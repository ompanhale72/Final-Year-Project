import { motion } from "framer-motion";
import { Calculator, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import api from "../api/client";
import { brands, formatCurrency, fuels, transmissions } from "../data/options";

export default function PricePrediction() {
  const [form, setForm] = useState({
    brand: "Hyundai",
    model: "Creta SX",
    year: "2020",
    km_driven: "28000",
    fuel_type: "Diesel",
    transmission_type: "Manual",
    seller_type: "Dealer",
    owner_type: "First Owner",
  });
  const [prediction, setPrediction] = useState(null);
  const [trend, setTrend] = useState([]);

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const predict = async (event) => {
    event?.preventDefault();
    const { data } = await api.post("/predict-price", form);
    setPrediction(data);
  };

  useEffect(() => {
    predict();
    api.get("/price-trend", { params: { brand: form.brand } }).then(({ data }) => setTrend(data.trend));
  }, []);

  useEffect(() => {
    api.get("/price-trend", { params: { brand: form.brand } }).then(({ data }) => setTrend(data.trend));
  }, [form.brand]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-wide text-mint">Prediction</p>
        <h1 className="mt-2 text-4xl font-extrabold text-ink">Estimate a fair resale price</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
        <form onSubmit={predict} className="rounded-lg bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-center gap-3">
            <Calculator className="text-mint" />
            <h2 className="text-xl font-extrabold text-ink">Vehicle inputs</h2>
          </div>
          <div className="grid gap-4">
            <select className="input" name="brand" value={form.brand} onChange={update}>{brands.map((brand) => <option key={brand}>{brand}</option>)}</select>
            <input className="input" name="model" value={form.model} onChange={update} placeholder="Model" />
            <input className="input" name="year" value={form.year} onChange={update} type="number" />
            <input className="input" name="km_driven" value={form.km_driven} onChange={update} type="number" />
            <select className="input" name="fuel_type" value={form.fuel_type} onChange={update}>{fuels.map((fuel) => <option key={fuel}>{fuel}</option>)}</select>
            <select className="input" name="transmission_type" value={form.transmission_type} onChange={update}>{transmissions.map((item) => <option key={item}>{item}</option>)}</select>
            <select className="input" name="seller_type" value={form.seller_type} onChange={update}><option>Individual</option><option>Dealer</option><option>Trustmark Dealer</option></select>
            <select className="input" name="owner_type" value={form.owner_type} onChange={update}><option>First Owner</option><option>Second Owner</option><option>Third Owner</option><option>Fourth & Above Owner</option></select>
          </div>
          <button className="btn-primary mt-5 w-full">
            <Sparkles size={18} />
            Predict fair price
          </button>
        </form>

        <div className="grid gap-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg bg-ink p-8 text-white shadow-soft">
            <p className="text-sm font-bold uppercase tracking-wide text-white/60">AI predicted resale price</p>
            <p className="mt-3 text-5xl font-extrabold">{prediction ? formatCurrency(prediction.predicted_price) : "..."}</p>
            <p className="mt-3 text-sm text-white/70">
              Model status: {prediction?.model_status || "loading"}. R2: {prediction?.metrics?.r2_score ?? "train model"} MAE: {prediction?.metrics?.mae ? formatCurrency(prediction.metrics.mae) : "train model"}.
            </p>
          </motion.div>

          <div className="rounded-lg bg-white p-6 shadow-soft">
            <h2 className="text-xl font-extrabold text-ink">Historical trend for {form.brand}</h2>
            <div className="mt-5 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => `${Math.round(value / 100000)}L`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="avg_price" stroke="#2EC4B6" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="avg_predicted" stroke="#F25F5C" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
