// Financial Agent Local Storage Layer
// This provides a localStorage-based implementation that can be swapped for a real database

import type {
  Portfolio,
  Position,
  Transaction,
  RiskScore,
  FinancialInsight,
  BankConnection,
  MarketData,
} from "./types/financial"

const STORAGE_KEYS = {
  PORTFOLIOS: "apex_financial_portfolios",
  POSITIONS: "apex_financial_positions",
  TRANSACTIONS: "apex_financial_transactions",
  RISK_SCORES: "apex_financial_risk_scores",
  INSIGHTS: "apex_financial_insights",
  CONNECTIONS: "apex_financial_connections",
  MARKET_DATA: "apex_financial_market_data",
}

// Helper functions
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function getFromStorage<T>(key: string): T[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(data))
}

// Portfolio operations
export const portfolioStorage = {
  getAll: (userId: string): Portfolio[] => {
    return getFromStorage<Portfolio>(STORAGE_KEYS.PORTFOLIOS).filter((p) => p.userId === userId)
  },

  getById: (id: string): Portfolio | undefined => {
    return getFromStorage<Portfolio>(STORAGE_KEYS.PORTFOLIOS).find((p) => p.id === id)
  },

  create: (data: Omit<Portfolio, "id" | "createdAt" | "updatedAt">): Portfolio => {
    const portfolios = getFromStorage<Portfolio>(STORAGE_KEYS.PORTFOLIOS)
    const newPortfolio: Portfolio = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    portfolios.push(newPortfolio)
    saveToStorage(STORAGE_KEYS.PORTFOLIOS, portfolios)
    return newPortfolio
  },

  update: (id: string, data: Partial<Portfolio>): Portfolio | undefined => {
    const portfolios = getFromStorage<Portfolio>(STORAGE_KEYS.PORTFOLIOS)
    const index = portfolios.findIndex((p) => p.id === id)
    if (index === -1) return undefined

    portfolios[index] = {
      ...portfolios[index],
      ...data,
      updatedAt: new Date(),
    }
    saveToStorage(STORAGE_KEYS.PORTFOLIOS, portfolios)
    return portfolios[index]
  },

  delete: (id: string): boolean => {
    const portfolios = getFromStorage<Portfolio>(STORAGE_KEYS.PORTFOLIOS)
    const filtered = portfolios.filter((p) => p.id !== id)
    if (filtered.length === portfolios.length) return false
    saveToStorage(STORAGE_KEYS.PORTFOLIOS, filtered)
    return true
  },
}

// Position operations
export const positionStorage = {
  getByPortfolio: (portfolioId: string): Position[] => {
    return getFromStorage<Position>(STORAGE_KEYS.POSITIONS).filter((p) => p.portfolioId === portfolioId)
  },

  getById: (id: string): Position | undefined => {
    return getFromStorage<Position>(STORAGE_KEYS.POSITIONS).find((p) => p.id === id)
  },

  create: (data: Omit<Position, "id" | "createdAt" | "lastUpdated">): Position => {
    const positions = getFromStorage<Position>(STORAGE_KEYS.POSITIONS)
    const newPosition: Position = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      lastUpdated: new Date(),
    }
    positions.push(newPosition)
    saveToStorage(STORAGE_KEYS.POSITIONS, positions)
    return newPosition
  },

  update: (id: string, data: Partial<Position>): Position | undefined => {
    const positions = getFromStorage<Position>(STORAGE_KEYS.POSITIONS)
    const index = positions.findIndex((p) => p.id === id)
    if (index === -1) return undefined

    positions[index] = {
      ...positions[index],
      ...data,
      lastUpdated: new Date(),
    }
    saveToStorage(STORAGE_KEYS.POSITIONS, positions)
    return positions[index]
  },

  delete: (id: string): boolean => {
    const positions = getFromStorage<Position>(STORAGE_KEYS.POSITIONS)
    const filtered = positions.filter((p) => p.id !== id)
    if (filtered.length === positions.length) return false
    saveToStorage(STORAGE_KEYS.POSITIONS, filtered)
    return true
  },
}

