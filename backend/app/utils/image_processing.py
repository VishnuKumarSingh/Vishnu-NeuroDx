"""
Image Preprocessing Utilities
Handles resizing, normalization, noise removal, and augmentation for MRI images.
"""

import io
import logging
from typing import Optional, Tuple

import cv2
import numpy as np
from PIL import Image, ImageFilter

logger = logging.getLogger(__name__)

# ── Constants ────────────────────────────────────────────────────────────────
TARGET_SIZE: Tuple[int, int] = (128, 128)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".dcm"}


def validate_image(file_bytes: bytes) -> bool:
    """Check that bytes can be decoded as an image."""
    try:
        img = Image.open(io.BytesIO(file_bytes))
        img.verify()
        return True
    except Exception:
        return False


def bytes_to_numpy(file_bytes: bytes) -> np.ndarray:
    """Convert raw file bytes → RGB numpy array."""
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    return np.array(img)


def resize_image(img: np.ndarray, size: Tuple[int, int] = TARGET_SIZE) -> np.ndarray:
    """Resize to target dimensions using INTER_AREA for downscaling quality."""
    return cv2.resize(img, size, interpolation=cv2.INTER_AREA)


def normalize_image(img: np.ndarray) -> np.ndarray:
    """Normalize pixel values to [0, 1]."""
    return img.astype(np.float32) / 255.0


def remove_noise(img: np.ndarray, kernel_size: int = 3) -> np.ndarray:
    """Apply Gaussian blur for mild noise reduction."""
    return cv2.GaussianBlur(img, (kernel_size, kernel_size), 0)


def enhance_contrast(img: np.ndarray) -> np.ndarray:
    """Apply CLAHE contrast enhancement on the L channel of LAB color space."""
    lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_enhanced = clahe.apply(l)
    lab_enhanced = cv2.merge([l_enhanced, a, b])
    return cv2.cvtColor(lab_enhanced, cv2.COLOR_LAB2RGB)


def preprocess_for_model(
    file_bytes: bytes,
    apply_noise_removal: bool = True,
    apply_contrast: bool = True,
) -> np.ndarray:
    """
    Full preprocessing pipeline:
      bytes → RGB array → noise removal → contrast enhancement
             → resize (128×128) → normalize → add batch dim → (1,128,128,3)
    """
    img = bytes_to_numpy(file_bytes)

    if apply_noise_removal:
        img = remove_noise(img)

    if apply_contrast:
        img = enhance_contrast(img)

    img = resize_image(img)
    img = normalize_image(img)
    img = np.expand_dims(img, axis=0)   # (1, 128, 128, 3)
    return img


def preprocess_for_display(file_bytes: bytes) -> np.ndarray:
    """
    Lighter pipeline for Grad-CAM overlay display (no batch dim).
    Returns uint8 RGB array at 128×128.
    """
    img = bytes_to_numpy(file_bytes)
    img = resize_image(img)
    return img  # uint8, (128, 128, 3)


def augment_image(img: np.ndarray) -> list[np.ndarray]:
    """
    Return a list of augmented variants (used during training, not inference):
      original, horizontal flip, vertical flip, 90° rotation, 180° rotation
    """
    return [
        img,
        cv2.flip(img, 1),                                # horizontal flip
        cv2.flip(img, 0),                                # vertical flip
        cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE),
        cv2.rotate(img, cv2.ROTATE_180),
    ]
