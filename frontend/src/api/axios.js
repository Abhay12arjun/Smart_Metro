import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL: API_URL
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("metroToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("metroUser");
      localStorage.removeItem("metroToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;