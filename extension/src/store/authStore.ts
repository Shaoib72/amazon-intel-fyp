import { create } from "zustand"
import { storage } from "../utils/storage"

interface User {
  id: string
  email: string
  full_name: string
  plan: string
}

interface AuthStore {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  setAuth: (user: User, token: string) => Promise<void>
  logout: () => Promise<void>
  loadFromStorage: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoggedIn: false,

  setAuth: async (user, token) => {
    await storage.set("auth_token", token)
    await storage.set("user", user)
    set({ user, token, isLoggedIn: true })
  },

  logout: async () => {
    await storage.remove("auth_token")
    await storage.remove("user")
    set({ user: null, token: null, isLoggedIn: false })
  },

  loadFromStorage: async () => {
    try {
      const token = await storage.get("auth_token")
      const user = await storage.get("user")
      if (token && user) {
        set({ token, user, isLoggedIn: true })
      }
    } catch (e) {
      console.error("Failed to load from storage", e)
    }
  },
}))