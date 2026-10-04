import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { brands, cities } from "../data/options";

export default function SearchPanel() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ brand: "", max_price: "", city: "" });

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    Object.entries(form).forEach(([key, value]) => value && params.set(key, value));
    navigate(`/vehicles?${params.toString()}`);
  };

  return (
    <form onSubmit={submit} className="glass-panel grid gap-3 rounded-lg p-3 shadow-soft md:grid-cols-[1fr_1fr_1fr_auto]">
      <select name="brand" value={form.brand} onChange={update} className="input">
        <option value="">Any brand</option>
        {brands.map((brand) => (
          <option key={brand}>{brand}</option>
        ))}
      </select>
      <input name="max_price" value={form.max_price} onChange={update} className="input" placeholder="Max price" type="number" />
      <select name="city" value={form.city} onChange={update} className="input">
        <option value="">Any city</option>
        {cities.map((city) => (
          <option key={city}>{city}</option>
        ))}
      </select>
      <button className="btn-primary">
        <Search size={18} />
        Search
      </button>
    </form>
  );
}
