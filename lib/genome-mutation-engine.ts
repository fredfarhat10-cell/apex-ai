import type { LifeGenome, ParallelLife, GenomeMutation, LifeArchetype } from "./types/genome-mutation"
import type { AppState } from "./types"

export class GenomeMutationEngine {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Analyze user's current life genome and identify dominant archetype
   */
  async analyzeLifeGenome(userContext: Partial<AppState>): Promise<LifeGenome> {
    const archetypeScores = this.calculateArchetypeScores(userContext)

    // Find dominant archetype
    const currentArchetype = Object.entries(archetypeScores).reduce((a, b) => (b[1] > a[1] ? b : a))[0] as LifeArchetype

    // Extract dominant traits
    const dominantTraits = this.extractDominantTraits(currentArchetype, userContext)

    return {
      userId: this.userId,
      currentArchetype,
      archetypeDistribution: archetypeScores,
      dominantTraits,
      evolutionHistory: [],
    }
  }

  /**
   * Calculate scores for each life archetype based on user behavior
   */
  private calculateArchetypeScores(userContext: Partial<AppState>): Record<LifeArchetype, number> {
    const expenses = userContext.expenses || []
    const habits = userContext.habits || []
    const strategicGoal = userContext.strategicGoal || ""

    const scores: Record<LifeArchetype, number> = {
      Optimizer: 0,
      Explorer: 0,
      Builder: 0,
      Healer: 0,
      Connector: 0,
      Scholar: 0,
      Maverick: 0,
      Guardian: 0,
    }

    // Optimizer: Efficiency, metrics, optimization
    if (strategicGoal.toLowerCase().includes("optimize") || strategicGoal.toLowerCase().includes("efficient")) {
      scores.Optimizer += 30
    }
    if (habits.some((h) => h.name.toLowerCase().includes("track") || h.name.toLowerCase().includes("measure"))) {
      scores.Optimizer += 20
    }

    // Explorer: Travel, new experiences, variety
    const travelExpenses = expenses.filter((e) => e.category === "Travel").length
    scores.Explorer += Math.min(travelExpenses * 10, 40)

    // Builder: Creation, projects, building things
    if (strategicGoal.toLowerCase().includes("build") || strategicGoal.toLowerCase().includes("create")) {
      scores.Builder += 30
    }

    // Healer: Health, wellness, helping others
    const healthExpenses = expenses.filter((e) => e.category === "Health").length
    scores.Healer += Math.min(healthExpenses * 10, 40)
    if (habits.some((h) => h.name.toLowerCase().includes("exercise") || h.name.toLowerCase().includes("meditate"))) {
      scores.Healer += 20
    }

    // Connector: Social, networking, relationships
    if (strategicGoal.toLowerCase().includes("network") || strategicGoal.toLowerCase().includes("connect")) {
      scores.Connector += 30
    }

    // Scholar: Learning, education, knowledge
    const educationExpenses = expenses.filter((e) => e.category === "Education").length
    scores.Scholar += Math.min(educationExpenses * 10, 40)
    if (habits.some((h) => h.name.toLowerCase().includes("read") || h.name.toLowerCase().includes("learn"))) {
      scores.Scholar += 20
    }

    // Maverick: Risk-taking, unconventional, independent
    if (strategicGoal.toLowerCase().includes("risk") || strategicGoal.toLowerCase().includes("unconventional")) {
      scores.Maverick += 30
    }

    // Guardian: Stability, security, protection
    if (strategicGoal.toLowerCase().includes("save") || strategicGoal.toLowerCase().includes("secure")) {
      scores.Guardian += 30
    }

    // Normalize scores to 0-100
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0)
    if (total > 0) {
      Object.keys(scores).forEach((key) => {
        scores[key as LifeArchetype] = Math.round((scores[key as LifeArchetype] / total) * 100)
      })
    }

