// Financial Agent Type Definitions

export interface Portfolio {
  id: string
  userId: string
  name: string
  description?: string
  currency: string
  totalValue: number
  createdAt: Date
  updatedAt: Date
}

export interface Position {
  id: string
  portfolioId: string
  ticker: string
  assetType: "stock" | "etf" | "bond" | "crypto" | "mutual_fund"
  quantity: number
  avgCost: number
  currentPrice?: number
  marketValue?: number
  unrealizedPnl?: number
  unrealizedPnlPercent?: number
  sector?: string
  region?: string
  source?: "manual" | "bank"
  bankConnectionId?: string
  lastUpdated: Date
  createdAt: Date
}

export interface Transaction {
  id: string
  portfolioId: string
  positionId?: string
  transactionType: "buy" | "sell" | "dividend" | "deposit" | "withdrawal"
  ticker?: string
  quantity?: number
  price?: number
  totalAmount: number
  fees: number
  notes?: string
  transactionDate: Date
  createdAt: Date
}

export interface RiskScore {
  id: string
  portfolioId: string
  overallScore: number // 0-100
  volatility?: number
  beta?: number
  maxDrawdown?: number
  sharpeRatio?: number
  esgScore?: number // 0-100
  riskLevel: "low" | "medium" | "high" | "very_high"
  computedAt: Date
}

export interface ESGRating {
  id: string
  ticker: string
  environmentalScore?: number
  socialScore?: number
  governanceScore?: number
  overallEsgScore?: number
  controversyLevel?: "none" | "low" | "medium" | "high"
  lastUpdated: Date
}

export interface MarketData {
  id: string
  ticker: string
  price: number
  change?: number
  changePercent?: number
  volume?: number
  marketCap?: number
  peRatio?: number
  dividendYield?: number
  week52High?: number
  week52Low?: number
  timestamp: Date
}

export interface FinancialInsight {
  id: string
  portfolioId: string
  insightType: "recommendation" | "alert" | "analysis" | "warning"
  title: string
  description: string
  priority: "low" | "medium" | "high" | "critical"
  actionItems?: Array<{
    action: string
    impact: string
  }>
  confidenceScore?: number // 0-100
  isRead: boolean
  createdAt: Date
  expiresAt?: Date
}

export interface BankConnection {
  id: string
  userId: string
  provider: string
  accountId: string
  accountName?: string
  accountType: "checking" | "savings" | "brokerage" | "retirement"
  accessToken: string
  refreshToken?: string
  tokenExpiresAt?: Date
  lastSyncedAt?: Date
  isActive: boolean
  createdAt: Date
}

// Analytics Types
export interface PortfolioAnalytics {
  totalValue: number
  totalCost: number
  totalPnl: number
  totalPnlPercent: number
  dayChange: number
  dayChangePercent: number
  weekChange: number
  weekChangePercent: number
  monthChange: number
  monthChangePercent: number
  yearChange: number
  yearChangePercent: number
  topGainers: Position[]
  topLosers: Position[]
  sectorAllocation: Record<string, number>
  assetAllocation: Record<string, number>
  regionAllocation: Record<string, number>
}

export interface SimulationResult {
  scenario: string
  currentValue: number
  projectedValue: number
  change: number
  changePercent: number
  newRiskScore: number
  newRiskLevel: "low" | "medium" | "high" | "very_high"
  recommendations: string[]
}
