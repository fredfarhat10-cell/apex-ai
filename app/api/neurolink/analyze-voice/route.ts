import { type NextRequest, NextResponse } from "next/server"
import { NeuroLinkEngine } from "@/lib/neurolink-engine"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 })
    }

    const audioBlob = new Blob([await audioFile.arrayBuffer()], { type: audioFile.type })
    const analysis = await NeuroLinkEngine.analyzeVoice(audioBlob)

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Error analyzing voice:", error)
    return NextResponse.json({ error: "Failed to analyze voice" }, { status: 500 })
  }
}
