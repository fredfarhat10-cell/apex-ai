export async function POST(request: Request) {
  try {
    const { prompt, context, systemPrompt, userContext } = await request.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return Response.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    const enhancedContext = `${systemPrompt || "You are a helpful AI assistant."}

${userContext ? `USER CONTEXT:\n${userContext}\n` : ""}

${context ? `ADDITIONAL CONTEXT:\n${context}\n` : ""}

USER MESSAGE: ${prompt}`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: enhancedContext }],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      },
    )

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated"

    return Response.json({ text })
  } catch (error) {
    console.error("[v0] AI chat error:", error)
    return Response.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
