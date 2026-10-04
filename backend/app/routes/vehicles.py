from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db
from ..models import Vehicle
from ..services.location_service import within_radius
from ..services.ml_service import predict_price
from ..services.recommendation_service import similar_vehicles

bp = Blueprint("vehicles", __name__)


def _vehicle_query_from_filters():
    query = Vehicle.query
    brand = request.args.get("brand")
    fuel = request.args.get("fuel")
    city = request.args.get("city")
    min_price = request.args.get("min_price", type=float)
    max_price = request.args.get("max_price", type=float)

    if brand:
        query = query.filter(Vehicle.brand.ilike(f"%{brand}%"))
    if fuel:
        query = query.filter(Vehicle.fuel_type == fuel)
    if city:
        query = query.filter(Vehicle.city.ilike(f"%{city}%"))
    if min_price is not None:
        query = query.filter(Vehicle.price >= min_price)
    if max_price is not None:
        query = query.filter(Vehicle.price <= max_price)

    sort = request.args.get("sort", "newest")
    if sort == "price_asc":
        query = query.order_by(Vehicle.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Vehicle.price.desc())
    elif sort == "km_low":
        query = query.order_by(Vehicle.km_driven.asc())
    else:
        query = query.order_by(Vehicle.created_at.desc())
    return query


@bp.get("/vehicles")
@bp.get("/api/vehicles")
def list_vehicles():
    vehicles = _vehicle_query_from_filters().all()
    lat = request.args.get("lat", type=float)
    lng = request.args.get("lng", type=float)
    radius = request.args.get("radius_km", default=100, type=float)
    if lat is not None and lng is not None:
        vehicles = [vehicle for vehicle in vehicles if within_radius(vehicle, lat, lng, radius)]
    return {"vehicles": [vehicle.to_dict() for vehicle in vehicles]}


@bp.post("/add-vehicle")
@bp.post("/api/add-vehicle")
@jwt_required()
def add_vehicle():
    data = request.get_json() or {}
    required = ("brand", "model", "year", "price", "km_driven", "fuel_type", "transmission_type", "city")
    missing = [field for field in required if not data.get(field)]
    if missing:
        return {"error": f"Missing required fields: {', '.join(missing)}"}, 400

    prediction = predict_price(data)
    vehicle = Vehicle(
        brand=data["brand"].title(),
        model=data["model"].title(),
        year=int(data["year"]),
        price=float(data["price"]),
        predicted_price=prediction["predicted_price"],
        km_driven=int(data["km_driven"]),
        fuel_type=data["fuel_type"],
        transmission_type=data["transmission_type"],
        seller_type=data.get("seller_type", "Individual"),
        owner_type=data.get("owner_type", "First Owner"),
        city=data["city"].title(),
        latitude=data.get("latitude"),
        longitude=data.get("longitude"),
        condition_rating=float(data.get("condition_rating", 4)),
        description=data.get("description"),
        image_urls=",".join(data.get("image_urls", [])),
        seller_id=int(get_jwt_identity()),
    )
    db.session.add(vehicle)
    db.session.commit()
    return {"vehicle": vehicle.to_dict(), "prediction": prediction}, 201


@bp.get("/vehicle/<int:vehicle_id>")
@bp.get("/api/vehicle/<int:vehicle_id>")
def get_vehicle(vehicle_id):
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    return {"vehicle": vehicle.to_dict()}


@bp.get("/similar-vehicles/<int:vehicle_id>")
@bp.get("/api/similar-vehicles/<int:vehicle_id>")
def get_similar_vehicles(vehicle_id):
    target = Vehicle.query.get_or_404(vehicle_id)
    vehicles = Vehicle.query.all()
    similar = similar_vehicles(target, vehicles)
    return {"vehicles": [vehicle.to_dict() for vehicle in similar]}
