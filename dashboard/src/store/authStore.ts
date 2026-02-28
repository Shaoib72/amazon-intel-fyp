import { create } from "zustand"

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
  setAuth: (user: User, token: string) => void
  logout: () => void
  loadFromStorage: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoggedIn: false,

  setAuth: (user, token) => {
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
    set({ user, token, isLoggedIn: true })
  },

  logout: () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    set({ user: null, token: null, isLoggedIn: false })
  },

  loadFromStorage: () => {
    const token = localStorage.getItem("token")
    const userStr = localStorage.getItem("user")
    if (token && userStr) {
      try { set({ token, user: JSON.parse(userStr), isLoggedIn: true }) }
      catch {}
    }
  },
}))