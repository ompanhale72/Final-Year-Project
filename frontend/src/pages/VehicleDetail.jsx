import { motion } from "framer-motion";
import { Calendar, Fuel, Gauge, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../api/client";
import ChatWidget from "../components/ChatWidget";
import VehicleCard from "../components/VehicleCard";
import { defaultCarImage, formatCurrency } from "../data/options";

export default function VehicleDetail() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [activeImage, setActiveImage] = useState(defaultCarImage);

  useEffect(() => {
    api.get(`/vehicle/${id}`).then(({ data }) => {
      setVehicle(data.vehicle);
      setActiveImage(data.vehicle.image_urls?.[0] || defaultCarImage);
    });
    api.get(`/similar-vehicles/${id}`).then(({ data }) => setSimilar(data.vehicles)).catch(() => setSimilar([]));
  }, [id]);

  if (!vehicle) {
    return <section className="mx-auto max-w-7xl px-4 py-20 text-slate-500 lg:px-8">Loading vehicle...</section>;
  }

  const images = vehicle.image_urls?.length ? vehicle.image_urls : [defaultCarImage];
  const fairDelta = Number(vehicle.predicted_price || 0) - Number(vehicle.price || 0);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <motion.img initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={activeImage} alt={`${vehicle.brand} ${vehicle.model}`} className="aspect-[16/10] w-full rounded-lg object-cover shadow-soft" />
          <div className="mt-4 grid grid-cols-3 gap-3">
            {images.map((image) => (
              <button key={image} onClick={() => setActiveImage(image)} className={`overflow-hidden rounded-lg border-2 ${activeImage === image ? "border-mint" : "border-transparent"}`}>
                <img src={image} alt="Vehicle gallery" className="aspect-[16/10] w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-lg bg-white p-6 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-wide text-mint">{vehicle.city}</p>
            <h1 className="mt-2 text-4xl font-extrabold text-ink">{vehicle.brand} {vehicle.model}</h1>
            <p className="mt-3 text-slate-500">{vehicle.description}</p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <span className="flex items-center gap-2 rounded-lg bg-cloud p-3"><Calendar size={18} /> {vehicle.year}</span>
              <span className="flex items-center gap-2 rounded-lg bg-cloud p-3"><Gauge size={18} /> {vehicle.km_driven.toLocaleString("en-IN")} km</span>
              <span className="flex items-center gap-2 rounded-lg bg-cloud p-3"><Fuel size={18} /> {vehicle.fuel_type}</span>
              <span className="flex items-center gap-2 rounded-lg bg-cloud p-3"><MapPin size={18} /> {vehicle.city}</span>
            </div>
          </div>

          <div className="rounded-lg bg-ink p-6 text-white shadow-soft">
            <Sparkles className="text-saffron" />
            <p className="mt-4 text-sm font-bold uppercase tracking-wide text-white/60">AI fair value</p>
            <p className="mt-2 text-4xl font-extrabold">{formatCurrency(vehicle.predicted_price)}</p>
            <p className="mt-2 text-sm text-white/70">
              Seller asks {formatCurrency(vehicle.price)}. This is {formatCurrency(Math.abs(fairDelta))} {fairDelta >= 0 ? "below or near fair value" : "above fair value"}.
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-mint" />
              <div>
                <p className="font-extrabold text-ink">Seller</p>
                <p className="text-sm text-slate-500">{vehicle.seller?.name || "Verified seller"} · {vehicle.seller_type}</p>
              </div>
            </div>
            <div className="mt-5">
              <ChatWidget sellerId={vehicle.seller_id} vehicleId={vehicle.id} />
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-12">
        <h2 className="mb-5 text-2xl font-extrabold text-ink">Similar vehicles</h2>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {similar.map((item) => <VehicleCard key={item.id} vehicle={item} />)}
        </div>
      </div>
    </section>
  );
}
