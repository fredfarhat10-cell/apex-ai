import { type NextRequest, NextResponse } from "next/server"
import { crewAIClient } from "@/lib/crewai-client"

export async function POST(request: NextRequest) {
  try {
    const { outputId, outputType, feedback, timestamp } = await request.json()

    // Trigger memory processing with feedback context
    const result = await crewAIClient.processMemory({
      userId: "current_user", // TODO: Get from auth
      interactionType: outputType,
      feedback,
      context: {
        outputId,
        timestamp,
        feedbackType: feedback,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Feedback processed and memory updated",
      learnings: result.learnings_count,
    })
  } catch (error) {
    console.error("[v0] Error processing feedback:", error)
    return NextResponse.json({ error: "Failed to process feedback" }, { status: 500 })
  }
}
