export async function POST(request: Request) {
  try {
    const { frames, prompt } = await request.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return Response.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    const analysisPrompt = `Analyze these video frames and answer: ${prompt}

Provide a detailed analysis of what you observe across the frames.`

    const parts = [
      { text: analysisPrompt },
      ...frames.slice(0, 3).map((frame: string) => ({
        inline_data: {
          mime_type: "image/jpeg",
          data: frame,
        },
      })),
    ]

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
        }),
      },
    )

    const data = await response.json()
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to analyze video"

    return Response.json({ analysis })
  } catch (error) {
    console.error("[v0] Video analysis error:", error)
    return Response.json({ error: "Failed to analyze video" }, { status: 500 })
  }
}
