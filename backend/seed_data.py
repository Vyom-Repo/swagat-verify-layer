from database.database import SessionLocal
from database.models import Grievance

db = SessionLocal()

data = [
    ("GJ-SWG-00001", "Vadodara", "Electricity", "Garbage", 22.3072, 73.1812),
    ("GJ-SWG-00002", "Rajkot", "Sanitation", "Pothole", 22.3039, 70.8022),
    ("GJ-SWG-00003", "Surat", "Electricity", "Drainage", 21.1702, 72.8311),
    ("GJ-SWG-00004", "Surat", "Sanitation", "Drainage", 21.1702, 72.8311),
    ("GJ-SWG-00005", "Surat", "Electricity", "Power Cut", 21.1702, 72.8311),
]

for item in data:
    grievance = Grievance(
        grievance_code=item[0],
        district=item[1],
        department=item[2],
        grievance_type=item[3],
        lat=item[4],
        lon=item[5],
        status="pending"
    )
    db.add(grievance)

db.commit()
db.close()

print("✅ Dummy data inserted")