    return scores
  }

  /**
   * Extract dominant traits for an archetype
   */
  private extractDominantTraits(archetype: LifeArchetype, userContext: Partial<AppState>): string[] {
    const traitMap: Record<LifeArchetype, string[]> = {
      Optimizer: ["Data-driven", "Efficient", "Systematic", "Goal-oriented", "Analytical"],
      Explorer: ["Curious", "Adventurous", "Flexible", "Open-minded", "Spontaneous"],
      Builder: ["Creative", "Ambitious", "Persistent", "Visionary", "Resourceful"],
      Healer: ["Empathetic", "Nurturing", "Balanced", "Mindful", "Compassionate"],
      Connector: ["Social", "Collaborative", "Influential", "Charismatic", "Supportive"],
      Scholar: ["Intellectual", "Curious", "Disciplined", "Thoughtful", "Knowledgeable"],
      Maverick: ["Independent", "Bold", "Innovative", "Risk-taking", "Unconventional"],
      Guardian: ["Responsible", "Protective", "Stable", "Reliable", "Cautious"],
    }

    return traitMap[archetype] || []
  }

  /**
   * Generate parallel life simulations based on potential decisions
   */
  async generateParallelLives(
    currentGenome: LifeGenome,
    userContext: Partial<AppState>,
    potentialDecisions: string[],
  ): Promise<ParallelLife[]> {
    const parallelLives: ParallelLife[] = []

    // Generate current path (baseline)
    const currentPath = await this.projectCurrentPath(currentGenome, userContext)
    parallelLives.push(currentPath)

    // Generate alternative paths for each archetype
    const alternativeArchetypes: LifeArchetype[] = ["Optimizer", "Explorer", "Builder", "Healer", "Connector"]

    for (const archetype of alternativeArchetypes) {
      if (archetype !== currentGenome.currentArchetype) {
        const alternativePath = await this.projectAlternativePath(archetype, currentGenome, userContext)
        parallelLives.push(alternativePath)
      }
    }

    return parallelLives
  }

  /**
   * Project current life path based on existing trajectory
   */
  private async projectCurrentPath(genome: LifeGenome, userContext: Partial<AppState>): Promise<ParallelLife> {
    const expenses = userContext.expenses || []
    const avgMonthlyExpense = expenses.reduce((sum, e) => sum + e.amount, 0) / Math.max(expenses.length, 1)

    return {
      id: `current-${Date.now()}`,
      archetype: genome.currentArchetype,
      divergencePoint: {
        timestamp: new Date().toISOString(),
        decision: "Continue current path",
        description: "Maintain existing trajectory and habits",
      },
      projectedOutcomes: {
        career: {
          role: "Current role progression",
          satisfaction: 70,
          income: avgMonthlyExpense * 12 * 1.5, // Projected income
          growth: 65,
        },
        financial: {
          netWorth: avgMonthlyExpense * 12 * 5, // 5 years of savings
          stability: 75,
          freedom: 60,
        },
        wellness: {
          health: 70,
          energy: 65,
          longevity: 78,
        },
        relationships: {
          depth: 70,
          breadth: 50,
          satisfaction: 65,
        },
        fulfillment: {
          purpose: 60,
          impact: 55,
          legacy: 50,
        },
      },
      probability: 0.8,
      timeHorizon: "5 years",
      keyMilestones: [
        { year: 1, event: "Incremental career growth", impact: "Moderate income increase" },
        { year: 3, event: "Skill development plateau", impact: "Stable but predictable trajectory" },
        { year: 5, event: "Mid-career assessment", impact: "Reevaluate life direction" },
      ],
    }
  }

  /**
   * Project alternative life path for different archetype
   */
  private async projectAlternativePath(
    archetype: LifeArchetype,
    currentGenome: LifeGenome,
    userContext: Partial<AppState>,
  ): Promise<ParallelLife> {
    const archetypeOutcomes: Record<
      LifeArchetype,
      {
        career: Partial<ParallelLife["projectedOutcomes"]["career"]>
        financial: Partial<ParallelLife["projectedOutcomes"]["financial"]>
        wellness: Partial<ParallelLife["projectedOutcomes"]["wellness"]>
        relationships: Partial<ParallelLife["projectedOutcomes"]["relationships"]>
        fulfillment: Partial<ParallelLife["projectedOutcomes"]["fulfillment"]>
        milestones: ParallelLife["keyMilestones"]
      }
    > = {
      Optimizer: {
        career: { role: "Data Analyst → VP of Operations", satisfaction: 75, income: 180000, growth: 85 },
        financial: { netWorth: 500000, stability: 90, freedom: 70 },
        wellness: { health: 75, energy: 70, longevity: 80 },
        relationships: { depth: 60, breadth: 40, satisfaction: 65 },
        fulfillment: { purpose: 70, impact: 75, legacy: 65 },
        milestones: [
          { year: 1, event: "Implement efficiency systems", impact: "20% productivity increase" },
          { year: 3, event: "Lead optimization initiative", impact: "Promoted to senior role" },
          { year: 5, event: "Build scalable processes", impact: "Industry recognition" },
        ],
      },
      Explorer: {
        career: { role: "Digital Nomad → Global Consultant", satisfaction: 90, income: 120000, growth: 70 },
        financial: { netWorth: 250000, stability: 60, freedom: 95 },
        wellness: { health: 85, energy: 90, longevity: 82 },
        relationships: { depth: 75, breadth: 90, satisfaction: 85 },
        fulfillment: { purpose: 85, impact: 70, legacy: 75 },
        milestones: [
          { year: 1, event: "Travel to 15 countries", impact: "Expanded worldview" },
          { year: 3, event: "Build international network", impact: "Global opportunities" },
          { year: 5, event: "Publish travel memoir", impact: "Inspire others" },
        ],
      },
      Builder: {
        career: { role: "Founder → CEO of Startup", satisfaction: 85, income: 200000, growth: 95 },
        financial: { netWorth: 1000000, stability: 50, freedom: 80 },
        wellness: { health: 65, energy: 75, longevity: 76 },
        relationships: { depth: 70, breadth: 70, satisfaction: 70 },
        fulfillment: { purpose: 95, impact: 90, legacy: 85 },
        milestones: [
          { year: 1, event: "Launch MVP product", impact: "First customers acquired" },
          { year: 3, event: "Raise Series A funding", impact: "Scale team to 20" },
          { year: 5, event: "Reach profitability", impact: "Industry leader" },
        ],
      },
      Healer: {
        career: { role: "Wellness Coach → Holistic Health Director", satisfaction: 95, income: 100000, growth: 70 },
        financial: { netWorth: 300000, stability: 75, freedom: 75 },
        wellness: { health: 95, energy: 90, longevity: 85 },
        relationships: { depth: 90, breadth: 60, satisfaction: 90 },
        fulfillment: { purpose: 95, impact: 85, legacy: 80 },
        milestones: [
          { year: 1, event: "Complete certification", impact: "Help 50 clients" },
          { year: 3, event: "Open wellness center", impact: "Community impact" },
          { year: 5, event: "Publish health book", impact: "Reach thousands" },
        ],
      },
      Connector: {
        career: { role: "Community Manager → Chief Networking Officer", satisfaction: 85, income: 150000, growth: 80 },
        financial: { netWorth: 400000, stability: 80, freedom: 75 },
        wellness: { health: 75, energy: 80, longevity: 79 },
        relationships: { depth: 85, breadth: 95, satisfaction: 90 },
        fulfillment: { purpose: 85, impact: 90, legacy: 80 },
        milestones: [
          { year: 1, event: "Build 500+ network", impact: "Key introductions" },
          { year: 3, event: "Host major conference", impact: "Industry influence" },
          { year: 5, event: "Create mentorship program", impact: "Legacy building" },
        ],
      },
      Scholar: {
        career: { role: "Researcher → Thought Leader", satisfaction: 90, income: 130000, growth: 75 },
        financial: { netWorth: 350000, stability: 85, freedom: 70 },
        wellness: { health: 80, energy: 75, longevity: 81 },
        relationships: { depth: 80, breadth: 50, satisfaction: 75 },
        fulfillment: { purpose: 90, impact: 85, legacy: 90 },
        milestones: [
          { year: 1, event: "Complete advanced degree", impact: "Expert status" },
          { year: 3, event: "Publish research paper", impact: "Academic recognition" },
          { year: 5, event: "Become industry authority", impact: "Speaking engagements" },
        ],
      },
      Maverick: {
        career: { role: "Freelancer → Disruptive Innovator", satisfaction: 95, income: 250000, growth: 90 },
        financial: { netWorth: 800000, stability: 40, freedom: 100 },
        wellness: { health: 70, energy: 85, longevity: 77 },
        relationships: { depth: 65, breadth: 75, satisfaction: 75 },
        fulfillment: { purpose: 90, impact: 95, legacy: 85 },
        milestones: [
          { year: 1, event: "Break industry norms", impact: "Gain attention" },
          { year: 3, event: "Launch controversial project", impact: "Polarizing success" },
          { year: 5, event: "Redefine category", impact: "Industry transformation" },
        ],
      },
      Guardian: {
        career: { role: "Risk Manager → Chief Security Officer", satisfaction: 75, income: 160000, growth: 70 },
        financial: { netWorth: 600000, stability: 95, freedom: 65 },
        wellness: { health: 80, energy: 70, longevity: 82 },
        relationships: { depth: 85, breadth: 55, satisfaction: 80 },
        fulfillment: { purpose: 75, impact: 70, legacy: 75 },
        milestones: [
          { year: 1, event: "Build emergency fund", impact: "Financial security" },
          { year: 3, event: "Protect organization", impact: "Crisis prevention" },
          { year: 5, event: "Mentor next generation", impact: "Knowledge transfer" },
        ],
      },
    }

    const outcomes = archetypeOutcomes[archetype]

    return {
      id: `alt-${archetype}-${Date.now()}`,
      archetype,
      divergencePoint: {
        timestamp: new Date().toISOString(),
        decision: `Shift to ${archetype} archetype`,
        description: `Embrace ${archetype} traits and make aligned decisions`,
      },
      projectedOutcomes: {
        career: {
          role: outcomes.career.role || "",
          satisfaction: outcomes.career.satisfaction || 70,
          income: outcomes.career.income || 100000,
          growth: outcomes.career.growth || 70,
        },
        financial: {
          netWorth: outcomes.financial.netWorth || 300000,
          stability: outcomes.financial.stability || 70,
          freedom: outcomes.financial.freedom || 70,
        },
        wellness: {
          health: outcomes.wellness.health || 75,
          energy: outcomes.wellness.energy || 75,
          longevity: outcomes.wellness.longevity || 78,
        },
        relationships: {
          depth: outcomes.relationships.depth || 70,
          breadth: outcomes.relationships.breadth || 60,
          satisfaction: outcomes.relationships.satisfaction || 70,
        },
        fulfillment: {
          purpose: outcomes.fulfillment.purpose || 70,
          impact: outcomes.fulfillment.impact || 70,
          legacy: outcomes.fulfillment.legacy || 70,
        },
      },
      probability: 0.6,
      timeHorizon: "5 years",
      keyMilestones: outcomes.milestones,
    }
  }

  /**
   * Propose genome mutation based on detected patterns
   */
  async proposeGenomeMutation(
    currentGenome: LifeGenome,
    userContext: Partial<AppState>,
    recentDecisions: string[],
  ): Promise<GenomeMutation> {
    const parallelLives = await this.generateParallelLives(currentGenome, userContext, recentDecisions)

    // Find best alternative path
    const currentPath = parallelLives[0]
    const alternatives = parallelLives.slice(1)

    // Score each path based on overall fulfillment
    const scorePath = (path: ParallelLife): number => {
      const outcomes = path.projectedOutcomes
      return (
        outcomes.career.satisfaction * 0.2 +
        outcomes.financial.freedom * 0.15 +
        outcomes.wellness.health * 0.2 +
        outcomes.relationships.satisfaction * 0.2 +
        outcomes.fulfillment.purpose * 0.25
      )
    }

    const currentScore = scorePath(currentPath)
    const bestAlternative = alternatives.reduce((best, path) => (scorePath(path) > scorePath(best) ? path : best))

    const bestScore = scorePath(bestAlternative)

    return {
      id: `mutation-${Date.now()}`,
      timestamp: new Date().toISOString(),
      mutationType: "career",
      description: `Detected potential for ${bestAlternative.archetype} archetype shift`,
      currentPath,
      alternativePaths: alternatives,
      recommendedPath: bestScore > currentScore * 1.15 ? bestAlternative.id : currentPath.id,
      reasoning:
        bestScore > currentScore * 1.15
          ? `${bestAlternative.archetype} path shows ${Math.round(((bestScore - currentScore) / currentScore) * 100)}% higher fulfillment potential across all life domains`
          : "Current path is optimal - continue existing trajectory",
    }
  }
}
