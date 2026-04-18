"""
Lakshya Grievance Resolution Verifier System — FastAPI Application
"""

import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routes.grievances import router as grievances_router
from routes.evidence import router as evidence_router
from routes.ivr import router as ivr_router
from routes.dashboard import router as dashboard_router

# ---------- Logging ----------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ---------- App ----------
app = FastAPI(
    title="Lakshya — Grievance Resolution Verifier",
    description="Independent verification of government complaint resolutions using IVR + GPS evidence.",
    version="1.0.0",
)

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Static files (uploaded photos) ----------
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ---------- Serve frontend static files ----------
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.isdir(FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="frontend")

# ---------- Routers ----------
app.include_router(grievances_router)
app.include_router(evidence_router)
app.include_router(ivr_router)
app.include_router(dashboard_router)


# ---------- Root ----------
@app.get("/")
def home():
    return {
        "service": "Lakshya — Grievance Resolution Verifier",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "grievances": "/api/grievances",
            "evidence": "/api/evidence/{grievance_id}",
            "ivr_simulate": "/api/ivr/simulate/{grievance_id}",
            "dashboard_stats": "/api/dashboard/stats",
            "dashboard_departments": "/api/dashboard/departments",
            "dashboard_fraud_alerts": "/api/dashboard/fraud-alerts",
            "dashboard_recent": "/api/dashboard/recent",
        },
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}