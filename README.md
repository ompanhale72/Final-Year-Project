# Smart Used Vehicle Price Prediction & Marketplace

A full-stack Cars24/OLX-style marketplace with AI resale pricing, vehicle listings, spare parts, recommendations, analytics, nearby search, JWT auth, and Socket.io chat.

## Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, Recharts, Axios
- Backend: Flask, Flask-JWT-Extended, Flask-SocketIO, SQLAlchemy
- Database: MySQL in production, SQLite fallback for fast local development
- ML: scikit-learn RandomForestRegressor for price prediction, KNN for similar vehicles, Joblib model persistence

## Project Structure

```text
frontend/
  src/
    api/client.js
    components/
    context/AuthContext.jsx
    pages/
backend/
  app/
    routes/
    services/
    models.py
  database/schema.sql
  ml/
    data/car_dekho.csv
    sample_dataset_format.csv
    train_model.py
    models/
```

## Dataset

The provided CarDekho CSV has been copied into:

```text
backend/ml/data/car_dekho.csv
```

Training uses:

- `name` split into derived `brand` and `model`
- `year` converted into `car_age`
- `km_driven`
- `fuel`
- `seller_type`
- `transmission`
- `owner`
- target: `selling_price`

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python ml/train_model.py
python -m app.seed
python run.py
```

The API runs at `http://localhost:5000`.

Demo users after seeding:

```text
seller@example.com / password123
buyer@example.com / password123
```

## MySQL Setup

Create the database with:

```bash
mysql -u root -p < backend/database/schema.sql
```

Then set `backend/.env`:

```text
DATABASE_URL=mysql+pymysql://vehicle_user:vehicle_password@localhost:3306/smart_vehicle_market
```

If `DATABASE_URL` remains `sqlite:///smart_vehicle.db`, the app runs locally without MySQL.

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

Optional environment variables:

```text
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## API Surface

Authentication:

- `POST /register`
- `POST /login`
- `GET /me`

Vehicles:

- `POST /add-vehicle`
- `GET /vehicles`
- `GET /vehicle/<id>`
- `GET /similar-vehicles/<id>`

Prediction and analytics:

- `POST /predict-price`
- `GET /price-trend`

Spare parts:

- `GET /parts`
- `POST /add-part`

Chat:

- `GET /chat/<other_user_id>`
- Socket events: `join_chat`, `send_message`, `receive_message`

Each route also has an `/api/...` alias used by the frontend.

## Notes

- The backend returns a deterministic fallback estimate if `price_model.pkl` has not been trained yet.
- Run `python ml/train_model.py` any time the dataset changes.
- Nearby search accepts `lat`, `lng`, and `radius_km` query params on `GET /vehicles`.
