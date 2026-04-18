"""
IVR routes — Twilio webhook, status callback, and simulation endpoint.

Endpoints:
  POST /api/ivr/initiate/{grievance_id}   — Manually trigger IVR call
  POST /api/ivr/webhook                   — Twilio sends citizen keypress here
  POST /api/ivr/status-callback           — Twilio call status updates
  POST /api/ivr/simulate/{grievance_id}   — Simulate citizen response (demo mode)
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, Form, Query, Request
from fastapi.responses import Response
from sqlalchemy.orm import Session
from pydantic import BaseModel
from services.verification import verify_grievance

from db import get_db
from models import Grievance, EvidenceLog
from services.twilio_service import initiate_ivr_call, generate_twiml_gather, is_simulation_mode
from services.verification import verify_grievance

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/ivr", tags=["IVR"])


# ---------- Initiate IVR call ----------
@router.post("/initiate/{grievance_id}", response_model=dict)
def ivr_initiate(grievance_id: int, db: Session = Depends(get_db)):
    """Manually trigger IVR call for a grievance."""
    grievance = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")

    result = initiate_ivr_call(grievance.citizen_phone, grievance.id)

    if result.get("call_sid"):
        grievance.ivr_call_sid = result["call_sid"]
        db.commit()

    return result


# ---------- Twilio webhook — receives gather response ----------
@router.post("/webhook")
async def ivr_webhook(
    request: Request,
    grievance_id: int = Query(None),
    db: Session = Depends(get_db),
):
    """
    Twilio POSTs here when citizen presses a key during the IVR call.

    Form params from Twilio: Digits, CallSid, etc.
    """
    # Parse form data from Twilio
    form = await request.form()
    digits = form.get("Digits")
    call_sid = form.get("CallSid", "")

    # If grievance_id not in query, try to find by call SID
    if not grievance_id:
        grievance = db.query(Grievance).filter(Grievance.ivr_call_sid == call_sid).first()
        if grievance:
            grievance_id = grievance.id

    if not grievance_id:
        # Return TwiML gather prompt (first call, no digits yet)
        return Response(content=generate_twiml_gather(), media_type="application/xml")

    if not digits:
        # No digits pressed — return TwiML gather prompt
        return Response(content=generate_twiml_gather(), media_type="application/xml")

    keypress = int(digits)
    logger.info(f"IVR webhook — Grievance #{grievance_id}, keypress={keypress}, CallSid={call_sid}")

    # Find or create evidence log
    evidence = (
        db.query(EvidenceLog)
        .filter(EvidenceLog.grievance_id == grievance_id)
        .order_by(EvidenceLog.recorded_at.desc())
        .first()
    )

    if evidence and evidence.ivr_keypress is None:
        # Update existing evidence with IVR response
        evidence.ivr_keypress = keypress
    else:
        # Create new evidence log for IVR response
        evidence = EvidenceLog(
            grievance_id=grievance_id,
            ivr_keypress=keypress,
        )
        db.add(evidence)

    db.commit()

    # If field evidence already uploaded, run verification
    db.refresh(evidence)
    if evidence.field_officer_gps_lat is not None:
        verify_grievance(db, grievance_id)

    # Return TwiML response
    if keypress == 1:
        twiml = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice" language="en-IN">
        Thank you. Your confirmation has been recorded. Your complaint is now verified as resolved.
    </Say>
</Response>"""
    else:
        twiml = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice" language="en-IN">
        Thank you. We have noted that your complaint is not resolved. It will be reopened for further action.
    </Say>
</Response>"""

    return Response(content=twiml, media_type="application/xml")


# ---------- Twilio status callback ----------
@router.post("/status-callback")
async def ivr_status_callback(
    request: Request,
    grievance_id: int = Query(None),
    db: Session = Depends(get_db),
):
    """
    Twilio POSTs call status updates here (completed, no-answer, busy, failed).

    If call was not answered → REOPEN the grievance.
    """
    form = await request.form()
    call_status = form.get("CallStatus", "")
    call_sid = form.get("CallSid", "")

    logger.info(f"IVR status callback — Grievance #{grievance_id}, status={call_status}")

    if call_status in ("no-answer", "busy", "failed"):
        if grievance_id:
            grievance = db.query(Grievance).filter(Grievance.id == grievance_id).first()
            if grievance and str(grievance.status) == "Verifying":
                grievance.status = "Reopened"
                db.commit()
                logger.warning(f"Grievance #{grievance_id} REOPENED — call {call_status}")

    return {"status": "received"}


# ---------- Simulation endpoint (demo mode) ----------
class SimulateRequest(BaseModel):
    keypress: int  # 1 = satisfied, 2 = not satisfied

@router.post("/simulate/{grievance_id}", response_model=dict)
def simulate_ivr_response(
    grievance_id: int,
    payload: SimulateRequest,
    db: Session = Depends(get_db),
):
    grievance = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")

    if payload.keypress not in (1, 2):
        raise HTTPException(status_code=400, detail="keypress must be 1 or 2")

    evidence = (
        db.query(EvidenceLog)
        .filter(EvidenceLog.grievance_id == grievance_id)
        .order_by(EvidenceLog.recorded_at.desc())
        .first()
    )

    if evidence and evidence.ivr_keypress is None:
        evidence.ivr_keypress = payload.keypress
    else:
        evidence = EvidenceLog(
            grievance_id=grievance_id,
            ivr_keypress=payload.keypress,
        )
        db.add(evidence)

    db.commit()
    db.refresh(evidence)

    # 🔥 ALWAYS RUN VERIFICATION
    verification_result = verify_grievance(db, grievance_id)

    return {
        "message": f"Simulated IVR response recorded: keypress={payload.keypress}",
        "grievance_id": grievance_id,
        "keypress": payload.keypress,
        "verification": verification_result,
    }