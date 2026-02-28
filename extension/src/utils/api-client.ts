import axios from "axios"
import { storage } from "./storage"

const API_BASE = "http://localhost:8000"

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
})

api.interceptors.request.use(async (config) => {
  try {
    const token = await storage.get("auth_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (e) {}
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await storage.remove("auth_token")
      await storage.remove("user")
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }),
  register: (email: string, password: string, full_name: string) =>
    api.post("/api/auth/register", { email, password, full_name }),
  me: () => api.get("/api/auth/me"),
}

export const productAPI = {
  get: (asin: string) => api.get(`/api/products/${asin}`),
  track: (asin: string) => api.post(`/api/products/${asin}/track`, {}),
  untrack: (asin: string) => api.delete(`/api/products/${asin}/track`),
  tracked: () => api.get("/api/products/tracked/list"),
}

export default api