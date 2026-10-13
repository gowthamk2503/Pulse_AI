import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.db import init_db
from app.services.emotion_service import EmotionService
from app.api.routes import router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("pulseai")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database and load model singleton
    logger.info("Initializing PulseAI database...")
    init_db()
    logger.info("Initializing Emotion Intelligence model...")
    EmotionService.get_instance()
    logger.info("PulseAI Backend is ready.")
    yield
    # Shutdown
    logger.info("Shutting down PulseAI Backend.")

app = FastAPI(
    title="PulseAI — Emotion Intelligence API",
    description="Backend API powering the PulseAI Emotion Intelligence platform. Features real-time text emotion classification, batch CSV analysis, analytics, and persistent history.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
origins_env = os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000")
allowed_origins = [o.strip() for o in origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes
app.include_router(router)

@app.get("/")
def root():
    return {
        "app": "PulseAI — Emotion Intelligence Platform",
        "status": "online",
        "docs_url": "/docs",
        "api_health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
