"""
CNN Training Script — Brain Tumor Multi-Class Classifier
Dataset: Kaggle Brain Tumor MRI Dataset
  https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset

Expected directory structure:
  dataset/
    Training/
      glioma/
      meningioma/
      notumor/
      pituitary/
    Testing/
      glioma/
      meningioma/
      notumor/
      pituitary/

Usage:
  cd backend
  python training/train_cnn.py --data_dir ./dataset --epochs 30 --batch_size 32
"""

import argparse
import os
import sys
import json
import logging

import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import (
    ModelCheckpoint, EarlyStopping, ReduceLROnPlateau, TensorBoard
)
from sklearn.metrics import classification_report, confusion_matrix

# Ensure parent package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from app.models.cnn_model import build_cnn, CLASS_NAMES

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

IMG_SIZE   = (128, 128)
MODEL_SAVE = os.path.join(os.path.dirname(__file__), "../saved_models/brain_tumor_cnn.h5")
PLOT_DIR   = os.path.join(os.path.dirname(__file__), "../saved_models/plots")


def build_data_generators(data_dir: str, batch_size: int):
    """Build train / validation / test ImageDataGenerators with augmentation."""
    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        rotation_range=20,
        width_shift_range=0.15,
        height_shift_range=0.15,
        shear_range=0.1,
        zoom_range=0.15,
        horizontal_flip=True,
        vertical_flip=False,
        brightness_range=[0.8, 1.2],
        fill_mode="nearest",
        validation_split=0.15,   # 15 % of training set → validation
    )

    test_datagen = ImageDataGenerator(rescale=1.0 / 255)

    train_gen = train_datagen.flow_from_directory(
        os.path.join(data_dir, "Training"),
        target_size=IMG_SIZE,
        batch_size=batch_size,
        class_mode="categorical",
        subset="training",
        seed=42,
        shuffle=True,
    )

    val_gen = train_datagen.flow_from_directory(
        os.path.join(data_dir, "Training"),
        target_size=IMG_SIZE,
        batch_size=batch_size,
        class_mode="categorical",
        subset="validation",
        seed=42,
        shuffle=False,
    )

    test_gen = test_datagen.flow_from_directory(
        os.path.join(data_dir, "Testing"),
        target_size=IMG_SIZE,
        batch_size=batch_size,
        class_mode="categorical",
        shuffle=False,
    )

    logger.info(f"Train samples   : {train_gen.samples}")
    logger.info(f"Validation      : {val_gen.samples}")
    logger.info(f"Test samples    : {test_gen.samples}")
    logger.info(f"Class mapping   : {train_gen.class_indices}")

    return train_gen, val_gen, test_gen


def plot_training_history(history, save_dir: str):
    """Save accuracy and loss curves."""
    os.makedirs(save_dir, exist_ok=True)
    epochs = range(1, len(history.history["accuracy"]) + 1)

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    fig.suptitle("NeuroAI CNN — Training History", fontsize=14, fontweight="bold")

    # Accuracy
    axes[0].plot(epochs, history.history["accuracy"],        label="Train Acc", color="#3B82F6")
    axes[0].plot(epochs, history.history["val_accuracy"],    label="Val Acc",   color="#8B5CF6")
    axes[0].set_title("Accuracy")
    axes[0].set_xlabel("Epoch")
    axes[0].set_ylabel("Accuracy")
    axes[0].legend()
    axes[0].grid(alpha=0.3)

    # Loss
    axes[1].plot(epochs, history.history["loss"],            label="Train Loss", color="#EF4444")
    axes[1].plot(epochs, history.history["val_loss"],        label="Val Loss",   color="#F59E0B")
    axes[1].set_title("Loss")
    axes[1].set_xlabel("Epoch")
    axes[1].set_ylabel("Loss")
    axes[1].legend()
    axes[1].grid(alpha=0.3)

    plt.tight_layout()
    path = os.path.join(save_dir, "training_history.png")
    plt.savefig(path, dpi=150)
    plt.close()
    logger.info(f"Training history plot saved: {path}")


