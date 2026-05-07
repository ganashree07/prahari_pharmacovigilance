from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime
import asyncio
import uuid
from database import get_db, OnboardingJob
from pydantic import BaseModel

router = APIRouter()

class OnboardingRequest(BaseModel):
    url: str

class OnboardingStep(BaseModel):
    step: str
    status: str
    timestamp: str
    details: str = None

class OnboardingResponse(BaseModel):
    job_id: str
    status: str
    message: str

# In-memory storage for demo (in production, use Redis or database)
onboarding_jobs: Dict[str, Dict] = {}

@router.post("/onboard", response_model=OnboardingResponse)
async def start_onboarding(request: OnboardingRequest):
    """
    Accept a URL, return a mock agentic onboarding result.
    """
    job_id = str(uuid.uuid4())
    
    # Initialize job
    job = {
        "id": job_id,
        "url": request.url,
        "status": "running",
        "progress": 0,
        "current_step": 0,
        "total_steps": 6,
        "steps": [
            {"step": "URL Validation", "status": "pending", "timestamp": datetime.utcnow().isoformat()},
            {"step": "Content Analysis", "status": "pending", "timestamp": datetime.utcnow().isoformat()},
            {"step": "Schema Detection", "status": "pending", "timestamp": datetime.utcnow().isoformat()},
            {"step": "Extraction Testing", "status": "pending", "timestamp": datetime.utcnow().isoformat()},
            {"step": "Confidence Scoring", "status": "pending", "timestamp": datetime.utcnow().isoformat()},
            {"step": "Integration Setup", "status": "pending", "timestamp": datetime.utcnow().isoformat()}
        ],
        "created_at": datetime.utcnow().isoformat()
    }
    
    onboarding_jobs[job_id] = job
    
    # Start background simulation
    asyncio.create_task(simulate_onboarding_progress(job_id))
    
    return OnboardingResponse(
        job_id=job_id,
        status="started",
        message="Onboarding process initiated"
    )

@router.get("/onboard/{job_id}/status")
async def get_onboarding_status(job_id: str):
    """
    Return current step progress for polling.
    """
    if job_id not in onboarding_jobs:
        raise HTTPException(status_code=404, detail="Onboarding job not found")
    
    job = onboarding_jobs[job_id]
    
    return {
        "job_id": job_id,
        "url": job["url"],
        "status": job["status"],
        "progress": job["progress"],
        "current_step": job["current_step"],
        "total_steps": job["total_steps"],
        "steps": job["steps"],
        "confidence": job.get("confidence"),
        "extraction_schema": job.get("extraction_schema"),
        "created_at": job["created_at"],
        "completed_at": job.get("completed_at")
    }

async def simulate_onboarding_progress(job_id: str):
    """
    Simulate the 6-step agentic onboarding process.
    """
    if job_id not in onboarding_jobs:
        return
    
    job = onboarding_jobs[job_id]
    
    for i in range(6):
        # Update previous step to completed
        if i > 0:
            job["steps"][i-1]["status"] = "completed"
        
        # Update current step to running
        job["steps"][i]["status"] = "running"
        job["current_step"] = i + 1
        job["progress"] = round(((i + 1) / 6) * 100)
        
        # Add small delay for realism
        await asyncio.sleep(1.5)
    
    # Mark all steps as completed
    for step in job["steps"]:
        step["status"] = "completed"
    
    # Finalize job
    job["status"] = "completed"
    job["progress"] = 100
    job["completed_at"] = datetime.utcnow().isoformat()
    
    # Add mock results
    import random
    job["confidence"] = random.randint(85, 97)
    job["extraction_schema"] = {
        "title_selector": "h1, .title, .post-title",
        "content_selector": ".content, .post-content, article, .message",
        "date_selector": ".date, .timestamp, time, .post-date",
        "author_selector": ".author, .username, .user, .poster",
        "metadata_fields": ["likes", "shares", "comments", "views"],
        "extraction_rules": {
            "min_content_length": 50,
            "max_content_length": 10000,
            "required_fields": ["title", "content"],
            "optional_fields": ["author", "date"]
        }
    }
    
    # Store in database for persistence
    from database import SessionLocal, OnboardingJob
    db = SessionLocal()
    try:
        db_job = OnboardingJob(
            id=job_id,
            url=job["url"],
            status=job["status"],
            progress=job["progress"],
            current_step=job["current_step"],
            total_steps=job["total_steps"],
            steps=job["steps"],
            confidence=job["confidence"],
            extraction_schema=job["extraction_schema"],
            created_at=datetime.fromisoformat(job["created_at"]),
            completed_at=datetime.fromisoformat(job["completed_at"]) if job["completed_at"] else None
        )
        db.add(db_job)
        db.commit()
    except Exception as e:
        print(f"Error saving onboarding job: {e}")
    finally:
        db.close()
