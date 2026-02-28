import { useState, useEffect } from "react"
import { authAPI } from "../utils/api-client"
import { useAuthStore } from "../store/authStore"

function PopupApp() {
  const { isLoggedIn, user, setAuth, logout, loadFromStorage } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    loadFromStorage()
  }, [])

  const handleLogin = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await authAPI.login(email, password)
      setAuth(res.data.user, res.data.access_token)
    } catch (e: any) {
      setError(e.response?.data?.detail || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  if (isLoggedIn && user) {
    return (
      <div style={{ width: "300px", padding: "20px", fontFamily: "Inter, sans-serif" }}>
        <div style={{
          background: "linear-gradient(135deg, #FF6B35, #f7931e)",
          color: "white",
          padding: "16px",
          borderRadius: "12px",
          marginBottom: "16px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>🔍</div>
          <div style={{ fontWeight: "bold", fontSize: "16px" }}>Amazon Intel</div>
          <div style={{ fontSize: "12px", opacity: 0.85 }}>AI Product Intelligence</div>
        </div>

        <div style={{
          backgroundColor: "#F0FDF4",
          border: "1px solid #BBF7D0",
          borderRadius: "10px",
          padding: "12px",
          marginBottom: "16px",
        }}>
          <div style={{ fontSize: "13px", color: "#166534", fontWeight: "600" }}>
            ✅ Logged in as
          </div>
          <div style={{ fontSize: "12px", color: "#374151", marginTop: "4px" }}>
            {user.email}
          </div>
          <div style={{
            display: "inline-block",
            backgroundColor: "#FF6B35",
            color: "white",
            padding: "2px 8px",
            borderRadius: "10px",
            fontSize: "10px",
            marginTop: "6px",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}>
            {user.plan} plan
          </div>
        </div>

        <div style={{
          backgroundColor: "#EFF6FF",
          border: "1px solid #BFDBFE",
          borderRadius: "10px",
          padding: "12px",
          marginBottom: "16px",
          fontSize: "12px",
          color: "#1E40AF",
        }}>
          💡 Go to any Amazon product page to see the intelligence sidebar automatically!
        </div>

        <button
          onClick={logout}
          style={{
            width: "100%",
            backgroundColor: "#F3F4F6",
            color: "#374151",
            border: "1px solid #E5E7EB",
            padding: "10px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <div style={{ width: "300px", padding: "20px", fontFamily: "Inter, sans-serif" }}>
      <div style={{
        background: "linear-gradient(135deg, #FF6B35, #f7931e)",
        color: "white",
        padding: "16px",
        borderRadius: "12px",
        marginBottom: "20px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "28px", marginBottom: "8px" }}>🔍</div>
        <div style={{ fontWeight: "bold", fontSize: "18px" }}>Amazon Intel</div>
        <div style={{ fontSize: "12px", opacity: 0.85 }}>AI-Powered Product Intelligence</div>
      </div>

      {error && (
        <div style={{
          backgroundColor: "#FEF2F2",
          border: "1px solid #FECACA",
          color: "#991B1B",
          padding: "10px",
          borderRadius: "8px",
          marginBottom: "14px",
          fontSize: "13px",
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: "12px" }}>
        <label style={{ fontSize: "12px", color: "#374151", fontWeight: "600", display: "block", marginBottom: "6px" }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            fontSize: "13px",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label style={{ fontSize: "12px", color: "#374151", fontWeight: "600", display: "block", marginBottom: "6px" }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            fontSize: "13px",
            boxSizing: "border-box",
          }}
        />
      </div>

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          width: "100%",
          backgroundColor: "#FF6B35",
          color: "white",
          border: "none",
          padding: "12px",
          borderRadius: "10px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "14px",
        }}
      >
        {loading ? "Logging in..." : "Login to Amazon Intel"}
      </button>
    </div>
  )
}

export default PopupApp