from flask import Blueprint, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError

from ..extensions import db
from ..models import User

bp = Blueprint("auth", __name__)


@bp.post("/register")
@bp.post("/api/register")
def register():
    data = request.get_json() or {}
    required = ("name", "email", "password")
    missing = [field for field in required if not data.get(field)]
    if missing:
        return {"error": f"Missing required fields: {', '.join(missing)}"}, 400

    user = User(name=data["name"], email=data["email"].lower(), city=data.get("city"))
    user.set_password(data["password"])
    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return {"error": "Email is already registered."}, 409

    token = create_access_token(identity=str(user.id))
    return {"user": user.to_dict(), "access_token": token}, 201


@bp.post("/login")
@bp.post("/api/login")
def login():
    data = request.get_json() or {}
    user = User.query.filter_by(email=str(data.get("email", "")).lower()).first()
    if not user or not user.check_password(data.get("password", "")):
        return {"error": "Invalid email or password."}, 401
    token = create_access_token(identity=str(user.id))
    return {"user": user.to_dict(), "access_token": token}


@bp.get("/me")
@bp.get("/api/me")
@jwt_required()
def me():
    user = User.query.get_or_404(int(get_jwt_identity()))
    return {"user": user.to_dict()}
