"""
Dashboard routes for the District Collector.

Endpoints:
  GET /api/dashboard/stats        — Summary statistics
  GET /api/dashboard/departments  — Per-department breakdown
  GET /api/dashboard/fraud-alerts — GPS mismatch flagged cases
  GET /api/dashboard/recent       — Recent grievances
"""

import logging
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, case, and_, text
from typing import Optional

from db import get_db
from models import Grievance, Department, EvidenceLog
from services.verification import calculate_gps_distance, GPS_THRESHOLD_METERS

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=dict)
def dashboard_stats(db: Session = Depends(get_db)):
    """Overall summary statistics for the dashboard."""
    total = db.query(func.count(Grievance.id)).scalar() or 0

    # Count by status
    status_counts = (
        db.query(Grievance.status, func.count(Grievance.id))
        .group_by(Grievance.status)
        .all()
    )
    counts = {str(s): c for s, c in status_counts}

    pending = counts.get("Pending Verification", 0)
    verifying = counts.get("Verifying", 0)
    verified = counts.get("Verified Closed", 0)
    reopened = counts.get("Reopened", 0)

    reopen_rate = round((reopened / total * 100), 2) if total > 0 else 0
    verification_rate = round((verified / total * 100), 2) if total > 0 else 0

    # Average quality score
    avg_quality = db.query(func.avg(Department.quality_score)).scalar() or 0

    # Failed IVR count
    failed_ivr = (
        db.query(func.count(EvidenceLog.id))
        .filter(EvidenceLog.ivr_keypress == 2)
        .scalar() or 0
    )

    return {
        "total_grievances": total,
        "pending_verification": pending,
        "verifying": verifying,
        "verified_closed": verified,
        "reopened": reopened,
        "reopen_rate_pct": reopen_rate,
        "verification_rate_pct": verification_rate,
        "avg_quality_score": round(float(avg_quality), 2),
        "failed_ivr_count": failed_ivr,
    }


@router.get("/departments", response_model=list)
def dashboard_departments(db: Session = Depends(get_db)):
    """Per-department breakdown with grievance counts and rates."""
    departments = db.query(Department).all()
    result = []

    for dept in departments:
        total = (
            db.query(func.count(Grievance.id))
            .filter(Grievance.department_id == dept.id)
            .scalar() or 0
        )
        reopened = (
            db.query(func.count(Grievance.id))
            .filter(Grievance.department_id == dept.id, Grievance.status == "Reopened")
            .scalar() or 0
        )
        verified = (
            db.query(func.count(Grievance.id))
            .filter(Grievance.department_id == dept.id, Grievance.status == "Verified Closed")
            .scalar() or 0
        )
        pending = (
            db.query(func.count(Grievance.id))
            .filter(Grievance.department_id == dept.id, Grievance.status == "Pending Verification")
            .scalar() or 0
        )

        failed_ivr = (
            db.query(func.count(EvidenceLog.id))
            .join(Grievance, EvidenceLog.grievance_id == Grievance.id)
            .filter(Grievance.department_id == dept.id, EvidenceLog.ivr_keypress == 2)
            .scalar() or 0
        )

        reopen_rate = round((reopened / total * 100), 2) if total > 0 else 0

        result.append({
            "id": dept.id,
            "name": dept.name,
            "total_grievances": total,
            "pending": pending,
            "verified_closed": verified,
            "reopened": reopened,
            "reopen_rate_pct": reopen_rate,
            "failed_ivr_count": failed_ivr,
            "total_claimed_resolved": dept.total_claimed_resolved,
            "quality_score": dept.quality_score,
        })

    # Sort by reopen rate descending (worst performers first)
    result.sort(key=lambda x: x["reopen_rate_pct"], reverse=True)
    return result


@router.get("/fraud-alerts", response_model=list)
def dashboard_fraud_alerts(db: Session = Depends(get_db)):
    """
    Flag grievances where field officer GPS is far from
    the original complaint GPS (potential fraud).
    """
    # Get all evidence logs with GPS data
    evidence_list = (
        db.query(EvidenceLog)
        .options(joinedload(EvidenceLog.grievance).joinedload(Grievance.department))
        .filter(
            EvidenceLog.field_officer_gps_lat.isnot(None),
            EvidenceLog.field_officer_gps_long.isnot(None),
        )
        .all()
    )

    alerts = []
    for ev in evidence_list:
        g = ev.grievance
        if not g:
            continue

        distance = calculate_gps_distance(
            g.original_gps_lat, g.original_gps_long,
            ev.field_officer_gps_lat, ev.field_officer_gps_long,
        )

        if distance > GPS_THRESHOLD_METERS:
            alerts.append({
                "grievance_id": g.id,
                "department": g.department.name if g.department else "Unknown",
                "citizen_name": g.citizen_name,
                "description": g.description,
                "status": str(g.status),
                "original_gps": {"lat": g.original_gps_lat, "long": g.original_gps_long},
                "officer_gps": {"lat": ev.field_officer_gps_lat, "long": ev.field_officer_gps_long},
                "distance_meters": round(distance, 2),
                "threshold_meters": GPS_THRESHOLD_METERS,
                "ivr_keypress": ev.ivr_keypress,
                "photo_url": ev.photo_url,
            })

    # Sort by distance descending (most suspicious first)
    alerts.sort(key=lambda x: x["distance_meters"], reverse=True)
    return alerts


@router.get("/recent", response_model=list)
def dashboard_recent(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Recent grievances with latest status."""
    grievances = (
        db.query(Grievance)
        .options(joinedload(Grievance.department))
        .order_by(Grievance.updated_at.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id": g.id,
            "department": g.department.name if g.department else "Unknown",
            "citizen_name": g.citizen_name,
            "description": g.description[:100] + ("..." if len(g.description) > 100 else ""),
            "status": str(g.status),
            "created_at": str(g.created_at) if g.created_at else None,
            "updated_at": str(g.updated_at) if g.updated_at else None,
        }
        for g in grievances
    ]
