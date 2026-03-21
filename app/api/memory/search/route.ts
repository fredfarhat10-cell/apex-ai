import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 5 } = await request.json()

    // In production, this would call the CrewAI backend with vector search
    const response = await fetch(`${process.env.CREWAI_BACKEND_URL}/api/memory/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "retrieve",
        content: query,
        limit,
      }),
    })

    const data = await response.json()

    return NextResponse.json({
      success: true,
      memories: data.memories || [],
    })
  } catch (error: any) {
    console.error("[Memory Search Error]", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
