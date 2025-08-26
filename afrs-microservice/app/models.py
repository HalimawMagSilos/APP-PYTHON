"""
Pydantic models for request/response schemas.
"""
from pydantic import BaseModel
from typing import Optional

class EnrollResponse(BaseModel):
    status: str
    patient_id: int
    message: Optional[str] = None

class MatchResponse(BaseModel):
    matched_patient_id: Optional[int]
    confidence: float
    decision: str
