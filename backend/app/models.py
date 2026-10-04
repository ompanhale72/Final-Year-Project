from datetime import datetime

from werkzeug.security import check_password_hash, generate_password_hash

from .extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(160), nullable=False, unique=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(80))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    vehicles = db.relationship("Vehicle", backref="seller", lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "city": self.city,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Vehicle(db.Model):
    __tablename__ = "vehicles"

    id = db.Column(db.Integer, primary_key=True)
    brand = db.Column(db.String(80), nullable=False, index=True)
    model = db.Column(db.String(160), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    predicted_price = db.Column(db.Float)
    km_driven = db.Column(db.Integer, nullable=False)
    fuel_type = db.Column(db.String(40), nullable=False)
    transmission_type = db.Column(db.String(40), nullable=False)
    seller_type = db.Column(db.String(60), default="Individual")
    owner_type = db.Column(db.String(80), default="First Owner")
    city = db.Column(db.String(80), nullable=False, index=True)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    condition_rating = db.Column(db.Float, default=4.0)
    description = db.Column(db.Text)
    image_urls = db.Column(db.Text)
    seller_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "brand": self.brand,
            "model": self.model,
            "year": self.year,
            "price": self.price,
            "predicted_price": self.predicted_price,
            "km_driven": self.km_driven,
            "fuel_type": self.fuel_type,
            "transmission_type": self.transmission_type,
            "seller_type": self.seller_type,
            "owner_type": self.owner_type,
            "city": self.city,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "condition_rating": self.condition_rating,
            "description": self.description,
            "image_urls": self.image_urls.split(",") if self.image_urls else [],
            "seller_id": self.seller_id,
            "seller": self.seller.to_dict() if self.seller else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Part(db.Model):
    __tablename__ = "parts"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(160), nullable=False, index=True)
    category = db.Column(db.String(80), nullable=False)
    brand = db.Column(db.String(80))
    price = db.Column(db.Float, nullable=False)
    city = db.Column(db.String(80), nullable=False)
    condition = db.Column(db.String(60), default="New")
    image_url = db.Column(db.String(500))
    seller_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    seller = db.relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "brand": self.brand,
            "price": self.price,
            "city": self.city,
            "condition": self.condition,
            "image_url": self.image_url,
            "seller_id": self.seller_id,
            "seller": self.seller.to_dict() if self.seller else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class ChatMessage(db.Model):
    __tablename__ = "chat_messages"

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    vehicle_id = db.Column(db.Integer, db.ForeignKey("vehicles.id"))
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    sender = db.relationship("User", foreign_keys=[sender_id])
    receiver = db.relationship("User", foreign_keys=[receiver_id])
    vehicle = db.relationship("Vehicle")

    def to_dict(self):
        return {
            "id": self.id,
            "sender_id": self.sender_id,
            "receiver_id": self.receiver_id,
            "vehicle_id": self.vehicle_id,
            "message": self.message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "sender": self.sender.to_dict() if self.sender else None,
        }
