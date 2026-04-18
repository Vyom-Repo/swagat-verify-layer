"""
SQLAlchemy ORM models for the Lakshya Grievance Redressal System.

Tables: departments, grievances, evidence_logs
"""

from sqlalchemy import (
    Column, Integer, String, Float, Text, ForeignKey,
    Enum as SAEnum, DateTime, CheckConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from db import Base


# ---------- Python enum for application-level use ----------
class GrievanceStatus(str, enum.Enum):
    """Maps to the `grievance_status` PostgreSQL ENUM."""
    PENDING_VERIFICATION = "Pending Verification"
    VERIFYING            = "Verifying"
    VERIFIED_CLOSED      = "Verified Closed"
    REOPENED             = "Reopened"


# Use raw string-based Enum that maps directly to PostgreSQL ENUM values
_grievance_status_enum = SAEnum(
    "Pending Verification",
    "Verifying",
    "Verified Closed",
    "Reopened",
    name="grievance_status",
    create_type=False,
)


# ---------- Departments ----------
class Department(Base):
    __tablename__ = "departments"

    id                     = Column(Integer, primary_key=True, index=True)
    name                   = Column(String(100), unique=True, nullable=False)
    total_claimed_resolved = Column(Integer, nullable=False, default=0)
    quality_score          = Column(Float, nullable=False, default=0.0)
    created_at             = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    grievances = relationship("Grievance", back_populates="department", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Department(id={self.id}, name='{self.name}')>"


# ---------- Grievances ----------
class Grievance(Base):
    __tablename__ = "grievances"

    id               = Column(Integer, primary_key=True, index=True)
    department_id    = Column(Integer, ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    citizen_name     = Column(String(150), nullable=False, default="Anonymous")
    citizen_phone    = Column(String(15), nullable=False, index=True)
    description      = Column(Text, nullable=False, default="")
    original_gps_lat = Column(Float, nullable=False)
    original_gps_long = Column(Float, nullable=False)
    status           = Column(
        _grievance_status_enum,
        nullable=False,
        default="Pending Verification",
    )
    ivr_call_sid     = Column(String(50), nullable=True)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())
    updated_at       = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    department    = relationship("Department", back_populates="grievances")
    evidence_logs = relationship("EvidenceLog", back_populates="grievance", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Grievance(id={self.id}, status='{self.status}')>"


# ---------- Evidence Logs ----------
class EvidenceLog(Base):
    __tablename__ = "evidence_logs"

    id                     = Column(Integer, primary_key=True, index=True)
    grievance_id           = Column(Integer, ForeignKey("grievances.id", ondelete="CASCADE"), nullable=False)
    field_officer_gps_lat  = Column(Float, nullable=True)
    field_officer_gps_long = Column(Float, nullable=True)
    ivr_keypress           = Column(Integer, nullable=True)
    photo_url              = Column(Text, nullable=True)
    recorded_at            = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint("ivr_keypress IN (1, 2)", name="ck_ivr_keypress_valid"),
    )

    # Relationships
    grievance = relationship("Grievance", back_populates="evidence_logs")

    def __repr__(self):
        return f"<EvidenceLog(id={self.id}, grievance_id={self.grievance_id}, ivr={self.ivr_keypress})>"
