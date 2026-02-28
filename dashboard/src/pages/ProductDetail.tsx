import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import api from "../utils/api"

export default function ProductDetail() {
  const { asin } = useParams<{ asin: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<any>(null)
  const [keywords, setKeywords] = useState<any[]>([])
  const [competitors, setCompetitors] = useState<any>(null)
  const [profit, setProfit] = useState<any>(null)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [productCost, setProductCost] = useState("")

  useEffect(() => {
    if (!asin) return
    setLoading(true)
    Promise.all([
      api.get(`/api/products/${asin}`),
      api.get(`/api/keywords/${asin}`).catch(() => ({ data: { keywords: [] } })),
      api.get(`/api/competitors/${asin}`).catch(() => ({ data: null })),
      api.get(`/api/analysis/${asin}/ai`).catch(() => ({ data: null })),
    ]).then(([p, k, c, a]) => {
      setProduct(p.data)
      setKeywords(k.data.keywords || [])
      setCompetitors(c.data)
      setAiAnalysis(a.data)
    }).finally(() => setLoading(false))
  }, [asin])

  const calcProfit = () => {
    if (!productCost || !asin) return
    api.get(`/api/profit/${asin}?product_cost=${productCost}`)
      .then(r => setProfit(r.data))
      .catch(() => {})
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" as const }}>
        <div style={{
          width: "50px", height: "50px",
          border: "5px solid #f3f3f3",
          borderTop: "5px solid #FF6B35",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 16px",
        }} />
        <p style={{ color: "#6B7280" }}>Analyzing product...</p>
        <style>{`@keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
      </div>
    </div>
  )

  if (!product) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" as const }}>
        <p style={{ color: "#EF4444", fontSize: "18px" }}>Product not found</p>
        <button onClick={() => navigate("/")} style={{
          marginTop: "16px", backgroundColor: "#FF6B35", color: "white",
          border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer"
        }}>← Go Back</button>
      </div>
    </div>
  )

  const score = product.opportunity_score
  const scoreColor = score >= 70 ? "#10B981" : score >= 45 ? "#F59E0B" : "#EF4444"
  const scoreLabel = score >= 70 ? "Great Opportunity" : score >= 45 ? "Moderate" : "Difficult"

  const tabs = [
    { id: "overview", label: "📊 Overview" },
    { id: "charts", label: "📈 Price History" },
    { id: "keywords", label: "🔍 Keywords" },
    { id: "competitors", label: "⚔️ Competitors" },
    { id: "profit", label: "💰 Profit" },
    { id: "ai", label: "🤖 AI Analysis" },
  ]

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F9FAFB" }}>
      {/* Navbar */}
      <nav style={{
        backgroundColor: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        padding: "0 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: "64px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => navigate("/")} style={{
            backgroundColor: "#F3F4F6", border: "none", padding: "8px 14px",
            borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600"
          }}>← Back</button>
          <span style={{ fontWeight: "800", fontSize: "18px", color: "#FF6B35" }}>🔍 Amazon Intel</span>
        </div>
        <div style={{
          backgroundColor: "#FEF3EE", color: "#FF6B35",
          padding: "6px 14px", borderRadius: "20px",
          fontSize: "13px", fontWeight: "700"
        }}>{asin}</div>
      </nav>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Product Header */}
        <div style={{
          backgroundColor: "white", borderRadius: "16px",
          padding: "24px", marginBottom: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}>
          <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
            {product.image_url && (
              <img src={product.image_url} alt={product.title}
                style={{ width: "100px", height: "100px", objectFit: "contain" as const, borderRadius: "8px", flexShrink: 0 }} />
            )}
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#111", marginBottom: "8px", lineHeight: "1.4" }}>
                {product.title}
              </h1>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" as const }}>
                {product.brand && <span style={{ fontSize: "13px", color: "#6B7280" }}>🏷️ {product.brand}</span>}
                {product.category && <span style={{ fontSize: "13px", color: "#6B7280" }}>📂 {product.category}</span>}
                <span style={{
                  backgroundColor: product.in_stock ? "#F0FDF4" : "#FEF2F2",
                  color: product.in_stock ? "#166534" : "#991B1B",
                  padding: "2px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600"
                }}>{product.in_stock ? "✅ In Stock" : "❌ Out of Stock"}</span>
              </div>
            </div>
            {score !== null && score !== undefined && (
              <div style={{
                border: `3px solid ${scoreColor}`, borderRadius: "16px",
                padding: "16px 20px", textAlign: "center" as const, minWidth: "120px", flexShrink: 0,
              }}>
                <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "4px" }}>OPPORTUNITY</div>
                <div style={{ fontSize: "36px", fontWeight: "800", color: scoreColor }}>{score}</div>
                <div style={{ fontSize: "11px", color: scoreColor, fontWeight: "600" }}>{scoreLabel}</div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px", marginBottom: "24px"
        }}>
          {[
            { label: "Monthly Sales", value: product.sales_estimate_monthly ? `~${product.sales_estimate_monthly.toLocaleString()}` : "N/A", color: "#10B981", bg: "#F0FDF4" },
            { label: "Monthly Revenue", value: product.revenue_estimate_monthly ? `$${Math.round(product.revenue_estimate_monthly).toLocaleString()}` : "N/A", color: "#3B82F6", bg: "#EFF6FF" },
            { label: "Current Price", value: product.current_price ? `$${product.current_price}` : "N/A", color: "#F59E0B", bg: "#FFFBEB" },
            { label: "BSR Rank", value: product.current_bsr ? `#${product.current_bsr.toLocaleString()}` : "N/A", color: "#8B5CF6", bg: "#F5F3FF" },
            { label: "Rating", value: product.current_rating ? `⭐ ${product.current_rating}` : "N/A", color: "#EF4444", bg: "#FEF2F2" },
            { label: "Reviews", value: product.current_review_count ? product.current_review_count.toLocaleString() : "N/A", color: "#06B6D4", bg: "#ECFEFF" },
          ].map(stat => (
            <div key={stat.label} style={{
              backgroundColor: stat.bg, border: `1px solid ${stat.color}30`,
              borderRadius: "12px", padding: "20px", textAlign: "center" as const,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <div style={{ fontSize: "11px", color: "#9CA3AF", textTransform: "uppercase" as const, marginBottom: "6px" }}>
                {stat.label}
              </div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{
          backgroundColor: "white", borderRadius: "16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden",
        }}>
          <div style={{ display: "flex", borderBottom: "2px solid #F3F4F6", overflowX: "auto" as const }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                flex: 1, padding: "16px 8px", border: "none",
                backgroundColor: "transparent",
                borderBottom: activeTab === tab.id ? "2px solid #FF6B35" : "2px solid transparent",
                color: activeTab === tab.id ? "#FF6B35" : "#6B7280",
                fontWeight: activeTab === tab.id ? "700" : "500",
                fontSize: "13px", cursor: "pointer", marginBottom: "-2px",
                whiteSpace: "nowrap" as const,
              }}>{tab.label}</button>
            ))}
          </div>

          <div style={{ padding: "24px" }}>

            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Product Summary</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ backgroundColor: "#F9FAFB", borderRadius: "12px", padding: "16px" }}>
                    <div style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "8px" }}>Amazon URL</div>
                    {product.amazon_url ? (
                      <a href={product.amazon_url} target="_blank" rel="noreferrer"
                        style={{ color: "#FF6B35", fontSize: "13px", wordBreak: "break-all" as const }}>
                        View on Amazon ↗
                      </a>
                    ) : <span style={{ color: "#9CA3AF", fontSize: "13px" }}>N/A</span>}
                  </div>
                  <div style={{ backgroundColor: "#F9FAFB", borderRadius: "12px", padding: "16px" }}>
                    <div style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "8px" }}>Opportunity Score</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ flex: 1, height: "8px", backgroundColor: "#E5E7EB", borderRadius: "4px" }}>
                        <div style={{
                          width: `${score || 0}%`, height: "8px",
                          backgroundColor: scoreColor, borderRadius: "4px",
                        }} />
                      </div>
                      <span style={{ color: scoreColor, fontWeight: "700" }}>{score}/100</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CHARTS TAB */}
            {activeTab === "charts" && (
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "20px" }}>📈 Price History</h3>
                {product.price_history && product.price_history.length > 1 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={product.price_history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                      <XAxis dataKey="recorded_at"
                        tickFormatter={v => new Date(v).toLocaleDateString()}
                        style={{ fontSize: "11px" }} />
                      <YAxis style={{ fontSize: "11px" }} />
                      <Tooltip
                        labelFormatter={v => new Date(v).toLocaleString()}
                        formatter={(v: any) => [`$${v}`, "Price"]}
                      />
                      <Line type="monotone" dataKey="price" stroke="#FF6B35" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign: "center" as const, padding: "60px", color: "#9CA3AF" }}>
                    <div style={{ fontSize: "48px", marginBottom: "12px" }}>📈</div>
                    <p style={{ fontSize: "15px" }}>Not enough data for chart yet.</p>
                    <p style={{ fontSize: "13px", marginTop: "8px" }}>Check back after 24 hours of tracking.</p>
                  </div>
                )}
              </div>
            )}

            {/* KEYWORDS TAB */}
            {activeTab === "keywords" && (
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>
                  🔍 Keyword Opportunities ({keywords.length})
                </h3>
                {keywords.length === 0 ? (
                  <div style={{ textAlign: "center" as const, padding: "40px", color: "#9CA3AF" }}>
                    Loading keywords...
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    {keywords.slice(0, 20).map((kw, i) => (
                      <div key={i} style={{
                        backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB",
                        borderRadius: "10px", padding: "12px",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: "600", color: "#111" }}>{kw.keyword}</div>
                          <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>
                            ~{kw.search_volume_estimate?.toLocaleString()} searches/mo
                          </div>
                        </div>
                        <div style={{ textAlign: "right" as const }}>
                          <div style={{
                            fontSize: "11px", fontWeight: "700",
                            color: kw.competition === "low" ? "#10B981" : kw.competition === "medium" ? "#F59E0B" : "#EF4444",
                            backgroundColor: kw.competition === "low" ? "#F0FDF4" : kw.competition === "medium" ? "#FFFBEB" : "#FEF2F2",
                            padding: "2px 8px", borderRadius: "6px",
                          }}>{kw.competition}</div>
                          {kw.is_long_tail && (
                            <div style={{ fontSize: "10px", color: "#8B5CF6", marginTop: "2px", fontWeight: "600" }}>LONG TAIL</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* COMPETITORS TAB */}
            {activeTab === "competitors" && (
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>
                  ⚔️ Competitor Analysis
                </h3>
                {competitors ? (
                  <div>
                    <div style={{
                      backgroundColor: "#EFF6FF", border: "2px solid #3B82F6",
                      borderRadius: "10px", padding: "14px", marginBottom: "8px",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                      <div>
                        <div style={{ fontSize: "11px", color: "#3B82F6", fontWeight: "700", marginBottom: "4px" }}>YOUR PRODUCT</div>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#111" }}>
                          {product.title?.substring(0, 60)}...
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "#374151" }}>
                        <span style={{ fontWeight: "600" }}>${product.current_price || "N/A"}</span>
                        <span>⭐{product.current_rating || "N/A"}</span>
                        <span>#{product.current_bsr?.toLocaleString() || "N/A"}</span>
                      </div>
                    </div>
                    {competitors.competitors?.map((comp: any, i: number) => (
                      <div key={i} style={{
                        backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB",
                        borderRadius: "10px", padding: "14px", marginBottom: "8px",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}>
                        <div style={{ flex: 1, marginRight: "16px" }}>
                          <div style={{ fontSize: "13px", fontWeight: "600", color: "#111" }}>{comp.title}</div>
                          <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ flex: 1, maxWidth: "200px", height: "4px", backgroundColor: "#E5E7EB", borderRadius: "2px" }}>
                              <div style={{
                                width: `${Math.min(comp.market_share * 3, 100)}%`,
                                height: "4px", backgroundColor: "#FF6B35", borderRadius: "2px"
                              }} />
                            </div>
                            <span style={{ fontSize: "11px", color: "#6B7280" }}>{comp.market_share}% market share</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "#374151" }}>
                          <span style={{ fontWeight: "600" }}>${comp.price || "N/A"}</span>
                          <span>⭐{comp.rating || "N/A"}</span>
                          <span>#{comp.bsr?.toLocaleString() || "N/A"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p style={{ color: "#9CA3AF" }}>No competitor data available</p>}
              </div>
            )}

            {/* PROFIT TAB */}
            {activeTab === "profit" && (
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>💰 FBA Profit Calculator</h3>
                <div style={{ maxWidth: "500px" }}>
                  <div style={{
                    backgroundColor: "#F9FAFB", borderRadius: "12px",
                    padding: "16px", marginBottom: "16px",
                    display: "flex", justifyContent: "space-between"
                  }}>
                    <span style={{ color: "#6B7280", fontSize: "14px" }}>Selling Price (Amazon)</span>
                    <span style={{ fontWeight: "800", fontSize: "18px", color: "#FF6B35" }}>
                      ${product.current_price || "N/A"}
                    </span>
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "8px" }}>
                      Your Product Cost (sourcing cost)
                    </label>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input
                        type="number"
                        value={productCost}
                        onChange={e => setProductCost(e.target.value)}
                        placeholder="e.g. 5.00"
                        style={{
                          flex: 1, padding: "12px", border: "2px solid #E5E7EB",
                          borderRadius: "10px", fontSize: "14px",
                        }}
                      />
                      <button onClick={calcProfit} style={{
                        backgroundColor: "#FF6B35", color: "white",
                        border: "none", padding: "12px 24px",
                        borderRadius: "10px", cursor: "pointer",
                        fontWeight: "700", fontSize: "14px",
                      }}>Calculate</button>
                    </div>
                  </div>
                  {profit && !profit.error && (
                    <div>
                      <div style={{
                        backgroundColor: profit.is_profitable ? "#F0FDF4" : "#FEF2F2",
                        border: `2px solid ${profit.is_profitable ? "#10B981" : "#EF4444"}`,
                        borderRadius: "12px", padding: "20px",
                        textAlign: "center" as const, marginBottom: "16px",
                      }}>
                        <div style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "4px" }}>NET PROFIT PER UNIT</div>
                        <div style={{
                          fontSize: "48px", fontWeight: "800",
                          color: profit.is_profitable ? "#10B981" : "#EF4444"
                        }}>${profit.gross_profit}</div>
                        <div style={{ fontSize: "15px", fontWeight: "600", color: profit.is_profitable ? "#166534" : "#991B1B" }}>
                          {profit.verdict}
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                        {[
                          { label: "Profit Margin", value: `${profit.profit_margin_percent}%`, color: profit.profit_margin_percent >= 20 ? "#10B981" : "#F59E0B" },
                          { label: "ROI", value: `${profit.roi_percent}%`, color: profit.roi_percent >= 50 ? "#10B981" : "#F59E0B" },
                          { label: "FBA Fee", value: `$${profit.fba_fee}`, color: "#EF4444" },
                          { label: "Amazon Cut", value: `$${profit.referral_fee}`, color: "#F59E0B" },
                          { label: "Total Fees", value: `$${profit.total_fees}`, color: "#8B5CF6" },
                          { label: "Break Even", value: `$${profit.breakeven_price}`, color: "#6B7280" },
                        ].map(item => (
                          <div key={item.label} style={{
                            backgroundColor: "#F9FAFB", borderRadius: "10px",
                            padding: "12px", textAlign: "center" as const,
                          }}>
                            <div style={{ fontSize: "10px", color: "#9CA3AF", textTransform: "uppercase" as const, marginBottom: "4px" }}>
                              {item.label}
                            </div>
                            <div style={{ fontSize: "18px", fontWeight: "700", color: item.color }}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI ANALYSIS TAB */}
            {activeTab === "ai" && (
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>🤖 AI Product Analysis</h3>
                {!aiAnalysis ? (
                  <div style={{ textAlign: "center" as const, padding: "40px", color: "#9CA3AF" }}>
                    <div style={{ fontSize: "48px", marginBottom: "12px" }}>🤖</div>
                    <p>Loading AI analysis...</p>
                  </div>
                ) : (
                  <div>
                    {/* Overall Signal */}
                    <div style={{
                      backgroundColor: aiAnalysis.overall_signal?.includes("🟢") ? "#F0FDF4" :
                                       aiAnalysis.overall_signal?.includes("🟡") ? "#FFFBEB" :
                                       aiAnalysis.overall_signal?.includes("🟠") ? "#FFF7ED" : "#FEF2F2",
                      border: `2px solid ${aiAnalysis.overall_signal?.includes("🟢") ? "#10B981" :
                                           aiAnalysis.overall_signal?.includes("🟡") ? "#F59E0B" :
                                           aiAnalysis.overall_signal?.includes("🟠") ? "#F97316" : "#EF4444"}`,
                      borderRadius: "16px", padding: "24px",
                      marginBottom: "20px", textAlign: "center" as const,
                    }}>
                      <div style={{ fontSize: "22px", fontWeight: "800", marginBottom: "8px" }}>
                        {aiAnalysis.overall_signal}
                      </div>
                      <p style={{ color: "#374151", fontSize: "14px", marginBottom: "8px" }}>{aiAnalysis.summary}</p>
                      <p style={{ color: "#6B7280", fontSize: "13px", fontStyle: "italic" as const }}>
                        👉 {aiAnalysis.action}
                      </p>
                    </div>

                    {/* Insights Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                      {[
                        { title: "📍 Market Position", content: aiAnalysis.position_insight, badge: aiAnalysis.market_position },
                        { title: "⭐ Review Barrier", content: aiAnalysis.review_insight, badge: aiAnalysis.review_barrier },
                        { title: "💲 Price Analysis", content: aiAnalysis.price_insight, badge: null },
                        { title: "🎯 Pricing Strategy", content: aiAnalysis.pricing_strategy, badge: null },
                        { title: "⭐ Quality Bar", content: aiAnalysis.rating_insight, badge: aiAnalysis.quality_bar },
                      ].map((item, i) => (
                        <div key={i} style={{
                          backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB",
                          borderRadius: "12px", padding: "16px",
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <div style={{ fontSize: "13px", fontWeight: "700", color: "#111" }}>{item.title}</div>
                            {item.badge && (
                              <div style={{
                                backgroundColor: "#FF6B35", color: "white",
                                padding: "2px 8px", borderRadius: "10px",
                                fontSize: "10px", fontWeight: "700"
                              }}>{item.badge}</div>
                            )}
                          </div>
                          <p style={{ fontSize: "12px", color: "#6B7280", lineHeight: "1.6" }}>{item.content}</p>
                        </div>
                      ))}
                    </div>

                    {/* Recommendations */}
                    {aiAnalysis.recommendations?.length > 0 && (
                      <div style={{
                        backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB",
                        borderRadius: "12px", padding: "16px",
                      }}>
                        <div style={{ fontSize: "14px", fontWeight: "700", color: "#111", marginBottom: "12px" }}>
                          📋 Key Recommendations
                        </div>
                        {aiAnalysis.recommendations.map((rec: string, i: number) => (
                          <div key={i} style={{
                            padding: "10px 14px", backgroundColor: "white",
                            borderRadius: "8px", marginBottom: "6px",
                            fontSize: "13px", color: "#374151",
                            border: "1px solid #E5E7EB",
                          }}>{rec}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}