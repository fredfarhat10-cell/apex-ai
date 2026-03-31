import type { NLUResult, Entity, Intent, Sentiment } from "./types/nlu"

/**
 * Process text through the NLU pipeline using OpenAI
 */
export async function processNLU(text: string): Promise<NLUResult> {
  try {
    const response = await fetch("/api/nlu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      throw new Error(`NLU API error: ${response.statusText}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("[v0] NLU processing failed:", error)
    throw error
  }
}

/**
 * Extract entities from text using pattern matching (fallback)
 */
export function extractEntitiesLocal(text: string): Entity[] {
  const entities: Entity[] = []

  // Email pattern
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  let match
  while ((match = emailRegex.exec(text)) !== null) {
    entities.push({
      type: "email",
      value: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      confidence: 0.95,
    })
  }

  // Phone pattern (simple US format)
  const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g
  while ((match = phoneRegex.exec(text)) !== null) {
    entities.push({
      type: "phone",
      value: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      confidence: 0.9,
    })
  }

  // URL pattern
  const urlRegex = /https?:\/\/[^\s]+/g
  while ((match = urlRegex.exec(text)) !== null) {
    entities.push({
      type: "url",
      value: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      confidence: 0.95,
    })
  }

  // Money pattern
  const moneyRegex = /\$\d+(?:,\d{3})*(?:\.\d{2})?/g
  while ((match = moneyRegex.exec(text)) !== null) {
    entities.push({
      type: "money",
      value: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      confidence: 0.9,
    })
  }

  // Date pattern (simple)
  const dateRegex = /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g
  while ((match = dateRegex.exec(text)) !== null) {
    entities.push({
      type: "date",
      value: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      confidence: 0.85,
    })
  }

  return entities
}

/**
 * Classify intent using keyword matching (fallback)
 */
export function classifyIntentLocal(text: string): Intent[] {
  const intents: Intent[] = []
  const lowerText = text.toLowerCase()

  const intentPatterns = [
    { name: "schedule", keywords: ["schedule", "calendar", "appointment", "meeting", "book"], confidence: 0.8 },
    { name: "reminder", keywords: ["remind", "reminder", "don't forget", "remember"], confidence: 0.85 },
    { name: "search", keywords: ["search", "find", "look for", "show me"], confidence: 0.8 },
    { name: "create", keywords: ["create", "make", "add", "new"], confidence: 0.75 },
    { name: "delete", keywords: ["delete", "remove", "cancel"], confidence: 0.8 },
    { name: "update", keywords: ["update", "change", "modify", "edit"], confidence: 0.75 },
    { name: "question", keywords: ["what", "when", "where", "who", "why", "how"], confidence: 0.7 },
    { name: "greeting", keywords: ["hello", "hi", "hey", "good morning", "good evening"], confidence: 0.9 },
    { name: "help", keywords: ["help", "assist", "support", "guide"], confidence: 0.85 },
  ]

  for (const pattern of intentPatterns) {
    const matchCount = pattern.keywords.filter((keyword) => lowerText.includes(keyword)).length
    if (matchCount > 0) {
      intents.push({
        name: pattern.name,
        confidence: pattern.confidence * (matchCount / pattern.keywords.length),
      })
    }
  }

  return intents.sort((a, b) => b.confidence - a.confidence).slice(0, 3)
}

/**
 * Analyze sentiment using keyword matching (fallback)
 */
export function analyzeSentimentLocal(text: string): Sentiment {
  const lowerText = text.toLowerCase()

  const positiveWords = [
    "good",
    "great",
    "excellent",
    "amazing",
    "wonderful",
    "fantastic",
    "love",
    "happy",
    "excited",
    "perfect",
    "awesome",
    "brilliant",
  ]
  const negativeWords = [
    "bad",
    "terrible",
    "awful",
    "horrible",
    "hate",
    "sad",
    "angry",
    "frustrated",
    "disappointed",
    "poor",
    "worst",
  ]

  let positiveCount = 0
  let negativeCount = 0

  for (const word of positiveWords) {
    if (lowerText.includes(word)) positiveCount++
  }

  for (const word of negativeWords) {
    if (lowerText.includes(word)) negativeCount++
  }

  const total = positiveCount + negativeCount
  if (total === 0) {
    return { label: "neutral", score: 0, confidence: 0.6 }
  }

  const score = (positiveCount - negativeCount) / total

  if (score > 0.2) {
    return { label: "positive", score, confidence: 0.7 + positiveCount * 0.05 }
  } else if (score < -0.2) {
    return { label: "negative", score, confidence: 0.7 + negativeCount * 0.05 }
  } else {
    return { label: "neutral", score, confidence: 0.65 }
  }
}

/**
 * Extract keywords from text
 */
export function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "he",
    "in",
    "is",
    "it",
    "its",
    "of",
    "on",
    "that",
    "the",
    "to",
    "was",
    "will",
    "with",
  ])

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word))

  const wordFreq: Record<string, number> = {}
  for (const word of words) {
    wordFreq[word] = (wordFreq[word] || 0) + 1
  }

  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word)
}
