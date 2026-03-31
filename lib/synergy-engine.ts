import { StudioGenesisEngine } from "./studio-genesis-engine"

export class SynergyEngine {
  private genesisEngine: StudioGenesisEngine

  constructor() {
    this.genesisEngine = new StudioGenesisEngine()
  }

  async init() {
    await this.genesisEngine.init()
  }

  /**
   * Generate motivational crossover message
   */
  async generateMotivationalCrossover(userId: string): Promise<string | null> {
    const studios = await this.genesisEngine.getStudiosByUser(userId)

    if (studios.length < 2) return null

    // Find high-skill and low-skill Studios
    const sortedBySkill = studios.sort((a, b) => b.progress.skillProgression - a.progress.skillProgression)

    const highSkillStudio = sortedBySkill[0]
    const lowSkillStudio = sortedBySkill[sortedBySkill.length - 1]

    if (highSkillStudio.progress.skillProgression > 50 && lowSkillStudio.progress.skillProgression < 30) {
      return `You've made incredible progress in ${highSkillStudio.name} (${highSkillStudio.progress.skillProgression}% mastery)! That same dedication can help you excel in ${lowSkillStudio.name}. The discipline you've built transfers across all areas of your life.`
    }

    return null
  }

  /**
   * Suggest scheduling practice time
   */
  async suggestScheduling(userId: string, calendarEvents: any[]): Promise<string | null> {
    const studios = await this.genesisEngine.getStudiosByUser(userId)

    // Find Studios that haven't been practiced recently
    const now = new Date()
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

    for (const studio of studios) {
      if (!studio.progress.lastSession || new Date(studio.progress.lastSession) < threeDaysAgo) {
        // Check for free time in calendar
        const freeSlots = this.findFreeTimeSlots(calendarEvents)

        if (freeSlots.length > 0) {
          const slot = freeSlots[0]
          return `I noticed you haven't practiced ${studio.name} in a few days. You have a free hour ${slot.day} at ${slot.time}. Would you like me to block that time for practice?`
        }
      }
    }

    return null
  }

  /**
   * Connect financial data to Studio interests
   */
  async suggestFinancialEnablement(userId: string, budgetSurplus: number): Promise<string | null> {
    const studios = await this.genesisEngine.getStudiosByUser(userId)

    // Find Studios with high engagement
    const activeStudios = studios
      .filter((s) => s.progress.sessionsLogged > 5)
      .sort((a, b) => b.progress.sessionsLogged - a.progress.sessionsLogged)

    if (activeStudios.length > 0 && budgetSurplus > 100) {
      const studio = activeStudios[0]
      return `Great news! You have a budget surplus of $${budgetSurplus} this month. Since you've been so dedicated to ${studio.name} (${studio.progress.sessionsLogged} sessions!), would you like to invest in some new equipment or a lesson to take your skills to the next level?`
    }

    return null
  }

  /**
   * Generate progress-based insights
   */
  async generateProgressInsights(userId: string): Promise<string[]> {
    const studios = await this.genesisEngine.getStudiosByUser(userId)
    const insights: string[] = []

    for (const studio of studios) {
      // Check for milestones achieved
      const recentMilestones = studio.progress.milestones.filter((m) => {
        if (!m.achieved || !m.achievedAt) return false
        const daysSinceAchieved = (Date.now() - new Date(m.achievedAt).getTime()) / (1000 * 60 * 60 * 24)
        return daysSinceAchieved < 7
      })

      for (const milestone of recentMilestones) {
        insights.push(`Congratulations! You achieved "${milestone.title}" in ${studio.name}! ${milestone.description}`)
      }

      // Check for consistent practice
      if (studio.progress.sessionsLogged >= 3) {
        const avgSessionsPerWeek = studio.progress.sessionsLogged / (studio.progress.totalTimeMinutes / (60 * 24 * 7))
        if (avgSessionsPerWeek >= 3) {
          insights.push(
            `You're crushing it in ${studio.name}! You're averaging ${avgSessionsPerWeek.toFixed(1)} sessions per week. This consistency is key to mastery.`,
          )
        }
      }
    }

    return insights
  }

  private findFreeTimeSlots(calendarEvents: any[]): Array<{ day: string; time: string }> {
    // Simplified free time detection
    // In a real implementation, this would analyze the calendar more thoroughly
    return [
      { day: "tomorrow", time: "7:00 AM" },
      { day: "Wednesday", time: "6:00 PM" },
    ]
  }
}
