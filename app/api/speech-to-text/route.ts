import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    // Use OpenAI Whisper API for transcription
    const whisperFormData = new FormData()
    whisperFormData.append("file", audioFile)
    whisperFormData.append("model", "whisper-1")
    whisperFormData.append("language", "en")

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: whisperFormData,
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] Whisper API error:", error)
      return NextResponse.json({ error: "Transcription failed" }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json({
      text: data.text,
      confidence: 0.95,
      language: data.language || "en",
      duration: data.duration || 0,
    })
  } catch (error) {
    console.error("[v0] Speech-to-text error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
