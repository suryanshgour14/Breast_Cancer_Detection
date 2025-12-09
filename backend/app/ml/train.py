import os
import warnings
warnings.filterwarnings("ignore")

import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from joblib import dump, load as joblib_load
import json

from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score, f1_score, roc_auc_score,
    classification_report, confusion_matrix, RocCurveDisplay
)
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.neural_network import MLPClassifier

try:
    from xgboost import XGBClassifier
    xgb_available = True
except Exception:
    xgb_available = False

from ..config import ARTIFACTS_DIR, MODEL_PATH

METRICS_CACHE_PATH = os.path.join(ARTIFACTS_DIR, "metrics_cache.json")


def build_models():
    models = {
        "Logistic Regression": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(max_iter=500, class_weight="balanced"))
        ]),
        "SVM (RBF)": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", SVC(kernel="rbf", probability=True, class_weight="balanced"))
        ]),
        "KNN": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", KNeighborsClassifier(n_neighbors=7, weights="distance"))
        ]),
        "Random Forest": RandomForestClassifier(
            n_estimators=300, class_weight="balanced_subsample", random_state=42
        ),
        "Gaussian Naive Bayes": GaussianNB(),
        "Gradient Boosting": GradientBoostingClassifier(),
        "MLP Neural Network": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", MLPClassifier(hidden_layer_sizes=(64,), max_iter=500, random_state=42))
        ]),
    }
    if xgb_available:
        models["XGBoost"] = XGBClassifier(
            eval_metric="logloss",
            n_estimators=300,
            learning_rate=0.05,
            subsample=0.9,
            colsample_bytree=0.9,
            random_state=42,
            use_label_encoder=False
        )
    return models


def evaluate_model(name, model, X_train, y_train, X_test, y_test):
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    if hasattr(model, "predict_proba"):
        y_score = model.predict_proba(X_test)[:, 1]
    elif hasattr(model, "decision_function"):
        y_score = model.decision_function(X_test)
    else:
        y_score = y_pred

    metrics = {
        "model": name,
        "accuracy": accuracy_score(y_test, y_pred),
        "f1": f1_score(y_test, y_pred),
        "roc_auc": roc_auc_score(y_test, y_score),
        "confusion_matrix": confusion_matrix(y_test, y_pred),
        "classification_report": classification_report(
            y_test, y_pred, target_names=["malignant(0)", "benign(1)"]
        )
    }
    return metrics, y_score


def train_and_save_best():
    data = load_breast_cancer()
    X = pd.DataFrame(data.data, columns=data.feature_names)
    y = pd.Series(data.target, name="target")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    models = build_models()
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    results = []
    roc_curves = {}

    os.makedirs(os.path.join(ARTIFACTS_DIR, "confusion_matrices"), exist_ok=True)

    for name, model in models.items():
        cv_score = cross_val_score(model, X_train, y_train, cv=skf, scoring="roc_auc")
        metrics, y_score = evaluate_model(name, model, X_train, y_train, X_test, y_test)
        metrics["cv_mean_roc_auc"] = float(cv_score.mean())
        metrics["cv_std_roc_auc"] = float(cv_score.std())
        results.append(metrics)
        roc_curves[name] = y_score

        sns.heatmap(metrics["confusion_matrix"], annot=True, cmap="Blues", fmt="d")
        plt.title(f"Confusion Matrix - {name}")
        safe_name = name.replace(" ", "_")
        plt.savefig(os.path.join(ARTIFACTS_DIR, "confusion_matrices", f"{safe_name}.png"))
        plt.close()

    df_results = pd.DataFrame([
        {
            "model": m["model"],
            "accuracy": m["accuracy"],
            "f1": m["f1"],
            "roc_auc": m["roc_auc"],
            "cv_mean_roc_auc": m["cv_mean_roc_auc"],
            "cv_std_roc_auc": m["cv_std_roc_auc"],
        }
        for m in results
    ]).sort_values(by=["roc_auc", "f1"], ascending=False)

    best_model_name = df_results.iloc[0]["model"]
    best_model = build_models()[best_model_name].fit(X, y)

    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    dump(best_model, MODEL_PATH)

    plt.figure(figsize=(8, 6))
    for name, y_score in roc_curves.items():
        RocCurveDisplay.from_predictions(y_test, y_score, name=name)
    plt.title("ROC Comparison Across Models")
    plt.tight_layout()
    plt.savefig(os.path.join(ARTIFACTS_DIR, "roc_curves.png"), dpi=150)
    plt.close()

    # Cache the metrics
    metrics_dict = df_results.to_dict(orient="records")
    try:
        with open(METRICS_CACHE_PATH, 'w') as f:
            json.dump(metrics_dict, f)
    except Exception as e:
        print(f"Warning: Could not cache metrics: {e}")
    
    return best_model_name, metrics_dict


def load_cached_metrics():
    """Load cached metrics from file if available."""
    if os.path.exists(METRICS_CACHE_PATH):
        try:
            with open(METRICS_CACHE_PATH, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Warning: Could not load cached metrics: {e}")
    return None


def get_metrics():
    """Get metrics, using cache if available, otherwise train models."""
    cached = load_cached_metrics()
    if cached:
        return cached
    # If no cache, train and return
    _, metrics = train_and_save_best()
    return metrics
