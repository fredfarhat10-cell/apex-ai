import { type NextRequest, NextResponse } from "next/server"
import { LegacyCloneEngine } from "@/lib/legacy-clone-engine"

export async function POST(request: NextRequest) {
  try {
    const { dna, requireAccessCode, expiresInDays } = await request.json()

    if (!dna) {
      return NextResponse.json({ error: "DNA is required" }, { status: 400 })
    }

    const share = await LegacyCloneEngine.createShare(dna, {
      requireAccessCode,
      expiresInDays,
    })

    return NextResponse.json({ share })
  } catch (error) {
    console.error("Error creating share:", error)
    return NextResponse.json({ error: "Failed to create share link" }, { status: 500 })
  }
}
