// Market Data Service
// Fetches real-time market data from various sources

import { marketDataStorage } from "./financial-storage"
import type { MarketData } from "./types/financial"

// Free market data sources
const YAHOO_FINANCE_API = "https://query1.finance.yahoo.com/v8/finance/chart"
const ALPHA_VANTAGE_API = "https://www.alphavantage.co/query"

interface YahooFinanceResponse {
  chart: {
    result: Array<{
      meta: {
        regularMarketPrice: number
        previousClose: number
        symbol: string
      }
      indicators: {
        quote: Array<{
          volume: number[]
        }>
      }
    }>
  }
}

interface AlphaVantageResponse {
  "Global Quote": {
    "01. symbol": string
    "05. price": string
    "09. change": string
    "10. change percent": string
    "06. volume": string
    "07. latest trading day": string
  }
}

/**
 * Fetch market data for a ticker from Yahoo Finance
 */
export async function fetchMarketData(ticker: string): Promise<MarketData | null> {
  try {
    // Check cache first (5 minute cache)
    const cached = marketDataStorage.get(ticker)
    if (cached && Date.now() - new Date(cached.timestamp).getTime() < 5 * 60 * 1000) {
      return cached
    }

    // Fetch from Yahoo Finance (free, no API key required)
    const response = await fetch(`${YAHOO_FINANCE_API}/${ticker}?interval=1d&range=1d`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    })

    if (!response.ok) {
      console.error(`[v0] Failed to fetch market data for ${ticker}:`, response.statusText)
      return null
    }

    const data: YahooFinanceResponse = await response.json()
    const result = data.chart.result[0]

    if (!result) {
      console.error(`[v0] No data found for ticker ${ticker}`)
      return null
    }

    const price = result.meta.regularMarketPrice
    const previousClose = result.meta.previousClose
    const change = price - previousClose
    const changePercent = (change / previousClose) * 100

    const marketData = marketDataStorage.set({
      ticker: ticker.toUpperCase(),
      price,
      change,
      changePercent,
      volume: result.indicators.quote[0]?.volume?.[0],
    })

    return marketData
  } catch (error) {
    console.error(`[v0] Error fetching market data for ${ticker}:`, error)
    return null
  }
}

/**
 * Fetch market data for multiple tickers
 */
