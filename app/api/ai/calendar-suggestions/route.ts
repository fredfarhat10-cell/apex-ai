import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: Request) {
  try {
    const { hobbies, activities, existingEvents } = await request.json()

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `Based on these hobbies: ${hobbies.join(", ")} and activities: ${activities.join(", ")}, suggest 3 calendar events that would help the user practice and improve.
    
Current events: ${existingEvents.map((e: any) => e.title).join(", ")}

For each event, provide:
1. Title (engaging and specific)
2. Description (why this session is valuable)
3. Duration in minutes
4. Best time of day (morning/afternoon/evening)
5. Category (music, art, fitness, learning, etc.)

Format as JSON array: [{"title": "...", "description": "...", "duration": 60, "timeOfDay": "morning", "category": "..."}]`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : []

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("[v0] Calendar suggestion error:", error)
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 })
  }
}
