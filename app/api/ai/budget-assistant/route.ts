import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { prompt, userId } = await request.json()

    // In production, this would use OpenAI to parse the request and generate a response
    // For demo, provide a helpful response
    const response = `I understand you want to adjust your budget. Based on your spending patterns, I recommend:

1. Increase your dining out budget by $100/month if you're consistently overspending
2. Consider reducing entertainment spending by $50/month to balance it out
3. Set aside an extra $150/month for your emergency fund

Would you like me to make these adjustments for you?`

    return NextResponse.json({ response })
  } catch (error) {
    console.error("[v0] Error in budget assistant:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
