import { createContext, useContext, useMemo, useState } from "react";

import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("smart_vehicle_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (payload) => {
    const { data } = await api.post("/login", payload);
    localStorage.setItem("smart_vehicle_token", data.access_token);
    localStorage.setItem("smart_vehicle_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/register", payload);
    localStorage.setItem("smart_vehicle_token", data.access_token);
    localStorage.setItem("smart_vehicle_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("smart_vehicle_token");
    localStorage.removeItem("smart_vehicle_user");
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, register, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
