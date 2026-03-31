import { NextResponse } from "next/server"
import type { NLUResult } from "@/lib/types/nlu"
import { extractEntitiesLocal, classifyIntentLocal, analyzeSentimentLocal, extractKeywords } from "@/lib/nlu-pipeline"

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid text input" }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY

    // If OpenAI API key is available, use GPT for advanced NLU
    if (apiKey) {
      try {
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
                role: "system",
                content: `You are an NLU (Natural Language Understanding) system. Analyze the given text and extract:
1. Entities (people, organizations, locations, dates, times, money, numbers, emails, phones, URLs)
2. Intents (what the user wants to do)
3. Sentiment (positive, negative, neutral with score)
4. Keywords (important words)
5. Topics (main themes)

Return a JSON object with this structure:
{
  "entities": [{"type": "person", "value": "John", "confidence": 0.95}],
  "intents": [{"name": "schedule", "confidence": 0.9}],
  "sentiment": {"label": "positive", "score": 0.8, "confidence": 0.9},
  "keywords": ["meeting", "tomorrow"],
  "topics": ["scheduling"],
  "language": "en"
}`,
              },
              {
                role: "user",
                content: text,
              },
            ],
            temperature: 0.3,
            response_format: { type: "json_object" },
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const analysis = JSON.parse(data.choices[0].message.content)

          const result: NLUResult = {
            text,
            entities: analysis.entities || [],
            intents: analysis.intents || [],
            sentiment: analysis.sentiment || { label: "neutral", score: 0, confidence: 0.5 },
            keywords: analysis.keywords || [],
            topics: analysis.topics || [],
            language: analysis.language || "en",
            timestamp: new Date().toISOString(),
          }

          return NextResponse.json(result)
        }
      } catch (error) {
        console.error("[v0] OpenAI NLU failed, falling back to local processing:", error)
      }
    }

    // Fallback to local processing
    const result: NLUResult = {
      text,
      entities: extractEntitiesLocal(text),
      intents: classifyIntentLocal(text),
      sentiment: analyzeSentimentLocal(text),
      keywords: extractKeywords(text),
      topics: [],
      language: "en",
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] NLU processing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
