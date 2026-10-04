import { motion } from "framer-motion";
import { LockKeyhole, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", city: "" });
  const [error, setError] = useState("");

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.email.includes("@")) return setError("Enter a valid email address.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    try {
      if (mode === "login") await login({ email: form.email, password: form.password });
      else await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Authentication failed.");
    }
  };

  return (
    <section className="mx-auto grid min-h-[720px] max-w-7xl gap-8 px-4 py-14 lg:grid-cols-2 lg:px-8">
      <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col justify-center">
        <p className="text-sm font-bold uppercase tracking-wide text-mint">Account</p>
        <h1 className="mt-3 text-4xl font-extrabold text-ink">Trade with verified profiles and secure JWT sessions.</h1>
        <p className="mt-4 text-slate-600">Create a seller profile, manage listings, chat with buyers, and get AI-backed pricing for every vehicle you add.</p>
        <img
          src="https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1100&q=80"
          alt="Premium vehicle interior"
          className="mt-8 aspect-[16/9] rounded-lg object-cover shadow-soft"
        />
      </motion.div>

      <motion.form initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit} className="m-auto w-full max-w-md rounded-lg bg-white p-6 shadow-soft">
        <div className="mb-6 grid grid-cols-2 rounded-lg bg-cloud p-1">
          <button type="button" onClick={() => setMode("login")} className={`rounded-lg py-2 text-sm font-bold ${mode === "login" ? "bg-white text-ink shadow-sm" : "text-slate-500"}`}>
            Login
          </button>
          <button type="button" onClick={() => setMode("register")} className={`rounded-lg py-2 text-sm font-bold ${mode === "register" ? "bg-white text-ink shadow-sm" : "text-slate-500"}`}>
            Register
          </button>
        </div>

        {mode === "register" && (
          <label className="mb-4 block">
            <span className="mb-2 flex items-center gap-2 text-sm font-bold text-ink"><UserRound size={16} /> Name</span>
            <input className="input" name="name" value={form.name} onChange={update} required />
          </label>
        )}
        <label className="mb-4 block">
          <span className="mb-2 flex items-center gap-2 text-sm font-bold text-ink"><Mail size={16} /> Email</span>
          <input className="input" name="email" value={form.email} onChange={update} type="email" required />
        </label>
        <label className="mb-4 block">
          <span className="mb-2 flex items-center gap-2 text-sm font-bold text-ink"><LockKeyhole size={16} /> Password</span>
          <input className="input" name="password" value={form.password} onChange={update} type="password" required />
        </label>
        {mode === "register" && <input className="input mb-4" name="city" value={form.city} onChange={update} placeholder="City" />}
        {error && <p className="mb-4 rounded-lg bg-coral/10 p-3 text-sm font-semibold text-coral">{error}</p>}
        <button className="btn-primary w-full">{mode === "login" ? "Login" : "Create account"}</button>
        <p className="mt-4 text-center text-sm text-slate-500">Demo: seller@example.com / password123 after seeding.</p>
      </motion.form>
    </section>
  );
}
