import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: Request) {
  try {
    const { hobbies, existingActivities } = await request.json()

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `Based on these hobbies: ${hobbies.join(", ")}, suggest 3 new activities that would be engaging and meaningful. 
    
Current activities: ${existingActivities.join(", ")}

For each activity, provide:
1. Name (short, engaging)
2. Category (music, art, fitness, learning, etc.)
3. Description (one sentence about why it's valuable)

Format as JSON array: [{"name": "...", "category": "...", "description": "..."}]`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : []

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("[v0] Activity suggestion error:", error)
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 })
  }
}
