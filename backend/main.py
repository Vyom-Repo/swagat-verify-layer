import os
import shutil
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from logic_gps import verify_location

app = FastAPI(title="Swagat Verification API")

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

@app.post("/verify-evidence/")
async def verify_evidence(
    grievance_id: str = Form(...),
    target_lat: float = Form(...),
    target_lon: float = Form(...),
    file: UploadFile = File(...)
):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        is_valid, message, actual_coords = verify_location(
            image_path=file_path, 
            target_lat=target_lat, 
            target_lon=target_lon, 
            max_distance_meters=50
        )
        
        return {
            "grievance_id": grievance_id,
            "verification_status": "PASSED" if is_valid else "FAILED",
            "details": message,
            "photo_coordinates": actual_coords
        }
        
    except Exception as e:
        return {
            "grievance_id": grievance_id,
            "verification_status": "SERVER_ERROR",
            "details": f"Verification failed: {str(e)}"
        }
        
    finally:
        # This guarantees the photo is deleted from your hard drive, 
        # even if the math above fails and throws an error.
        if os.path.exists(file_path):
            os.remove(file_path)