import { motion } from "framer-motion";
import { Save, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { brands, cities, formatCurrency, fuels, transmissions } from "../data/options";

const initialForm = {
  brand: "Maruti",
  model: "Swift VXI",
  year: "2018",
  price: "450000",
  km_driven: "42000",
  fuel_type: "Petrol",
  transmission_type: "Manual",
  seller_type: "Individual",
  owner_type: "First Owner",
  city: "Delhi",
  latitude: "28.6139",
  longitude: "77.2090",
  condition_rating: "4.2",
  description: "",
  image_urls: "",
};

export default function AddVehicle() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState("");

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  useEffect(() => {
    const ready = form.brand && form.model && form.year && form.km_driven && form.fuel_type && form.transmission_type;
    if (!ready) return;
    const timer = setTimeout(() => {
      api.post("/predict-price", form).then(({ data }) => setPrediction(data)).catch(() => setPrediction(null));
    }, 450);
    return () => clearTimeout(timer);
  }, [form]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!user) return setError("Please login before adding a listing.");
    try {
      const payload = {
        ...form,
        image_urls: form.image_urls
          ? form.image_urls.split(",").map((url) => url.trim()).filter(Boolean)
          : ["https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80"],
      };
      const { data } = await api.post("/add-vehicle", payload);
      navigate(`/vehicles/${data.vehicle.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Could not add vehicle.");
    }
  };

  if (!user) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Sparkles className="mx-auto text-mint" size={42} />
        <h1 className="mt-4 text-3xl font-extrabold text-ink">Login to list a vehicle</h1>
        <p className="mt-2 text-slate-500">Prediction works for everyone, but creating marketplace listings requires an account.</p>
        <Link to="/auth" className="btn-primary mt-6">Login</Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-wide text-mint">Sell</p>
        <h1 className="mt-2 text-4xl font-extrabold text-ink">Add vehicle with instant AI price</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit} className="rounded-lg bg-white p-6 shadow-soft">
          <div className="grid gap-4 md:grid-cols-2">
            <select className="input" name="brand" value={form.brand} onChange={update}>{brands.map((brand) => <option key={brand}>{brand}</option>)}</select>
            <input className="input" name="model" value={form.model} onChange={update} placeholder="Model" required />
            <input className="input" name="year" value={form.year} onChange={update} type="number" min="1990" max="2026" required />
            <input className="input" name="km_driven" value={form.km_driven} onChange={update} type="number" placeholder="KM driven" required />
            <input className="input" name="price" value={form.price} onChange={update} type="number" placeholder="Asking price" required />
            <select className="input" name="fuel_type" value={form.fuel_type} onChange={update}>{fuels.map((fuel) => <option key={fuel}>{fuel}</option>)}</select>
            <select className="input" name="transmission_type" value={form.transmission_type} onChange={update}>{transmissions.map((item) => <option key={item}>{item}</option>)}</select>
            <select className="input" name="owner_type" value={form.owner_type} onChange={update}>
              <option>First Owner</option>
              <option>Second Owner</option>
              <option>Third Owner</option>
              <option>Fourth & Above Owner</option>
            </select>
            <select className="input" name="city" value={form.city} onChange={update}>{cities.map((city) => <option key={city}>{city}</option>)}</select>
            <input className="input" name="condition_rating" value={form.condition_rating} onChange={update} type="number" min="1" max="5" step="0.1" />
            <input className="input" name="latitude" value={form.latitude} onChange={update} placeholder="Latitude" />
            <input className="input" name="longitude" value={form.longitude} onChange={update} placeholder="Longitude" />
          </div>
          <textarea className="input mt-4 min-h-28" name="description" value={form.description} onChange={update} placeholder="Description, service history, upgrades" />
          <input className="input mt-4" name="image_urls" value={form.image_urls} onChange={update} placeholder="Image URLs separated by commas" />
          {error && <p className="mt-4 rounded-lg bg-coral/10 p-3 text-sm font-semibold text-coral">{error}</p>}
          <button className="btn-primary mt-5">
            <Save size={18} />
            Publish listing
          </button>
        </motion.form>

        <aside className="h-fit rounded-lg bg-ink p-6 text-white shadow-soft">
          <Sparkles className="text-saffron" />
          <p className="mt-4 text-sm font-bold uppercase tracking-wide text-white/60">Predicted fair price</p>
          <p className="mt-2 text-4xl font-extrabold">{prediction ? formatCurrency(prediction.predicted_price) : "..."}</p>
          <p className="mt-3 text-sm text-white/70">
            Status: {prediction?.model_status || "checking"}. Train the RandomForest model to replace the fallback estimator.
          </p>
          <div className="mt-6 rounded-lg bg-white/10 p-4">
            <p className="text-sm font-bold">Listing score inputs</p>
            <p className="mt-2 text-sm text-white/70">Brand, model, car age, mileage, fuel, seller type, transmission, and ownership history.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
