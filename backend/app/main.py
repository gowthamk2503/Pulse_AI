import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Response, Request
from fastapi.responses import JSONResponse
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

# CORS configuration - Allow Vercel frontend, local dev, custom origins, and any matching regex
configured_origins = [
    "https://pulse-ai-plum.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]
env_origins = os.environ.get("CORS_ORIGINS", "")
if env_origins and env_origins != "*":
    configured_origins.extend([o.strip() for o in env_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=configured_origins,
    allow_origin_regex=r"^https?:\/\/.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Fail-safe CORS response middleware ensuring headers on preflight & unhandled errors
@app.middleware("http")
async def ensure_cors_headers(request: Request, call_next):
    origin = request.headers.get("origin")
    if request.method == "OPTIONS":
        response = Response(status_code=200)
    else:
        try:
            response = await call_next(request)
        except Exception as exc:
            logger.error(f"Unhandled server error: {exc}", exc_info=True)
            response = JSONResponse(
                status_code=500,
                content={"detail": "An internal server error occurred."}
            )

    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH"
        req_headers = request.headers.get("access-control-request-headers")
        response.headers["Access-Control-Allow-Headers"] = req_headers if req_headers else "Authorization, Content-Type, Accept, Origin, X-Requested-With"
        response.headers["Access-Control-Expose-Headers"] = "*"
        response.headers["Access-Control-Max-Age"] = "86400"

    return response

# Mount routes at both /api and root / so any client configuration works seamlessly
app.include_router(router, prefix="/api")
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
