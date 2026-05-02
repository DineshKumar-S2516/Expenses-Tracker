import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fintrack_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function extractError(error) {
  const data = error?.response?.data;
  if (data?.fields) {
    return Object.values(data.fields).join(", ");
  }
  return data?.error || data?.message || "Something went wrong";
}

export default api;
