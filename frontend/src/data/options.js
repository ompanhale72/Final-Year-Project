export const brands = ["Maruti", "Hyundai", "Honda", "Toyota", "Mahindra", "Tata", "Ford", "BMW", "Audi"];
export const fuels = ["Petrol", "Diesel", "CNG", "LPG", "Electric"];
export const transmissions = ["Manual", "Automatic"];
export const cities = ["Delhi", "Mumbai", "Bengaluru", "Pune", "Hyderabad", "Chennai", "Jaipur"];

export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export const defaultCarImage =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80";
