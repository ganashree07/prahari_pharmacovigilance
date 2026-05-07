from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from database import get_db, Project
from pydantic import BaseModel

router = APIRouter()

class LatencyConfig(BaseModel):
    real_time: bool
    batch_interval_hours: int

class ProjectCreate(BaseModel):
    name: str
    keywords: List[str]
    sources: List[str]
    latency_config: LatencyConfig

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    keywords: Optional[List[str]] = None
    sources: Optional[List[str]] = None
    latency_config: Optional[LatencyConfig] = None

class ProjectResponse(BaseModel):
    id: str
    name: str
    keywords: List[str]
    sources: List[str]
    latency_config: LatencyConfig
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

@router.get("/", response_model=List[ProjectResponse])
async def get_projects(db: Session = Depends(get_db)):
    """
    Get all monitoring projects.
    """
    projects = db.query(Project).all()
    return projects

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, db: Session = Depends(get_db)):
    """
    Get single project by ID.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return project

@router.post("/", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    """
    Create a new monitoring project.
    """
    # Generate unique ID
    project_id = str(int(datetime.utcnow().timestamp() * 1000))
    
    db_project = Project(
        id=project_id,
        name=project.name,
        keywords=project.keywords,
        sources=project.sources,
        latency_config=project.latency_config.dict(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    return db_project

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str, 
    project_update: ProjectUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update an existing project.
    """
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Update fields if provided
    update_data = project_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "latency_config" and value:
            setattr(db_project, field, value.dict())
        else:
            setattr(db_project, field, value)
    
    db_project.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_project)
    
    return db_project

@router.delete("/{project_id}")
async def delete_project(project_id: str, db: Session = Depends(get_db)):
    """
    Delete a project.
    """
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(db_project)
    db.commit()
    
    return {"message": "Project deleted successfully"}
