// Alpha Brief Research Types

export interface AlphaBrief {
  id: string
  userId: string
  ticker: string
  companyName: string
  generatedAt: string
  expiresAt: string
  status: "generating" | "completed" | "failed"
  sections: {
    overview: CompanyOverview
    financials: FinancialMetrics
    news: NewsAnalysis
    technical: TechnicalAnalysis
    risks: RiskAssessment
    recommendation: InvestmentRecommendation
  }
}

export interface CompanyOverview {
  description: string
  sector: string
  industry: string
  marketCap: number
  employees: number
  founded: string
  headquarters: string
  ceo: string
  website: string
}

export interface FinancialMetrics {
  currentPrice: number
  priceChange24h: number
  priceChangePercent24h: number
  volume: number
  avgVolume: number
  marketCap: number
  peRatio: number
  eps: number
  dividendYield: number
  beta: number
  week52High: number
  week52Low: number
  revenue: number
  revenueGrowth: number
  profitMargin: number
  operatingMargin: number
  returnOnEquity: number
  debtToEquity: number
  currentRatio: number
  quickRatio: number
}

export interface NewsAnalysis {
  recentNews: Array<{
    title: string
    source: string
    publishedAt: string
    url: string
    sentiment: "positive" | "neutral" | "negative"
    summary: string
  }>
  overallSentiment: "bullish" | "neutral" | "bearish"
  sentimentScore: number // -100 to 100
  keyThemes: string[]
}

export interface TechnicalAnalysis {
  trend: "uptrend" | "downtrend" | "sideways"
  support: number[]
  resistance: number[]
  movingAverages: {
    sma20: number
    sma50: number
    sma200: number
  }
  rsi: number
  macd: {
    value: number
    signal: number
    histogram: number
  }
  signals: Array<{
    type: "buy" | "sell" | "hold"
    indicator: string
    strength: "strong" | "moderate" | "weak"
  }>
}

export interface RiskAssessment {
  overallRisk: "low" | "medium" | "high" | "very-high"
  riskScore: number // 0-100
  factors: Array<{
    category: string
    risk: "low" | "medium" | "high"
    description: string
    impact: string
  }>
  volatility: number
  beta: number
  maxDrawdown: number
}

export interface InvestmentRecommendation {
  rating: "strong-buy" | "buy" | "hold" | "sell" | "strong-sell"
  confidence: number // 0-100
  targetPrice: number
  timeHorizon: "short-term" | "medium-term" | "long-term"
  reasoning: string[]
  catalysts: string[]
  risks: string[]
  allocation: string
}

export interface ResearchRequest {
  id: string
  userId: string
  ticker: string
  requestedAt: string
  status: "pending" | "processing" | "completed" | "failed"
  briefId?: string
  error?: string
}
