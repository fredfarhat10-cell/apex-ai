import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { positions, portfolio } = body

    if (!positions || !Array.isArray(positions)) {
      return NextResponse.json({ error: "Positions array is required" }, { status: 400 })
    }

    // Calculate portfolio metrics
    const totalValue = positions.reduce((sum, pos) => sum + (pos.marketValue || 0), 0)
    const totalCost = positions.reduce((sum, pos) => sum + pos.avgCost * pos.quantity, 0)

    // Calculate volatility (simplified - based on P&L variance)
    const pnlPercentages = positions.map((pos) => pos.unrealizedPnlPercent || 0)
    const avgPnl = pnlPercentages.reduce((sum, pnl) => sum + pnl, 0) / pnlPercentages.length
    const variance = pnlPercentages.reduce((sum, pnl) => sum + Math.pow(pnl - avgPnl, 2), 0) / pnlPercentages.length
    const volatility = Math.sqrt(variance)

    // Calculate diversification score
    const sectorCount = new Set(positions.map((pos) => pos.sector)).size
    const assetTypeCount = new Set(positions.map((pos) => pos.assetType)).size
    const diversificationScore = Math.min(100, sectorCount * 15 + assetTypeCount * 20 + positions.length * 5)

    // Calculate beta (simplified - relative to market volatility)
    const beta = volatility / 15 // Assuming market volatility of 15%

    // Calculate Sharpe ratio (simplified)
    const riskFreeRate = 4.5 // 4.5% risk-free rate
    const portfolioReturn = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0
    const sharpeRatio = volatility > 0 ? (portfolioReturn - riskFreeRate) / volatility : 0

    // Calculate max drawdown (simplified)
    const maxDrawdown = Math.min(...pnlPercentages)

    // Calculate overall risk score (0-100, higher = riskier)
    let overallScore = 50 // Base score
    overallScore += volatility * 2 // Add volatility impact
    overallScore += Math.abs(beta - 1) * 10 // Add beta deviation impact
    overallScore -= diversificationScore * 0.3 // Reduce for diversification
    overallScore = Math.max(0, Math.min(100, overallScore))

    // Determine risk level
    let riskLevel: "low" | "medium" | "high" | "very_high"
    if (overallScore < 30) riskLevel = "low"
    else if (overallScore < 50) riskLevel = "medium"
    else if (overallScore < 70) riskLevel = "high"
    else riskLevel = "very_high"

    // Calculate ESG score (based on sector allocation)
    const sectorESGScores: Record<string, number> = {
      Technology: 75,
      Healthcare: 70,
      "Financial Services": 65,
      Energy: 40,
      Utilities: 50,
      "Consumer Cyclical": 60,
      "Consumer Defensive": 65,
      Industrials: 55,
      "Basic Materials": 45,
      "Real Estate": 60,
      "Communication Services": 70,
    }

    const esgScore = positions.reduce((sum, pos) => {
      const sectorScore = sectorESGScores[pos.sector] || 60
      const weight = (pos.marketValue || 0) / totalValue
      return sum + sectorScore * weight
    }, 0)

    const riskScore = {
      portfolioId: portfolio?.id || "unknown",
      overallScore,
      volatility,
      beta,
      maxDrawdown,
      sharpeRatio,
      esgScore,
      riskLevel,
      diversificationScore,
    }

    return NextResponse.json(riskScore)
  } catch (error) {
    console.error("[v0] Risk assessment API error:", error)
    return NextResponse.json({ error: "Failed to assess risk" }, { status: 500 })
  }
}
