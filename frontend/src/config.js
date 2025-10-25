// src/config.js
const isProduction = import.meta.env.MODE === "production";

export const API_BASE_URL = isProduction
  ? "https://api.yourdomain.com"
  : "http://localhost/react_trucking_system/backend/api";