import { useEffect, useState } from "react"
import { extractASIN, isAmazonProductPage } from "../utils/asin-extractor"
import { productAPI } from "../utils/api-client"
import { useAuthStore } from "../store/authStore"
import api from "../utils/api-client"

export const config = {
  matches: ["https://www.amazon.com/*"],
}

type Tab = "overview" | "keywords" | "competitors" | "profit"

function AmazonSidebar() {
  const [asin, setAsin] = useState<string | null>(null)
  const [product, setProduct] = useState<any>(null)
  const [keywords, setKeywords] = useState<any[]>([])
  const [competitors, setCompetitors] = useState<any>(null)
  const [profit, setProfit] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [isOpen, setIsOpen] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isLoggedIn, loadFromStorage } = useAuthStore()

  useEffect(() => {
    loadFromStorage().then(() => {
      const detected = extractASIN(window.location.href)
      setAsin(detected)
    })
  }, [])

  useEffect(() => {
    if (!asin || !isLoggedIn) return
    setLoading(true)
    setError(null)
    productAPI.get(asin)
      .then((res) => {
        setProduct(res.data)
        // Load other data in background
        api.get(`/api/keywords/${asin}`).then(r => setKeywords(r.data.keywords || [])).catch(() => {})
        api.get(`/api/competitors/${asin}`).then(r => setCompetitors(r.data)).catch(() => {})
      })
      .catch((err) => setError(err.response?.data?.detail || "Failed to load"))
      .finally(() => setLoading(false))
  }, [asin, isLoggedIn])

  const loadProfit = (cost: number) => {
    if (!asin || !product) return
    api.get(`/api/profit/${asin}?product_cost=${cost}`)
      .then(r => setProfit(r.data))
      .catch(() => {})
  }

  if (!isAmazonProductPage(window.location.href)) return null

  const tabs: {id: Tab, label: string, emoji: string}[] = [
    {id: "overview", label: "Overview", emoji: "📊"},
    {id: "keywords", label: "Keywords", emoji: "🔍"},
    {id: "competitors", label: "Rivals", emoji: "⚔️"},
    {id: "profit", label: "Profit", emoji: "💰"},
  ]

  return (
    <div style={{
      position: "fixed",
      right: isOpen ? "0" : "-420px",
      top: "80px",
      width: "400px",
      height: "calc(100vh - 80px)",
      backgroundColor: "#fff",
      boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
      zIndex: 999999,
      transition: "right 0.3s ease",
      display: "flex",
      flexDirection: "column",
      fontFamily: "Inter, -apple-system, sans-serif",
    }}>
      {/* Toggle Button */}
      <button onClick={() => setIsOpen(!isOpen)} style={{
        position: "absolute",
        left: "-44px",
        top: "40%",
        backgroundColor: "#FF6B35",
        color: "white",
        border: "none",
        borderRadius: "8px 0 0 8px",
        padding: "14px 8px",
        cursor: "pointer",
        writingMode: "vertical-rl",
        fontWeight: "bold",
        fontSize: "11px",
        letterSpacing: "1px",
        boxShadow: "-2px 0 8px rgba(0,0,0,0.2)",
      }}>
        {isOpen ? "▶ HIDE" : "◀ INTEL"}
      </button>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #FF6B35, #f7931e)",
        color: "white",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div>
          <div style={{fontWeight: "bold", fontSize: "15px"}}>🔍 Amazon Intel</div>
          <div style={{fontSize: "10px", opacity: 0.85}}>AI-Powered Intelligence</div>
        </div>
        {asin && (
          <div style={{
            backgroundColor: "rgba(255,255,255,0.2)",
            padding: "3px 8px",
            borderRadius: "20px",
            fontSize: "10px",
            fontWeight: "bold",
          }}>{asin}</div>
        )}
      </div>

      {/* Tabs */}
      {isLoggedIn && (
        <div style={{
          display: "flex",
          borderBottom: "2px solid #F3F4F6",
          backgroundColor: "#FAFAFA",
          flexShrink: 0,
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: "10px 4px",
                border: "none",
                backgroundColor: "transparent",
                borderBottom: activeTab === tab.id ? "2px solid #FF6B35" : "2px solid transparent",
                color: activeTab === tab.id ? "#FF6B35" : "#6B7280",
                fontWeight: activeTab === tab.id ? "700" : "500",
                fontSize: "10px",
                cursor: "pointer",
                marginBottom: "-2px",
                transition: "all 0.2s",
              }}
            >
              <div>{tab.emoji}</div>
              <div>{tab.label}</div>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div style={{flex: 1, overflowY: "auto", padding: "16px"}}>
        {!isLoggedIn && (
          <div style={{textAlign: "center", padding: "60px 20px"}}>
            <div style={{fontSize: "48px", marginBottom: "12px"}}>🔐</div>
            <p style={{color: "#374151", fontWeight: "600"}}>Login Required</p>
            <p style={{color: "#9CA3AF", fontSize: "13px"}}>Open the extension popup to login</p>
          </div>
        )}

        {isLoggedIn && loading && (
          <div style={{textAlign: "center", padding: "60px"}}>
            <div style={{
              width: "40px", height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #FF6B35",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}/>
            <p style={{color: "#6B7280", fontSize: "13px"}}>Analyzing product...</p>
          </div>
        )}

        {isLoggedIn && error && (
          <div style={{
            backgroundColor: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#991B1B",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "13px",
          }}>⚠️ {error}</div>
        )}

        {isLoggedIn && product && !loading && (
          <>
            {activeTab === "overview" && <OverviewTab product={product} asin={asin!} />}
            {activeTab === "keywords" && <KeywordsTab keywords={keywords} />}
            {activeTab === "competitors" && <CompetitorsTab data={competitors} product={product} />}
            {activeTab === "profit" && <ProfitTab profit={profit} product={product} onCalculate={loadProfit} />}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #FF6B35; border-radius: 4px; }
      `}</style>
    </div>
  )
}

// ============ OVERVIEW TAB ============
function OverviewTab({ product, asin }: { product: any, asin: string }) {
  const [tracked, setTracked] = useState(false)
  const [trackLoading, setTrackLoading] = useState(false)

  const score = product.opportunity_score
  const scoreColor = score >= 70 ? "#10B981" : score >= 45 ? "#F59E0B" : "#EF4444"
  const scoreLabel = score >= 70 ? "🟢 Great Opportunity" : score >= 45 ? "🟡 Moderate" : "🔴 Difficult"

  const handleTrack = async () => {
    setTrackLoading(true)
    try {
      if (tracked) { await productAPI.untrack(asin); setTracked(false) }
      else { await productAPI.track(asin); setTracked(true) }
    } catch {} finally { setTrackLoading(false) }
  }

  return (
    <div>
      <p style={{fontSize: "13px", color: "#111", lineHeight: "1.5", marginBottom: "14px",
        display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden"}}>
        {product.title}
      </p>

      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px"}}>
        {[
          {label: "Monthly Sales", value: product.sales_estimate_monthly ? `~${product.sales_estimate_monthly.toLocaleString()}` : "N/A", color: "#10B981"},
          {label: "Revenue/Month", value: product.revenue_estimate_monthly ? `$${Math.round(product.revenue_estimate_monthly).toLocaleString()}` : "N/A", color: "#3B82F6"},
          {label: "BSR Rank", value: product.current_bsr ? `#${product.current_bsr.toLocaleString()}` : "N/A", color: "#8B5CF6"},
          {label: "Price", value: product.current_price ? `$${product.current_price}` : "N/A", color: "#F59E0B"},
          {label: "Rating", value: product.current_rating ? `⭐ ${product.current_rating}` : "N/A", color: "#EF4444"},
          {label: "Reviews", value: product.current_review_count ? product.current_review_count.toLocaleString() : "N/A", color: "#06B6D4"},
        ].map(stat => (
          <div key={stat.label} style={{backgroundColor: "#F9FAFB", border: `1px solid ${stat.color}25`,
            borderRadius: "10px", padding: "10px", textAlign: "center"}}>
            <div style={{fontSize: "9px", color: "#9CA3AF", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px"}}>
              {stat.label}
            </div>
            <div style={{fontSize: "14px", fontWeight: "bold", color: stat.color}}>{stat.value}</div>
          </div>
        ))}
      </div>

      {score !== null && score !== undefined && (
        <div style={{border: `2px solid ${scoreColor}`, borderRadius: "12px", padding: "14px",
          marginBottom: "14px", textAlign: "center", backgroundColor: `${scoreColor}08`}}>
          <div style={{fontSize: "10px", color: "#9CA3AF", textTransform: "uppercase", marginBottom: "4px"}}>
            Opportunity Score
          </div>
          <div style={{fontSize: "40px", fontWeight: "bold", color: scoreColor, lineHeight: 1}}>{score}</div>
          <div style={{fontSize: "12px", color: scoreColor, marginTop: "4px", fontWeight: "600"}}>{scoreLabel}</div>
          <div style={{backgroundColor: "#F3F4F6", borderRadius: "8px", height: "6px", marginTop: "10px"}}>
            <div style={{backgroundColor: scoreColor, height: "6px", borderRadius: "8px", width: `${score}%`, transition: "width 1s ease"}}/>
          </div>
        </div>
      )}

      <div style={{backgroundColor: product.in_stock ? "#F0FDF4" : "#FEF2F2",
        border: `1px solid ${product.in_stock ? "#BBF7D0" : "#FECACA"}`,
        borderRadius: "8px", padding: "10px", marginBottom: "12px",
        textAlign: "center", fontSize: "13px",
        color: product.in_stock ? "#166534" : "#991B1B", fontWeight: "600"}}>
        {product.in_stock ? "✅ In Stock" : "❌ Out of Stock"}
      </div>

      <button onClick={handleTrack} disabled={trackLoading} style={{
        width: "100%", backgroundColor: tracked ? "#EF4444" : "#FF6B35",
        color: "white", border: "none", padding: "12px",
        borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "14px",
      }}>
        {trackLoading ? "..." : tracked ? "❌ Stop Tracking" : "⭐ Track This Product"}
      </button>

      {(product.brand || product.category) && (
        <div style={{marginTop: "10px", fontSize: "11px", color: "#6B7280"}}>
          {product.brand && <span>🏷️ {product.brand}</span>}
          {product.brand && product.category && " · "}
          {product.category && <span>📂 {product.category}</span>}
        </div>
      )}
    </div>
  )
}

// ============ KEYWORDS TAB ============
function KeywordsTab({ keywords }: { keywords: any[] }) {
  if (!keywords.length) return (
    <div style={{textAlign: "center", padding: "40px 20px", color: "#9CA3AF"}}>
      <div style={{fontSize: "32px", marginBottom: "8px"}}>🔍</div>
      <p>Loading keywords...</p>
    </div>
  )

  return (
    <div>
      <div style={{fontSize: "13px", fontWeight: "700", color: "#111", marginBottom: "12px"}}>
        🔍 Top Keywords ({keywords.length})
      </div>
      {keywords.slice(0, 15).map((kw, i) => (
        <div key={i} style={{
          backgroundColor: "#F9FAFB",
          border: "1px solid #E5E7EB",
          borderRadius: "8px",
          padding: "10px 12px",
          marginBottom: "6px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div style={{flex: 1}}>
            <div style={{fontSize: "12px", fontWeight: "600", color: "#111"}}>{kw.keyword}</div>
            <div style={{fontSize: "10px", color: "#9CA3AF", marginTop: "2px"}}>
              Vol: ~{kw.search_volume_estimate?.toLocaleString()} · {kw.word_count} words
            </div>
          </div>
          <div style={{textAlign: "right", marginLeft: "8px"}}>
            <div style={{
              fontSize: "11px",
              fontWeight: "bold",
              color: kw.competition === "low" ? "#10B981" : kw.competition === "medium" ? "#F59E0B" : "#EF4444",
              backgroundColor: kw.competition === "low" ? "#F0FDF4" : kw.competition === "medium" ? "#FFFBEB" : "#FEF2F2",
              padding: "2px 6px",
              borderRadius: "6px",
              marginBottom: "2px",
            }}>
              {kw.competition}
            </div>
            {kw.is_long_tail && (
              <div style={{fontSize: "9px", color: "#8B5CF6", fontWeight: "600"}}>LONG TAIL</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ============ COMPETITORS TAB ============
function CompetitorsTab({ data, product }: { data: any, product: any }) {
  if (!data) return (
    <div style={{textAlign: "center", padding: "40px 20px", color: "#9CA3AF"}}>
      <div style={{fontSize: "32px", marginBottom: "8px"}}>⚔️</div>
      <p>Loading competitors...</p>
    </div>
  )

  const myPrice = product.current_price
  const myRating = product.current_rating
  const myBsr = product.current_bsr

  return (
    <div>
      <div style={{fontSize: "13px", fontWeight: "700", color: "#111", marginBottom: "12px"}}>
        ⚔️ Top Competitors ({data.total_competitors})
      </div>

      {/* Your product */}
      <div style={{
        backgroundColor: "#EFF6FF",
        border: "2px solid #3B82F6",
        borderRadius: "10px",
        padding: "10px 12px",
        marginBottom: "8px",
      }}>
        <div style={{fontSize: "10px", color: "#3B82F6", fontWeight: "700", marginBottom: "4px"}}>YOU</div>
        <div style={{fontSize: "12px", color: "#111", fontWeight: "600",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
          {product.title?.substring(0, 45)}...
        </div>
        <div style={{display: "flex", gap: "12px", marginTop: "4px", fontSize: "11px", color: "#6B7280"}}>
          <span>💲{myPrice || "N/A"}</span>
          <span>⭐{myRating || "N/A"}</span>
          <span>#{myBsr?.toLocaleString() || "N/A"}</span>
        </div>
      </div>

      {data.competitors?.map((comp: any, i: number) => (
        <div key={i} style={{
          backgroundColor: "#F9FAFB",
          border: "1px solid #E5E7EB",
          borderRadius: "8px",
          padding: "10px 12px",
          marginBottom: "6px",
        }}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
            <div style={{flex: 1, marginRight: "8px"}}>
              <div style={{fontSize: "11px", fontWeight: "600", color: "#111",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                {comp.title}
              </div>
              <div style={{display: "flex", gap: "10px", marginTop: "4px", fontSize: "10px", color: "#6B7280"}}>
                <span>💲{comp.price || "N/A"}</span>
                <span>⭐{comp.rating || "N/A"}</span>
                <span>#{comp.bsr?.toLocaleString() || "N/A"}</span>
              </div>
            </div>
            <div style={{
              backgroundColor: "#F3F4F6",
              borderRadius: "6px",
              padding: "4px 8px",
              fontSize: "10px",
              fontWeight: "bold",
              color: "#374151",
              whiteSpace: "nowrap",
            }}>
              {comp.market_share}% share
            </div>
          </div>
          <div style={{marginTop: "6px"}}>
            <div style={{height: "3px", backgroundColor: "#E5E7EB", borderRadius: "2px"}}>
              <div style={{height: "3px", backgroundColor: "#FF6B35", borderRadius: "2px",
                width: `${Math.min(comp.market_share * 3, 100)}%`}}/>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ============ PROFIT TAB ============
function ProfitTab({ profit, product, onCalculate }: { profit: any, product: any, onCalculate: (cost: number) => void }) {
  const [cost, setCost] = useState("")

  return (
    <div>
      <div style={{fontSize: "13px", fontWeight: "700", color: "#111", marginBottom: "12px"}}>
        💰 Profit Calculator
      </div>

      <div style={{
        backgroundColor: "#F9FAFB",
        border: "1px solid #E5E7EB",
        borderRadius: "10px",
        padding: "12px",
        marginBottom: "14px",
      }}>
        <div style={{fontSize: "11px", color: "#6B7280", marginBottom: "4px"}}>Selling Price</div>
        <div style={{fontSize: "22px", fontWeight: "bold", color: "#111"}}>
          ${product.current_price || "N/A"}
        </div>
      </div>

      <div style={{marginBottom: "12px"}}>
        <label style={{fontSize: "12px", color: "#374151", fontWeight: "600", display: "block", marginBottom: "6px"}}>
          Your Product Cost ($)
        </label>
        <div style={{display: "flex", gap: "8px"}}>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="e.g. 5.00"
            style={{
              flex: 1,
              padding: "10px",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              fontSize: "13px",
            }}
          />
          <button
            onClick={() => cost && onCalculate(parseFloat(cost))}
            style={{
              backgroundColor: "#FF6B35",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "13px",
            }}
          >
            Calculate
          </button>
        </div>
      </div>

      {profit && !profit.error && (
        <div>
          <div style={{
            backgroundColor: profit.is_profitable ? "#F0FDF4" : "#FEF2F2",
            border: `2px solid ${profit.is_profitable ? "#10B981" : "#EF4444"}`,
            borderRadius: "12px",
            padding: "14px",
            marginBottom: "14px",
            textAlign: "center",
          }}>
            <div style={{fontSize: "11px", color: "#9CA3AF", marginBottom: "4px"}}>Net Profit Per Unit</div>
            <div style={{fontSize: "36px", fontWeight: "bold",
              color: profit.is_profitable ? "#10B981" : "#EF4444"}}>
              ${profit.gross_profit}
            </div>
            <div style={{fontSize: "13px", fontWeight: "600",
              color: profit.is_profitable ? "#166534" : "#991B1B"}}>
              {profit.verdict}
            </div>
          </div>

          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px"}}>
            {[
              {label: "Profit Margin", value: `${profit.profit_margin_percent}%`, color: profit.profit_margin_percent >= 20 ? "#10B981" : "#F59E0B"},
              {label: "ROI", value: `${profit.roi_percent}%`, color: profit.roi_percent >= 50 ? "#10B981" : "#F59E0B"},
              {label: "FBA Fees", value: `$${profit.fba_fee}`, color: "#EF4444"},
              {label: "Amazon Cut", value: `$${profit.referral_fee}`, color: "#F59E0B"},
              {label: "Total Fees", value: `$${profit.total_fees}`, color: "#8B5CF6"},
              {label: "Break Even", value: `$${profit.breakeven_price}`, color: "#6B7280"},
            ].map(item => (
              <div key={item.label} style={{
                backgroundColor: "#F9FAFB",
                border: `1px solid ${item.color}20`,
                borderRadius: "8px",
                padding: "8px",
                textAlign: "center",
              }}>
                <div style={{fontSize: "9px", color: "#9CA3AF", textTransform: "uppercase", marginBottom: "2px"}}>
                  {item.label}
                </div>
                <div style={{fontSize: "14px", fontWeight: "bold", color: item.color}}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AmazonSidebar