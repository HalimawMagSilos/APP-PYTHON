"""
FastAPI entrypoint for AFRS microservice.
Startup initializes DB table and ensures model/index directories exist.
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import enroll, match
from app.db import ensure_table
from app.utils import ensure_dir, logger
from app.config import Config
import os

app = FastAPI(
    title="AFRS - AI Facial Recognition Service",
    version="1.0.0",
    description="AFRS microservice for SPRS integration"
)

# ---------- CORS FIX ----------
origins = [
    "http://localhost:5173",       # your frontend dev
    "http://localhost",            # optional
    "https://your-frontend-domain.com"  # deployed frontend if any
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # allow these origins
    allow_credentials=True,
    allow_methods=["*"],            # allow GET, POST, etc.
    allow_headers=["*"],            # allow custom headers like x-api-key
)
# -------------------------------

app.include_router(enroll.router, prefix="/enroll", tags=["Enroll"])
app.include_router(match.router, prefix="/match", tags=["Match"])

@app.on_event("startup")
def startup_event():
    logger.info("Starting AFRS...")
    ensure_table()
    ensure_dir(Config.DATA_FOLDER)
    ensure_dir(Config.TMP_DIR)
    # We purposely do not force-model-load at startup to avoid blocking; models load lazily on first request.
    logger.info("AFRS startup complete. Endpoints ready.")

@app.get("/health")
@app.get("/api/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host=Config.HOST, port=Config.PORT, log_level=Config.LOG_LEVEL)
