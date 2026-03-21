import type { AlphaBrief } from "@/lib/types/alpha-brief"

export async function generateAlphaBriefMock(ticker: string): Promise<AlphaBrief> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const brief: AlphaBrief = {
    id: `brief_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: "demo-user",
    ticker: ticker.toUpperCase(),
    companyName: getCompanyName(ticker),
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: "completed",
    sections: {
      overview: {
        description: `${getCompanyName(ticker)} is a leading technology company focused on innovation and growth.`,
        sector: "Technology",
        industry: "Software",
        marketCap: 2500000000000,
        employees: 150000,
        founded: "1976",
        headquarters: "Cupertino, CA",
        ceo: "Tim Cook",
        website: `https://www.${ticker.toLowerCase()}.com`,
      },
      financials: {
        currentPrice: 185.5,
        priceChange24h: 2.5,
        priceChangePercent24h: 1.37,
        volume: 52000000,
        avgVolume: 48000000,
        marketCap: 2500000000000,
        peRatio: 28.5,
        eps: 6.5,
        dividendYield: 0.52,
        beta: 1.2,
        week52High: 198.23,
        week52Low: 164.08,
        revenue: 394000000000,
        revenueGrowth: 8.5,
        profitMargin: 25.3,
        operatingMargin: 30.1,
        returnOnEquity: 147.5,
        debtToEquity: 1.73,
        currentRatio: 0.98,
        quickRatio: 0.83,
      },
      news: {
        recentNews: [
          {
            title: `${getCompanyName(ticker)} Announces Strong Q4 Earnings`,
            source: "Financial Times",
            publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            url: "https://example.com/news1",
            sentiment: "positive",
            summary: "Company beats analyst expectations with record revenue and profit margins.",
          },
          {
            title: `New Product Launch Expected to Drive Growth`,
            source: "Bloomberg",
            publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            url: "https://example.com/news2",
            sentiment: "positive",
            summary: "Analysts predict strong demand for upcoming product releases.",
          },
          {
            title: `Regulatory Concerns in European Markets`,
            source: "Reuters",
            publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            url: "https://example.com/news3",
            sentiment: "negative",
            summary: "EU regulators investigating potential antitrust violations.",
          },
        ],
        overallSentiment: "bullish",
        sentimentScore: 65,
        keyThemes: ["Earnings Growth", "Product Innovation", "Regulatory Risk", "Market Expansion"],
      },
      technical: {
        trend: "uptrend",
        support: [180.0, 175.0, 170.0],
        resistance: [190.0, 195.0, 200.0],
        movingAverages: {
          sma20: 183.5,
          sma50: 178.2,
          sma200: 172.8,
        },
        rsi: 62,
        macd: {
          value: 2.5,
          signal: 1.8,
          histogram: 0.7,
        },
        signals: [
          {
            type: "buy",
            indicator: "Moving Average Crossover",
            strength: "moderate",
          },
          {
            type: "buy",
            indicator: "RSI",
            strength: "weak",
          },
        ],
      },
      risks: {
        overallRisk: "medium",
        riskScore: 55,
        factors: [
          {
            category: "Market Risk",
            risk: "medium",
            description: "Exposure to broader market volatility",
            impact: "Stock price may fluctuate with overall market conditions",
          },
          {
            category: "Regulatory Risk",
            risk: "high",
            description: "Ongoing antitrust investigations",
            impact: "Potential fines or operational restrictions",
          },
          {
            category: "Competition Risk",
            risk: "medium",
            description: "Intense competition in core markets",
            impact: "Pressure on margins and market share",
          },
          {
            category: "Technology Risk",
            risk: "low",
            description: "Rapid technological change",
            impact: "Need for continuous innovation investment",
          },
        ],
        volatility: 18.5,
        beta: 1.2,
        maxDrawdown: -15.3,
      },
      recommendation: {
        rating: "buy",
        confidence: 75,
        targetPrice: 205.0,
        timeHorizon: "medium-term",
        reasoning: [
          "Strong financial performance with consistent revenue growth",
          "Innovative product pipeline expected to drive future growth",
          "Solid balance sheet with manageable debt levels",
          "Technical indicators suggest continued upward momentum",
        ],
        catalysts: [
          "Upcoming product launches in Q2",
          "Expansion into emerging markets",
          "Potential for increased dividend or buyback program",
          "Resolution of regulatory concerns",
        ],
        risks: [
          "Regulatory headwinds in key markets",
          "Increased competition from emerging players",
          "Potential economic slowdown affecting consumer spending",
          "Currency fluctuations impacting international revenue",
        ],
        allocation: "Consider 3-5% portfolio allocation for growth-oriented investors",
      },
    },
  }

  return brief
}

function getCompanyName(ticker: string): string {
  const companies: Record<string, string> = {
    AAPL: "Apple Inc.",
    MSFT: "Microsoft Corporation",
    GOOGL: "Alphabet Inc.",
    AMZN: "Amazon.com Inc.",
    TSLA: "Tesla Inc.",
    NVDA: "NVIDIA Corporation",
    META: "Meta Platforms Inc.",
  }

  return companies[ticker.toUpperCase()] || `${ticker.toUpperCase()} Corporation`
}
