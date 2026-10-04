import { Gauge, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { defaultCarImage, formatCurrency } from "../data/options";

export default function VehicleCard({ vehicle }) {
  const image = vehicle?.image_urls?.[0] || defaultCarImage;
  const priceDelta = (vehicle.predicted_price || 0) - (vehicle.price || 0);

  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={image} alt={`${vehicle.brand} ${vehicle.model}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-3 rounded-lg bg-white/90 px-3 py-1 text-xs font-bold text-ink">
          {vehicle.condition_rating || 4.2}/5 condition
        </span>
      </div>
      <div className="space-y-4 p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-mint">{vehicle.city}</p>
          <h3 className="mt-1 line-clamp-1 text-lg font-extrabold text-ink">
            {vehicle.brand} {vehicle.model}
          </h3>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">Seller price</p>
            <p className="text-xl font-extrabold text-ink">{formatCurrency(vehicle.price)}</p>
          </div>
          <div className={`rounded-lg px-3 py-2 text-right text-xs font-bold ${priceDelta >= 0 ? "bg-mint/10 text-mint" : "bg-coral/10 text-coral"}`}>
            <Sparkles className="ml-auto" size={14} />
            AI {formatCurrency(vehicle.predicted_price)}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Gauge size={14} /> {vehicle.km_driven?.toLocaleString("en-IN")} km
          </span>
          <span>{vehicle.fuel_type}</span>
          <span>{vehicle.transmission_type}</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin size={14} /> Nearby ready
          </span>
          <span className="flex items-center gap-1 text-ink">
            <ShieldCheck size={14} /> Verified
          </span>
        </div>
      </div>
    </Link>
  );
}
