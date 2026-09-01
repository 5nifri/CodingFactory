"""
FastAPI ML service for formation-category recommendations.

Exposes:
    POST /predict

Input: 7 binary interest flags.
Output: ranked list of category recommendations with scores, OR an
explicit "no recommendation" response if the student selected zero
interests (cold start — see test_model.py for why this must be
handled explicitly rather than letting the model guess).

Run:
    uvicorn src.main:app --reload --port 8000

Swagger UI: http://localhost:8000/docs
"""

from fastapi import FastAPI
from pydantic import BaseModel, Field
import joblib
import pandas as pd

MODEL_PATH = "models/formation_recommender.pkl"

FEATURES = [
    "interest_development",
    "interest_mobile",
    "interest_data_science",
    "interest_ai",
    "interest_devops",
    "interest_cybersecurity",
    "interest_erp",
]

app = FastAPI(title="CodingFactory ML Service", version="1.0.0")

model = joblib.load(MODEL_PATH)


class PredictRequest(BaseModel):
    interest_development: bool = Field(default=False)
    interest_mobile: bool = Field(default=False)
    interest_data_science: bool = Field(default=False)
    interest_ai: bool = Field(default=False)
    interest_devops: bool = Field(default=False)
    interest_cybersecurity: bool = Field(default=False)
    interest_erp: bool = Field(default=False)


class CategoryScore(BaseModel):
    category: str
    score: float


class PredictResponse(BaseModel):
    available: bool
    recommendations: list[CategoryScore] = []


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    row = request.model_dump()

    # Cold start: zero interests selected. Do NOT call the model —
    # its output on an all-zero input is a meaningless artifact of the
    # tree's default path, not a real recommendation.
    if not any(row.values()):
        return PredictResponse(available=False, recommendations=[])

    X = pd.DataFrame([{f: int(row[f]) for f in FEATURES}])[FEATURES]

    proba = model.predict_proba(X)[0]
    classes = model.classes_

    ranked = sorted(zip(classes, proba), key=lambda x: -x[1])

    recommendations = [
        CategoryScore(category=category, score=round(float(score), 4))
        for category, score in ranked
        if score > 0.01
    ]

    return PredictResponse(available=True, recommendations=recommendations)
