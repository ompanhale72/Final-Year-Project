from flask import Blueprint, request

from ..services.ml_service import predict_price

bp = Blueprint("prediction", __name__)


@bp.post("/predict-price")
@bp.post("/api/predict-price")
def predict_vehicle_price():
    payload = request.get_json() or {}
    try:
        return predict_price(payload)
    except (TypeError, ValueError) as exc:
        return {"error": f"Invalid prediction input: {exc}"}, 400
