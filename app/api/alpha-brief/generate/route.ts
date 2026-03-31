import { type NextRequest, NextResponse } from "next/server"
import { crewAIClient } from "@/lib/crewai-client"
import { generateAlphaBriefMock } from "@/lib/mock-api-client"

export async function POST(request: NextRequest) {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

  try {
    const { userId, ticker } = await request.json()

    if (isDemoMode) {
      console.log("[v0] Demo mode enabled, using mock data")
      const mockBrief = await generateAlphaBriefMock(ticker)
      return NextResponse.json(mockBrief)
    }

    try {
      const response = await crewAIClient.generateAlphaBrief(userId, ticker)

      if (response.success) {
        return NextResponse.json(response.brief)
      } else {
        throw new Error("CrewAI backend returned unsuccessful response")
      }
    } catch (crewaiError) {
      console.error("[v0] CrewAI backend unavailable, falling back to mock data:", crewaiError)

      const mockBrief = await generateAlphaBriefMock(ticker)
      return NextResponse.json(mockBrief)
    }
  } catch (error) {
    console.error("[v0] Error generating alpha brief:", error)
    return NextResponse.json({ error: "Failed to generate alpha brief" }, { status: 500 })
  }
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
