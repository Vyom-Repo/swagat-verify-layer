import os
import shutil
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from geopy.distance import geodesic
from database.database import engine
from database.models import Base
from database.database import SessionLocal
from database.models import Grievance
from database.models import Evidence, MasterVerification, Grievance
from database.models import User
from fastapi.responses import Response
from fastapi import Request
from backend.ivr import trigger_call

from fastapi.staticfiles import StaticFiles

Base.metadata.create_all(bind=engine)
app = FastAPI(title="Swagat Verification API")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

print("DEBUG → Static path:", UPLOAD_DIR)

app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def read_root():
    return {"status": "System Online", "message": "Ready for verification"}

@app.get("/tasks/")
def get_tasks():
    db = SessionLocal()
    tasks = db.query(Grievance).all()

    result = []
    for t in tasks:
        result.append({
            "id": t.id,
            "grievance_code": t.grievance_code,
            "district": t.district,
            "department": t.department,
            "type": t.grievance_type,
            "lat": t.lat,
            "lon": t.lon,
            "status": t.status
        })

    db.close()
    return result

@app.post("/login/")
def login(username: str = Form(...), password: str = Form(...)):
    db = SessionLocal()

    user = db.query(User).filter(
        User.username == username,
        User.password == password
    ).first()

    db.close()

    if not user:
        return {"status": "error", "message": "Invalid credentials"}

    return {
        "status": "success",
        "user_id": user.id,
        "role": user.role,
        "department": user.department
    }

@app.get("/tasks/{user_id}")
def get_tasks(user_id: int):
    db = SessionLocal()

    tasks = db.query(Grievance).filter(
        Grievance.assigned_officer_id == user_id
    ).all()

    result = []
    for t in tasks:
        result.append({
            "id": t.id,
            "grievance_code": t.grievance_code,
            "district": t.district,
            "department": t.department,
            "type": t.grievance_type,
            "lat": t.lat,
            "lon": t.lon,
            "status": t.status
        })

    db.close()
    return result

@app.post("/verify-evidence/")
async def verify_evidence(
    grievance_id: int = Form(...),
    user_id: int = Form(...),
    target_lat: float = Form(...),
    target_lon: float = Form(...),
    photo_lat: float = Form(...),
    photo_lon: float = Form(...),
    file: UploadFile = File(...)
):
    db = SessionLocal()

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    try:
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # GPS verification using frontend coordinates (no EXIF)
        officer_location = (photo_lat, photo_lon)
        target_location = (target_lat, target_lon)
        distance = geodesic(officer_location, target_location).meters

        is_valid = distance <= 500
        message = f"Within range ({distance:.2f} meters)" if is_valid else f"Distance offset: {distance:.2f} meters"
        actual_coords = (photo_lat, photo_lon)

        gps_status = "PASSED" if is_valid else "FAILED"

        print(f"DEBUG → Officer GPS: {officer_location}, Target: {target_location}, Distance: {distance:.2f}m, Valid: {is_valid}")

        grievance = db.query(Grievance).filter(
        Grievance.id == grievance_id
        ).first()

# 🔥 ADD THIS CHECK HERE
        if not grievance:
            db.close()
            return {
                "error": f"Grievance not found for ID {grievance_id}"
            }

        # 🔥 SAVE EVIDENCE
        evidence = Evidence(
            grievance_id=grievance_id,
            uploaded_by=user_id,
            photo_path=file_path,
            photo_lat=actual_coords[0] if actual_coords else None,
            photo_lon=actual_coords[1] if actual_coords else None,
            distance=0,
            gps_status=gps_status,
            ai_status="PENDING"
        )

        db.add(evidence)
        db.commit()

        # 🔥 TRIGGER IVR CALL
        phone_number = "+918320784449"

        # 🔥 DECISION LOGIC
        if gps_status == "FAILED":
            final_status = "REOPENED"
            reopen_flag = 1
        else:
            final_status = "VERIFIED"
            reopen_flag = 0

        print("DEBUG → Final status:", final_status)

# 🔥 FORCE UPDATE USING QUERY (MOST RELIABLE)
        db.query(Grievance).filter(
            Grievance.id == grievance_id
        ).update({
            "status": final_status
        })

        db.commit()

        print("DEBUG → DB updated for grievance:", grievance_id)

        # 🔥 MASTER TABLE UPDATE
        master = MasterVerification(
            grievance_code=grievance.grievance_code,
            district=grievance.district,
            department=grievance.department,
            grievance_type=grievance.grievance_type,

            gps_match_flag=1 if is_valid else 0,
            photo_uploaded=1,

            ivr_call_status="PENDING",
            ivr_response=0,

            verification_status=final_status,
            reopen_flag=reopen_flag
        )

        db.add(master)
        db.commit()

        # 🔥 TRIGGER IVR CALL
        # 🔥 TRIGGER IVR ONLY IF EVERYTHING IS VALID
        if gps_status == "PASSED" and file:
            try:
                trigger_call(phone_number, grievance_id)
                print("✅ IVR call triggered successfully")

                # update master table call status
                db.query(MasterVerification).filter(
                    MasterVerification.grievance_code == grievance.grievance_code
                ).order_by(MasterVerification.id.desc()).first().ivr_call_status = "CALLED"

                db.commit()

            except Exception as e:
                print("❌ IVR call failed:", str(e))
        else:
            print("🚫 Skipping IVR → GPS failed or no photo")

            # update master table
            db.query(MasterVerification).filter(
                MasterVerification.grievance_code == grievance.grievance_code
            ).order_by(MasterVerification.id.desc()).first().ivr_call_status = "SKIPPED"

            db.commit()
        return {
            "status": final_status,
            "message": message
        }

    except Exception as e:
        return {"error": str(e)}

    finally:
        db.close()
        if os.path.exists(file_path):
            os.remove(file_path)

