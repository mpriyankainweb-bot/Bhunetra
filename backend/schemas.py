"""
Pydantic Schemas for BhuNetra FastAPI Backend
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ScoreWeightsInput(BaseModel):
    w1_ndvi: float = Field(default=0.30, ge=0.0, le=1.0)
    w2_ndwi: float = Field(default=0.35, ge=0.0, le=1.0)
    w3_structure: float = Field(default=0.20, ge=0.0, le=1.0)
    w4_consistency: float = Field(default=0.15, ge=0.0, le=1.0)
    terrain_preset: Optional[str] = "semi_arid"

class RecomputeResponse(BaseModel):
    status: str
    updatedCount: int
    weightsApplied: ScoreWeightsInput
    terrainPreset: str
    averageScore: float

class MismatchUpdate(BaseModel):
    status: str = Field(..., pattern="^(Open|Assigned|Verified|Resolved)$")
    assignedOfficer: Optional[str] = None
    auditNotes: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str
    role: str = "field_officer"

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str
    district: str

class SyncBatchItem(BaseModel):
    tempId: str
    latitude: float
    longitude: float
    accuracyMeters: float
    claimedStructure: str
    villageName: str
    watershedId: str
    notes: Optional[str] = None
    capturedAt: str
    imageBase64: Optional[str] = None

class SyncBatchRequest(BaseModel):
    items: List[SyncBatchItem]

class PublicSummaryResponse(BaseModel):
    village: str
    district: str
    totalWorks: int
    completedWorks: int
    verifiedWorks: int
    averageHealthScore: float
    greenCoverGrowthPct: float
    waterStorageCapacityM3: float
    sites: List[Dict[str, Any]]
