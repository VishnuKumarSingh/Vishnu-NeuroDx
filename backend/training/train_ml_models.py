"""
ML Model Training Script — SVM & Random Forest
Trains on CNN-extracted features for optimal performance.

Usage:
  cd backend
  python training/train_ml_models.py --data_dir ./dataset
"""

import argparse
import os
import sys
import logging

import numpy as np
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder

import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from app.models.cnn_model import load_cnn_model, CLASS_NAMES
from app.models.ml_models import (
    build_svm, build_random_forest, save_ml_models,
    extract_cnn_features, evaluate_model,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

IMG_SIZE   = (128, 128)
BATCH_SIZE = 64


def load_dataset_as_arrays(data_dir: str, split: str) -> tuple[np.ndarray, np.ndarray]:
    """Load all images from a split directory into numpy arrays."""
    gen = ImageDataGenerator(rescale=1.0 / 255)
    flow = gen.flow_from_directory(
        os.path.join(data_dir, split),
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode="sparse",
        shuffle=False,
    )
    X, y = [], []
    for i in range(len(flow)):
        batch_x, batch_y = flow[i]
        X.append(batch_x)
        y.extend(batch_y.astype(int))
    return np.vstack(X), np.array(y)


def extract_features(images: np.ndarray, cnn_model, batch_size: int = 64) -> np.ndarray:
    """Extract feature vectors from the CNN's penultimate Dense layer."""
    import tensorflow as tf
    feature_extractor = tf.keras.Model(
        inputs=cnn_model.inputs,
        outputs=cnn_model.get_layer("dense").output,
    )
    return feature_extractor.predict(images, batch_size=batch_size, verbose=1)


def main(args):
    logger.info("Loading CNN model for feature extraction...")
    try:
        cnn_model = load_cnn_model()
    except FileNotFoundError:
        logger.error("CNN model not found. Run train_cnn.py first.")
        sys.exit(1)

    # ── Load data ─────────────────────────────────────────────────────────────
    logger.info("Loading training data...")
    X_train, y_train = load_dataset_as_arrays(args.data_dir, "Training")
    logger.info("Loading test data...")
    X_test, y_test = load_dataset_as_arrays(args.data_dir, "Testing")

    # ── Feature extraction ────────────────────────────────────────────────────
    logger.info("Extracting CNN features from training images...")
    feat_train = extract_features(X_train, cnn_model)
    logger.info("Extracting CNN features from test images...")
    feat_test  = extract_features(X_test, cnn_model)

    # ── Scaling ───────────────────────────────────────────────────────────────
    scaler = StandardScaler()
    feat_train_s = scaler.fit_transform(feat_train)
    feat_test_s  = scaler.transform(feat_test)

    # ── SVM ───────────────────────────────────────────────────────────────────
    logger.info("Training SVM...")
    svm = build_svm()
    svm.fit(feat_train_s, y_train)
    svm_preds = svm.predict(feat_test_s)
    svm_metrics = evaluate_model(y_test, svm_preds, "SVM")
    logger.info(f"SVM metrics: {svm_metrics}")

    # ── Random Forest ─────────────────────────────────────────────────────────
    logger.info("Training Random Forest...")
    rf = build_random_forest()
    rf.fit(feat_train_s, y_train)
    rf_preds = rf.predict(feat_test_s)
    rf_metrics = evaluate_model(y_test, rf_preds, "Random Forest")
    logger.info(f"Random Forest metrics: {rf_metrics}")

    # ── Save ──────────────────────────────────────────────────────────────────
    save_ml_models(svm, rf, scaler)
    logger.info("Done! SVM, Random Forest, and scaler saved to saved_models/")

    # Print summary
    print("\n" + "=" * 50)
    print("MODEL COMPARISON RESULTS")
    print("=" * 50)
    for metrics in [svm_metrics, rf_metrics]:
        print(f"\n{metrics['model']}:")
        print(f"  Accuracy  : {metrics['accuracy']:.2f}%")
        print(f"  Precision : {metrics['precision']:.2f}%")
        print(f"  Recall    : {metrics['recall']:.2f}%")
        print(f"  F1 Score  : {metrics['f1_score']:.2f}%")
    print("=" * 50)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train SVM and Random Forest models")
    parser.add_argument("--data_dir", default="./dataset", help="Root dataset directory")
    args = parser.parse_args()
    main(args)
