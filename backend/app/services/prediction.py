"""
Prediction Orchestration Service
Coordinates image preprocessing, CNN inference, Grad-CAM, and ML models.
"""

import base64
import io
import logging

import numpy as np
from PIL import Image

from app.utils.image_processing import preprocess_for_model, preprocess_for_display
from app.models import cnn_model as cnn
from app.models.gradcam import generate_gradcam_b64, generate_mock_gradcam_b64
from app.models.ml_models import predict_with_ml_models

logger = logging.getLogger(__name__)


def _encode_original(display_img: np.ndarray) -> str:
    """Encode the uint8 RGB display image as a base64 PNG data URI."""
    buf = io.BytesIO()
    Image.fromarray(display_img).save(buf, format="PNG")
    buf.seek(0)
    encoded = base64.b64encode(buf.read()).decode("utf-8")
    return f"data:image/png;base64,{encoded}"


async def run_full_prediction(file_bytes: bytes) -> dict:
    """
    Full prediction pipeline:
      1. Preprocess image for model (float32, 1×128×128×3)
      2. Run CNN inference → class + confidence + probabilities
      3. Generate Grad-CAM overlay
      4. Run SVM / Random Forest comparison
      5. Return structured response

    Returns:
        {
          "cnn": { predicted_class, confidence, probabilities },
          "gradcam_image": "data:image/png;base64,...",
          "original_image": "data:image/png;base64,...",
          "ml_models": { svm: {...}, random_forest: {...} },
        }
    """
    # ── 1. Preprocessing ──────────────────────────────────────────────────────
    model_input = preprocess_for_model(file_bytes)         # (1,128,128,3) float32
    display_img = preprocess_for_display(file_bytes)       # (128,128,3)   uint8

    original_b64 = _encode_original(display_img)

    # ── 2. CNN Inference ──────────────────────────────────────────────────────
    cnn_result = cnn.predict(model_input)
    predicted_idx = list(cnn.CLASS_NAMES).index(cnn_result["predicted_class"])

    # ── 3. Grad-CAM ───────────────────────────────────────────────────────────
    loaded_model = cnn.get_model()
    if loaded_model is not None:
        gradcam_b64 = generate_gradcam_b64(
            model_input, display_img, loaded_model, predicted_idx
        )
    else:
        gradcam_b64 = generate_mock_gradcam_b64(display_img)

    # ── 4. ML Models ──────────────────────────────────────────────────────────
    ml_results = predict_with_ml_models(model_input, loaded_model)

    return {
        "cnn": cnn_result,
        "gradcam_image": gradcam_b64,
        "original_image": original_b64,
        "ml_models": ml_results,
    }
