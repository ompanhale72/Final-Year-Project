import { Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import AddVehicle from "./pages/AddVehicle";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Listings from "./pages/Listings";
import PricePrediction from "./pages/PricePrediction";
import SpareParts from "./pages/SpareParts";
import VehicleDetail from "./pages/VehicleDetail";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vehicles" element={<Listings />} />
        <Route path="/vehicles/:id" element={<VehicleDetail />} />
        <Route path="/add-vehicle" element={<AddVehicle />} />
        <Route path="/parts" element={<SpareParts />} />
        <Route path="/predict" element={<PricePrediction />} />
      </Route>
    </Routes>
  );
}
