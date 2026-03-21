import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid text input" }, { status: 400 })
    }

    // Use OpenAI embeddings API
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] OpenAI API error:", error)
      return NextResponse.json({ error: "Failed to generate embedding" }, { status: response.status })
    }

    const data = await response.json()
    const embedding = data.data[0].embedding

    return NextResponse.json({ embedding })
  } catch (error) {
    console.error("[v0] Embedding generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
