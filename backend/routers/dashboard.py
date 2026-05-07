from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from database import get_db, Signal
from pydantic import BaseModel

router = APIRouter()

class DashboardStats(BaseModel):
    active_projects: int
    signals_today: int
    novel_adrs: int
    pending_review: int

class TrendData(BaseModel):
    date: str
    known_adr: int
    novel_adr: int

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Return counts: active_projects, signals_today, novel_adrs, pending_review
    """
    # For demo, we'll use hardcoded counts
    # In a real implementation, these would be calculated from the database
    
    # Count signals today
    today = datetime.utcnow().date()
    signals_today = db.query(Signal).filter(
        func.date(Signal.created_at) == today
    ).count()
    
    # Count novel ADRs
    novel_adrs = db.query(Signal).filter(Signal.category == "NOVEL").count()
    
    # Count pending review
    pending_review = db.query(Signal).filter(Signal.status == "pending_review").count()
    
    # Active projects (hardcoded for demo)
    active_projects = 3
    
    return DashboardStats(
        active_projects=active_projects,
        signals_today=signals_today,
        novel_adrs=novel_adrs,
        pending_review=pending_review
    )

@router.get("/trend", response_model=list[TrendData])
async def get_trend_data(db: Session = Depends(get_db)):
    """
    Return 7-day signal trend data (known_adr[], novel_adr[] arrays)
    """
    # Get data for the last 7 days
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=6)
    
    trend_data = []
    
    for i in range(7):
        current_date = start_date + timedelta(days=i)
        
        # Count known ADRs for this date
        known_adrs = db.query(Signal).filter(
            func.date(Signal.created_at) == current_date,
            Signal.category == "KNOWN"
        ).count()
        
        # Count novel ADRs for this date
        novel_adrs = db.query(Signal).filter(
            func.date(Signal.created_at) == current_date,
            Signal.category == "NOVEL"
        ).count()
        
        trend_data.append(TrendData(
            date=current_date.isoformat(),
            known_adr=known_adrs,
            novel_adr=novel_adrs
        ))
    

    
    return trend_data
