from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db
from ..models import Part

bp = Blueprint("parts", __name__)


@bp.get("/parts")
@bp.get("/api/parts")
def list_parts():
    query = Part.query.order_by(Part.created_at.desc())
    search = request.args.get("search")
    category = request.args.get("category")
    city = request.args.get("city")
    if search:
        query = query.filter(Part.name.ilike(f"%{search}%"))
    if category:
        query = query.filter(Part.category == category)
    if city:
        query = query.filter(Part.city.ilike(f"%{city}%"))
    return {"parts": [part.to_dict() for part in query.all()]}


@bp.post("/add-part")
@bp.post("/api/add-part")
@jwt_required()
def add_part():
    data = request.get_json() or {}
    required = ("name", "category", "price", "city")
    missing = [field for field in required if not data.get(field)]
    if missing:
        return {"error": f"Missing required fields: {', '.join(missing)}"}, 400
    part = Part(
        name=data["name"],
        category=data["category"],
        brand=data.get("brand"),
        price=float(data["price"]),
        city=data["city"],
        condition=data.get("condition", "New"),
        image_url=data.get("image_url"),
        seller_id=int(get_jwt_identity()),
    )
    db.session.add(part)
    db.session.commit()
    return {"part": part.to_dict()}, 201
