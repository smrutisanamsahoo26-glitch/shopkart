import axios from "axios";

const rawBaseURL = import.meta.env.VITE_API_URL || "http://localhost:8085";
// Strip trailing slash if present to avoid duplicate slashes in endpoints
const baseURL = rawBaseURL.replace(/\/+$/, "");

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;

