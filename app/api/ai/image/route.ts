export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return Response.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    // Use placeholder for now since Gemini doesn't generate images directly
    // In production, you'd integrate with an image generation API
    const imageUrl = `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(prompt)}`

    return Response.json({ imageUrl })
  } catch (error) {
    console.error("[v0] Image generation error:", error)
    return Response.json({ error: "Failed to generate image" }, { status: 500 })
  }
}
