from datetime import UTC, datetime
from pathlib import Path

import joblib
import pandas as pd
from flask import current_app

MODEL_CACHE = {"bundle": None, "path": None}


def _split_name(name):
    parts = str(name or "").strip().split()
    if not parts:
        return "Unknown", "Unknown"
    return parts[0], " ".join(parts[1:]) or parts[0]


def normalize_vehicle_payload(payload):
    brand = payload.get("brand")
    model = payload.get("model")
    if not brand or not model:
        brand, model = _split_name(payload.get("name", "Unknown Car"))

    current_year = datetime.now(UTC).year
    year = int(payload.get("year", current_year - int(payload.get("car_age", 5))))
    car_age = max(current_year - year, 0)

    return {
        "brand": str(brand).title(),
        "model": str(model).title(),
        "car_age": car_age,
        "km_driven": int(float(payload.get("km_driven", 50000))),
        "fuel": payload.get("fuel") or payload.get("fuel_type") or "Petrol",
        "seller_type": payload.get("seller_type", "Individual"),
        "transmission": payload.get("transmission")
        or payload.get("transmission_type")
        or "Manual",
        "owner": payload.get("owner") or payload.get("owner_type") or "First Owner",
    }


def load_model_bundle():
    model_path = Path(current_app.config["MODEL_PATH"])
    if MODEL_CACHE["bundle"] is not None and MODEL_CACHE["path"] == model_path:
        return MODEL_CACHE["bundle"]
    if not model_path.exists():
        return None
    MODEL_CACHE["bundle"] = joblib.load(model_path)
    MODEL_CACHE["path"] = model_path
    return MODEL_CACHE["bundle"]


def fallback_price_estimate(vehicle):
    brand_factor = {
        "Mercedes-Benz": 1.7,
        "Bmw": 1.65,
        "Audi": 1.55,
        "Toyota": 1.25,
        "Honda": 1.15,
        "Hyundai": 1.05,
        "Mahindra": 1.05,
        "Maruti": 0.9,
        "Tata": 0.85,
    }.get(vehicle["brand"], 1.0)
    fuel_factor = {"Diesel": 1.08, "Petrol": 1.0, "CNG": 0.92, "LPG": 0.88}.get(
        vehicle["fuel"], 1.0
    )
    transmission_factor = 1.14 if vehicle["transmission"] == "Automatic" else 1.0
    depreciation = max(0.36, 1 - vehicle["car_age"] * 0.075)
    km_penalty = max(0.62, 1 - vehicle["km_driven"] / 320000)
    estimate = 650000 * brand_factor * fuel_factor * transmission_factor * depreciation * km_penalty
    return round(max(45000, estimate), 0)


def predict_price(payload):
    vehicle = normalize_vehicle_payload(payload)
    bundle = load_model_bundle()
    if bundle is None:
        return {
            "predicted_price": fallback_price_estimate(vehicle),
            "model_status": "fallback",
            "message": "Train backend/ml/train_model.py to enable RandomForest predictions.",
        }

    frame = pd.DataFrame([vehicle], columns=bundle["features"])
    predicted_price = float(bundle["pipeline"].predict(frame)[0])
    return {
        "predicted_price": round(predicted_price, 0),
        "model_status": "trained",
        "metrics": bundle.get("metrics", {}),
    }
