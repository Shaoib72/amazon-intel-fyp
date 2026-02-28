import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../utils/api"
import { useAuthStore } from "../store/authStore"

export default function Home() {
  const [tracked, setTracked] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [searchResult, setSearchResult] = useState<any>(null)
  const [searchError, setSearchError] = useState("")
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    api.get("/api/products/tracked/list")
      .then(res => setTracked(res.data))
      .catch(() => {})
  }, [])

  const handleSearch = async () => {
    if (!search.trim()) return
    const asin = search.trim().toUpperCase()
    setLoading(true)
    setSearchError("")
    setSearchResult(null)
    try {
      const res = await api.get(`/api/products/${asin}`)
      setSearchResult(res.data)
    } catch (e: any) {
      setSearchError(e.response?.data?.detail || "Product not found")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const scoreColor = (s: number) => s >= 70 ? "#10B981" : s >= 45 ? "#F59E0B" : "#EF4444"

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F9FAFB" }}>
      {/* Navbar */}
      <nav style={{
        backgroundColor: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "64px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "24px" }}>🔍</span>
          <span style={{ fontWeight: "800", fontSize: "18px", color: "#FF6B35" }}>Amazon Intel</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "13px", color: "#6B7280" }}>👤 {user?.email}</span>
          <span style={{
            backgroundColor: "#FEF3EE", color: "#FF6B35",
            padding: "4px 10px", borderRadius: "20px",
            fontSize: "11px", fontWeight: "700", textTransform: "uppercase" as const
          }}>{user?.plan}</span>
          <button
            onClick={() => {
              const token = localStorage.getItem("token")
              window.open(`http://localhost:8000/api/analysis/export/csv?token=${token}`, "_blank")
              // Trigger download via fetch
              api.get("/api/analysis/export/csv", { responseType: "blob" }).then(res => {
                const url = window.URL.createObjectURL(new Blob([res.data]))
                const a = document.createElement("a")
                a.href = url
                a.download = "tracked_products.csv"
                a.click()
                window.URL.revokeObjectURL(url)
              }).catch(() => {})
            }}
            style={{
              backgroundColor: "#10B981", color: "white",
              border: "none", padding: "8px 16px",
              borderRadius: "8px", cursor: "pointer",
              fontSize: "13px", fontWeight: "600"
            }}
          >📥 Export CSV</button>
          <button onClick={handleLogout} style={{
            backgroundColor: "#F3F4F6", color: "#374151",
            border: "none", padding: "8px 16px",
            borderRadius: "8px", cursor: "pointer", fontSize: "13px"
          }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Search Bar */}
        <div style={{
          backgroundColor: "white", borderRadius: "16px",
          padding: "32px", marginBottom: "32px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#111", marginBottom: "8px" }}>
            🔍 Search Any Amazon Product
          </h2>
          <p style={{ color: "#9CA3AF", fontSize: "14px", marginBottom: "20px" }}>
            Enter an Amazon ASIN to get full product intelligence
          </p>
          <div style={{ display: "flex", gap: "12px" }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Enter ASIN (e.g. B09B8LFKQL)"
              style={{
                flex: 1, padding: "14px 16px",
                border: "2px solid #E5E7EB", borderRadius: "10px",
                fontSize: "15px", outline: "none",
              }}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              style={{
                backgroundColor: loading ? "#FDA574" : "#FF6B35",
                color: "white", border: "none",
                padding: "14px 28px", borderRadius: "10px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "700", fontSize: "15px", minWidth: "120px",
              }}
            >
              {loading ? "Searching..." : "Analyze"}
            </button>
          </div>

          {searchError && (
            <div style={{
              backgroundColor: "#FEF2F2", border: "1px solid #FECACA",
              color: "#991B1B", padding: "12px", borderRadius: "8px",
              marginTop: "16px", fontSize: "14px"
            }}>⚠️ {searchError}</div>
          )}

          {searchResult && (
            <div style={{
              marginTop: "24px", padding: "24px",
              border: "2px solid #FF6B35", borderRadius: "12px",
              backgroundColor: "#FFFBF8",
            }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111", marginBottom: "16px" }}>
                {searchResult.title}
              </h3>
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
                gap: "12px", marginBottom: "16px"
              }}>
                {[
                  { label: "Monthly Sales", value: searchResult.sales_estimate_monthly ? `~${searchResult.sales_estimate_monthly.toLocaleString()}` : "N/A", color: "#10B981" },
                  { label: "Revenue/Month", value: searchResult.revenue_estimate_monthly ? `$${Math.round(searchResult.revenue_estimate_monthly).toLocaleString()}` : "N/A", color: "#3B82F6" },
                  { label: "BSR Rank", value: searchResult.current_bsr ? `#${searchResult.current_bsr.toLocaleString()}` : "N/A", color: "#8B5CF6" },
                  { label: "Price", value: searchResult.current_price ? `$${searchResult.current_price}` : "N/A", color: "#F59E0B" },
                  { label: "Rating", value: searchResult.current_rating ? `⭐ ${searchResult.current_rating}` : "N/A", color: "#EF4444" },
                  { label: "Reviews", value: searchResult.current_review_count ? searchResult.current_review_count.toLocaleString() : "N/A", color: "#06B6D4" },
                  { label: "Opportunity", value: searchResult.opportunity_score ? `${searchResult.opportunity_score}/100` : "N/A", color: scoreColor(searchResult.opportunity_score) },
                  { label: "In Stock", value: searchResult.in_stock ? "✅ Yes" : "❌ No", color: searchResult.in_stock ? "#10B981" : "#EF4444" },
                ].map(stat => (
                  <div key={stat.label} style={{
                    backgroundColor: "white", border: `1px solid ${stat.color}25`,
                    borderRadius: "10px", padding: "12px", textAlign: "center" as const,
                  }}>
                    <div style={{ fontSize: "10px", color: "#9CA3AF", textTransform: "uppercase" as const, marginBottom: "4px" }}>
                      {stat.label}
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: stat.color }}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => api.post(`/api/products/${searchResult.asin}/track`, {})
                    .then(() => alert("✅ Product tracked!"))
                    .catch(() => alert("Already tracking this product"))}
                  style={{
                    backgroundColor: "#FF6B35", color: "white",
                    border: "none", padding: "10px 20px",
                    borderRadius: "8px", cursor: "pointer", fontWeight: "600"
                  }}
                >⭐ Track Product</button>
                <button
                  onClick={() => navigate(`/product/${searchResult.asin}`)}
                  style={{
                    backgroundColor: "#F3F4F6", color: "#374151",
                    border: "none", padding: "10px 20px",
                    borderRadius: "8px", cursor: "pointer", fontWeight: "600"
                  }}
                >📊 Full Analysis</button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px", marginBottom: "32px"
        }}>
          {[
            { label: "Tracked Products", value: tracked.length, color: "#FF6B35", bg: "#FEF3EE", icon: "📦" },
            { label: "Total Analyses", value: tracked.length * 3, color: "#3B82F6", bg: "#EFF6FF", icon: "📊" },
            { label: "Plan", value: (user?.plan || "free").toUpperCase(), color: "#10B981", bg: "#F0FDF4", icon: "⭐" },
          ].map(stat => (
            <div key={stat.label} style={{
              backgroundColor: stat.bg, borderRadius: "12px",
              padding: "20px", border: `1px solid ${stat.color}20`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>{stat.icon}</div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "4px" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tracked Products */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#111" }}>
              ⭐ Tracked Products ({tracked.length})
            </h2>
          </div>

          {tracked.length === 0 ? (
            <div style={{
              backgroundColor: "white", borderRadius: "12px",
              padding: "60px", textAlign: "center" as const,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
              <p style={{ color: "#374151", fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>
                No tracked products yet
              </p>
              <p style={{ color: "#9CA3AF", fontSize: "13px" }}>
                Search for an ASIN above or use the Chrome extension on Amazon!
              </p>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px"
            }}>
              {tracked.map(p => (
                <div
                  key={p.asin}
                  onClick={() => navigate(`/product/${p.asin}`)}
                  style={{
                    backgroundColor: "white", borderRadius: "12px",
                    padding: "20px", cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    border: "1px solid #E5E7EB",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)")}
                >
                  <div style={{
                    fontSize: "13px", fontWeight: "600", color: "#111",
                    marginBottom: "8px", overflow: "hidden",
                    textOverflow: "ellipsis", whiteSpace: "nowrap" as const
                  }}>
                    {p.title}
                  </div>
                  <div style={{
                    fontSize: "11px", color: "#FF6B35",
                    fontWeight: "700", marginBottom: "12px"
                  }}>
                    {p.asin}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "#10B981", fontWeight: "600" }}>
                      {p.current_price ? `$${p.current_price}` : "N/A"}
                    </span>
                    <span style={{ color: "#8B5CF6", fontWeight: "600" }}>
                      {p.current_bsr ? `#${p.current_bsr.toLocaleString()}` : "N/A"}
                    </span>
                  </div>
                  <div style={{
                    marginTop: "12px", paddingTop: "12px",
                    borderTop: "1px solid #F3F4F6",
                    fontSize: "11px", color: "#9CA3AF"
                  }}>
                    📅 {new Date(p.tracked_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}