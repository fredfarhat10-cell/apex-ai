import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Use OpenAI to extract style modifiers
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a style analysis expert. Extract aesthetic style modifiers from the user's text. 
            Categorize each modifier as: color, mood, style, texture, or era.
            Return a JSON array of objects with: term, category, confidence (0-1).
            Focus on visual and aesthetic descriptors.`,
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.3,
      }),
    })

    const data = await response.json()
    const content = data.choices[0].message.content

    // Parse the JSON response
    let styleModifiers = []
    try {
      styleModifiers = JSON.parse(content)
    } catch {
      // If parsing fails, return empty array
      styleModifiers = []
    }

    return NextResponse.json({ styleModifiers })
  } catch (error) {
    console.error("Style analysis error:", error)
    return NextResponse.json({ error: "Style analysis failed" }, { status: 500 })
  }
}
