"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ApexSpinner } from "@/components/apex-spinner"
import {
  FileTextIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  BarChart3Icon,
  NewspaperIcon,
} from "@/components/icons"
import type { AlphaBriefType, ResearchRequest } from "@/lib/types/alpha-brief"

export default function AlphaBriefComponent() {
  const [briefs, setBriefs] = useState<AlphaBriefType[]>([])
  const [selectedBrief, setSelectedBrief] = useState<AlphaBriefType | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [ticker, setTicker] = useState("")
  const [requestId, setRequestId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState("")

  useEffect(() => {
    fetchBriefs()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (requestId && generating) {
      interval = setInterval(async () => {
        await checkStatus(requestId)
      }, 5000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [requestId, generating])

  const fetchBriefs = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/alpha-brief/list?userId=demo-user")
      const data = await response.json()

      if (data.success) {
        setBriefs(data.briefs)
        if (data.briefs.length > 0 && !selectedBrief) {
          setSelectedBrief(data.briefs[0])
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching briefs:", error)
    } finally {
      setLoading(false)
    }
  }

  const requestBrief = async () => {
    if (!ticker.trim()) return

    setGenerating(true)
    setStatusMessage("Initiating research request...")

    try {
      const response = await fetch("/api/alpha-brief/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo-user",
          ticker: ticker.toUpperCase(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setRequestId(data.request.id)

        if (data.request.status === "completed" && data.request.briefId) {
          // Brief already exists
          setStatusMessage("Brief retrieved from cache!")
          setGenerating(false)
          fetchBriefs()
        } else {
          setStatusMessage("Agents are gathering market data...")
        }
      }
    } catch (error) {
      console.error("[v0] Error requesting brief:", error)
      setGenerating(false)
      setStatusMessage("Failed to request brief")
    }
  }

  const checkStatus = async (reqId: string) => {
    try {
      const response = await fetch(`/api/alpha-brief/status?requestId=${reqId}`)
      const data = await response.json()

      if (data.success && data.request) {
        const request: ResearchRequest = data.request

        switch (request.status) {
          case "pending":
            setStatusMessage("Request queued...")
            break
          case "processing":
            setStatusMessage("AI agents analyzing financial data...")
            break
          case "completed":
            setStatusMessage("Analysis complete!")
            setGenerating(false)
            setRequestId(null)
            fetchBriefs()
            break
          case "failed":
            setStatusMessage(`Failed: ${request.error || "Unknown error"}`)
            setGenerating(false)
            setRequestId(null)
            break
        }
      }
    } catch (error) {
      console.error("[v0] Error checking status:", error)
    }
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "strong-buy":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "buy":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "hold":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "sell":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "strong-sell":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-400"
      case "medium":
        return "text-yellow-400"
      case "high":
        return "text-orange-400"
      case "very-high":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0a0a0f] text-white flex items-center justify-center">
        <ApexSpinner />
      </div>
    )
  }

  return (
    <div className="h-screen w-full bg-[#0a0a0f] text-white overflow-y-auto">
      <div className="flex h-full">
        {/* Sidebar - Briefs List */}
        <div className="w-80 bg-[#0f1118] border-r border-white/10 p-6 overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <FileTextIcon size={24} className="text-cyan-400" />
              <h2 className="text-xl font-bold text-cyan-400">Alpha Briefs</h2>
            </div>

            {/* Request Form */}
            <div className="space-y-3">
              <Input
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="Enter ticker (e.g., AAPL)"
                className="bg-[#14161e] border-white/20 text-white"
                onKeyDown={(e) => e.key === "Enter" && requestBrief()}
                disabled={generating}
              />
              <Button
                onClick={requestBrief}
                disabled={generating || !ticker.trim()}
                className="w-full bg-cyan-600 hover:bg-cyan-700"
              >
                {generating ? "Generating..." : "Generate Brief"}
              </Button>
              {generating && (
                <div className="bg-[#14161e] p-3 rounded-lg border border-cyan-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <ApexSpinner />
                    <span className="text-xs text-cyan-400 font-semibold">PROCESSING</span>
                  </div>
                  <p className="text-xs text-gray-400">{statusMessage}</p>
                </div>
              )}
            </div>
          </div>

          {/* Briefs List */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-3">Previous Briefs</h3>
            {briefs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No briefs generated yet</p>
            ) : (
              briefs.map((brief) => (
                <button
                  key={brief.id}
                  onClick={() => setSelectedBrief(brief)}
                  className={`w-full text-left bg-[#14161e] p-3 rounded-lg border transition-all ${
                    selectedBrief?.id === brief.id
                      ? "border-cyan-400/50 bg-cyan-400/5"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">{brief.ticker}</span>
                    <Badge className={getRatingColor(brief.sections.recommendation.rating)}>
                      {brief.sections.recommendation.rating.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{brief.companyName}</p>
                  <p className="text-xs text-gray-500">{new Date(brief.generatedAt).toLocaleDateString()}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Content - Brief Viewer */}
        <div className="flex-1 overflow-y-auto p-8">
          {!selectedBrief ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <FileTextIcon size={64} className="text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Brief Selected</h3>
                <p className="text-gray-500">Generate a new brief or select one from the sidebar.</p>
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Header */}
              <div className="bg-[#0f1118] border border-white/10 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">{selectedBrief.ticker}</h1>
                    <p className="text-xl text-gray-400">{selectedBrief.companyName}</p>
                  </div>
                  <Badge className={getRatingColor(selectedBrief.sections.recommendation.rating)}>
                    {selectedBrief.sections.recommendation.rating.replace("-", " ").toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>Generated: {new Date(selectedBrief.generatedAt).toLocaleString()}</span>
                  <span>•</span>
                  <span>Expires: {new Date(selectedBrief.expiresAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-[#0f1118] border border-green-500/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUpIcon className="text-green-400" size={20} />
                    <h3 className="text-xs uppercase tracking-widest text-gray-400">Current Price</h3>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    ${selectedBrief.sections.financials.currentPrice.toFixed(2)}
                  </p>
                  <p
                    className={`text-sm ${selectedBrief.sections.financials.priceChangePercent24h >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {selectedBrief.sections.financials.priceChangePercent24h >= 0 ? "+" : ""}
                    {selectedBrief.sections.financials.priceChangePercent24h.toFixed(2)}%
                  </p>
                </Card>

                <Card className="bg-[#0f1118] border border-blue-500/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2Icon className="text-blue-400" size={20} />
                    <h3 className="text-xs uppercase tracking-widest text-gray-400">Confidence</h3>
                  </div>
                  <p className="text-2xl font-bold text-white">{selectedBrief.sections.recommendation.confidence}%</p>
                  <p className="text-sm text-gray-400">{selectedBrief.sections.recommendation.timeHorizon}</p>
                </Card>

                <Card className="bg-[#0f1118] border border-yellow-500/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangleIcon className="text-yellow-400" size={20} />
                    <h3 className="text-xs uppercase tracking-widest text-gray-400">Risk Level</h3>
                  </div>
                  <p className={`text-2xl font-bold ${getRiskColor(selectedBrief.sections.risks.overallRisk)}`}>
                    {selectedBrief.sections.risks.overallRisk.toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-400">Score: {selectedBrief.sections.risks.riskScore}/100</p>
                </Card>

                <Card className="bg-[#0f1118] border border-purple-500/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3Icon className="text-purple-400" size={20} />
                    <h3 className="text-xs uppercase tracking-widest text-gray-400">Target Price</h3>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    ${selectedBrief.sections.recommendation.targetPrice.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-400">
                    {(
                      ((selectedBrief.sections.recommendation.targetPrice -
                        selectedBrief.sections.financials.currentPrice) /
                        selectedBrief.sections.financials.currentPrice) *
                      100
                    ).toFixed(1)}
                    % upside
                  </p>
                </Card>
              </div>

              {/* Detailed Sections */}
              <Accordion type="multiple" defaultValue={["overview", "recommendation"]} className="space-y-4">
                {/* Overview */}
                <AccordionItem value="overview" className="bg-[#0f1118] border border-white/10 rounded-lg px-6">
                  <AccordionTrigger className="text-lg font-semibold text-cyan-400 hover:text-cyan-300">
                    Company Overview
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300 space-y-3">
                    <p className="leading-relaxed">{selectedBrief.sections.overview.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Sector:</span>{" "}
                        <span className="text-white">{selectedBrief.sections.overview.sector}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Industry:</span>{" "}
                        <span className="text-white">{selectedBrief.sections.overview.industry}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Market Cap:</span>{" "}
                        <span className="text-white">
                          ${(selectedBrief.sections.overview.marketCap / 1e9).toFixed(2)}B
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Employees:</span>{" "}
                        <span className="text-white">{selectedBrief.sections.overview.employees.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">CEO:</span>{" "}
                        <span className="text-white">{selectedBrief.sections.overview.ceo}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Founded:</span>{" "}
                        <span className="text-white">{selectedBrief.sections.overview.founded}</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Financials */}
                <AccordionItem value="financials" className="bg-[#0f1118] border border-white/10 rounded-lg px-6">
                  <AccordionTrigger className="text-lg font-semibold text-cyan-400 hover:text-cyan-300">
                    Financial Metrics
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-[#14161e] p-3 rounded-lg">
                        <span className="text-gray-400 block mb-1">P/E Ratio</span>
                        <span className="text-white font-semibold">
                          {selectedBrief.sections.financials.peRatio.toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-[#14161e] p-3 rounded-lg">
                        <span className="text-gray-400 block mb-1">EPS</span>
                        <span className="text-white font-semibold">
                          ${selectedBrief.sections.financials.eps.toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-[#14161e] p-3 rounded-lg">
                        <span className="text-gray-400 block mb-1">Dividend Yield</span>
                        <span className="text-white font-semibold">
                          {selectedBrief.sections.financials.dividendYield.toFixed(2)}%
                        </span>
                      </div>
                      <div className="bg-[#14161e] p-3 rounded-lg">
                        <span className="text-gray-400 block mb-1">Revenue Growth</span>
                        <span className="text-white font-semibold">
                          {selectedBrief.sections.financials.revenueGrowth.toFixed(2)}%
                        </span>
                      </div>
                      <div className="bg-[#14161e] p-3 rounded-lg">
                        <span className="text-gray-400 block mb-1">Profit Margin</span>
                        <span className="text-white font-semibold">
                          {selectedBrief.sections.financials.profitMargin.toFixed(2)}%
                        </span>
                      </div>
                      <div className="bg-[#14161e] p-3 rounded-lg">
                        <span className="text-gray-400 block mb-1">ROE</span>
                        <span className="text-white font-semibold">
                          {selectedBrief.sections.financials.returnOnEquity.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* News Analysis */}
                <AccordionItem value="news" className="bg-[#0f1118] border border-white/10 rounded-lg px-6">
                  <AccordionTrigger className="text-lg font-semibold text-cyan-400 hover:text-cyan-300">
                    <div className="flex items-center gap-2">
                      <NewspaperIcon size={20} />
                      <span>News & Sentiment</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div>
                        <span className="text-gray-400 text-sm">Overall Sentiment:</span>{" "}
                        <Badge
                          className={
                            selectedBrief.sections.news.overallSentiment === "bullish"
                              ? "bg-green-500/20 text-green-400"
                              : selectedBrief.sections.news.overallSentiment === "bearish"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-blue-500/20 text-blue-400"
                          }
                        >
                          {selectedBrief.sections.news.overallSentiment.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Score:</span>{" "}
                        <span className="text-white font-semibold">
                          {selectedBrief.sections.news.sentimentScore}/100
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {selectedBrief.sections.news.recentNews.slice(0, 5).map((news, idx) => (
                        <div key={idx} className="bg-[#14161e] p-4 rounded-lg border border-white/10">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-white font-semibold text-sm">{news.title}</h4>
                            <Badge
                              className={
                                news.sentiment === "positive"
                                  ? "bg-green-500/20 text-green-400"
                                  : news.sentiment === "negative"
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-gray-500/20 text-gray-400"
                              }
                            >
                              {news.sentiment}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-xs mb-2">{news.summary}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{news.source}</span>
                            <span>•</span>
                            <span>{new Date(news.publishedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Technical Analysis */}
                <AccordionItem value="technical" className="bg-[#0f1118] border border-white/10 rounded-lg px-6">
                  <AccordionTrigger className="text-lg font-semibold text-cyan-400 hover:text-cyan-300">
                    Technical Analysis
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#14161e] p-4 rounded-lg">
                        <span className="text-gray-400 text-sm block mb-1">Trend</span>
                        <Badge
                          className={
                            selectedBrief.sections.technical.trend === "uptrend"
                              ? "bg-green-500/20 text-green-400"
                              : selectedBrief.sections.technical.trend === "downtrend"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-blue-500/20 text-blue-400"
                          }
                        >
                          {selectedBrief.sections.technical.trend.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="bg-[#14161e] p-4 rounded-lg">
                        <span className="text-gray-400 text-sm block mb-1">RSI</span>
                        <span className="text-white font-semibold">
                          {selectedBrief.sections.technical.rsi.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm text-gray-400 mb-2">Signals</h5>
                      <div className="space-y-2">
                        {selectedBrief.sections.technical.signals.map((signal, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-[#14161e] p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                              {signal.type === "buy" ? (
                                <TrendingUpIcon className="text-green-400" size={16} />
                              ) : signal.type === "sell" ? (
                                <TrendingDownIcon className="text-red-400" size={16} />
                              ) : (
                                <CheckCircle2Icon className="text-blue-400" size={16} />
                              )}
                              <span className="text-white text-sm">{signal.indicator}</span>
                            </div>
                            <Badge
                              className={
                                signal.type === "buy"
                                  ? "bg-green-500/20 text-green-400"
                                  : signal.type === "sell"
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-blue-500/20 text-blue-400"
                              }
                            >
                              {signal.type.toUpperCase()} - {signal.strength}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Risks */}
                <AccordionItem value="risks" className="bg-[#0f1118] border border-white/10 rounded-lg px-6">
                  <AccordionTrigger className="text-lg font-semibold text-cyan-400 hover:text-cyan-300">
                    <div className="flex items-center gap-2">
                      <AlertTriangleIcon size={20} />
                      <span>Risk Assessment</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-3">
                      {selectedBrief.sections.risks.factors.map((factor, idx) => (
                        <div key={idx} className="bg-[#14161e] p-4 rounded-lg border border-white/10">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="text-white font-semibold">{factor.category}</h5>
                            <Badge className={`${getRiskColor(factor.risk)} bg-opacity-20`}>
                              {factor.risk.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">{factor.description}</p>
                          <p className="text-gray-500 text-xs">Impact: {factor.impact}</p>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Recommendation */}
                <AccordionItem value="recommendation" className="bg-[#0f1118] border border-white/10 rounded-lg px-6">
                  <AccordionTrigger className="text-lg font-semibold text-cyan-400 hover:text-cyan-300">
                    Investment Recommendation
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-lg p-4">
                      <h5 className="text-sm text-gray-400 mb-2">Reasoning</h5>
                      <ul className="space-y-2">
                        {selectedBrief.sections.recommendation.reasoning.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-300">
                            <span className="text-cyan-400 mt-1">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#14161e] p-4 rounded-lg">
                        <h5 className="text-sm text-green-400 mb-2">Catalysts</h5>
                        <ul className="space-y-1">
                          {selectedBrief.sections.recommendation.catalysts.map((catalyst, idx) => (
                            <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                              <span className="text-green-400">+</span>
                              <span>{catalyst}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-[#14161e] p-4 rounded-lg">
                        <h5 className="text-sm text-red-400 mb-2">Risks</h5>
                        <ul className="space-y-1">
                          {selectedBrief.sections.recommendation.risks.map((risk, idx) => (
                            <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                              <span className="text-red-400">-</span>
                              <span>{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="bg-[#14161e] p-4 rounded-lg">
                      <h5 className="text-sm text-gray-400 mb-2">Suggested Allocation</h5>
                      <p className="text-white">{selectedBrief.sections.recommendation.allocation}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
