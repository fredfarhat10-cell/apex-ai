import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { content, category, importance, context } = await request.json()

    // In production, this would call the CrewAI backend
    // For now, return success
    const response = await fetch(`${process.env.CREWAI_BACKEND_URL}/api/memory/store`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "store",
        content,
        category,
        importance,
        context,
      }),
    })

    const data = await response.json()

    return NextResponse.json({
      success: true,
      memoryId: data.memory_id,
      message: "Memory stored successfully",
    })
  } catch (error: any) {
    console.error("[Memory Store Error]", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
