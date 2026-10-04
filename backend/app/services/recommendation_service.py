import pandas as pd
from sklearn.neighbors import NearestNeighbors


def similar_vehicles(target_vehicle, vehicles, limit=6):
    candidates = [vehicle for vehicle in vehicles if vehicle.id != target_vehicle.id]
    if not candidates:
        return []

    rows = []
    all_vehicles = [target_vehicle] + candidates
    for vehicle in all_vehicles:
        rows.append(
            {
                "id": vehicle.id,
                "brand": vehicle.brand,
                "fuel_type": vehicle.fuel_type,
                "transmission_type": vehicle.transmission_type,
                "year": vehicle.year,
                "price": vehicle.price,
                "km_driven": vehicle.km_driven,
                "condition_rating": vehicle.condition_rating or 4,
            }
        )

    frame = pd.DataFrame(rows)
    model_frame = pd.get_dummies(
        frame.drop(columns=["id"]),
        columns=["brand", "fuel_type", "transmission_type"],
    )
    neighbors = NearestNeighbors(n_neighbors=min(limit + 1, len(model_frame)), metric="euclidean")
    neighbors.fit(model_frame)
    indexes = neighbors.kneighbors(model_frame.iloc[[0]], return_distance=False)[0][1:]
    ids = set(frame.iloc[indexes]["id"].tolist())
    return [vehicle for vehicle in candidates if vehicle.id in ids]
