"""
Twilio IVR service — handles call initiation and TwiML generation.

Supports a SIMULATION mode when Twilio credentials are not configured,
so the system works for demos without real phone calls.
"""

import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# ---------- Configuration ----------
TWILIO_ACCOUNT_SID  = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN   = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "")
BASE_URL            = os.getenv("BASE_URL", "http://localhost:8000")

# Simulation mode: enabled when Twilio creds are missing
SIMULATION_MODE = not (TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER)

if SIMULATION_MODE:
    logger.warning("Twilio credentials not configured — running in SIMULATION mode. "
                   "IVR calls will be simulated, not actually placed.")

# Only import Twilio if credentials are set
_twilio_client = None
if not SIMULATION_MODE:
    try:
        from twilio.rest import Client
        _twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        logger.info("Twilio client initialized successfully.")
    except ImportError:
        logger.error("twilio package not installed. pip install twilio")
        SIMULATION_MODE = True


def initiate_ivr_call(citizen_phone: str, grievance_id: int) -> dict:
    """
    Place an IVR call to the citizen for verification.

    In SIMULATION mode, returns a fake call SID and logs the action.
    """
    webhook_url = f"{BASE_URL}/api/ivr/webhook?grievance_id={grievance_id}"
    status_callback_url = f"{BASE_URL}/api/ivr/status-callback?grievance_id={grievance_id}"

    if SIMULATION_MODE:
        fake_sid = f"SIM_{grievance_id}_{citizen_phone[-4:]}"
        logger.info(f"[SIMULATION] IVR call to {citizen_phone} for grievance #{grievance_id} — SID: {fake_sid}")
        return {
            "success": True,
            "call_sid": fake_sid,
            "simulation": True,
            "message": f"Simulated IVR call to {citizen_phone}. "
                       f"Use POST /api/ivr/simulate/{grievance_id} to simulate citizen response."
        }

    try:
        call = _twilio_client.calls.create(
            to=citizen_phone,
            from_=TWILIO_PHONE_NUMBER,
            url=webhook_url,
            status_callback=status_callback_url,
            status_callback_event=["completed", "no-answer", "busy", "failed"],
            method="POST",
        )
        logger.info(f"IVR call placed to {citizen_phone} — SID: {call.sid}")
        return {
            "success": True,
            "call_sid": call.sid,
            "simulation": False,
            "message": f"IVR call placed to {citizen_phone}"
        }
    except Exception as e:
        logger.error(f"Twilio call failed: {e}")
        return {
            "success": False,
            "call_sid": None,
            "simulation": False,
            "message": f"Call failed: {str(e)}"
        }


def generate_twiml_gather() -> str:
    """
    Generate TwiML XML for the IVR verification prompt.

    Asks citizen to press 1 if satisfied, 2 if not.
    """
    return """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather numDigits="1" action="/api/ivr/webhook" method="POST" timeout="10">
        <Say voice="alice" language="en-IN">
            Namaste. This is a verification call from the District Collector's office
            regarding your recent complaint.
            If your complaint has been resolved satisfactorily, press 1.
            If your complaint has NOT been resolved, press 2.
        </Say>
    </Gather>
    <Say voice="alice" language="en-IN">
        We did not receive any input. Your complaint will be marked for re-investigation.
        Thank you.
    </Say>
</Response>"""


def is_simulation_mode() -> bool:
    """Check if running in simulation mode."""
    return SIMULATION_MODE
