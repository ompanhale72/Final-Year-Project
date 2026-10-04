from pathlib import Path

import pandas as pd

from app import create_app
from app.extensions import db
from app.models import Part, User, Vehicle
from app.services.ml_service import predict_price

CAR_IMAGES = [
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1200&q=80",
]

CITIES = [
    ("Delhi", 28.6139, 77.2090),
    ("Mumbai", 19.0760, 72.8777),
    ("Bengaluru", 12.9716, 77.5946),
    ("Pune", 18.5204, 73.8567),
    ("Hyderabad", 17.3850, 78.4867),
]


def split_name(name):
    parts = str(name).split()
    if not parts:
        return "Unknown", "Unknown"
    return parts[0], " ".join(parts[1:]) or parts[0]


def ensure_user(name, email, city):
    user = User.query.filter_by(email=email).first()
    if user:
        return user
    user = User(name=name, email=email, city=city)
    user.set_password("password123")
    db.session.add(user)
    db.session.commit()
    return user


def seed():
    app = create_app()
    with app.app_context():
        seller = ensure_user("Aarav Motors", "seller@example.com", "Delhi")
        buyer = ensure_user("Demo Buyer", "buyer@example.com", "Mumbai")

        if Vehicle.query.count() == 0:
            dataset = Path(__file__).resolve().parents[1] / "ml" / "data" / "car_dekho.csv"
            frame = pd.read_csv(dataset).sample(36, random_state=7).reset_index(drop=True)
            for index, row in frame.iterrows():
                brand, model = split_name(row["name"])
                city, lat, lng = CITIES[index % len(CITIES)]
                payload = {
                    "brand": brand,
                    "model": model,
                    "year": int(row["year"]),
                    "km_driven": int(row["km_driven"]),
                    "fuel_type": row["fuel"],
                    "transmission_type": row["transmission"],
                    "seller_type": row["seller_type"],
                    "owner_type": row["owner"],
                }
                prediction = predict_price(payload)
                db.session.add(
                    Vehicle(
                        brand=brand.title(),
                        model=model.title(),
                        year=int(row["year"]),
                        price=float(row["selling_price"]),
                        predicted_price=prediction["predicted_price"],
                        km_driven=int(row["km_driven"]),
                        fuel_type=row["fuel"],
                        transmission_type=row["transmission"],
                        seller_type=row["seller_type"],
                        owner_type=row["owner"],
                        city=city,
                        latitude=lat,
                        longitude=lng,
                        condition_rating=round(3.6 + (index % 12) / 10, 1),
                        description="Verified listing with service-history checks and AI assisted pricing.",
                        image_urls=",".join(CAR_IMAGES),
                        seller_id=seller.id if index % 3 else buyer.id,
                    )
                )
            db.session.commit()

        if Part.query.count() == 0:
            parts = [
                ("Michelin Energy XM2 Tyre", "Tyres", "Michelin", 6200, "Delhi"),
                ("Bosch Brake Pad Set", "Brakes", "Bosch", 3400, "Mumbai"),
                ("Amaron Battery 45Ah", "Battery", "Amaron", 5100, "Bengaluru"),
                ("Hyundai Headlamp Assembly", "Lighting", "Hyundai", 8700, "Pune"),
                ("Castrol Magnatec 5W-30", "Engine Oil", "Castrol", 2100, "Hyderabad"),
                ("Maruti Swift Front Bumper", "Body", "Maruti", 7600, "Delhi"),
            ]
            for name, category, brand, price, city in parts:
                db.session.add(
                    Part(
                        name=name,
                        category=category,
                        brand=brand,
                        price=price,
                        city=city,
                        condition="New",
                        image_url="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=80",
                        seller_id=seller.id,
                    )
                )
            db.session.commit()

        print("Seed complete. Demo users: seller@example.com / buyer@example.com, password password123")


if __name__ == "__main__":
    seed()
