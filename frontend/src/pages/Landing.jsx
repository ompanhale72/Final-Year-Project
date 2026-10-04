import { motion } from "framer-motion";
import { ArrowRight, BarChart3, MapPin, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import api from "../api/client";
import Metric from "../components/Metric";
import SearchPanel from "../components/SearchPanel";
import VehicleCard from "../components/VehicleCard";
import { formatCurrency } from "../data/options";

export default function Landing() {
  const [vehicles, setVehicles] = useState([]);
  const [trend, setTrend] = useState([]);

  useEffect(() => {
    api.get("/vehicles").then(({ data }) => setVehicles(data.vehicles.slice(0, 6))).catch(() => setVehicles([]));
    api.get("/price-trend").then(({ data }) => setTrend(data.trend)).catch(() => setTrend([]));
  }, []);

  return (
    <>
      <section className="hero-image min-h-[680px] text-white">
        <div className="mx-auto flex min-h-[680px] max-w-7xl flex-col justify-center px-4 py-14 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur">
              <Sparkles size={16} /> AI-powered resale intelligence
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-6xl">
              Smart Used Vehicle Price Prediction & Marketplace
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-white/82">
              Buy, sell, predict fair value, discover spare parts, and chat directly with verified sellers in one polished marketplace.
            </p>
            <div className="mt-8">
              <SearchPanel />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/add-vehicle" className="btn-primary bg-saffron text-ink hover:bg-white">
                Sell your vehicle <ArrowRight size={18} />
              </Link>
              <Link to="/predict" className="btn-secondary border-white/30 bg-white/10 text-white hover:bg-white hover:text-ink">
                Predict price
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto -mt-16 grid max-w-7xl gap-4 px-4 lg:grid-cols-4 lg:px-8">
        <Metric label="AI price checks" value="10k+" tone="mint" />
        <Metric label="Verified cities" value="28" tone="saffron" />
        <Metric label="Avg model R2" value="Live" tone="ink" />
        <Metric label="Spare parts" value="500+" tone="coral" />
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-mint">Featured vehicles</p>
              <h2 className="mt-2 text-3xl font-extrabold text-ink">Fresh listings with AI fair-value checks</h2>
            </div>
            <Link to="/vehicles" className="hidden text-sm font-bold text-mint md:block">View all</Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-lg bg-white p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-mint" />
              <div>
                <p className="font-extrabold text-ink">Market price trend</p>
                <p className="text-sm text-slate-500">Average resale values from listings and training data.</p>
              </div>
            </div>
            <div className="mt-5 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="priceArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2EC4B6" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#2EC4B6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={(value) => `${Math.round(value / 100000)}L`} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="avg_price" stroke="#2EC4B6" fill="url(#priceArea)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid gap-4">
            {[
              [ShieldCheck, "Condition rating", "Score listings with structured seller-provided condition signals."],
              [MessageCircle, "Real-time chat", "Socket.io rooms connect buyers and sellers immediately."],
              [MapPin, "Nearby search", "Filter vehicles by coordinates and radius for local discovery."],
            ].map(([Icon, title, copy]) => (
              <div key={title} className="rounded-lg bg-white p-5 shadow-sm">
                <Icon className="text-coral" />
                <h3 className="mt-3 font-extrabold text-ink">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">{copy}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </>
  );
}
