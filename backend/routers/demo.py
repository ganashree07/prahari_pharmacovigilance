from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db, Signal, VerificationResponse
from pydantic import BaseModel

router = APIRouter()

@router.post("/reset")
async def reset_demo(db: Session = Depends(get_db)):
    """
    Resets all signal statuses to original seeded values.
    Resets all submission timestamps and validation counts.
    This lets me reset the demo between judge presentations without restarting the server.
    """
    # Delete all verification responses
    db.query(VerificationResponse).delete()
    
    # Reset all signals to original seeded values for the demo
    original_values = {
        "1": {"drug": "Metformin", "confidence": 87, "integrity": 94, "category": "NOVEL", "status": "pending_review"},
        "2": {"drug": "Paracetamol", "confidence": 72, "integrity": 89, "category": "KNOWN", "status": "escalated"},
        "3": {"drug": "Azithromycin", "confidence": 65, "integrity": 78, "category": "NOVEL", "status": "under_review"},
        "4": {"drug": "Ibuprofen", "confidence": 55, "integrity": 91, "category": "KNOWN", "status": "resolved"},
        "5": {"drug": "Atorvastatin", "confidence": 81, "integrity": 70, "category": "NOVEL", "status": "pending_review"}
    }
    
    reset_count = 0
    
    for signal_id, values in original_values.items():
        signal = db.query(Signal).filter(Signal.id == signal_id).first()
        if signal:
            signal.status = values["status"]
            signal.confidence = values["confidence"]
            signal.integrity = values["integrity"]
            signal.category = values["category"]
            signal.submitted_at = datetime.utcnow() if values["status"] == "escalated" else None
            signal.user_confirmations = 0
            signal.doctor_validations = 0
            signal.submitted_to_authority = True if values["status"] == "escalated" else False
            signal.authority_status = 'acknowledged' if values["status"] == "escalated" else 'pending'
            # Explicitly clear any verification data or audit trails
            signal.verification_data = None 
            reset_count += 1
    
    db.commit()
    
    return {
        "message": "Demo reset successfully",
        "signals_reset": reset_count,
        "reset_time": datetime.utcnow().isoformat()
    }
