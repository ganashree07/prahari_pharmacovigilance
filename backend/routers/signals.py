import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from database import get_db, Signal, VerificationResponse
from pydantic import BaseModel

router = APIRouter()

class SignalResponse(BaseModel):
    id: str
    drug: str
    symptom: str
    meddra: str
    source: str
    source_url: Optional[str] = None
    confidence: float
    integrity: float
    category: str
    status: str
    raw_text: Optional[str] = None
    verification_data: Optional[dict] = None
    created_at: datetime
    submitted_at: Optional[datetime] = None
    user_confirmations: int
    doctor_validations: int
    submitted_to_authority: bool
    authority_status: str

    class Config:
        from_attributes = True

class SignalListResponse(BaseModel):
    signals: List[SignalResponse]
    total: int
    page: int
    per_page: int

@router.get("/", response_model=SignalListResponse)
async def get_signals(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    project_id: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    List signals with filters and pagination.
    """
    query = db.query(Signal)
    
    # Apply filters
    if project_id:
        # For demo, we'll filter by drugs that might be in the project
        # In a real implementation, this would use proper project-signal relationships
        query = query.filter(Signal.drug.contains("diabetes"))
    
    if category:
        query = query.filter(Signal.category == category.upper())
    
    if status:
        query = query.filter(Signal.status == status.lower())
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * per_page
    signals = query.offset(offset).limit(per_page).all()
    
    return SignalListResponse(
        signals=signals,
        total=total,
        page=page,
        per_page=per_page
    )

@router.get("/{signal_id}", response_model=SignalResponse)
async def get_signal(signal_id: str, db: Session = Depends(get_db)):
    """
    Get single signal detail with all verification data.
    """
    signal = db.query(Signal).filter(Signal.id == signal_id).first()
    if not signal:
        raise HTTPException(status_code=404, detail="Signal not found")
    
    return signal

class UserConfirmRequest(BaseModel):
    answers: dict

@router.post("/{signal_id}/user-confirm", response_model=SignalResponse)
async def user_confirm(signal_id: str, request: UserConfirmRequest, db: Session = Depends(get_db)):
    """
    Increment user confirmation count and log response.
    """
    signal = db.query(Signal).filter(Signal.id == signal_id).first()
    if not signal:
        raise HTTPException(status_code=404, detail="Signal not found")
    
    signal.user_confirmations += 1
    
    verification = VerificationResponse(
        signal_id=signal_id,
        role='user',
        response_data=json.dumps(request.answers)
    )
    db.add(verification)
    db.commit()
    db.refresh(signal)
    
    return signal

class DoctorValidateRequest(BaseModel):
    answers: dict
    recommendation: str

@router.post("/{signal_id}/doctor-validate", response_model=SignalResponse)
async def doctor_validate(signal_id: str, request: DoctorValidateRequest, db: Session = Depends(get_db)):
    """
    Increment doctor validation count and handle escalation if recommended.
    """
    signal = db.query(Signal).filter(Signal.id == signal_id).first()
    if not signal:
        raise HTTPException(status_code=404, detail="Signal not found")
    
    signal.doctor_validations += 1
    
    if request.recommendation == 'escalate':
        signal.submitted_to_authority = True
        signal.submitted_at = datetime.utcnow()
        signal.authority_status = 'acknowledged'
        signal.status = 'escalated'
    
    verification = VerificationResponse(
        signal_id=signal_id,
        role='doctor',
        response_data=json.dumps(request.answers)
    )
    db.add(verification)
    db.commit()
    db.refresh(signal)
    
    return signal

@router.post("/{signal_id}/submit", response_model=SignalResponse)
async def submit_signal(signal_id: str, db: Session = Depends(get_db)):
    """
    Mark signal as submitted to CDSCO, log timestamp.
    """
    signal = db.query(Signal).filter(Signal.id == signal_id).first()
    if not signal:
        raise HTTPException(status_code=404, detail="Signal not found")
    
    signal.status = "escalated"
    signal.submitted_to_authority = True
    signal.submitted_at = datetime.utcnow()
    signal.authority_status = 'acknowledged'
    
    db.commit()
    db.refresh(signal)
    
    return signal

@router.put("/{signal_id}/status", response_model=SignalResponse)
async def update_signal_status(
    signal_id: str, 
    status: str,
    db: Session = Depends(get_db)
):
    """
    Update signal status (for demo purposes).
    """
    signal = db.query(Signal).filter(Signal.id == signal_id).first()
    if not signal:
        raise HTTPException(status_code=404, detail="Signal not found")
    
    valid_statuses = ["pending_review", "escalated", "under_review", "resolved"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    signal.status = status
    db.commit()
    db.refresh(signal)
    
    return signal
