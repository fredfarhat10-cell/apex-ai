import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { portfolio, positions, riskScore, userProfile } = body

    if (!portfolio || !positions) {
      return NextResponse.json({ error: "Portfolio and positions are required" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const totalValue = positions.reduce((sum: number, pos: any) => sum + (pos.marketValue || 0), 0)
    const totalCost = positions.reduce((sum: number, pos: any) => sum + pos.avgCost * pos.quantity, 0)
    const totalPnl = totalValue - totalCost
    const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0

    // Calculate sector allocation
    const sectorAllocation = positions.reduce((acc: any, pos: any) => {
      const sector = pos.sector || "Other"
      acc[sector] = (acc[sector] || 0) + (pos.marketValue || 0)
      return acc
    }, {})

    const prompt = `You are the Financial Agent — an AI analyst specialized in investment performance, risk, and sustainability.

Portfolio Analysis Request:
- Portfolio Name: ${portfolio.name}
- Total Value: $${totalValue.toFixed(2)}
- Total P&L: $${totalPnl.toFixed(2)} (${totalPnlPercent.toFixed(2)}%)
- Number of Positions: ${positions.length}
- Risk Score: ${riskScore?.overallScore || "Not calculated"}
- Risk Level: ${riskScore?.riskLevel || "Unknown"}

Positions:
${positions.map((pos: any) => `- ${pos.ticker} (${pos.assetType}): ${pos.quantity} shares @ $${pos.avgCost.toFixed(2)}, Current: $${pos.currentPrice?.toFixed(2) || "N/A"}, P&L: ${pos.unrealizedPnlPercent?.toFixed(2) || "N/A"}%`).join("\n")}

Sector Allocation:
${Object.entries(sectorAllocation)
  .map(
    ([sector, value]: [string, any]) =>
      `- ${sector}: $${value.toFixed(2)} (${((value / totalValue) * 100).toFixed(1)}%)`,
  )
  .join("\n")}

User Profile:
${
  userProfile
    ? `- Goals: ${userProfile.goals?.join(", ") || "Not specified"}
- Risk Tolerance: ${userProfile.riskTolerance || "Not specified"}`
    : "No profile data"
}

Please provide:
1. A comprehensive portfolio analysis (2-3 sentences)
2. 3-5 specific, actionable insights with priority levels (critical, high, medium, low)
3. Risk assessment and diversification recommendations
4. ESG considerations if applicable
5. Rebalancing suggestions if needed

Format your response as JSON with this structure:
{
  "summary": "Overall portfolio analysis",
  "insights": [
    {
      "title": "Insight title",
      "description": "Detailed description",
      "priority": "high|medium|low|critical",
      "type": "recommendation|alert|analysis|warning",
      "actionItems": [
        { "action": "Specific action", "impact": "Expected impact" }
      ],
      "confidenceScore": 85
    }
  ],
  "riskAssessment": {
    "overallRisk": "low|medium|high|very_high",
    "diversificationScore": 75,
    "recommendations": ["recommendation 1", "recommendation 2"]
  },
  "rebalancing": {
    "needed": true,
    "suggestions": ["suggestion 1", "suggestion 2"]
  }
}`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response")
    }

    const analysis = JSON.parse(jsonMatch[0])

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("[v0] Financial analysis API error:", error)
    return NextResponse.json({ error: "Failed to analyze portfolio" }, { status: 500 })
  }
}