// Transaction operations
export const transactionStorage = {
  getByPortfolio: (portfolioId: string): Transaction[] => {
    return getFromStorage<Transaction>(STORAGE_KEYS.TRANSACTIONS)
      .filter((t) => t.portfolioId === portfolioId)
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
  },

  create: (data: Omit<Transaction, "id" | "createdAt">): Transaction => {
    const transactions = getFromStorage<Transaction>(STORAGE_KEYS.TRANSACTIONS)
    const newTransaction: Transaction = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
    }
    transactions.push(newTransaction)
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions)
    return newTransaction
  },
}

// Risk Score operations
export const riskScoreStorage = {
  getLatest: (portfolioId: string): RiskScore | undefined => {
    const scores = getFromStorage<RiskScore>(STORAGE_KEYS.RISK_SCORES)
      .filter((s) => s.portfolioId === portfolioId)
      .sort((a, b) => new Date(b.computedAt).getTime() - new Date(a.computedAt).getTime())
    return scores[0]
  },

  create: (data: Omit<RiskScore, "id" | "computedAt">): RiskScore => {
    const scores = getFromStorage<RiskScore>(STORAGE_KEYS.RISK_SCORES)
    const newScore: RiskScore = {
      ...data,
      id: generateId(),
      computedAt: new Date(),
    }
    scores.push(newScore)
    saveToStorage(STORAGE_KEYS.RISK_SCORES, scores)
    return newScore
  },
}

// Insight operations
export const insightStorage = {
  getByPortfolio: (portfolioId: string): FinancialInsight[] => {
    return getFromStorage<FinancialInsight>(STORAGE_KEYS.INSIGHTS)
      .filter((i) => i.portfolioId === portfolioId)
      .filter((i) => !i.expiresAt || new Date(i.expiresAt) > new Date())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  create: (data: Omit<FinancialInsight, "id" | "createdAt">): FinancialInsight => {
    const insights = getFromStorage<FinancialInsight>(STORAGE_KEYS.INSIGHTS)
    const newInsight: FinancialInsight = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
    }
    insights.push(newInsight)
    saveToStorage(STORAGE_KEYS.INSIGHTS, insights)
    return newInsight
  },

  markAsRead: (id: string): boolean => {
    const insights = getFromStorage<FinancialInsight>(STORAGE_KEYS.INSIGHTS)
    const index = insights.findIndex((i) => i.id === id)
    if (index === -1) return false

    insights[index].isRead = true
    saveToStorage(STORAGE_KEYS.INSIGHTS, insights)
    return true
  },
}

// Bank Connection operations
export const connectionStorage = {
  getByUser: (userId: string): BankConnection[] => {
    return getFromStorage<BankConnection>(STORAGE_KEYS.CONNECTIONS).filter((c) => c.userId === userId && c.isActive)
  },

  create: (data: Omit<BankConnection, "id" | "createdAt">): BankConnection => {
    const connections = getFromStorage<BankConnection>(STORAGE_KEYS.CONNECTIONS)
    const newConnection: BankConnection = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
    }
    connections.push(newConnection)
    saveToStorage(STORAGE_KEYS.CONNECTIONS, connections)
    return newConnection
  },

  updateSyncTime: (id: string): boolean => {
    const connections = getFromStorage<BankConnection>(STORAGE_KEYS.CONNECTIONS)
    const index = connections.findIndex((c) => c.id === id)
    if (index === -1) return false

    connections[index].lastSyncedAt = new Date()
    saveToStorage(STORAGE_KEYS.CONNECTIONS, connections)
    return true
  },

  deactivate: (id: string): boolean => {
    const connections = getFromStorage<BankConnection>(STORAGE_KEYS.CONNECTIONS)
    const index = connections.findIndex((c) => c.id === id)
    if (index === -1) return false

    connections[index].isActive = false
    saveToStorage(STORAGE_KEYS.CONNECTIONS, connections)
    return true
  },
}

// Market Data operations
export const marketDataStorage = {
  get: (ticker: string): MarketData | undefined => {
    const data = getFromStorage<MarketData>(STORAGE_KEYS.MARKET_DATA)
      .filter((d) => d.ticker === ticker)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    return data[0]
  },

  set: (data: Omit<MarketData, "id" | "timestamp">): MarketData => {
    const marketData = getFromStorage<MarketData>(STORAGE_KEYS.MARKET_DATA)
    const newData: MarketData = {
      ...data,
      id: generateId(),
      timestamp: new Date(),
    }
    marketData.push(newData)
    saveToStorage(STORAGE_KEYS.MARKET_DATA, marketData)
    return newData
  },
}