def plot_confusion_matrix(y_true, y_pred, save_dir: str):
    """Save a heatmap of the confusion matrix."""
    os.makedirs(save_dir, exist_ok=True)
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(8, 6))
    sns.heatmap(
        cm, annot=True, fmt="d", cmap="Blues",
        xticklabels=CLASS_NAMES, yticklabels=CLASS_NAMES,
    )
    plt.title("Confusion Matrix", fontsize=13)
    plt.ylabel("True Label")
    plt.xlabel("Predicted Label")
    plt.tight_layout()
    path = os.path.join(save_dir, "confusion_matrix.png")
    plt.savefig(path, dpi=150)
    plt.close()
    logger.info(f"Confusion matrix saved: {path}")


def main(args):
    os.makedirs(os.path.dirname(MODEL_SAVE), exist_ok=True)

    # ── Data ──────────────────────────────────────────────────────────────────
    train_gen, val_gen, test_gen = build_data_generators(args.data_dir, args.batch_size)

    # ── Model ─────────────────────────────────────────────────────────────────
    model = build_cnn(num_classes=4)
    model.summary()

    # ── Callbacks ─────────────────────────────────────────────────────────────
    callbacks = [
        ModelCheckpoint(
            MODEL_SAVE, monitor="val_accuracy",
            save_best_only=True, verbose=1,
        ),
        EarlyStopping(
            monitor="val_loss", patience=8,
            restore_best_weights=True, verbose=1,
        ),
        ReduceLROnPlateau(
            monitor="val_loss", factor=0.5,
            patience=4, min_lr=1e-6, verbose=1,
        ),
        TensorBoard(log_dir="./logs", histogram_freq=1),
    ]

    # ── Class weights (handles imbalance) ─────────────────────────────────────
    total = train_gen.samples
    class_counts = {v: 0 for v in train_gen.class_indices.values()}
    for _, labels in zip(range(len(train_gen)), train_gen):
        for lbl in labels[1].argmax(axis=1):
            class_counts[lbl] += 1
        if sum(class_counts.values()) >= total:
            break

    class_weight = {
        k: total / (len(class_counts) * v) if v > 0 else 1.0
        for k, v in class_counts.items()
    }
    logger.info(f"Class weights: {class_weight}")

    # ── Training ──────────────────────────────────────────────────────────────
    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=args.epochs,
        callbacks=callbacks,
        class_weight=class_weight,
        verbose=1,
    )

    # ── Evaluation ────────────────────────────────────────────────────────────
    logger.info("Evaluating on test set...")
    test_loss, test_acc = model.evaluate(test_gen, verbose=0)
    logger.info(f"Test accuracy : {test_acc * 100:.2f}%")
    logger.info(f"Test loss     : {test_loss:.4f}")

    y_pred = model.predict(test_gen, verbose=0).argmax(axis=1)
    y_true = test_gen.classes

    report = classification_report(y_true, y_pred, target_names=CLASS_NAMES)
    logger.info(f"\nClassification Report:\n{report}")

    # ── Save metrics ─────────────────────────────────────────────────────────
    metrics = {
        "test_accuracy": float(test_acc),
        "test_loss": float(test_loss),
        "epochs_trained": len(history.history["accuracy"]),
    }
    with open(os.path.join(PLOT_DIR if os.path.exists(PLOT_DIR) else ".", "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)

    # ── Plots ─────────────────────────────────────────────────────────────────
    plot_training_history(history, PLOT_DIR)
    plot_confusion_matrix(y_true, y_pred, PLOT_DIR)

    logger.info(f"Model saved to: {MODEL_SAVE}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train the NeuroAI CNN")
    parser.add_argument("--data_dir",   default="./dataset", help="Root dataset directory")
    parser.add_argument("--epochs",     type=int, default=30)
    parser.add_argument("--batch_size", type=int, default=32)
    args = parser.parse_args()
    main(args)
