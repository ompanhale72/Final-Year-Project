import argparse
from datetime import UTC, datetime
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATASET = ROOT / "ml" / "data" / "car_dekho.csv"
DEFAULT_OUTPUT = ROOT / "ml" / "models" / "price_model.pkl"


def split_vehicle_name(name):
    parts = str(name).strip().split()
    if not parts:
        return "Unknown", "Unknown"
    return parts[0].title(), (" ".join(parts[1:]) or parts[0]).title()


def load_training_frame(dataset_path):
    frame = pd.read_csv(dataset_path)
    required = {
        "name",
        "year",
        "selling_price",
        "km_driven",
        "fuel",
        "seller_type",
        "transmission",
        "owner",
    }
    missing = required - set(frame.columns)
    if missing:
        raise ValueError(f"Dataset missing required columns: {', '.join(sorted(missing))}")

    names = frame["name"].apply(split_vehicle_name)
    frame["brand"] = names.apply(lambda item: item[0])
    frame["model"] = names.apply(lambda item: item[1])
    frame["car_age"] = datetime.now(UTC).year - frame["year"].astype(int)
    frame["car_age"] = frame["car_age"].clip(lower=0)

    for column in ["fuel", "seller_type", "transmission", "owner", "brand", "model"]:
        frame[column] = frame[column].fillna("Unknown").astype(str)

    frame["km_driven"] = frame["km_driven"].fillna(frame["km_driven"].median()).astype(int)
    frame["selling_price"] = frame["selling_price"].astype(float)
    return frame


def train(dataset_path=DEFAULT_DATASET, output_path=DEFAULT_OUTPUT):
    frame = load_training_frame(dataset_path)
    features = [
        "brand",
        "model",
        "car_age",
        "km_driven",
        "fuel",
        "seller_type",
        "transmission",
        "owner",
    ]
    target = "selling_price"
    x_train, x_test, y_train, y_test = train_test_split(
        frame[features],
        frame[target],
        test_size=0.2,
        random_state=42,
    )

    categorical = ["brand", "model", "fuel", "seller_type", "transmission", "owner"]
    numeric = ["car_age", "km_driven"]
    preprocessor = ColumnTransformer(
        transformers=[
            ("categorical", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical),
            ("numeric", "passthrough", numeric),
        ]
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            (
                "model",
                RandomForestRegressor(
                    n_estimators=220,
                    min_samples_leaf=2,
                    random_state=42,
                    n_jobs=-1,
                ),
            ),
        ]
    )
    pipeline.fit(x_train, y_train)
    predictions = pipeline.predict(x_test)
    metrics = {
        "r2_score": round(float(r2_score(y_test, predictions)), 4),
        "mae": round(float(mean_absolute_error(y_test, predictions)), 2),
        "train_rows": int(len(x_train)),
        "test_rows": int(len(x_test)),
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {
            "pipeline": pipeline,
            "features": features,
            "metrics": metrics,
            "trained_at": datetime.now(UTC).isoformat(),
            "dataset": str(dataset_path),
        },
        output_path,
    )
    return metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train used vehicle price model.")
    parser.add_argument("--dataset", default=str(DEFAULT_DATASET))
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT))
    args = parser.parse_args()
    result = train(Path(args.dataset), Path(args.output))
    print(f"Saved model to {args.output}")
    print(result)
