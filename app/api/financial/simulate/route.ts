import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scenario, portfolio, positions } = body

    if (!scenario || !portfolio || !positions) {
      return NextResponse.json({ error: "Scenario, portfolio, and positions are required" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const totalValue = positions.reduce((sum: number, pos: any) => sum + (pos.marketValue || 0), 0)

    const prompt = `You are the Financial Agent — an AI analyst specialized in investment simulation and scenario analysis.

Current Portfolio:
- Total Value: $${totalValue.toFixed(2)}
- Positions: ${positions.length}

Positions:
${positions.map((pos: any) => `- ${pos.ticker}: ${pos.quantity} shares @ $${pos.currentPrice?.toFixed(2) || "N/A"}, Value: $${pos.marketValue?.toFixed(2) || "N/A"}`).join("\n")}

Scenario to Simulate:
${scenario}

Please analyze this scenario and provide:
1. Projected portfolio value after the scenario
2. Expected change in value ($ and %)
3. New risk score (0-100)
4. New risk level (low, medium, high, very_high)
5. Specific recommendations based on the scenario
6. Confidence level (0-100)

Format your response as JSON:
{
  "scenario": "Brief description of scenario",
  "currentValue": ${totalValue},
  "projectedValue": 0,
  "change": 0,
  "changePercent": 0,
  "newRiskScore": 0,
  "newRiskLevel": "medium",
  "recommendations": ["rec1", "rec2"],
  "confidence": 85,
  "analysis": "Detailed analysis of the scenario impact"
}`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response")
    }

    const simulation = JSON.parse(jsonMatch[0])

    return NextResponse.json(simulation)
  } catch (error) {
    console.error("[v0] Financial simulation API error:", error)
    return NextResponse.json({ error: "Failed to simulate scenario" }, { status: 500 })
  }
}
