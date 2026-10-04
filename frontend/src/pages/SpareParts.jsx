import { PackagePlus, Search } from "lucide-react";
import { useEffect, useState } from "react";

import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { cities, formatCurrency } from "../data/options";

const categories = ["Tyres", "Brakes", "Battery", "Lighting", "Engine Oil", "Body"];

export default function SpareParts() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ search: "", category: "", city: "" });
  const [parts, setParts] = useState([]);
  const [form, setForm] = useState({ name: "", category: "Tyres", brand: "", price: "", city: "Delhi", condition: "New", image_url: "" });

  const updateFilters = (event) => setFilters({ ...filters, [event.target.name]: event.target.value });
  const updateForm = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const fetchParts = () => api.get("/parts", { params: filters }).then(({ data }) => setParts(data.parts));

  useEffect(() => {
    fetchParts();
  }, []);

  const addPart = async (event) => {
    event.preventDefault();
    if (!user) return;
    await api.post("/add-part", {
      ...form,
      image_url: form.image_url || "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=80",
    });
    setForm({ name: "", category: "Tyres", brand: "", price: "", city: "Delhi", condition: "New", image_url: "" });
    fetchParts();
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-wide text-mint">Spare parts</p>
        <h1 className="mt-2 text-4xl font-extrabold text-ink">Find parts from verified sellers</h1>
      </div>

      <div className="mb-8 grid gap-4 rounded-lg bg-white p-4 shadow-soft md:grid-cols-[1fr_220px_220px_auto]">
        <input name="search" value={filters.search} onChange={updateFilters} className="input" placeholder="Search parts" />
        <select name="category" value={filters.category} onChange={updateFilters} className="input">
          <option value="">Any category</option>
          {categories.map((category) => <option key={category}>{category}</option>)}
        </select>
        <select name="city" value={filters.city} onChange={updateFilters} className="input">
          <option value="">Any city</option>
          {cities.map((city) => <option key={city}>{city}</option>)}
        </select>
        <button onClick={fetchParts} className="btn-primary"><Search size={18} /> Search</button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {parts.map((part) => (
            <article key={part.id} className="overflow-hidden rounded-lg bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
              <img src={part.image_url} alt={part.name} className="aspect-[16/10] w-full object-cover" />
              <div className="p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-mint">{part.category}</p>
                <h3 className="mt-1 text-lg font-extrabold text-ink">{part.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{part.brand} · {part.condition} · {part.city}</p>
                <p className="mt-4 text-2xl font-extrabold text-ink">{formatCurrency(part.price)}</p>
              </div>
            </article>
          ))}
        </div>

        <form onSubmit={addPart} className="h-fit rounded-lg bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-center gap-3">
            <PackagePlus className="text-coral" />
            <div>
              <p className="font-extrabold text-ink">Add spare part</p>
              <p className="text-sm text-slate-500">{user ? "Post inventory for buyers." : "Login to post inventory."}</p>
            </div>
          </div>
          <div className="grid gap-3">
            <input className="input" name="name" value={form.name} onChange={updateForm} placeholder="Part name" required />
            <select className="input" name="category" value={form.category} onChange={updateForm}>{categories.map((category) => <option key={category}>{category}</option>)}</select>
            <input className="input" name="brand" value={form.brand} onChange={updateForm} placeholder="Brand" />
            <input className="input" name="price" value={form.price} onChange={updateForm} type="number" placeholder="Price" required />
            <select className="input" name="city" value={form.city} onChange={updateForm}>{cities.map((city) => <option key={city}>{city}</option>)}</select>
            <select className="input" name="condition" value={form.condition} onChange={updateForm}><option>New</option><option>Used</option><option>Refurbished</option></select>
            <input className="input" name="image_url" value={form.image_url} onChange={updateForm} placeholder="Image URL" />
          </div>
          <button disabled={!user} className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50">Add part</button>
        </form>
      </div>
    </section>
  );
}
