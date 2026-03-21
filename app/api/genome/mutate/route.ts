import { type NextRequest, NextResponse } from "next/server"
import { GenomeMutationEngine } from "@/lib/genome-mutation-engine"

export async function POST(request: NextRequest) {
  try {
    const { userId, currentGenome, userContext, recentDecisions } = await request.json()

    console.log("[v0] Proposing genome mutation...")

    const gme = new GenomeMutationEngine(userId)

    const mutation = await gme.proposeGenomeMutation(currentGenome, userContext, recentDecisions || [])

    console.log("[v0] Recommended path:", mutation.recommendedPath)
    console.log("[v0] Reasoning:", mutation.reasoning)

    return NextResponse.json({
      success: true,
      mutation,
    })
  } catch (error) {
    console.error("[v0] Genome mutation error:", error)
    return NextResponse.json({ success: false, error: "Failed to propose genome mutation" }, { status: 500 })
  }
}
