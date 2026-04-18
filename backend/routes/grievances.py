"""
Grievance CRUD routes.

Endpoints:
  POST   /api/grievances              — Citizen submits complaint
  GET    /api/grievances              — List all (with filters)
  GET    /api/grievances/{id}         — Single grievance + evidence
  PATCH  /api/grievances/{id}/resolve — Department marks resolved → triggers verification
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Optional, List

from db import get_db
from models import Grievance, Department, EvidenceLog
from services.twilio_service import initiate_ivr_call

router = APIRouter(prefix="/api/grievances", tags=["Grievances"])


# ---------- Pydantic schemas ----------
class GrievanceCreate(BaseModel):
    department_id: int
    citizen_name: str = "Anonymous"
    citizen_phone: str
    description: str
    original_gps_lat: float
    original_gps_long: float


# ---------- Routes ----------

@router.post("/", response_model=dict, status_code=201)
def create_grievance(payload: GrievanceCreate, db: Session = Depends(get_db)):
    """Citizen submits a new complaint."""
    dept = db.query(Department).filter(Department.id == payload.department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    grievance = Grievance(
        department_id=payload.department_id,
        citizen_name=payload.citizen_name,
        citizen_phone=payload.citizen_phone,
        description=payload.description,
        original_gps_lat=payload.original_gps_lat,
        original_gps_long=payload.original_gps_long,
        status="Pending Verification",
    )
    db.add(grievance)
    db.commit()
    db.refresh(grievance)

    return {
        "message": "Grievance submitted successfully",
        "grievance_id": grievance.id,
        "status": str(grievance.status),
    }


@router.get("/", response_model=List[dict])
def list_grievances(
    status: Optional[str] = Query(None, description="Filter by status"),
    department_id: Optional[int] = Query(None, description="Filter by department"),
    db: Session = Depends(get_db),
):
    """List all grievances with optional filters."""
    query = db.query(Grievance).options(joinedload(Grievance.department))

    if status:
        query = query.filter(Grievance.status == status)
    if department_id:
        query = query.filter(Grievance.department_id == department_id)

    query = query.order_by(Grievance.created_at.desc())
    grievances = query.all()

    return [
        {
            "id": g.id,
            "department_id": g.department_id,
            "department_name": g.department.name if g.department else None,
            "citizen_name": g.citizen_name,
            "citizen_phone": g.citizen_phone,
            "description": g.description,
            "original_gps_lat": g.original_gps_lat,
            "original_gps_long": g.original_gps_long,
            "status": str(g.status),
            "created_at": str(g.created_at) if g.created_at else None,
            "updated_at": str(g.updated_at) if g.updated_at else None,
        }
        for g in grievances
    ]


@router.get("/{grievance_id}", response_model=dict)
def get_grievance(grievance_id: int, db: Session = Depends(get_db)):
    """Get single grievance with its evidence logs."""
    grievance = (
        db.query(Grievance)
        .options(joinedload(Grievance.evidence_logs), joinedload(Grievance.department))
        .filter(Grievance.id == grievance_id)
        .first()
    )
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")

    return {
        "id": grievance.id,
        "department_id": grievance.department_id,
        "department_name": grievance.department.name if grievance.department else None,
        "citizen_name": grievance.citizen_name,
        "citizen_phone": grievance.citizen_phone,
        "description": grievance.description,
        "original_gps_lat": grievance.original_gps_lat,
        "original_gps_long": grievance.original_gps_long,
        "status": str(grievance.status),
        "ivr_call_sid": grievance.ivr_call_sid,
        "created_at": str(grievance.created_at) if grievance.created_at else None,
        "updated_at": str(grievance.updated_at) if grievance.updated_at else None,
        "evidence_logs": [
            {
                "id": e.id,
                "field_officer_gps_lat": e.field_officer_gps_lat,
                "field_officer_gps_long": e.field_officer_gps_long,
                "ivr_keypress": e.ivr_keypress,
                "photo_url": e.photo_url,
                "recorded_at": str(e.recorded_at) if e.recorded_at else None,
            }
            for e in grievance.evidence_logs
        ],
    }


@router.patch("/{grievance_id}/resolve", response_model=dict)
def resolve_grievance(grievance_id: int, db: Session = Depends(get_db)):
    """
    Department marks a grievance as resolved.
    Triggers: status → Verifying + IVR call to citizen.
    """
    grievance = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")

    if str(grievance.status) not in ("Pending Verification", "Reopened"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot resolve a grievance with status '{grievance.status}'. "
                   f"Only 'Pending Verification' or 'Reopened' grievances can be resolved."
        )

    # Update status to Verifying
    grievance.status = "Verifying"
    db.commit()
    db.refresh(grievance)

    # Trigger IVR call
    ivr_result = initiate_ivr_call(grievance.citizen_phone, grievance.id)

    # Store call SID
    if ivr_result.get("call_sid"):
        grievance.ivr_call_sid = ivr_result["call_sid"]
        db.commit()

    # Update department resolved count
    dept = db.query(Department).filter(Department.id == grievance.department_id).first()
    if dept:
        dept.total_claimed_resolved += 1
        db.commit()

    return {
        "message": "Grievance marked as resolved — verification in progress",
        "grievance_id": grievance.id,
        "status": "Verifying",
        "ivr": ivr_result,
    }