@app.get("/dashboard/")
def dashboard():
    db = SessionLocal()

    total = db.query(Grievance).count()
    verified = db.query(Grievance).filter(Grievance.status == "VERIFIED").count()
    reopened = db.query(Grievance).filter(Grievance.status == "REOPENED").count()

    # Department-wise score
    departments = db.query(Grievance.department).distinct().all()

    dept_data = []

    for d in departments:
        dept = d[0]

        total_cases = db.query(Grievance).filter(
            Grievance.department == dept
        ).count()

        verified_cases = db.query(Grievance).filter(
            Grievance.department == dept,
            Grievance.status == "VERIFIED"
        ).count()

        score = (verified_cases / total_cases * 100) if total_cases else 0

        dept_data.append({
            "department": dept,
            "total": total_cases,
            "verified": verified_cases,
            "score": round(score, 2)
        })

    db.close()

    return {
        "total_complaints": total,
        "verified": verified,
        "reopened": reopened,
        "department_stats": dept_data
    }

@app.get("/monitoring/")
def get_monitoring_data():
    """Returns all grievances merged with latest master_verification record per grievance_code."""
    db = SessionLocal()

    try:
        grievances = db.query(Grievance).all()

        result = []
        for g in grievances:
            # Get LATEST master_verification record for this grievance (handles duplicates)
            master = db.query(MasterVerification).filter(
                MasterVerification.grievance_code == g.grievance_code
            ).order_by(MasterVerification.id.desc()).first()

            # Map IVR call status to frontend-friendly values
            ivr_status = "Pending"
            if master:
                if master.ivr_call_status == "SUCCESS" and master.ivr_response == 1:
                    ivr_status = "Confirmed"
                elif master.ivr_call_status == "SUCCESS" and master.ivr_response == 2:
                    ivr_status = "Not Confirmed"
                elif master.ivr_call_status == "CALLED":
                    ivr_status = "Pending"
                elif master.ivr_call_status == "SKIPPED":
                    ivr_status = "Failed"
                elif master.ivr_call_status == "PENDING":
                    ivr_status = "Pending"

            result.append({
                "id": g.id,
                "grievance_code": g.grievance_code,
                "district": g.district,
                "department": g.department,
                "type": g.grievance_type,
                "lat": g.lat,
                "lon": g.lon,
                "status": g.status,
                # Master verification data
                "ivr_status": ivr_status,
                "ivr_call_status_raw": master.ivr_call_status if master else None,
                "ivr_response": master.ivr_response if master else 0,
                "gps_match_flag": master.gps_match_flag if master else 0,
                "photo_uploaded": master.photo_uploaded if master else 0,
                "verification_status": master.verification_status if master else g.status,
                "reopen_flag": master.reopen_flag if master else 0
            })

        print(f"DEBUG → /monitoring/ returning {len(result)} records")
        for r in result:
            print(f"  {r['grievance_code']}: status={r['status']}, ivr={r['ivr_status']}, ivr_raw={r['ivr_call_status_raw']}, response={r['ivr_response']}")

        return result

    finally:
        db.close()

from fastapi import Request
from fastapi.responses import Response


@app.post("/ivr")
async def ivr(request: Request):
    form = await request.form()
    digits = form.get("Digits")
    grievance_id = request.query_params.get("grievance_id")

    print("DEBUG → Digits:", digits)

    # FIRST CALL
    if not digits:
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
<Gather numDigits="1" timeout="10" action="/ivr?grievance_id={grievance_id}" method="POST">

<Play>https://d7e2-2401-4900-8fc4-b751-d993-22e-28fd-b48a.ngrok-free.app/static/ivr_gujarati.mp3</Play>

</Gather>

</Response>"""

        return Response(content=twiml, media_type="application/xml")

    # USER INPUT
    if digits == "1":
        result = "CONFIRMED"
    elif digits == "2":
        result = "REJECTED"
    else:
        result = "INVALID"

    print(f"🔥 IVR Response for {grievance_id}: {result}")

    # FINAL RESPONSE
    return Response(content="""<?xml version="1.0" encoding="UTF-8"?>
<Response>
<Say>Thank you. Your response has been recorded.</Say>
</Response>""", media_type="application/xml")
@app.get("/test-call")
def test_call():
    trigger_call("+918320784449", 1)
    return {"message": "Call triggered"}

@app.get("/check-file")
def check_file():
    file_path = os.path.join(BASE_DIR, "uploads", "ivr_gujarati.mp3")
    return {
        "exists": os.path.exists(file_path),
        "path": file_path
    }