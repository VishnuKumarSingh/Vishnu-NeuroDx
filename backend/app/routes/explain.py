"""
/api/v1/explain  — Generate AI clinical explanation
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.services.ai_explanation import generate_explanation

logger = logging.getLogger(__name__)
router = APIRouter()


class ExplainRequest(BaseModel):
    predicted_class: str
    confidence: float
    probabilities: dict
    patient_name: Optional[str] = None


@router.post("/explain", summary="Generate AI clinical explanation for a prediction")
async def explain(req: ExplainRequest):
    """
    Given a model prediction, return a natural-language clinical impression
    suitable for inclusion in a medical report.
    """
    try:
        explanation = await generate_explanation(
            predicted_class=req.predicted_class,
            confidence=req.confidence,
            probabilities=req.probabilities,
            patient_name=req.patient_name,
        )
        return {"explanation": explanation}
    except Exception as exc:
        logger.exception("Explanation generation failed")
        raise HTTPException(status_code=500, detail=str(exc))
