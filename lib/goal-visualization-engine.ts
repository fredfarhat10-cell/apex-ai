import { openDB, type DBSchema, type IDBPDatabase } from "idb"
import type { GoalVisualization } from "./types/generative"
import { RunwayAPI } from "./integrations/runway"

interface GoalVizDB extends DBSchema {
  visualizations: {
    key: string
    value: GoalVisualization
    indexes: { "by-user": string; "by-goal": string }
  }
}

export class GoalVisualizationEngine {
  private db: IDBPDatabase<GoalVizDB> | null = null
  private runwayAPI: RunwayAPI

  constructor() {
    this.runwayAPI = new RunwayAPI()
  }

  async init() {
    this.db = await openDB<GoalVizDB>("apex-goal-viz-db", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("visualizations")) {
          const store = db.createObjectStore("visualizations", { keyPath: "id" })
          store.createIndex("by-user", "userId")
          store.createIndex("by-goal", "goalId")
        }
      },
    })
  }

  /**
   * Generate goal visualization
   */
  async generateVisualization(
    userId: string,
    goalId: string,
    goalData: {
      description: string
      targetDate?: Date
      details?: string[]
      userPhoto?: string
    },
  ): Promise<GoalVisualization> {
    // Build detailed prompt
    const prompt = this.buildGoalPrompt(goalData)

    // Generate image
    const content = await this.runwayAPI.generateContent("image", prompt, {
      width: 1024,
      height: 1024,
    })

    const visualization: GoalVisualization = {
      id: `viz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      goalId,
      goalDescription: goalData.description,
      imageUrl: content.url,
      prompt,
      generatedAt: new Date(),
    }

    await this.saveVisualization(visualization)

    return visualization
  }

  /**
   * Build goal visualization prompt
   */
  private buildGoalPrompt(goalData: {
    description: string
    targetDate?: Date
    details?: string[]
    userPhoto?: string
  }): string {
    let prompt = `Create a photorealistic, inspiring visualization of someone successfully achieving this goal: ${goalData.description}.`

    if (goalData.details && goalData.details.length > 0) {
      prompt += ` Include these specific details: ${goalData.details.join(", ")}.`
    }

    if (goalData.targetDate) {
      const monthYear = goalData.targetDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      prompt += ` Set in ${monthYear}.`
    }

    prompt += ` Make it feel tangible, achievable, and emotionally powerful. Use vibrant colors and dynamic composition. Show the moment of triumph and success.`

    return prompt
  }

  /**
   * Get visualizations for user
   */
  async getVisualizationsByUser(userId: string): Promise<GoalVisualization[]> {
    if (!this.db) await this.init()
    return await this.db!.getAllFromIndex("visualizations", "by-user", userId)
  }

  /**
   * Get visualizations for goal
   */
  async getVisualizationsByGoal(goalId: string): Promise<GoalVisualization[]> {
    if (!this.db) await this.init()
    return await this.db!.getAllFromIndex("visualizations", "by-goal", goalId)
  }

  private async saveVisualization(viz: GoalVisualization) {
    if (!this.db) await this.init()
    await this.db!.put("visualizations", viz)
  }
}
