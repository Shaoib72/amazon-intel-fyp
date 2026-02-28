import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../utils/api"
import { useAuthStore } from "../store/authStore"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isRegister, setIsRegister] = useState(false)
  const [fullName, setFullName] = useState("")
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    try {
      if (isRegister) {
        await api.post("/api/auth/register", { email, password, full_name: fullName })
        setIsRegister(false)
        setError("")
        return
      }
      const res = await api.post("/api/auth/login", { email, password })
      setAuth(res.data.user, res.data.access_token)
      navigate("/")
    } catch (e: any) {
      setError(e.response?.data?.detail || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #FF6B35 0%, #f7931e 50%, #FF6B35 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "20px",
        padding: "40px",
        width: "100%",
        maxWidth: "420px",
        boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#111" }}>Amazon Intel</h1>
          <p style={{ color: "#9CA3AF", fontSize: "14px", marginTop: "4px" }}>
            AI-Powered Product Intelligence Platform
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: "#FEF2F2", border: "1px solid #FECACA",
            color: "#991B1B", padding: "12px", borderRadius: "8px",
            marginBottom: "16px", fontSize: "14px",
          }}>{error}</div>
        )}

        {isRegister && (
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
              Full Name
            </label>
            <input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your name"
              style={{ width: "100%", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "10px", fontSize: "14px" }}
            />
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{ width: "100%", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "10px", fontSize: "14px" }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{ width: "100%", padding: "12px", border: "1px solid #E5E7EB", borderRadius: "10px", fontSize: "14px" }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%", backgroundColor: loading ? "#FDA574" : "#FF6B35",
            color: "white", border: "none", padding: "14px",
            borderRadius: "10px", cursor: "pointer",
            fontWeight: "700", fontSize: "15px", marginBottom: "16px",
          }}
        >
          {loading ? "Please wait..." : isRegister ? "Create Account" : "Login"}
        </button>

        <p style={{ textAlign: "center", fontSize: "13px", color: "#6B7280" }}>
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <span
            onClick={() => { setIsRegister(!isRegister); setError("") }}
            style={{ color: "#FF6B35", fontWeight: "600", cursor: "pointer" }}
          >
            {isRegister ? "Login" : "Register"}
          </span>
        </p>
      </div>
    </div>
  )
}