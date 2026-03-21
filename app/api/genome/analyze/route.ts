import { type NextRequest, NextResponse } from "next/server"
import { GenomeMutationEngine } from "@/lib/genome-mutation-engine"

export async function POST(request: NextRequest) {
  try {
    const { userId, userContext } = await request.json()

    console.log("[v0] Analyzing life genome...")

    const gme = new GenomeMutationEngine(userId)

    const genome = await gme.analyzeLifeGenome(userContext)

    console.log("[v0] Current archetype:", genome.currentArchetype)
    console.log("[v0] Archetype distribution:", genome.archetypeDistribution)

    return NextResponse.json({
      success: true,
      genome,
    })
  } catch (error) {
    console.error("[v0] Genome analysis error:", error)
    return NextResponse.json({ success: false, error: "Failed to analyze life genome" }, { status: 500 })
  }
}
