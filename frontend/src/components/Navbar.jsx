import { Menu, Search, Sparkles, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const links = [
  ["Marketplace", "/vehicles"],
  ["Predict", "/predict"],
  ["Sell", "/add-vehicle"],
  ["Parts", "/parts"],
  ["Dashboard", "/dashboard"],
];

function linkClass({ isActive }) {
  return `rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive ? "bg-ink text-white" : "text-slate-600 hover:bg-white hover:text-ink"
  }`;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-cloud/85 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-white shadow-soft">
            <Sparkles size={20} />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-extrabold text-ink">SmartWheel</span>
            <span className="block text-xs font-semibold text-mint">AI resale marketplace</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map(([label, path]) => (
            <NavLink key={path} to={path} className={linkClass}>
              {label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/vehicles" className="btn-secondary py-2">
            <Search size={17} />
            Browse
          </Link>
          {user ? (
            <button onClick={logout} className="btn-primary py-2">
              <UserRound size={17} />
              Logout
            </button>
          ) : (
            <Link to="/auth" className="btn-primary py-2">
              <UserRound size={17} />
              Login
            </Link>
          )}
        </div>

        <button className="rounded-lg bg-white p-2 shadow-sm lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white px-4 pb-4 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            {links.map(([label, path]) => (
              <NavLink key={path} to={path} onClick={() => setOpen(false)} className={linkClass}>
                {label}
              </NavLink>
            ))}
            {user ? (
              <button onClick={logout} className="btn-primary">
                Logout
              </button>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="btn-primary">
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
