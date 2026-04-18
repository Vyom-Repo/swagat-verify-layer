"""
Evidence upload routes.

Endpoints:
  POST /api/evidence/{grievance_id}  — Field officer uploads photo + GPS
"""

import os
import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional

from db import get_db
from models import Grievance, EvidenceLog, GrievanceStatus
from services.verification import verify_grievance

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/evidence", tags=["Evidence"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")


@router.post("/{grievance_id}", response_model=dict, status_code=201)
async def upload_evidence(
    grievance_id: int,
    field_officer_gps_lat: float = Form(...),
    field_officer_gps_long: float = Form(...),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    """
    Field officer uploads evidence: GPS coordinates + optional photo.

    If an IVR response already exists for this grievance, the full
    verification pipeline runs automatically after upload.
    """
    grievance = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")

    # Save photo to disk
    photo_url = None
    if photo and photo.filename:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        ext = os.path.splitext(photo.filename)[1] or ".jpg"
        filename = f"g{grievance_id}_{uuid.uuid4().hex[:8]}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)

        contents = await photo.read()
        with open(filepath, "wb") as f:
            f.write(contents)

        photo_url = f"/uploads/{filename}"
        logger.info(f"Photo saved: {filepath}")

    # Check if there's already an evidence log with IVR response (from webhook)
    existing_evidence = (
        db.query(EvidenceLog)
        .filter(EvidenceLog.grievance_id == grievance_id)
        .order_by(EvidenceLog.recorded_at.desc())
        .first()
    )

    if existing_evidence and existing_evidence.ivr_keypress is not None and existing_evidence.field_officer_gps_lat is None:
        # IVR came first — update existing record with GPS + photo
        existing_evidence.field_officer_gps_lat = field_officer_gps_lat
        existing_evidence.field_officer_gps_long = field_officer_gps_long
        if photo_url:
            existing_evidence.photo_url = photo_url
        db.commit()
        db.refresh(existing_evidence)
        evidence_id = existing_evidence.id
    else:
        # Create new evidence log (IVR response may come later)
        evidence = EvidenceLog(
            grievance_id=grievance_id,
            field_officer_gps_lat=field_officer_gps_lat,
            field_officer_gps_long=field_officer_gps_long,
            photo_url=photo_url,
        )
        db.add(evidence)
        db.commit()
        db.refresh(evidence)
        evidence_id = evidence.id

    # If IVR response is already available, run verification now
    latest_evidence = (
        db.query(EvidenceLog)
        .filter(EvidenceLog.grievance_id == grievance_id)
        .order_by(EvidenceLog.recorded_at.desc())
        .first()
    )

    verification_result = None
    if latest_evidence and latest_evidence.ivr_keypress is not None:
        verification_result = verify_grievance(db, grievance_id)

    return {
        "message": "Evidence uploaded successfully",
        "evidence_id": evidence_id,
        "photo_url": photo_url,
        "verification": verification_result,
    }
