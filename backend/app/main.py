import os
from typing import List

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import pandas as pd

from .schemas import (
    FeatureVector,
    BatchFeatures,
    PredictionResponse,
    BatchPredictionResponse,
    MetricItem,
)
from .ml.inference import predict_single, predict_batch, get_feature_names, load_model
from .ml.train import train_and_save_best, get_metrics
from .config import ARTIFACTS_DIR


app = FastAPI(title="Breast Cancer Detection API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    try:
        load_model()
    except Exception:
        pass


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/features", response_model=List[str])
def features():
    return get_feature_names()


@app.post("/predict", response_model=PredictionResponse)
def predict(body: FeatureVector):
    try:
        result = predict_single(body.features)
        return PredictionResponse(**result)
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing feature: {e}")


@app.post("/predict/batch", response_model=BatchPredictionResponse)
async def predict_batch_endpoint(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = await file.read()
    df = pd.read_csv(pd.io.common.BytesIO(content))
    feature_names = get_feature_names()
    missing = [f for f in feature_names if f not in df.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {missing}",
        )
    rows = df[feature_names].to_dict(orient="records")
    results = predict_batch(rows)
    return BatchPredictionResponse(results=[PredictionResponse(**r) for r in results])


@app.get("/models/metrics", response_model=List[MetricItem])
def models_metrics():
    metrics_list = get_metrics()
    return [MetricItem(**m) for m in metrics_list]


app.mount("/static", StaticFiles(directory=ARTIFACTS_DIR), name="static")
