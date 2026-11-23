import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.api import api_router
from backend.app.db.init_db import init_db
from backend.app.db.session import ACTIVE_DB_TYPE
from backend.app.core.model_loader import ml_engine

logger = logging.getLogger("phishshield.main")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup 1: Ensure database tables exist
    logger.info("Initializing PhishShield AI Application...")
    try:
        init_db()
        logger.info(f"Database schema verified on: {ACTIVE_DB_TYPE}")
    except Exception as e:
        logger.warning(f"Database auto-initialization deferred or failed: {e}")

    # Startup 2: Load Joblib Machine Learning Artifacts
    ml_loaded = ml_engine.load_artifacts()
    if ml_loaded:
        logger.info(f"ML Model successfully mounted: {ml_engine.model_name}")
    else:
        logger.info("ML Engine operating in heuristic fallback mode (run 'python ml/train.py' to generate Joblib model).")

    yield
    # Shutdown
    logger.info("PhishShield AI Application shutting down.")

app = FastAPI(
    title="AI-Based Phishing Website Detection API",
    description="REST API service for analyzing URLs, extracting lexical/structural features, and detecting phishing websites using Machine Learning.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS Middleware for React Frontend
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
origins.extend([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
])

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(set(origins)),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API Routers
app.include_router(api_router)

@app.get("/", tags=["System"])
def root_status():
    return {
        "project": "AI-Based Phishing Website Detection Using Machine Learning",
        "status": "Online",
        "database": ACTIVE_DB_TYPE,
        "ml_model_active": ml_engine.model_name if ml_engine.is_loaded else "Heuristic Fallback",
        "ml_engine_loaded": ml_engine.is_loaded,
        "docs_url": "/docs",
        "api_v1": "/api"
    }

@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "Healthy",
        "database_engine": ACTIVE_DB_TYPE,
        "ml_inference_ready": True,
        "ml_model_loaded": ml_engine.is_loaded,
        "active_model_name": ml_engine.model_name
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
