"""
/api/v1/predict  — MRI image upload & inference endpoint
"""

import logging
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse

from app.utils.image_processing import validate_image, ALLOWED_EXTENSIONS
from app.services.prediction import run_full_prediction
from app.models.ml_models import get_model_comparison_stats

logger = logging.getLogger(__name__)
router = APIRouter()

MAX_FILE_SIZE = 20 * 1024 * 1024   # 20 MB


@router.post("/predict", summary="Run brain tumor prediction on an MRI image")
async def predict(file: UploadFile = File(...)):
    """
    Upload an MRI image (JPG / PNG) and receive:
    - CNN classification + confidence + per-class probabilities
    - Grad-CAM heatmap (base64 PNG)
    - SVM & Random Forest predictions
    - Model benchmark comparison metrics
    """
    # ── Validation ────────────────────────────────────────────────────────────
    suffix = f".{file.filename.rsplit('.', 1)[-1].lower()}" if "." in file.filename else ""
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{suffix}'. Allowed: {ALLOWED_EXTENSIONS}",
        )

    file_bytes = await file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum 20 MB.")

    if not validate_image(file_bytes):
        raise HTTPException(status_code=400, detail="File is not a valid image.")

    # ── Inference ─────────────────────────────────────────────────────────────
    try:
        result = await run_full_prediction(file_bytes)
        result["model_comparison_stats"] = get_model_comparison_stats()
        return JSONResponse(content=result)
    except Exception as exc:
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(exc)}")
