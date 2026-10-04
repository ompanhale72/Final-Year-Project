import { Car, IndianRupee, Plus, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/client";
import Metric from "../components/Metric";
import VehicleCard from "../components/VehicleCard";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../data/options";

export default function Dashboard() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    api.get("/vehicles").then(({ data }) => {
      setVehicles(user ? data.vehicles.filter((vehicle) => vehicle.seller_id === user.id) : []);
    });
  }, [user]);

  if (!user) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <UserRound className="mx-auto text-mint" size={42} />
        <h1 className="mt-4 text-3xl font-extrabold text-ink">Login to view your dashboard</h1>
        <p className="mt-2 text-slate-500">Your listings, profile, and chats are protected with JWT authentication.</p>
        <Link to="/auth" className="btn-primary mt-6">Login</Link>
      </section>
    );
  }

  const inventoryValue = vehicles.reduce((sum, vehicle) => sum + Number(vehicle.price || 0), 0);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 rounded-lg bg-white p-6 shadow-soft md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-mint/10 text-mint">
            <UserRound size={28} />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-mint">Seller dashboard</p>
            <h1 className="text-3xl font-extrabold text-ink">{user.name}</h1>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>
        <Link to="/add-vehicle" className="btn-primary">
          <Plus size={18} />
          Add listing
        </Link>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Metric label="My listings" value={vehicles.length} tone="mint" />
        <Metric label="Inventory value" value={formatCurrency(inventoryValue)} tone="saffron" />
        <Metric label="Profile city" value={user.city || "Not set"} tone="ink" />
      </div>

      <div className="mb-5 flex items-center gap-2">
        <Car className="text-coral" />
        <h2 className="text-2xl font-extrabold text-ink">My listings</h2>
      </div>
      {vehicles.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
        </div>
      ) : (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <IndianRupee className="mx-auto text-saffron" size={38} />
          <p className="mt-3 font-bold text-ink">No listings yet</p>
          <p className="text-sm text-slate-500">Add a vehicle to get an instant AI price estimate.</p>
        </div>
      )}
    </section>
  );
}
