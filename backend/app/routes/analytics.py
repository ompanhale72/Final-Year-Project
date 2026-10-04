from pathlib import Path

import pandas as pd
from flask import Blueprint, request
from sqlalchemy import func

from ..models import Vehicle

bp = Blueprint("analytics", __name__)


@bp.get("/price-trend")
@bp.get("/api/price-trend")
def price_trend():
    brand = request.args.get("brand")
    query = (
        Vehicle.query.with_entities(
            Vehicle.year,
            func.avg(Vehicle.price).label("avg_price"),
            func.avg(Vehicle.predicted_price).label("avg_predicted"),
        )
        .group_by(Vehicle.year)
        .order_by(Vehicle.year)
    )
    if brand:
        query = query.filter(Vehicle.brand.ilike(f"%{brand}%"))
    rows = query.all()
    if rows:
        return {
            "trend": [
                {
                    "year": year,
                    "avg_price": round(avg_price or 0, 0),
                    "avg_predicted": round(avg_predicted or avg_price or 0, 0),
                }
                for year, avg_price, avg_predicted in rows
            ]
        }

    dataset = Path(__file__).resolve().parents[2] / "ml" / "data" / "car_dekho.csv"
    if dataset.exists():
        frame = pd.read_csv(dataset)
        if brand:
            frame = frame[frame["name"].str.contains(brand, case=False, na=False)]
        grouped = frame.groupby("year")["selling_price"].mean().reset_index().tail(12)
        return {
            "trend": [
                {
                    "year": int(row["year"]),
                    "avg_price": round(float(row["selling_price"]), 0),
                    "avg_predicted": round(float(row["selling_price"]), 0),
                }
                for _, row in grouped.iterrows()
            ]
        }
    return {"trend": []}
