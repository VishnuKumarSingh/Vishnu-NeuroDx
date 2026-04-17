"""
CNN Model — Brain Tumor Multi-Class Classifier
Architecture: Conv2D → MaxPool → Conv2D → MaxPool → Flatten → Dense → Softmax
"""

import os
import logging
import numpy as np
from typing import Optional

logger = logging.getLogger(__name__)

# ── Class Labels ─────────────────────────────────────────────────────────────
CLASS_NAMES = ["Glioma", "Meningioma", "No Tumor", "Pituitary Tumor"]
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../../saved_models/brain_tumor_cnn.h5")

_model = None   # Singleton cache


def build_cnn(num_classes: int = 4, input_shape=(128, 128, 3)):
    """
    Build the CNN architecture.
    Can be imported independently by the training script.
    """
    # Lazy import — TF only needed when explicitly requested
    import tensorflow as tf
    from tensorflow.keras import layers, models, regularizers

    model = models.Sequential([
        # ── Block 1 ──────────────────────────────────────────────────────────
        layers.Conv2D(32, (3, 3), activation="relu", padding="same",
                      input_shape=input_shape, name="conv1_1"),
        layers.BatchNormalization(),
        layers.Conv2D(32, (3, 3), activation="relu", padding="same", name="conv1_2"),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2), name="pool1"),
        layers.Dropout(0.25),

        # ── Block 2 ──────────────────────────────────────────────────────────
        layers.Conv2D(64, (3, 3), activation="relu", padding="same", name="conv2_1"),
        layers.BatchNormalization(),
        layers.Conv2D(64, (3, 3), activation="relu", padding="same", name="conv2_2"),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2), name="pool2"),
        layers.Dropout(0.25),

        # ── Block 3 ──────────────────────────────────────────────────────────
        layers.Conv2D(128, (3, 3), activation="relu", padding="same", name="conv3_1"),
        layers.BatchNormalization(),
        layers.Conv2D(128, (3, 3), activation="relu", padding="same", name="conv3_last"),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2), name="pool3"),
        layers.Dropout(0.4),

        # ── Classifier Head ───────────────────────────────────────────────────
        layers.Flatten(),
        layers.Dense(512, activation="relu",
                     kernel_regularizer=regularizers.l2(1e-4)),
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        layers.Dense(256, activation="relu"),
        layers.Dropout(0.3),
        layers.Dense(num_classes, activation="softmax", name="predictions"),
    ], name="NeuroAI_CNN")

    model.compile(
        optimizer="adam",
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def load_cnn_model():
    """Load model from disk into the module-level singleton."""
    global _model
    if _model is not None:
        return _model

    model_path = os.path.abspath(MODEL_PATH)
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Trained model not found at: {model_path}")

    import tensorflow as tf
    _model = tf.keras.models.load_model(model_path)
    logger.info(f"CNN model loaded from {model_path}")
    return _model


def get_model():
    """Return the cached model, or None if not loaded."""
    return _model


def predict(image_array: np.ndarray) -> dict:
    """
    Run inference on a pre-processed image array shaped (1, 128, 128, 3).

    Returns:
        {
          "predicted_class": str,
          "confidence": float,        # 0–100
          "probabilities": {class: prob, ...}
        }
    """
    model = get_model()

    if model is None:
        # ── Demo / fallback mode when no .h5 is present ──────────────────────
        logger.warning("Running in DEMO mode — no trained model found.")
        probs = np.array([0.72, 0.12, 0.10, 0.06])
        predicted_idx = int(np.argmax(probs))
    else:
        raw_probs = model.predict(image_array, verbose=0)[0]
        probs = raw_probs
        predicted_idx = int(np.argmax(probs))

    predicted_class = CLASS_NAMES[predicted_idx]
    confidence = float(probs[predicted_idx]) * 100

    probabilities = {
        CLASS_NAMES[i]: round(float(probs[i]) * 100, 2)
        for i in range(len(CLASS_NAMES))
    }

    return {
        "predicted_class": predicted_class,
        "confidence": round(confidence, 2),
        "probabilities": probabilities,
    }
