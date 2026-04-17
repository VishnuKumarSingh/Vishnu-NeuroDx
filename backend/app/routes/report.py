"""
/api/v1/generate-report  — Build and return a PDF diagnostic report
"""

import os
import logging
from typing import Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.services.report_generator import generate_report
from app.services.ai_explanation import generate_explanation

logger = logging.getLogger(__name__)
router = APIRouter()


class ReportRequest(BaseModel):
    patient_name: str
    patient_age: Optional[int] = None
    prediction: dict               # CNN result dict
    ml_results: Optional[dict] = None
    gradcam_image: str = ""        # base64 PNG
    original_image: str = ""       # base64 PNG
    explanation: Optional[str] = None


@router.post("/generate-report", summary="Generate a downloadable PDF diagnostic report")
async def create_report(req: ReportRequest):
    """
    Accepts prediction data + patient info, builds a PDF report, and returns it
    as a file download.
    """
    try:
        explanation = req.explanation
        if not explanation:
            explanation = await generate_explanation(
                predicted_class=req.prediction.get("predicted_class", "Unknown"),
                confidence=req.prediction.get("confidence", 0.0),
                probabilities=req.prediction.get("probabilities", {}),
                patient_name=req.patient_name,
            )

        filepath = generate_report(
            patient_name=req.patient_name,
            patient_age=req.patient_age,
            prediction=req.prediction,
            explanation=explanation,
            gradcam_b64=req.gradcam_image,
            original_b64=req.original_image,
            ml_results=req.ml_results,
        )

        if not os.path.exists(filepath):
            raise HTTPException(status_code=500, detail="Report file not created.")

        return FileResponse(
            path=filepath,
            media_type="application/pdf",
            filename=os.path.basename(filepath),
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Report generation failed")
        raise HTTPException(status_code=500, detail=f"Report error: {str(exc)}")
