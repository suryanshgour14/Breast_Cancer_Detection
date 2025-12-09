import threading
from typing import List, Dict, Any

import numpy as np
from joblib import load
from sklearn.datasets import load_breast_cancer

from ..config import MODEL_PATH

_model = None
_model_lock = threading.Lock()
_feature_names = None


def get_feature_names() -> List[str]:
    global _feature_names
    if _feature_names is None:
        data = load_breast_cancer()
        _feature_names = list(data.feature_names)
    return _feature_names


def load_model(path: str = None):
    global _model
    with _model_lock:
        if _model is None:
            model_path = path or MODEL_PATH
            if not model_path or not __import__("os").path.exists(model_path):
                raise FileNotFoundError(f"Model not found at {model_path}")
            _model = load(model_path)
    return _model


def predict_single(features: Dict[str, float]) -> Dict[str, Any]:
    model = load_model()
    feature_names = get_feature_names()
    x = np.array([[features[name] for name in feature_names]], dtype=float)
    prob = model.predict_proba(x)[0, 1]
    label = int(prob >= 0.5)
    return {
        "prediction": label,
        "probability_benign": float(prob),
        "probability_malignant": float(1 - prob),
    }


def predict_batch(rows: List[Dict[str, float]]) -> List[Dict[str, Any]]:
    model = load_model()
    feature_names = get_feature_names()
    X = np.array([[row[name] for name in feature_names] for row in rows], dtype=float)
    probs = model.predict_proba(X)[:, 1]
    preds = (probs >= 0.5).astype(int)
    out = []
    for p, prob in zip(preds, probs):
        out.append({
            "prediction": int(p),
            "probability_benign": float(prob),
            "probability_malignant": float(1 - prob),
        })
    return out
