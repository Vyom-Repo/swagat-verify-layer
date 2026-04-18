"""
Verification logic engine.

Rules:
  1. Citizen pressed 2 (NOT satisfied)          → REOPENED
  2. No IVR response (call failed / unanswered) → REOPENED
  3. GPS distance > threshold                    → REOPENED (fraud suspected)
  4. All checks pass                             → VERIFIED CLOSED
"""

import os
import logging
from geopy.distance import geodesic
from sqlalchemy.orm import Session

from models import Grievance, EvidenceLog

logger = logging.getLogger(__name__)

# Distance threshold in meters (configurable via env)
GPS_THRESHOLD_METERS = float(os.getenv("GPS_DISTANCE_THRESHOLD_METERS", "500"))


def calculate_gps_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return distance in meters between two GPS coordinates."""
    return geodesic((lat1, lon1), (lat2, lon2)).meters


def verify_grievance(db: Session, grievance_id: int) -> dict:
    """
    Run the full verification pipeline on a grievance.

    Returns:
        dict with keys: verified (bool), reason (str), new_status (str),
                        gps_distance_m (float | None)
    """
    grievance = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not grievance:
        return {"verified": False, "reason": "Grievance not found", "new_status": None, "gps_distance_m": None}

    # Get the latest evidence log for this grievance
    evidence = (
        db.query(EvidenceLog)
        .filter(EvidenceLog.grievance_id == grievance_id)
        .order_by(EvidenceLog.recorded_at.desc())
        .first()
    )

    result = {
        "verified": False,
        "reason": "",
        "new_status": "",
        "gps_distance_m": None,
    }

    # ------------------------------------------------------------------
    # Rule 1: Check IVR response
    # ------------------------------------------------------------------
    if evidence and evidence.ivr_keypress == 2:
        result["reason"] = "Citizen reported NOT satisfied (IVR keypress = 2)"
        result["new_status"] = "Reopened"
        _update_status(db, grievance, "Reopened")
        logger.info(f"Grievance #{grievance_id} REOPENED — citizen unsatisfied")
        return result

    # ------------------------------------------------------------------
    # Rule 2: No IVR response at all
    # ------------------------------------------------------------------
    if not evidence or evidence.ivr_keypress is None:
        if grievance.status == "Verifying":
            result["reason"] = "Awaiting IVR response — no action taken yet"
            result["new_status"] = "Verifying"
            return result
        result["reason"] = "No IVR response received — defaulting to REOPEN"
        result["new_status"] = "Reopened"
        _update_status(db, grievance, "Reopened")
        logger.info(f"Grievance #{grievance_id} REOPENED — no IVR response")
        return result

    # ------------------------------------------------------------------
    # Rule 3: GPS distance check
    # ------------------------------------------------------------------
    if evidence.field_officer_gps_lat is not None and evidence.field_officer_gps_long is not None:
        distance = calculate_gps_distance(
            grievance.original_gps_lat, grievance.original_gps_long,
            evidence.field_officer_gps_lat, evidence.field_officer_gps_long,
        )
        result["gps_distance_m"] = round(distance, 2)

        if distance > GPS_THRESHOLD_METERS:
            result["reason"] = (
                f"GPS mismatch detected — officer was {distance:.0f}m away "
                f"(threshold: {GPS_THRESHOLD_METERS:.0f}m). Suspected fraud."
            )
            result["new_status"] = "Reopened"
            _update_status(db, grievance, "Reopened")
            logger.warning(f"Grievance #{grievance_id} REOPENED — GPS fraud, distance={distance:.0f}m")
            return result

    # ------------------------------------------------------------------
    # Rule 4: All checks pass → VERIFIED
    # ------------------------------------------------------------------
    result["verified"] = True
    result["reason"] = "All verification checks passed"
    result["new_status"] = "Verified Closed"
    _update_status(db, grievance, "Verified Closed")
    logger.info(f"Grievance #{grievance_id} VERIFIED CLOSED")
    return result


def _update_status(db: Session, grievance: Grievance, new_status: str):
    """Update grievance status and commit."""
    grievance.status = new_status
    db.commit()
    db.refresh(grievance)
