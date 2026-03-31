import { openDB, type DBSchema, type IDBPDatabase } from "idb"
import type { UserAestheticProfile, StyleModifier, PinterestPin, AestheticQuery, StyleChoice } from "./types/aesthetic"
import { NLUStyleAnalyzer } from "./nlu-style-analyzer"
import { PinterestAPI } from "./pinterest-api"

interface AestheticDB extends DBSchema {
  aestheticProfiles: {
    key: string
    value: UserAestheticProfile
  }
  studioBackgrounds: {
    key: string
    value: {
      studioId: string
      interest: string
      selectedPin: PinterestPin
      timestamp: Date
    }
  }
}

export class AestheticEngine {
  private db: IDBPDatabase<AestheticDB> | null = null
  private styleAnalyzer: NLUStyleAnalyzer
  private pinterestAPI: PinterestAPI

  constructor() {
    this.styleAnalyzer = new NLUStyleAnalyzer()
    this.pinterestAPI = new PinterestAPI()
  }

  async init() {
    this.db = await openDB<AestheticDB>("apex-aesthetic-db", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("aestheticProfiles")) {
          db.createObjectStore("aestheticProfiles", { keyPath: "userId" })
        }
        if (!db.objectStoreNames.contains("studioBackgrounds")) {
          db.createObjectStore("studioBackgrounds", { keyPath: "studioId" })
        }
      },
    })
  }

  /**
   * Build aesthetic profile from onboarding conversation
   */
  async buildProfileFromConversation(userId: string, conversationText: string): Promise<UserAestheticProfile> {
    // Extract style modifiers using both pattern matching and AI
    const patternModifiers = this.styleAnalyzer.extractStyleModifiers(conversationText)
    const aiModifiers = await this.styleAnalyzer.analyzeWithAI(conversationText)

    // Merge and deduplicate modifiers
    const allModifiers = [...patternModifiers, ...aiModifiers]
    const uniqueModifiers = this.deduplicateModifiers(allModifiers)

    // Extract preferred colors and moods
    const preferredColors = uniqueModifiers.filter((m) => m.category === "color").map((m) => m.term)

    const preferredMoods = uniqueModifiers.filter((m) => m.category === "mood").map((m) => m.term)

    // Calculate overall confidence score
    const confidenceScore = this.calculateOverallConfidence(uniqueModifiers)

    const profile: UserAestheticProfile = {
      userId,
      styleModifiers: uniqueModifiers,
      preferredColors,
      preferredMoods,
      confirmedStyles: [],
      confidenceScore,
      lastUpdated: new Date(),
    }

    // Save to database
    await this.saveProfile(profile)

    return profile
  }

  /**
   * Build aesthetic query for Pinterest search
   */
  buildAestheticQuery(interest: string, profile: UserAestheticProfile, skillLevel?: string): AestheticQuery {
    // Get top style modifiers
    const topModifiers = profile.styleModifiers.slice(0, 3).map((m) => m.term)

    // Construct search query
    const queryParts = [...topModifiers, interest, "aesthetic"]

    if (skillLevel) {
      queryParts.push(skillLevel)
    }

    return {
      interest,
      styleModifiers: topModifiers,
      skillLevel,
      searchQuery: queryParts.join(" "),
    }
  }

  /**
   * Find perfect background image for a Studio
   */
  async findStudioBackground(interest: string, profile: UserAestheticProfile): Promise<PinterestPin> {
    // Build search query
    const query = this.buildAestheticQuery(interest, profile)

    // Search Pinterest
    const pins = await this.pinterestAPI.searchPins(query.searchQuery, 10)

    if (pins.length === 0) {
      throw new Error("No pins found for query")
    }

    // Select best pin based on engagement score
    const bestPin = pins.reduce((best, current) => (current.engagementScore > best.engagementScore ? current : best))

    return bestPin
  }

  /**
   * Get style choices for low-confidence scenarios
   */
  async getStyleChoices(interest: string): Promise<StyleChoice[]> {
    const styles: StyleChoice[] = [
      {
        id: "modern-minimal",
        name: "Modern & Minimal",
        description: "Clean lines, neutral colors, contemporary feel",
        imageUrl: "",
        keywords: ["modern", "minimalist", "clean", "neutral"],
      },
      {
        id: "vibrant-energetic",
        name: "Vibrant & Energetic",
        description: "Bold colors, dynamic compositions, high energy",
        imageUrl: "",
        keywords: ["vibrant", "energetic", "bold", "colorful"],
      },
      {
        id: "natural-organic",
        name: "Natural & Organic",
        description: "Earth tones, natural textures, calming atmosphere",
        imageUrl: "",
        keywords: ["natural", "organic", "calm", "earthy"],
      },
    ]

    // Fetch sample images for each style
    for (const style of styles) {
      const query = `${interest} ${style.keywords.join(" ")} aesthetic`
      const pins = await this.pinterestAPI.searchPins(query, 1)
      if (pins.length > 0) {
        style.imageUrl = pins[0].imageUrl
      }
    }

    return styles
  }

  /**
   * Update profile with confirmed style choice
   */
  async confirmStyleChoice(userId: string, styleChoice: StyleChoice) {
    const profile = await this.getProfile(userId)
    if (!profile) return

    // Add confirmed style keywords as modifiers
    const newModifiers: StyleModifier[] = styleChoice.keywords.map((keyword) => ({
      term: keyword,
      category: "style",
      confidence: 1.0, // User confirmed, so high confidence
    }))

    profile.styleModifiers = [...profile.styleModifiers, ...newModifiers]
    profile.confirmedStyles.push(styleChoice.id)
    profile.confidenceScore = Math.min(profile.confidenceScore + 0.3, 1.0)
    profile.lastUpdated = new Date()

    await this.saveProfile(profile)
  }

  // Helper methods

  private deduplicateModifiers(modifiers: StyleModifier[]): StyleModifier[] {
    const seen = new Map<string, StyleModifier>()

    for (const modifier of modifiers) {
      const existing = seen.get(modifier.term)
      if (!existing || modifier.confidence > existing.confidence) {
        seen.set(modifier.term, modifier)
      }
    }

    return Array.from(seen.values())
  }

  private calculateOverallConfidence(modifiers: StyleModifier[]): number {
    if (modifiers.length === 0) return 0

    const avgConfidence = modifiers.reduce((sum, m) => sum + m.confidence, 0) / modifiers.length
    const countBonus = Math.min(modifiers.length * 0.05, 0.3)

    return Math.min(avgConfidence + countBonus, 1.0)
  }

  private async saveProfile(profile: UserAestheticProfile) {
    if (!this.db) await this.init()
    await this.db!.put("aestheticProfiles", profile)
  }

  async getProfile(userId: string): Promise<UserAestheticProfile | null> {
    if (!this.db) await this.init()
    return (await this.db!.get("aestheticProfiles", userId)) || null
  }

  async saveStudioBackground(studioId: string, interest: string, pin: PinterestPin) {
    if (!this.db) await this.init()
    await this.db!.put("studioBackgrounds", {
      studioId,
      interest,
      selectedPin: pin,
      timestamp: new Date(),
    })
  }
}
