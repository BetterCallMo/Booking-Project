// lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // ✅ لازم تحط لينك الباك عندك
});

export default api;