export async function fetchMultipleMarketData(tickers: string[]): Promise<Map<string, MarketData>> {
  const results = new Map<string, MarketData>()

  // Fetch in parallel with rate limiting
  const batchSize = 5
  for (let i = 0; i < tickers.length; i += batchSize) {
    const batch = tickers.slice(i, i + batchSize)
    const promises = batch.map((ticker) => fetchMarketData(ticker))
    const batchResults = await Promise.all(promises)

    batchResults.forEach((data, index) => {
      if (data) {
        results.set(batch[index], data)
      }
    })

    // Rate limiting: wait 1 second between batches
    if (i + batchSize < tickers.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  return results
}

/**
 * Get detailed stock information including fundamentals
 */
export async function fetchStockDetails(ticker: string): Promise<{
  ticker: string
  name: string
  sector: string
  industry: string
  marketCap: number
  peRatio: number
  dividendYield: number
  week52High: number
  week52Low: number
} | null> {
  try {
    // Fetch from Yahoo Finance quote endpoint
    const response = await fetch(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=price,summaryDetail,assetProfile`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      },
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const result = data.quoteSummary.result[0]

    return {
      ticker: ticker.toUpperCase(),
      name: result.price.longName || ticker,
      sector: result.assetProfile?.sector || "Unknown",
      industry: result.assetProfile?.industry || "Unknown",
      marketCap: result.price.marketCap?.raw || 0,
      peRatio: result.summaryDetail?.trailingPE?.raw || 0,
      dividendYield: result.summaryDetail?.dividendYield?.raw || 0,
      week52High: result.summaryDetail?.fiftyTwoWeekHigh?.raw || 0,
      week52Low: result.summaryDetail?.fiftyTwoWeekLow?.raw || 0,
    }
  } catch (error) {
    console.error(`[v0] Error fetching stock details for ${ticker}:`, error)
    return null
  }
}

/**
 * Search for stocks by name or ticker
 */
export async function searchStocks(query: string): Promise<
  Array<{
    ticker: string
    name: string
    type: string
    exchange: string
  }>
> {
  try {
    const [stockResults, cryptoResults] = await Promise.all([searchStocksYahoo(query), searchCrypto(query)])

    // Combine and return results
    return [...stockResults, ...cryptoResults]
  } catch (error) {
    console.error(`[v0] Error searching:`, error)
    return []
  }
}

/**
 * Search for stocks on Yahoo Finance
 */
async function searchStocksYahoo(query: string): Promise<
  Array<{
    ticker: string
    name: string
    type: string
    exchange: string
  }>
> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      },
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.quotes
      .filter((quote: any) => quote.quoteType === "EQUITY" || quote.quoteType === "ETF")
      .map((quote: any) => ({
        ticker: quote.symbol,
        name: quote.longname || quote.shortname,
        type: quote.quoteType,
        exchange: quote.exchange,
      }))
  } catch (error) {
    console.error(`[v0] Error searching stocks on Yahoo:`, error)
    return []
  }
}

/**
 * Search for cryptocurrencies on CoinGecko
 */
async function searchCrypto(query: string): Promise<
  Array<{
    ticker: string
    name: string
    type: string
    exchange: string
  }>
> {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`)

    if (!response.ok) {
      return []
    }

    const data = await response.json()

    // Return top 5 crypto results
    return data.coins.slice(0, 5).map((coin: any) => ({
      ticker: coin.symbol.toUpperCase(),
      name: coin.name,
      type: "CRYPTO",
      exchange: "CoinGecko",
    }))
  } catch (error) {
    console.error(`[v0] Error searching crypto:`, error)
    return []
  }
}

/**
 * Get crypto price data
 */
export async function fetchCryptoData(symbol: string): Promise<MarketData | null> {
  try {
    // Use CoinGecko API (free, no API key required)
    const coinId = symbol.toLowerCase().replace("usd", "")
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`,
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    const coinData = data[coinId]

    if (!coinData) {
      return null
    }

    const marketData = marketDataStorage.set({
      ticker: symbol.toUpperCase(),
      price: coinData.usd,
      change: (coinData.usd * coinData.usd_24h_change) / 100,
      changePercent: coinData.usd_24h_change,
      volume: coinData.usd_24h_vol,
    })

    return marketData
  } catch (error) {
    console.error(`[v0] Error fetching crypto data for ${symbol}:`, error)
    return null
  }
}

/**
 * Calculate ESG score for a ticker (simplified version)
 */
export async function calculateESGScore(
  ticker: string,
  sector: string,
): Promise<{
  environmentalScore: number
  socialScore: number
  governanceScore: number
  overallScore: number
  controversyLevel: "none" | "low" | "medium" | "high"
}> {
  // In production, this would call an ESG data API
  // For now, we'll use sector-based heuristics

  const sectorScores: Record<string, { e: number; s: number; g: number }> = {
    Technology: { e: 75, s: 80, g: 85 },
    Healthcare: { e: 70, s: 85, g: 80 },
    "Financial Services": { e: 65, s: 75, g: 90 },
    Energy: { e: 40, s: 60, g: 70 },
    Utilities: { e: 50, s: 70, g: 75 },
    "Consumer Cyclical": { e: 60, s: 70, g: 75 },
    "Consumer Defensive": { e: 65, s: 75, g: 80 },
    Industrials: { e: 55, s: 65, g: 75 },
    "Basic Materials": { e: 45, s: 60, g: 70 },
    "Real Estate": { e: 60, s: 70, g: 75 },
    "Communication Services": { e: 70, s: 75, g: 80 },
  }

  const scores = sectorScores[sector] || { e: 60, s: 70, g: 75 }

  // Add some randomness to make it more realistic
  const randomize = (base: number) => Math.max(0, Math.min(100, base + (Math.random() * 20 - 10)))

  const environmentalScore = randomize(scores.e)
  const socialScore = randomize(scores.s)
  const governanceScore = randomize(scores.g)
  const overallScore = (environmentalScore + socialScore + governanceScore) / 3

  let controversyLevel: "none" | "low" | "medium" | "high" = "none"
  if (overallScore < 40) controversyLevel = "high"
  else if (overallScore < 60) controversyLevel = "medium"
  else if (overallScore < 80) controversyLevel = "low"

  return {
    environmentalScore,
    socialScore,
    governanceScore,
    overallScore,
    controversyLevel,
  }
}
