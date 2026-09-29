"""
BhuNetra SQLAlchemy ORM Models
Defines Watershed Sites, Photos, Remote Sensing Trends, and Mismatches.
"""
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class WatershedSiteModel(Base):
    __tablename__ = "watershed_sites"

    id = Column(String(64), primary_key=True, index=True)
    code = Column(String(64), unique=True, index=True)
    name = Column(String(255), nullable=False)
    village = Column(String(128), index=True, nullable=False)
    gram_panchayat = Column(String(128))
    block = Column(String(128), index=True, nullable=False)
    district = Column(String(128), index=True, nullable=False)
    state = Column(String(128), nullable=False, default="Maharashtra")
    watershed_id = Column(String(64), index=True, nullable=False)
    watershed_name = Column(String(255), nullable=False)
    terrain_type = Column(String(32), default="semi_arid") # semi_arid, hilly, coastal

    # Spatial Coordinates (lat/lon columns fallback)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    elevation_meters = Column(Float, default=450.0)

    # Work Details
    structure_type = Column(String(64), nullable=False, index=True) # check_dam, farm_pond, plantation, etc.
    sanctioned_date = Column(String(32), nullable=False)
    completion_date = Column(String(32))
    budget_inr_lakhs = Column(Float, default=0.0)
    mgnrega_work_id = Column(String(64), index=True)
    implementing_agency = Column(String(255))

    # Media & ML Classification
    photo_url = Column(Text, nullable=False)
    gradcam_url = Column(Text, nullable=True)
    classification_label = Column(String(64), nullable=False)
    classification_confidence = Column(Float, default=0.0)

    # Remote Sensing Spectral Indices
    baseline_ndvi = Column(Float, default=0.0)
    postwork_ndvi = Column(Float, default=0.0)
    delta_ndvi = Column(Float, default=0.0)
    baseline_ndwi = Column(Float, default=0.0)
    postwork_ndwi = Column(Float, default=0.0)
    delta_ndwi = Column(Float, default=0.0)

    # Composite Scoring & Explainability
    health_score = Column(Integer, default=50, index=True)
    score_breakdown = Column(JSON, nullable=True)

    # Audit & Mismatch Flag
    is_flagged = Column(Boolean, default=False, index=True)
    mismatch_severity = Column(String(32), nullable=True) # critical, high, medium, low
    mismatch_status = Column(String(32), default="Open") # Open, Assigned, Verified, Resolved
    mismatch_reason = Column(Text, nullable=True)
    mismatch_audit_trail = Column(Text, nullable=True)
    assigned_officer = Column(String(128), nullable=True)
    anomaly_score = Column(Float, default=0.0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    photos = relationship("PhotoRecordModel", back_populates="site")

class PhotoRecordModel(Base):
    __tablename__ = "photo_records"

    id = Column(String(64), primary_key=True, index=True)
    site_id = Column(String(64), ForeignKey("watershed_sites.id"), nullable=True)
    file_path = Column(Text, nullable=False)
    extracted_lat = Column(Float, nullable=False)
    extracted_lon = Column(Float, nullable=False)
    extracted_altitude = Column(Float, nullable=True)
    camera_model = Column(String(128), nullable=True)
    exif_timestamp = Column(String(64), nullable=True)
    
    # Inference Results
    predicted_class = Column(String(64), nullable=False)
    confidence = Column(Float, nullable=False)
    gradcam_path = Column(Text, nullable=True)
    nearest_watershed_id = Column(String(64), nullable=True)
    snap_distance_meters = Column(Float, default=0.0)
    
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    site = relationship("WatershedSiteModel", back_populates="photos")
