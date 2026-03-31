"use client"

import { useState, useEffect } from "react"
import { useVault } from "@/lib/vault-context"
import Widget from "./widget"
import { DollarSignIcon, SparklesIcon, TrendingUpIcon, AlertTriangleIcon } from "./icons"
import {
  portfolioStorage,
  positionStorage,
  transactionStorage,
  riskScoreStorage,
  insightStorage,
} from "@/lib/financial-storage"
import type { Portfolio, Position, Transaction, RiskScore, FinancialInsight } from "@/lib/types/financial"
import ApexSpinner from "./apex-spinner"
import AnimatedCard from "./animated-card"
import GradientText from "./gradient-text"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import BankConnections from "./bank-connections"
import BulkImportModal from "./bulk-import-modal"

function PlusIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function TrashIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

export default function FinancialContent() {
  const { userProfile } = useVault()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [positions, setPositions] = useState<Position[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null)
  const [insights, setInsights] = useState<FinancialInsight[]>([])
  const [showAddPosition, setShowAddPosition] = useState(false)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [showAddPortfolio, setShowAddPortfolio] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showSimulator, setShowSimulator] = useState(false)
  const [simulationScenario, setSimulationScenario] = useState("")
  const [simulationResult, setSimulationResult] = useState<any>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [activeTab, setActiveTab] = useState<"portfolio" | "banks">("portfolio")
  const [portfolioView, setPortfolioView] = useState<"manual" | "bank" | "combined">("combined")

  useEffect(() => {
    if (userProfile?.id) {
      loadPortfolios()
    }
  }, [userProfile])

  useEffect(() => {
    if (selectedPortfolio) {
      loadPortfolioData(selectedPortfolio.id)
    }
  }, [selectedPortfolio])

  const loadPortfolios = () => {
    const userId = userProfile?.id || "demo-user"
    const userPortfolios = portfolioStorage.getAll(userId)
    setPortfolios(userPortfolios)

    if (userPortfolios.length > 0 && !selectedPortfolio) {
      setSelectedPortfolio(userPortfolios[0])
    } else if (userPortfolios.length === 0) {
      const defaultPortfolio = portfolioStorage.create({
        userId,
        name: "My Portfolio",
        description: "Main investment portfolio",
        currency: "USD",
        totalValue: 0,
      })
      setPortfolios([defaultPortfolio])
      setSelectedPortfolio(defaultPortfolio)
    }
  }

  const loadPortfolioData = (portfolioId: string) => {
    const portfolioPositions = positionStorage.getByPortfolio(portfolioId)
    const portfolioTransactions = transactionStorage.getByPortfolio(portfolioId)
    const latestRiskScore = riskScoreStorage.getLatest(portfolioId)
    const portfolioInsights = insightStorage.getByPortfolio(portfolioId)

    setPositions(portfolioPositions)
    setTransactions(portfolioTransactions)
    setRiskScore(latestRiskScore || null)
    setInsights(portfolioInsights)
  }

  const updateAllPrices = async () => {
    if (!selectedPortfolio || positions.length === 0) return

    setIsUpdatingPrices(true)
    try {
      const tickers = positions.map((p) => p.ticker)
      const response = await fetch("/api/financial/market-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers }),
      })

      if (response.ok) {
        const marketData = await response.json()

        for (const position of positions) {
          const data = marketData[position.ticker]
          if (data) {
            positionStorage.update(position.id, {
              currentPrice: data.price,
              marketValue: data.price * position.quantity,
              unrealizedPnl: (data.price - position.avgCost) * position.quantity,
              unrealizedPnlPercent: ((data.price - position.avgCost) / position.avgCost) * 100,
            })
          }
        }

        loadPortfolioData(selectedPortfolio.id)
      }
    } catch (error) {
      console.error("[v0] Error updating prices:", error)
    } finally {
      setIsUpdatingPrices(false)
    }
  }

  const handleSearchStocks = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      const response = await fetch(`/api/financial/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const results = await response.json()
        setSearchResults(results)
      }
    } catch (error) {
      console.error("[v0] Error searching stocks:", error)
    }
  }

  const handleAddPosition = async (ticker: string, quantity: number, avgCost: number, assetType: string) => {
    if (!selectedPortfolio) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/financial/market-data?ticker=${ticker}&type=${assetType === "crypto" ? "crypto" : "stock"}`,
      )

      let currentPrice = avgCost
      let sector = "Unknown"
      let region = "US"

      if (response.ok) {
        const marketData = await response.json()
        currentPrice = marketData.price

        if (assetType === "stock" || assetType === "etf") {
          const detailsResponse = await fetch(`/api/financial/stock-details?ticker=${ticker}`)
          if (detailsResponse.ok) {
            const details = await detailsResponse.json()
            sector = details.sector
            region = details.exchange?.includes("NASDAQ") || details.exchange?.includes("NYSE") ? "US" : "International"
          }
        }
      }

      const newPosition = positionStorage.create({
        portfolioId: selectedPortfolio.id,
        ticker: ticker.toUpperCase(),
        assetType: assetType as any,
        quantity,
        avgCost,
        currentPrice,
        marketValue: currentPrice * quantity,
        unrealizedPnl: (currentPrice - avgCost) * quantity,
        unrealizedPnlPercent: ((currentPrice - avgCost) / avgCost) * 100,
        sector,
        region,
        source: "manual",
      })

      transactionStorage.create({
        portfolioId: selectedPortfolio.id,
        positionId: newPosition.id,
        transactionType: "buy",
        ticker: ticker.toUpperCase(),
        quantity,
        price: avgCost,
        totalAmount: avgCost * quantity,
        fees: 0,
        transactionDate: new Date(),
      })

      loadPortfolioData(selectedPortfolio.id)
      setShowAddPosition(false)
      setSearchQuery("")
      setSearchResults([])
    } catch (error) {
      console.error("[v0] Error adding position:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkImport = async (positions: any[]) => {
    if (!selectedPortfolio) return

    setIsLoading(true)
    try {
      for (const pos of positions) {
        await handleAddPosition(pos.ticker, pos.quantity, pos.avgCost, pos.assetType)
      }
      loadPortfolioData(selectedPortfolio.id)
    } catch (error) {
      console.error("[v0] Error bulk importing positions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPortfolio = (name: string, description: string) => {
    const userId = userProfile?.id || "demo-user"
    const newPortfolio = portfolioStorage.create({
      userId,
      name,
      description,
      currency: "USD",
      totalValue: 0,
    })
    setPortfolios([...portfolios, newPortfolio])
    setSelectedPortfolio(newPortfolio)
    setShowAddPortfolio(false)
  }

  const manualPositions = positions.filter((p) => p.source === "manual" || !p.source)
  const bankPositions = positions.filter((p) => p.source === "bank")
  const displayPositions =
    portfolioView === "manual" ? manualPositions : portfolioView === "bank" ? bankPositions : positions

  const calculateMetrics = (positionsList: Position[]) => {
    const totalValue = positionsList.reduce((sum, pos) => sum + (pos.marketValue || 0), 0)
    const totalCost = positionsList.reduce((sum, pos) => sum + pos.avgCost * pos.quantity, 0)
    const totalPnl = totalValue - totalCost
    const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0
    return { totalValue, totalCost, totalPnl, totalPnlPercent }
  }

  const manualMetrics = calculateMetrics(manualPositions)
  const bankMetrics = calculateMetrics(bankPositions)
  const combinedMetrics = calculateMetrics(positions)

  const metrics = portfolioView === "manual" ? manualMetrics : portfolioView === "bank" ? bankMetrics : combinedMetrics

  const sectorAllocation = positions.reduce(
    (acc, pos) => {
      const sector = pos.sector || "Other"
      acc[sector] = (acc[sector] || 0) + (pos.marketValue || 0)
      return acc
    },
    {} as Record<string, number>,
  )

  const sectorData = Object.entries(sectorAllocation).map(([sector, value]) => ({
    sector,
    value,
    percentage: (value / metrics.totalValue) * 100,
  }))

  const assetAllocation = positions.reduce(
    (acc, pos) => {
      acc[pos.assetType] = (acc[pos.assetType] || 0) + (pos.marketValue || 0)
      return acc
    },
    {} as Record<string, number>,
  )

  const assetData = Object.entries(assetAllocation).map(([type, value]) => ({
    type,
    value,
    percentage: (value / metrics.totalValue) * 100,
  }))

  const CHART_COLORS = ["#22d3ee", "#a78bfa", "#67e8f9", "#06b6d4", "#8b5cf6"]

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-400"
      case "medium":
        return "text-yellow-400"
      case "high":
        return "text-orange-400"
      case "very_high":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "border-red-500 bg-red-500/10"
      case "high":
        return "border-orange-500 bg-orange-500/10"
      case "medium":
        return "border-yellow-500 bg-yellow-500/10"
      case "low":
        return "border-blue-500 bg-blue-500/10"
      default:
        return "border-gray-500 bg-gray-500/10"
    }
  }

  const runAIAnalysis = async () => {
    if (!selectedPortfolio || positions.length === 0) return

    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/financial/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolio: selectedPortfolio,
          positions,
          riskScore,
          userProfile,
        }),
      })

      if (response.ok) {
        const analysis = await response.json()

        if (analysis.insights) {
          for (const insight of analysis.insights) {
            insightStorage.create({
              portfolioId: selectedPortfolio.id,
              insightType: insight.type,
              title: insight.title,
              description: insight.description,
              priority: insight.priority,
              actionItems: insight.actionItems,
              confidenceScore: insight.confidenceScore,
              isRead: false,
            })
          }
        }

        if (analysis.riskAssessment) {
          await calculateRiskScore()
        }

        loadPortfolioData(selectedPortfolio.id)
      }
    } catch (error) {
      console.error("[v0] Error running AI analysis:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const calculateRiskScore = async () => {
    if (!selectedPortfolio || positions.length === 0) return

    try {
      const response = await fetch("/api/financial/risk-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolio: selectedPortfolio,
          positions,
        }),
      })

      if (response.ok) {
        const riskData = await response.json()
        const newRiskScore = riskScoreStorage.create({
          portfolioId: selectedPortfolio.id,
          overallScore: riskData.overallScore,
          volatility: riskData.volatility,
          beta: riskData.beta,
          maxDrawdown: riskData.maxDrawdown,
          sharpeRatio: riskData.sharpeRatio,
          esgScore: riskData.esgScore,
          riskLevel: riskData.riskLevel,
        })
        setRiskScore(newRiskScore)
      }
    } catch (error) {
      console.error("[v0] Error calculating risk score:", error)
    }
  }

  const runSimulation = async () => {
    if (!selectedPortfolio || !simulationScenario) return

    setIsSimulating(true)
    try {
      const response = await fetch("/api/financial/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: simulationScenario,
          portfolio: selectedPortfolio,
          positions,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setSimulationResult(result)
      }
    } catch (error) {
      console.error("[v0] Error running simulation:", error)
    } finally {
      setIsSimulating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="animate-fadeIn">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-white">
          <DollarSignIcon size={32} className="text-apex-primary animate-pulse-ring" />
          <GradientText>Financial Agent</GradientText>
        </h1>
        <p className="text-apex-gray">AI-powered portfolio management and investment intelligence.</p>
      </div>

      <div className="flex gap-2 border-b border-gray-700">
        <button
          onClick={() => setActiveTab("portfolio")}
          className={`px-4 py-2 font-semibold transition-all ${
            activeTab === "portfolio"
              ? "text-apex-primary border-b-2 border-apex-primary"
              : "text-apex-gray hover:text-white"
          }`}
        >
          Portfolio
        </button>
        <button
          onClick={() => setActiveTab("banks")}
          className={`px-4 py-2 font-semibold transition-all ${
            activeTab === "banks"
              ? "text-apex-primary border-b-2 border-apex-primary"
              : "text-apex-gray hover:text-white"
          }`}
        >
          Bank Connections
        </button>
      </div>

      {activeTab === "banks" ? (
        <BankConnections />
      ) : (
        <>
          <div className="flex items-center gap-4">
            <select
              value={selectedPortfolio?.id || ""}
              onChange={(e) => {
                const portfolio = portfolios.find((p) => p.id === e.target.value)
                if (portfolio) setSelectedPortfolio(portfolio)
              }}
              className="bg-apex-darker border border-gray-700 rounded-md px-4 py-2 text-white outline-none focus:ring-2 focus:ring-apex-primary"
            >
              {portfolios.map((portfolio) => (
                <option key={portfolio.id} value={portfolio.id}>
                  {portfolio.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowAddPortfolio(true)}
              className="px-4 py-2 bg-apex-primary text-white rounded-md hover:bg-apex-primary/80 transition-all"
            >
              New Portfolio
            </button>
          </div>

          <div className="flex gap-2 p-1 bg-apex-darker rounded-lg w-fit">
            <button
              onClick={() => setPortfolioView("combined")}
              className={`px-4 py-2 rounded-md transition-all text-sm font-medium ${
                portfolioView === "combined" ? "bg-apex-primary text-white" : "text-apex-gray hover:text-white"
              }`}
            >
              Combined View
            </button>
            <button
              onClick={() => setPortfolioView("manual")}
              className={`px-4 py-2 rounded-md transition-all text-sm font-medium ${
                portfolioView === "manual" ? "bg-apex-primary text-white" : "text-apex-gray hover:text-white"
              }`}
            >
              Manual Portfolio ({manualPositions.length})
            </button>
            <button
              onClick={() => setPortfolioView("bank")}
              className={`px-4 py-2 rounded-md transition-all text-sm font-medium ${
                portfolioView === "bank" ? "bg-apex-primary text-white" : "text-apex-gray hover:text-white"
              }`}
            >
              Bank Investments ({bankPositions.length})
            </button>
          </div>

          {portfolioView === "combined" && (manualPositions.length > 0 || bankPositions.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatedCard className="animate-fadeIn">
                <Widget title="Manual Portfolio">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-apex-gray">Total Value</p>
                      <p className="text-2xl font-bold text-white">
                        ${manualMetrics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-apex-gray">P&L</p>
                      <p
                        className={`text-lg font-bold ${manualMetrics.totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {manualMetrics.totalPnl >= 0 ? "+" : ""}$
                        {manualMetrics.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })} (
                        {manualMetrics.totalPnlPercent.toFixed(2)}%)
                      </p>
                    </div>
                    <p className="text-xs text-apex-gray">{manualPositions.length} positions</p>
                  </div>
                </Widget>
              </AnimatedCard>

              <AnimatedCard className="animate-fadeIn">
                <Widget title="Bank Investments">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-apex-gray">Total Value</p>
                      <p className="text-2xl font-bold text-white">
                        ${bankMetrics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-apex-gray">P&L</p>
                      <p
                        className={`text-lg font-bold ${bankMetrics.totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {bankMetrics.totalPnl >= 0 ? "+" : ""}$
                        {bankMetrics.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })} (
                        {bankMetrics.totalPnlPercent.toFixed(2)}%)
                      </p>
                    </div>
                    <p className="text-xs text-apex-gray">{bankPositions.length} positions</p>
                  </div>
                </Widget>
              </AnimatedCard>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={runAIAnalysis}
              disabled={isAnalyzing || positions.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <ApexSpinner size={16} />
                  Analyzing...
                </>
              ) : (
                <>
                  <SparklesIcon size={16} />
                  Run AI Analysis
                </>
              )}
            </button>
            <button
              onClick={calculateRiskScore}
              disabled={positions.length === 0}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <AlertTriangleIcon size={16} />
              Calculate Risk
            </button>
            <button
              onClick={() => setShowSimulator(true)}
              disabled={positions.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              What-If Simulator
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnimatedCard className="animate-fadeIn" style={{ animationDelay: "100ms" } as any}>
              <Widget title="Total Value">
                <p className="text-3xl font-bold">
                  <GradientText from="#22d3ee" to="#06b6d4">
                    $
                    {metrics.totalValue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </GradientText>
                </p>
                <p className="text-sm text-apex-gray mt-1">
                  {portfolioView === "combined" ? "Combined" : portfolioView === "manual" ? "Manual" : "Bank"} Value
                </p>
              </Widget>
            </AnimatedCard>

            <AnimatedCard className="animate-fadeIn" style={{ animationDelay: "150ms" } as any}>
              <Widget title="Total P&L">
                <p className={`text-3xl font-bold ${metrics.totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {metrics.totalPnl >= 0 ? "+" : ""}$
                  {metrics.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className={`text-sm mt-1 ${metrics.totalPnlPercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {metrics.totalPnlPercent >= 0 ? "+" : ""}
                  {metrics.totalPnlPercent.toFixed(2)}%
                </p>
              </Widget>
            </AnimatedCard>

            <AnimatedCard className="animate-fadeIn" style={{ animationDelay: "200ms" } as any}>
              <Widget title="Risk Score">
                {riskScore ? (
                  <>
                    <p className="text-3xl font-bold text-white">{riskScore.overallScore.toFixed(1)}/100</p>
                    <p className={`text-sm mt-1 font-semibold ${getRiskColor(riskScore.riskLevel)}`}>
                      {riskScore.riskLevel.toUpperCase().replace("_", " ")}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-apex-gray">No risk data</p>
                )}
              </Widget>
            </AnimatedCard>

            <AnimatedCard className="animate-fadeIn" style={{ animationDelay: "250ms" } as any}>
              <Widget title="ESG Score">
                {riskScore?.esgScore ? (
                  <>
                    <p className="text-3xl font-bold text-green-400">{riskScore.esgScore.toFixed(1)}/100</p>
                    <p className="text-sm text-apex-gray mt-1">Environmental, Social, Governance</p>
                  </>
                ) : (
                  <p className="text-sm text-apex-gray">No ESG data</p>
                )}
              </Widget>
            </AnimatedCard>
          </div>

          {insights.length > 0 && (
            <AnimatedCard className="animate-fadeIn" style={{ animationDelay: "300ms" } as any}>
              <Widget title="AI Insights" icon={<SparklesIcon className="text-apex-accent animate-pulse" />}>
                <div className="space-y-3">
                  {insights.slice(0, 3).map((insight, index) => (
                    <div
                      key={insight.id}
                      className={`p-4 border rounded-md ${getPriorityColor(insight.priority)} transition-all hover:scale-[1.02]`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-white">{insight.title}</h4>
                        {insight.confidenceScore && (
                          <span className="text-xs text-apex-gray">{insight.confidenceScore}% confidence</span>
                        )}
                      </div>
                      <p className="text-sm text-apex-gray">{insight.description}</p>
                      {insight.actionItems && insight.actionItems.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {insight.actionItems.map((item, i) => (
                            <p key={i} className="text-xs text-apex-accent">
                              • {item.action}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Widget>
            </AnimatedCard>
          )}

          <AnimatedCard className="animate-fadeIn" style={{ animationDelay: "350ms" } as any}>
            <Widget title="Holdings">
              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => setShowAddPosition(true)}
                  className="px-4 py-2 bg-apex-primary text-white rounded-md hover:bg-apex-primary/80 transition-all"
                >
                  Add Position
                </button>
                <button
                  onClick={() => setShowBulkImport(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all"
                >
                  Bulk Import
                </button>
                <button
                  onClick={updateAllPrices}
                  disabled={isUpdatingPrices || displayPositions.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUpdatingPrices ? (
                    <>
                      <ApexSpinner size={16} />
                      Updating...
                    </>
                  ) : (
                    <>
                      <TrendingUpIcon size={16} />
                      Refresh Prices
                    </>
                  )}
                </button>
              </div>

              {displayPositions.length === 0 ? (
                <p className="text-apex-gray text-sm">
                  No {portfolioView === "manual" ? "manual" : portfolioView === "bank" ? "bank" : ""} positions yet.
                  {portfolioView === "manual" && " Add your first investment."}
                  {portfolioView === "bank" && " Connect a bank account to sync investments."}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2 px-2 text-sm font-semibold text-apex-gray">Ticker</th>
                        <th className="text-left py-2 px-2 text-sm font-semibold text-apex-gray">Type</th>
                        {portfolioView === "combined" && (
                          <th className="text-left py-2 px-2 text-sm font-semibold text-apex-gray">Source</th>
                        )}
                        <th className="text-right py-2 px-2 text-sm font-semibold text-apex-gray">Quantity</th>
                        <th className="text-right py-2 px-2 text-sm font-semibold text-apex-gray">Avg Cost</th>
                        <th className="text-right py-2 px-2 text-sm font-semibold text-apex-gray">Current Price</th>
                        <th className="text-right py-2 px-2 text-sm font-semibold text-apex-gray">Market Value</th>
                        <th className="text-right py-2 px-2 text-sm font-semibold text-apex-gray">P&L</th>
                        <th className="text-right py-2 px-2 text-sm font-semibold text-apex-gray">P&L %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayPositions.map((position) => (
                        <tr
                          key={position.id}
                          className="border-b border-gray-800 hover:bg-apex-darker/50 transition-colors"
                        >
                          <td className="py-3 px-2 font-semibold text-white">{position.ticker}</td>
                          <td className="py-3 px-2 text-sm text-apex-gray capitalize">{position.assetType}</td>
                          {portfolioView === "combined" && (
                            <td className="py-3 px-2 text-sm">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  position.source === "bank"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : "bg-purple-500/20 text-purple-400"
                                }`}
                              >
                                {position.source === "bank" ? "Bank" : "Manual"}
                              </span>
                            </td>
                          )}
                          <td className="py-3 px-2 text-right text-white">{position.quantity}</td>
                          <td className="py-3 px-2 text-right text-white">${position.avgCost.toFixed(2)}</td>
                          <td className="py-3 px-2 text-right text-white">
                            ${position.currentPrice?.toFixed(2) || "-"}
                          </td>
                          <td className="py-3 px-2 text-right text-white">
                            ${position.marketValue?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "-"}
                          </td>
                          <td
                            className={`py-3 px-2 text-right font-semibold ${(position.unrealizedPnl || 0) >= 0 ? "text-green-400" : "text-red-400"}`}
                          >
                            {(position.unrealizedPnl || 0) >= 0 ? "+" : ""}${position.unrealizedPnl?.toFixed(2) || "-"}
                          </td>
                          <td
                            className={`py-3 px-2 text-right font-semibold ${(position.unrealizedPnlPercent || 0) >= 0 ? "text-green-400" : "text-red-400"}`}
                          >
                            {(position.unrealizedPnlPercent || 0) >= 0 ? "+" : ""}
                            {position.unrealizedPnlPercent?.toFixed(2) || "-"}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Widget>
          </AnimatedCard>

          {positions.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatedCard className="animate-fadeIn" style={{ animationDelay: "400ms" } as any}>
                <Widget title="Sector Allocation">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sectorData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ sector, percentage }) => `${sector} ${percentage.toFixed(1)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        animationDuration={800}
                      >
                        {sectorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(15, 20, 25, 0.95)",
                          border: "1px solid rgba(34, 211, 238, 0.3)",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                        formatter={(value: number) => [
                          `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                          "Value",
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Widget>
              </AnimatedCard>

              <AnimatedCard className="animate-fadeIn" style={{ animationDelay: "450ms" } as any}>
                <Widget title="Asset Type Allocation">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={assetData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                      <XAxis dataKey="type" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(15, 20, 25, 0.95)",
                          border: "1px solid rgba(34, 211, 238, 0.3)",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                        formatter={(value: number) => [
                          `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                          "Value",
                        ]}
                      />
                      <Bar dataKey="value" fill="#22d3ee" radius={[8, 8, 0, 0]} animationDuration={800} />
                    </BarChart>
                  </ResponsiveContainer>
                </Widget>
              </AnimatedCard>
            </div>
          )}

          {transactions.length > 0 && (
            <AnimatedCard className="animate-fadeIn" style={{ animationDelay: "500ms" } as any}>
              <Widget title="Recent Transactions">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {transactions.slice(0, 10).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-apex-darker border border-gray-700 rounded-md hover:border-apex-primary/30 transition-all"
                    >
                      <div>
                        <p className="font-medium text-white capitalize">{transaction.transactionType}</p>
                        <p className="text-xs text-apex-gray">
                          {transaction.ticker} • {new Date(transaction.transactionDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold ${transaction.transactionType === "buy" ? "text-red-400" : "text-green-400"}`}
                        >
                          {transaction.transactionType === "buy" ? "-" : "+"}${transaction.totalAmount.toFixed(2)}
                        </p>
                        {transaction.quantity && transaction.price && (
                          <p className="text-xs text-apex-gray">
                            {transaction.quantity} @ ${transaction.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Widget>
            </AnimatedCard>
          )}

          {showAddPosition && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-apex-dark border border-gray-700 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-white mb-4">Add Position</h3>

                <div className="mb-4">
                  <label className="text-sm font-medium text-apex-gray">Search Stocks</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      handleSearchStocks(e.target.value)
                    }}
                    placeholder="Search by name or ticker..."
                    className="w-full bg-apex-darker border border-gray-700 rounded-md p-2 mt-1 text-white"
                  />
                  {searchResults.length > 0 && (
                    <div className="mt-2 max-h-40 overflow-y-auto border border-gray-700 rounded-md">
                      {searchResults.map((result) => (
                        <button
                          key={result.ticker}
                          onClick={() => {
                            setSearchQuery(result.ticker)
                            setSearchResults([])
                          }}
                          className="w-full text-left p-2 hover:bg-apex-darker/50 transition-colors"
                        >
                          <p className="text-white font-semibold">{result.ticker}</p>
                          <p className="text-xs text-apex-gray">{result.name}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    handleAddPosition(
                      searchQuery || (formData.get("ticker") as string),
                      Number(formData.get("quantity")),
                      Number(formData.get("avgCost")),
                      formData.get("assetType") as string,
                    )
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-sm font-medium text-apex-gray">Ticker Symbol</label>
                    <input
                      type="text"
                      name="ticker"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      required
                      placeholder="AAPL"
                      className="w-full bg-apex-darker border border-gray-700 rounded-md p-2 mt-1 text-white uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-apex-gray">Asset Type</label>
                    <select
                      name="assetType"
                      required
                      className="w-full bg-apex-darker border border-gray-700 rounded-md p-2 mt-1 text-white"
                    >
                      <option value="stock">Stock</option>
                      <option value="etf">ETF</option>
                      <option value="bond">Bond</option>
                      <option value="crypto">Crypto</option>
                      <option value="mutual_fund">Mutual Fund</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-apex-gray">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      required
                      step="0.00000001"
                      min="0"
                      placeholder="10"
                      className="w-full bg-apex-darker border border-gray-700 rounded-md p-2 mt-1 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-apex-gray">Average Cost (per unit)</label>
                    <input
                      type="number"
                      name="avgCost"
                      required
                      step="0.01"
                      min="0"
                      placeholder="150.00"
                      className="w-full bg-apex-darker border border-gray-700 rounded-md p-2 mt-1 text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-apex-primary text-white py-2 rounded-md hover:bg-apex-primary/80 transition-all disabled:opacity-50"
                    >
                      {isLoading ? "Adding..." : "Add Position"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddPosition(false)}
                      className="flex-1 bg-gray-700 text-white py-2 rounded-md hover:bg-gray-600 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showAddPortfolio && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-apex-dark border border-gray-700 rounded-lg p-6 max-w-md w-full">
                <h3 className="text-xl font-bold text-white mb-4">Create Portfolio</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    handleAddPortfolio(formData.get("name") as string, formData.get("description") as string)
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-sm font-medium text-apex-gray">Portfolio Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="My Portfolio"
                      className="w-full bg-apex-darker border border-gray-700 rounded-md p-2 mt-1 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-apex-gray">Description</label>
                    <textarea
                      name="description"
                      placeholder="Optional description"
                      rows={3}
                      className="w-full bg-apex-darker border border-gray-700 rounded-md p-2 mt-1 text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-apex-primary text-white py-2 rounded-md hover:bg-apex-primary/80 transition-all"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddPortfolio(false)}
                      className="flex-1 bg-gray-700 text-white py-2 rounded-md hover:bg-gray-600 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showSimulator && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-apex-dark border border-gray-700 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-white mb-4">What-If Scenario Simulator</h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-apex-gray">Describe your scenario</label>
                    <textarea
                      value={simulationScenario}
                      onChange={(e) => setSimulationScenario(e.target.value)}
                      placeholder="E.g., 'What if I sell 50% of my tech stocks and invest in bonds?' or 'What if the market drops 20%?'"
                      rows={4}
                      className="w-full bg-apex-darker border border-gray-700 rounded-md p-3 mt-1 text-white"
                    />
                  </div>

                  <button
                    onClick={runSimulation}
                    disabled={isSimulating || !simulationScenario}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-md hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSimulating ? (
                      <>
                        <ApexSpinner size={16} />
                        Simulating...
                      </>
                    ) : (
                      <>
                        <SparklesIcon size={16} />
                        Run Simulation
                      </>
                    )}
                  </button>

                  {simulationResult && (
                    <div className="mt-6 space-y-4">
                      <div className="p-4 bg-apex-darker border border-gray-700 rounded-md">
                        <h4 className="font-semibold text-white mb-2">Simulation Results</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-apex-gray">Current Value</p>
                            <p className="text-lg font-bold text-white">
                              ${simulationResult.currentValue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-apex-gray">Projected Value</p>
                            <p className="text-lg font-bold text-white">
                              $
                              {simulationResult.projectedValue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-apex-gray">Change</p>
                            <p
                              className={`text-lg font-bold ${simulationResult.change >= 0 ? "text-green-400" : "text-red-400"}`}
                            >
                              {simulationResult.change >= 0 ? "+" : ""}$
                              {simulationResult.change?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-apex-gray">Change %</p>
                            <p
                              className={`text-lg font-bold ${simulationResult.changePercent >= 0 ? "text-green-400" : "text-red-400"}`}
                            >
                              {simulationResult.changePercent >= 0 ? "+" : ""}
                              {simulationResult.changePercent?.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-apex-darker border border-gray-700 rounded-md">
                        <h4 className="font-semibold text-white mb-2">Risk Assessment</h4>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-apex-gray">New Risk Score</p>
                            <p className="text-lg font-bold text-white">{simulationResult.newRiskScore}/100</p>
                          </div>
                          <div>
                            <p className="text-sm text-apex-gray">Risk Level</p>
                            <p className={`text-lg font-bold ${getRiskColor(simulationResult.newRiskLevel)}`}>
                              {simulationResult.newRiskLevel?.toUpperCase().replace("_", " ")}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-apex-gray">Confidence</p>
                            <p className="text-lg font-bold text-white">{simulationResult.confidence}%</p>
                          </div>
                        </div>
                      </div>

                      {simulationResult.analysis && (
                        <div className="p-4 bg-apex-darker border border-gray-700 rounded-md">
                          <h4 className="font-semibold text-white mb-2">Analysis</h4>
                          <p className="text-sm text-apex-gray">{simulationResult.analysis}</p>
                        </div>
                      )}

                      {simulationResult.recommendations && simulationResult.recommendations.length > 0 && (
                        <div className="p-4 bg-apex-darker border border-gray-700 rounded-md">
                          <h4 className="font-semibold text-white mb-2">Recommendations</h4>
                          <ul className="space-y-2">
                            {simulationResult.recommendations.map((rec: string, index: number) => (
                              <li key={index} className="text-sm text-apex-gray flex items-start gap-2">
                                <span className="text-apex-accent">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setShowSimulator(false)
                      setSimulationScenario("")
                      setSimulationResult(null)
                    }}
                    className="w-full bg-gray-700 text-white py-2 rounded-md hover:bg-gray-600 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          {showBulkImport && <BulkImportModal onImport={handleBulkImport} onClose={() => setShowBulkImport(false)} />}
        </>
      )}
    </div>
  )
}
