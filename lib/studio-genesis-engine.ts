import { openDB, type DBSchema, type IDBPDatabase } from "idb"
import type { Studio, StudioModule } from "./types/studio"
import { getTemplateForInterest } from "./studio-templates"
import { ContentAggregator } from "./content-aggregator"
import { AestheticEngine } from "./aesthetic-engine"

interface StudioDB extends DBSchema {
  studios: {
    key: string
    value: Studio
    indexes: { "by-user": string; "by-type": string }
  }
}

export class StudioGenesisEngine {
  private db: IDBPDatabase<StudioDB> | null = null
  private contentAggregator: ContentAggregator
  private aestheticEngine: AestheticEngine

  constructor() {
    this.contentAggregator = new ContentAggregator()
    this.aestheticEngine = new AestheticEngine()
  }

  async init() {
    this.db = await openDB<StudioDB>("apex-studios-db", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("studios")) {
          const store = db.createObjectStore("studios", { keyPath: "id" })
          store.createIndex("by-user", "userId")
          store.createIndex("by-type", "type")
        }
      },
    })

    await this.aestheticEngine.init()
  }

  /**
   * Auto-generate Studios from user interests
   */
  async generateStudios(
    userId: string,
    interests: Array<{ name: string; skillLevel: string }>,
    conversationText: string,
  ): Promise<Studio[]> {
    const studios: Studio[] = []

    // Build aesthetic profile
    const aestheticProfile = await this.aestheticEngine.buildProfileFromConversation(userId, conversationText)

    // Generate a Studio for each interest
    for (const interest of interests) {
      const studio = await this.createStudio(userId, interest.name, interest.skillLevel, aestheticProfile)
      studios.push(studio)
    }

    return studios
  }

  /**
   * Create a single Studio
   */
  private async createStudio(
    userId: string,
    interest: string,
    skillLevel: string,
    aestheticProfile: any,
  ): Promise<Studio> {
    // Get appropriate template
    const template = getTemplateForInterest(interest)

    // Find background image using aesthetic engine
    let backgroundImage = "/placeholder.svg?height=1080&width=1920"
    try {
      const pin = await this.aestheticEngine.findStudioBackground(interest, aestheticProfile)
      backgroundImage = pin.imageUrl
    } catch (error) {
      console.error("Failed to find background image:", error)
    }

    // Aggregate content from APIs
    const content = await this.contentAggregator.aggregateContent(interest, skillLevel)

    // Build modules from content
    const modules: StudioModule[] = []

    // Add video modules
    if (content.videos.length > 0) {
      modules.push({
        id: `${interest}-videos`,
        type: "video",
        title: "Recommended Videos",
        description: "Curated tutorials and guides",
        content: content.videos.slice(0, 5),
        source: "youtube",
      })
    }

    // Add audio modules
    if (content.playlists.length > 0) {
      modules.push({
        id: `${interest}-playlists`,
        type: "audio",
        title: "Motivation Playlists",
        description: "Music to fuel your practice",
        content: content.playlists.slice(0, 3),
        source: "spotify",
      })
    }

    // Add image modules
    if (content.images.length > 0) {
      modules.push({
        id: `${interest}-images`,
        type: "image",
        title: "Inspiration Gallery",
        description: "Visual inspiration for your journey",
        content: content.images.slice(0, 8),
        source: "unsplash",
      })
    }

    // Add article modules
    if (content.articles.length > 0) {
      modules.push({
        id: `${interest}-articles`,
        type: "article",
        title: "Latest News & Articles",
        description: "Stay updated with the latest",
        content: content.articles.slice(0, 5),
        source: "news",
      })
    }

    // Add tracker module
    modules.push({
      id: `${interest}-tracker`,
      type: "tracker",
      title: "Progress Tracker",
      description: "Log your sessions and track improvement",
      content: null,
      source: "internal",
    })

    const studio: Studio = {
      id: `${userId}-${interest.toLowerCase().replace(/\s+/g, "-")}`,
      userId,
      name: interest,
      type: template.type,
      interest,
      skillLevel: skillLevel as any,
      backgroundImage,
      createdAt: new Date(),
      modules,
      progress: {
        sessionsLogged: 0,
        totalTimeMinutes: 0,
        milestones: this.generateMilestones(interest, skillLevel),
        skillProgression: 0,
      },
    }

    // Save to database
    await this.saveStudio(studio)

    return studio
  }

  private generateMilestones(interest: string, skillLevel: string): any[] {
    const milestones = [
      {
        id: "first-session",
        title: "First Session",
        description: `Complete your first ${interest} session`,
        achieved: false,
      },
      {
        id: "10-sessions",
        title: "Consistent Practice",
        description: "Log 10 sessions",
        achieved: false,
      },
      {
        id: "30-days",
        title: "30-Day Streak",
        description: "Practice for 30 consecutive days",
        achieved: false,
      },
      {
        id: "skill-up",
        title: "Level Up",
        description: `Advance to ${skillLevel === "beginner" ? "intermediate" : "advanced"} level`,
        achieved: false,
      },
    ]

    return milestones
  }

  async saveStudio(studio: Studio) {
    if (!this.db) await this.init()
    await this.db!.put("studios", studio)
  }

  async getStudiosByUser(userId: string): Promise<Studio[]> {
    if (!this.db) await this.init()
    return await this.db!.getAllFromIndex("studios", "by-user", userId)
  }

  async getStudio(studioId: string): Promise<Studio | null> {
    if (!this.db) await this.init()
    return (await this.db!.get("studios", studioId)) || null
  }

  async logSession(studioId: string, durationMinutes: number) {
    const studio = await this.getStudio(studioId)
    if (!studio) return

    studio.progress.sessionsLogged++
    studio.progress.totalTimeMinutes += durationMinutes
    studio.progress.lastSession = new Date()

    // Check milestones
    if (studio.progress.sessionsLogged === 1) {
      const milestone = studio.progress.milestones.find((m) => m.id === "first-session")
      if (milestone) {
        milestone.achieved = true
        milestone.achievedAt = new Date()
      }
    }

    if (studio.progress.sessionsLogged === 10) {
      const milestone = studio.progress.milestones.find((m) => m.id === "10-sessions")
      if (milestone) {
        milestone.achieved = true
        milestone.achievedAt = new Date()
      }
    }

    // Update skill progression
    studio.progress.skillProgression = Math.min(studio.progress.sessionsLogged * 2, 100)

    await this.saveStudio(studio)
  }
}
