"""
NeuroAI - Advanced Brain Tumor Diagnosis System
FastAPI Backend Entry Point
"""

import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routes import predict, report, explain, chat
from app.models.cnn_model import load_cnn_model

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle management."""
    logger.info("🧠 NeuroAI starting up — loading models...")
    try:
        load_cnn_model()
        logger.info("✅ CNN model loaded successfully.")
    except Exception as e:
        logger.warning(f"⚠️  CNN model not found, will use mock predictions: {e}")

    # Ensure required directories exist
    os.makedirs("reports", exist_ok=True)
    os.makedirs("saved_models", exist_ok=True)

    yield

    logger.info("🛑 NeuroAI shutting down...")


app = FastAPI(
    title="NeuroAI Brain Tumor Diagnosis API",
    description=(
        "Advanced AI-powered brain tumor detection platform. "
        "Classifies MRI scans into Glioma, Meningioma, Pituitary Tumor, or No Tumor. "
        "Includes Grad-CAM heatmaps, generative AI explanations, and PDF reporting."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Lock down to your domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static files (generated reports & heatmaps) ────────────────────────────
os.makedirs("reports", exist_ok=True)
app.mount("/reports", StaticFiles(directory="reports"), name="reports")

# ── Routers ─────────────────────────────────────────────────────────────────
app.include_router(predict.router, prefix="/api/v1", tags=["Prediction"])
app.include_router(report.router,  prefix="/api/v1", tags=["Reports"])
app.include_router(explain.router, prefix="/api/v1", tags=["Explanation"])
app.include_router(chat.router,    prefix="/api/v1", tags=["Chat"])


# ── Root / Health ────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "NeuroAI Brain Tumor Diagnosis System",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}
