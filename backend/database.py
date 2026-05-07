from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Boolean, Text, JSON, ForeignKey
import uuid
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import asyncio

SQLALCHEMY_DATABASE_URL = "sqlite:///./prahari.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Signal(Base):
    __tablename__ = "signals"
    
    id = Column(String, primary_key=True)
    drug = Column(String, nullable=False)
    symptom = Column(String, nullable=False)
    meddra = Column(String, nullable=False)
    source = Column(String, nullable=False)
    source_url = Column(Text)
    confidence = Column(Float, nullable=False)
    integrity = Column(Float, nullable=False)
    category = Column(String, nullable=False)  # KNOWN, NOVEL, UNRELATED
    status = Column(String, nullable=False)  # pending_review, escalated, under_review, resolved
    raw_text = Column(Text)
    verification_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    submitted_at = Column(DateTime, nullable=True)
    user_confirmations = Column(Integer, default=0)
    doctor_validations = Column(Integer, default=0)
    submitted_to_authority = Column(Boolean, default=False)
    authority_status = Column(String, default='pending')

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    keywords = Column(JSON, nullable=False)  # List of strings
    sources = Column(JSON, nullable=False)  # List of strings
    latency_config = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class OnboardingJob(Base):
    __tablename__ = "onboarding_jobs"
    
    id = Column(String, primary_key=True)
    url = Column(String, nullable=False)
    status = Column(String, nullable=False)  # pending, running, completed, failed
    progress = Column(Integer, default=0)
    current_step = Column(Integer, default=0)
    total_steps = Column(Integer, default=6)
    steps = Column(JSON, nullable=False)
    confidence = Column(Float)
    extraction_schema = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)

class VerificationResponse(Base):
    __tablename__ = "verification_responses"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    signal_id = Column(String, ForeignKey("signals.id"))
    role = Column(String)  # 'user' or 'doctor'
    response_data = Column(Text)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

async def init_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Seed data
    await seed_signals()

async def seed_signals():
    from sqlalchemy.orm import Session
    
    db = SessionLocal()
    try:
        # Check if signals already exist
        existing_signals = db.query(Signal).first()
        if existing_signals:
            return
        
        # Seed mock signals
        mock_signals = [
            {
                "id": "1",
                "drug": "Metformin",
                "symptom": "Toxic epidermal necrolysis",
                "meddra": "10043391",
                "source": "Reddit",
                "source_url": "https://reddit.com/r/diabetes/comments/abc123",
                "confidence": 87,
                "integrity": 94,
                "category": "NOVEL",
                "status": "pending_review",
                "raw_text": "I've been on metformin for 6 months and suddenly developed severe skin reactions. My doctor says it looks like toxic epidermal necrolysis. Has anyone else experienced this? The rash started 2 weeks ago and has been getting progressively worse. I'm now hospitalized and they're saying it might be connected to the metformin.",
                "verification_data": None,
                "created_at": datetime.utcnow() - timedelta(days=7)
            },
            {
                "id": "2",
                "drug": "Paracetamol",
                "symptom": "Nausea",
                "meddra": "10028813",
                "source": "Practo",
                "confidence": 72,
                "integrity": 89,
                "category": "KNOWN",
                "status": "escalated",
                "raw_text": "After taking paracetamol for my headache, I experienced nausea and stomach discomfort. This happens every time I take it.",
                "created_at": datetime.utcnow() - timedelta(days=5)
            },
            {
                "id": "3",
                "drug": "Azithromycin",
                "symptom": "Palpitations",
                "meddra": "10033557",
                "source": "Twitter/X",
                "confidence": 65,
                "integrity": 78,
                "category": "NOVEL",
                "status": "under_review",
                "raw_text": "Started azithromycin yesterday and now having heart palpitations. Is this normal? Should I be concerned?",
                "created_at": datetime.utcnow() - timedelta(days=3)
            },
            {
                "id": "4",
                "drug": "Ibuprofen",
                "symptom": "Headache",
                "meddra": "10019211",
                "source": "Quora",
                "confidence": 55,
                "integrity": 91,
                "category": "KNOWN",
                "status": "resolved",
                "raw_text": "I've been getting headaches after taking ibuprofen. Is this a known side effect?",
                "created_at": datetime.utcnow() - timedelta(days=2)
            },
            {
                "id": "5",
                "drug": "Atorvastatin",
                "symptom": "Memory loss",
                "meddra": "10027986",
                "source": "LocalCircles",
                "confidence": 81,
                "integrity": 70,
                "category": "NOVEL",
                "status": "pending_review",
                "raw_text": "My father has been on atorvastatin for 3 months and is experiencing memory loss. The doctor says it's unrelated but I'm not convinced.",
                "created_at": datetime.utcnow()
            }
        ]
        
        for signal_data in mock_signals:
            signal = Signal(**signal_data)
            db.add(signal)
        
        db.commit()
        
        # Seed mock projects
        mock_projects = [
            {
                "id": "1",
                "name": "Diabetes Drug Monitoring",
                "keywords": ["metformin", "insulin", "glipizide", "hypoglycemia", "hyperglycemia"],
                "sources": ["Reddit", "Practo", "LocalCircles"],
                "latency_config": {
                    "real_time": True,
                    "batch_interval_hours": 1
                }
            },
            {
                "id": "2",
                "name": "Cardiovascular Drug Safety",
                "keywords": ["atorvastatin", "amlodipine", "losartan", "atenolol", "palpitations", "chest pain"],
                "sources": ["Twitter/X", "Quora", "Practo"],
                "latency_config": {
                    "real_time": False,
                    "batch_interval_hours": 4
                }
            },
            {
                "id": "3",
                "name": "Antibiotic Adverse Reactions",
                "keywords": ["azithromycin", "amoxicillin", "ciprofloxacin", "doxycycline", "allergy", "rash"],
                "sources": ["Reddit", "Twitter/X", "Quora"],
                "latency_config": {
                    "real_time": True,
                    "batch_interval_hours": 2
                }
            }
        ]
        
        for project_data in mock_projects:
            project = Project(**project_data)
            db.add(project)
        
        db.commit()
        
    finally:
        db.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
