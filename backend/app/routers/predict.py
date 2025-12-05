from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.models.hybrid_model import HybridEnergyModel

router = APIRouter()

class Appliance(BaseModel):
    name: str
    watts: int
    hours: int
    category: str

class PredictionRequest(BaseModel):
    state: str
    bill_history: List[float]
    appliances: List[Appliance]

class PredictionResponse(BaseModel):
    predictions: List[Dict[str, Any]]
    appliance_breakdown: Dict[str, float]
    total_annual: float
    total_cost: float
    avg_monthly: float
    tips: List[str]

model = HybridEnergyModel()

@router.post("/predict", response_model=PredictionResponse)
async def predict_energy(request: PredictionRequest):
    """Predict energy consumption using backend hybrid model."""
    try:
        result = model.predict(
            state=request.state,
            bill_history=request.bill_history,
            appliances=[a.model_dump() for a in request.appliances],
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/shap")
async def calculate_shap(request: PredictionRequest):
    """Return simple SHAP-style feature importance values."""
    try:
        dummy_result = model.predict(
            state=request.state,
            bill_history=request.bill_history,
            appliances=[a.model_dump() for a in request.appliances],
        )
        shap_values = model.calculate_shap(
            state=request.state,
            bill_history=request.bill_history,
            appliances=[a.model_dump() for a in request.appliances],
            avg_monthly=dummy_result['avg_monthly'],
        )
        return {"features": shap_values}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
