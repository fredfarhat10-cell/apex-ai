import type { StyleModifier } from "./types/aesthetic"

// Style modifier patterns for extraction
const STYLE_PATTERNS = {
  color: ["vibrant", "muted", "pastel", "bold", "neutral", "monochrome", "colorful", "dark", "light", "bright"],
  mood: [
    "calm",
    "energetic",
    "peaceful",
    "intense",
    "relaxing",
    "motivating",
    "inspiring",
    "cozy",
    "professional",
    "playful",
  ],
  style: [
    "modern",
    "minimalist",
    "rustic",
    "industrial",
    "bohemian",
    "classic",
    "contemporary",
    "vintage",
    "elegant",
    "casual",
  ],
  texture: ["clean", "gritty", "smooth", "rough", "polished", "natural", "organic", "sleek", "textured"],
  era: ["retro", "futuristic", "traditional", "timeless", "trendy", "classic", "80s", "90s", "contemporary"],
}

export class NLUStyleAnalyzer {
  /**
   * Extract style modifiers from conversational text
   */
  extractStyleModifiers(text: string): StyleModifier[] {
    const modifiers: StyleModifier[] = []
    const lowerText = text.toLowerCase()

    // Check each category for matching terms
    for (const [category, terms] of Object.entries(STYLE_PATTERNS)) {
      for (const term of terms) {
        if (lowerText.includes(term)) {
          // Calculate confidence based on context
          const confidence = this.calculateConfidence(lowerText, term)

          modifiers.push({
            term,
            category: category as StyleModifier["category"],
            confidence,
          })
        }
      }
    }

    // Sort by confidence
    return modifiers.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Calculate confidence score for a style modifier
   */
  private calculateConfidence(text: string, term: string): number {
    let confidence = 0.5 // Base confidence

    // Higher confidence if term appears multiple times
    const occurrences = (text.match(new RegExp(term, "gi")) || []).length
    confidence += Math.min(occurrences * 0.1, 0.3)

    // Higher confidence if term is emphasized (e.g., "really modern", "very clean")
    const emphasizers = ["really", "very", "super", "extremely", "totally"]
    for (const emphasizer of emphasizers) {
      if (text.includes(`${emphasizer} ${term}`)) {
        confidence += 0.2
        break
      }
    }

    return Math.min(confidence, 1.0)
  }

  /**
   * Analyze text using AI for deeper style understanding
   */
  async analyzeWithAI(text: string): Promise<StyleModifier[]> {
    try {
      const response = await fetch("/api/nlu/style-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error("Style analysis failed")
      }

      const data = await response.json()
      return data.styleModifiers
    } catch (error) {
      console.error("AI style analysis error:", error)
      // Fallback to pattern-based extraction
      return this.extractStyleModifiers(text)
    }
  }
}
