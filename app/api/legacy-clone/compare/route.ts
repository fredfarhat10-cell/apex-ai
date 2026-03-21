import { type NextRequest, NextResponse } from "next/server"
import { LegacyCloneEngine } from "@/lib/legacy-clone-engine"

export async function POST(request: NextRequest) {
  try {
    const { userDNA, cloneDNA } = await request.json()

    if (!userDNA || !cloneDNA) {
      return NextResponse.json({ error: "Both DNAs are required" }, { status: 400 })
    }

    const comparison = LegacyCloneEngine.compareDNA(userDNA, cloneDNA)

    return NextResponse.json({ comparison })
  } catch (error) {
    console.error("Error comparing DNAs:", error)
    return NextResponse.json({ error: "Failed to compare DNAs" }, { status: 500 })
  }
}
