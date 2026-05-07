from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from routers import projects, signals, dashboard, sources, demo
from database import init_db
from nlp_pipeline import NLPipeline

# Global NLP pipeline instance
nlp_pipeline = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database
    await init_db()
    
    # Initialize NLP pipeline
    global nlp_pipeline
    nlp_pipeline = NLPipeline()
    
    yield
    
    # Cleanup
    pass

app = FastAPI(
    title="Prahari API",
    description="Pharmacovigilance Social Listening Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://0.0.0.0:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(signals.router, prefix="/api/signals", tags=["signals"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(sources.router, prefix="/api/sources", tags=["sources"])
app.include_router(demo.router, prefix="/api/demo", tags=["demo"])

@app.get("/")
async def root():
    return {"message": "Prahari API - Pharmacovigilance Social Listening Platform"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "nlp_pipeline": nlp_pipeline is not None}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
