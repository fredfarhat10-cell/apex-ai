import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get("image") as File

    if (!imageFile) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    // Convert image to base64
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString("base64")
    const mimeType = imageFile.type

    // Use OpenAI Vision API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image and provide: 1) A detailed description, 2) List of objects/items visible, 3) Any text present, 4) Dominant colors, 5) Relevant tags. Return as JSON with keys: description, objects (array with name and confidence), text, colors (array with color and percentage), tags (array of strings).",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        response_format: { type: "json_object" },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] Vision API error:", error)
      return NextResponse.json({ error: "Image analysis failed" }, { status: response.status })
    }

    const data = await response.json()
    const analysis = JSON.parse(data.choices[0].message.content)

    // Add metadata
    const metadata = {
      width: 0,
      height: 0,
      format: imageFile.type,
      size: imageFile.size,
    }

    return NextResponse.json({
      ...analysis,
      metadata,
    })
  } catch (error) {
    console.error("[v0] Image analysis error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
