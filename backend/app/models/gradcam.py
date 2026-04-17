"""
Grad-CAM — Gradient-weighted Class Activation Mapping
Produces a heatmap highlighting the tumor region in the MRI scan.
"""

import io
import base64
import logging

import cv2
import numpy as np

logger = logging.getLogger(__name__)

LAST_CONV_LAYER = "conv3_last"   # must match layer name in cnn_model.py


def compute_gradcam(
    image_array: np.ndarray,
    model,
    class_index: int,
    last_conv_layer_name: str = LAST_CONV_LAYER,
) -> np.ndarray:
    """
    Compute the Grad-CAM heatmap for the given class.

    Args:
        image_array : preprocessed image  (1, 128, 128, 3)  float32
        model       : loaded Keras model
        class_index : predicted class index
        last_conv_layer_name : name of the target convolutional layer

    Returns:
        heatmap : uint8 array (128, 128, 3) — BGR colormap
    """
    import tensorflow as tf

    # Build a sub-model that outputs (last_conv_output, final_predictions)
    grad_model = tf.keras.Model(
        inputs=model.inputs,
        outputs=[
            model.get_layer(last_conv_layer_name).output,
            model.output,
        ],
    )

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(image_array)
        loss = predictions[:, class_index]

    # Gradients of the class score w.r.t. last conv feature map
    grads = tape.gradient(loss, conv_outputs)

    # Global average pooling of gradients → importance weight per channel
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    # Weight the conv output channels by their gradient importance
    conv_outputs = conv_outputs[0]                          # (H, W, C)
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]  # (H, W, 1)
    heatmap = tf.squeeze(heatmap)                           # (H, W)

    # ReLU + normalize to [0, 1]
    heatmap = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-8)
    heatmap = heatmap.numpy()

    # Resize heatmap to input image size
    heatmap_resized = cv2.resize(heatmap, (128, 128))

    # Apply COLORMAP_JET → vibrant red/yellow highlights
    heatmap_uint8 = np.uint8(255 * heatmap_resized)
    heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)

    return heatmap_colored  # BGR uint8 (128, 128, 3)


def overlay_heatmap(
    original_img: np.ndarray,
    heatmap: np.ndarray,
    alpha: float = 0.45,
) -> np.ndarray:
    """
    Blend the original MRI (RGB, 128×128) with the Grad-CAM heatmap (BGR).

    Args:
        original_img : uint8 RGB array (128, 128, 3)
        heatmap      : uint8 BGR colormap (128, 128, 3)
        alpha        : heatmap opacity (0 = invisible, 1 = full)

    Returns:
        overlay : uint8 RGB array (128, 128, 3)
    """
    # Convert heatmap BGR → RGB so colors are consistent
    heatmap_rgb = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
    overlay = cv2.addWeighted(original_img, 1 - alpha, heatmap_rgb, alpha, 0)
    return overlay


def generate_gradcam_b64(
    image_array: np.ndarray,
    original_display: np.ndarray,
    model,
    class_index: int,
) -> str:
    """
    Full pipeline: compute heatmap → overlay → encode as base64 PNG.

    Args:
        image_array      : preprocessed float32 array (1, 128, 128, 3)
        original_display : uint8 RGB array (128, 128, 3) — raw resize of input
        model            : Keras model
        class_index      : predicted class index

    Returns:
        base64-encoded PNG string (data URI ready)
    """
    try:
        heatmap = compute_gradcam(image_array, model, class_index)
        overlay = overlay_heatmap(original_display, heatmap)

        # Encode to PNG → base64
        overlay_pil_bytes = io.BytesIO()
        from PIL import Image
        Image.fromarray(overlay).save(overlay_pil_bytes, format="PNG")
        overlay_pil_bytes.seek(0)
        encoded = base64.b64encode(overlay_pil_bytes.read()).decode("utf-8")
        return f"data:image/png;base64,{encoded}"

    except Exception as exc:
        logger.error(f"Grad-CAM generation failed: {exc}")
        return ""


def generate_mock_gradcam_b64(original_display: np.ndarray) -> str:
    """
    Fallback when model is unavailable — returns a mock red-circle overlay.
    Used in demo / test mode.
    """
    mock = original_display.copy()
    h, w = mock.shape[:2]
    cx, cy, radius = w // 2, h // 2, min(w, h) // 4
    overlay = mock.copy()
    cv2.circle(overlay, (cx, cy), radius, (255, 50, 50), -1)
    blended = cv2.addWeighted(mock, 0.6, overlay, 0.4, 0)

    buf = io.BytesIO()
    from PIL import Image
    Image.fromarray(blended).save(buf, format="PNG")
    buf.seek(0)
    encoded = base64.b64encode(buf.read()).decode("utf-8")
    return f"data:image/png;base64,{encoded}"
