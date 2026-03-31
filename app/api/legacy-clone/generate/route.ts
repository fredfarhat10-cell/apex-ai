import { type NextRequest, NextResponse } from "next/server"
import { LegacyCloneEngine } from "@/lib/legacy-clone-engine"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const dna = await LegacyCloneEngine.generateDNA(userId)

    return NextResponse.json({ dna })
  } catch (error) {
    console.error("Error generating DNA:", error)
    return NextResponse.json({ error: "Failed to generate Performance DNA" }, { status: 500 })
  }
}
