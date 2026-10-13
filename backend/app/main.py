import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from app.database.db import init_db
from app.api.routes import router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("pulseai")

# Configure PyTorch memory efficiency if torch is available
try:
    import torch
    torch.set_num_threads(1)
except Exception:
    pass

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database quickly without blocking server binding
    logger.info("Initializing PulseAI database...")
    init_db()
    logger.info("PulseAI Backend startup complete.")
    yield
    # Shutdown
    logger.info("Shutting down PulseAI Backend.")

app = FastAPI(
    title="PulseAI — Emotion Intelligence API",
    description="Backend API powering the PulseAI Emotion Intelligence platform. Features real-time text emotion classification, batch CSV analysis, analytics, and persistent history.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration - Allow all origins or specified
origins_env = os.environ.get("CORS_ORIGINS", "*")
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

# Support both GET and HEAD for Render/cloud port health checks
@app.api_route("/", methods=["GET", "HEAD"])
def root(response: Response):
    return {
        "app": "PulseAI — Emotion Intelligence Platform",
        "status": "online",
        "docs_url": "/docs",
        "api_health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
