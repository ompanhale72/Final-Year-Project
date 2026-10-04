import { Filter, LocateFixed, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import api from "../api/client";
import VehicleCard from "../components/VehicleCard";
import { brands, cities, fuels } from "../data/options";

export default function Listings() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [filters, setFilters] = useState({
    brand: searchParams.get("brand") || "",
    city: searchParams.get("city") || "",
    fuel: "",
    max_price: searchParams.get("max_price") || "",
    sort: "newest",
  });
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const update = (event) => setFilters({ ...filters, [event.target.name]: event.target.value });

  const fetchVehicles = (params = filters) => {
    setLoading(true);
    api
      .get("/vehicles", { params })
      .then(({ data }) => setVehicles(data.vehicles))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const useNearby = () => {
    navigator.geolocation?.getCurrentPosition((position) => {
      fetchVehicles({
        ...filters,
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        radius_km: 250,
      });
    });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-mint">Marketplace</p>
          <h1 className="mt-2 text-4xl font-extrabold text-ink">Browse verified used vehicles</h1>
        </div>
        <button onClick={useNearby} className="btn-secondary">
          <LocateFixed size={18} />
          Nearby vehicles
        </button>
      </div>

      <div className="mb-8 rounded-lg bg-white p-4 shadow-soft">
        <div className="mb-4 flex items-center gap-2 font-extrabold text-ink">
          <Filter size={18} /> Filters
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          <select name="brand" value={filters.brand} onChange={update} className="input">
            <option value="">Brand</option>
            {brands.map((brand) => <option key={brand}>{brand}</option>)}
          </select>
          <select name="fuel" value={filters.fuel} onChange={update} className="input">
            <option value="">Fuel</option>
            {fuels.map((fuel) => <option key={fuel}>{fuel}</option>)}
          </select>
          <select name="city" value={filters.city} onChange={update} className="input">
            <option value="">City</option>
            {cities.map((city) => <option key={city}>{city}</option>)}
          </select>
          <input name="max_price" value={filters.max_price} onChange={update} className="input" placeholder="Max price" type="number" />
          <select name="sort" value={filters.sort} onChange={update} className="input">
            <option value="newest">Newest</option>
            <option value="price_asc">Price low to high</option>
            <option value="price_desc">Price high to low</option>
            <option value="km_low">Lowest km</option>
          </select>
        </div>
        <button onClick={() => fetchVehicles()} className="btn-primary mt-4">
          <SlidersHorizontal size={18} />
          Apply filters
        </button>
      </div>

      {loading ? (
        <p className="rounded-lg bg-white p-6 text-slate-500 shadow-sm">Loading vehicles...</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
        </div>
      )}
    </section>
  );
}
