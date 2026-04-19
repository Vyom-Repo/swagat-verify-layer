from sqlalchemy import Column, Integer, String, Float, ForeignKey, TIMESTAMP
from database.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    username = Column(String, unique=True)
    password = Column(String)
    role = Column(String)
    department = Column(String)

class Grievance(Base):
    __tablename__ = "grievances"
    id = Column(Integer, primary_key=True)
    grievance_code = Column(String, unique=True)
    district = Column(String)
    department = Column(String)
    grievance_type = Column(String)
    lat = Column(Float)
    lon = Column(Float)
    status = Column(String, default="pending")
    assigned_officer_id = Column(Integer, ForeignKey("users.id"))

class Evidence(Base):
    __tablename__ = "evidence"
    id = Column(Integer, primary_key=True)
    grievance_id = Column(Integer, ForeignKey("grievances.id"))
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    photo_path = Column(String)
    photo_lat = Column(Float)
    photo_lon = Column(Float)
    distance = Column(Float)
    gps_status = Column(String)
    ai_status = Column(String)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

class IVRLog(Base):
    __tablename__ = "ivr_logs"
    id = Column(Integer, primary_key=True)
    grievance_id = Column(Integer, ForeignKey("grievances.id"))
    call_status = Column(String)
    user_response = Column(Integer)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

class MasterVerification(Base):
    __tablename__ = "master_verification"
    id = Column(Integer, primary_key=True)
    grievance_code = Column(String)
    district = Column(String)
    department = Column(String)
    grievance_type = Column(String)
    gps_match_flag = Column(Integer)
    photo_uploaded = Column(Integer)
    ivr_call_status = Column(String)
    ivr_response = Column(Integer)
    verification_status = Column(String)
    reopen_flag = Column(Integer)