export interface CareerQuest {
  id: string
  title: string
  description: string
  targetRole?: string
  targetCompany?: string
  targetSalary?: number
  deadline?: Date
  status: "active" | "completed" | "paused"
  progress: number
  createdAt: Date
  updatedAt: Date
}

export interface SkillGap {
  skill: string
  currentLevel: "none" | "beginner" | "intermediate" | "advanced" | "expert"
  requiredLevel: "beginner" | "intermediate" | "advanced" | "expert"
  priority: "low" | "medium" | "high" | "critical"
  learningResources?: string[]
}

export interface NetworkingOpportunity {
  type: "connection" | "event" | "community" | "mentor"
  title: string
  description: string
  potentialValue: "low" | "medium" | "high"
  actionRequired: string
  deadline?: Date
}

export interface ProfessionalCapital {
  skills: {
    technical: string[]
    soft: string[]
    leadership: string[]
  }
  network: {
    totalConnections: number
    industryBreakdown: Record<string, number>
    keyContacts: string[]
  }
  productivity: {
    tasksCompleted: number
    completionRate: number
    projectsActive: number
    performanceRating: "needs-improvement" | "on-track" | "exceeding"
  }
}

export interface QuarterlyCareerReview {
  id: string
  userId: string
  quarter: string // e.g., "Q1 2024"
  careerQuest: string
  professionalCapital: ProfessionalCapital
  skillGaps: SkillGap[]
  networkingOpportunities: NetworkingOpportunity[]
  actionPlan: {
    skillDevelopmentQuest: {
      title: string
      description: string
      milestones: string[]
      estimatedDuration: string
    }
    networkingAction: {
      title: string
      description: string
      steps: string[]
      deadline: Date
    }
  }
  budgetRequired?: number
  timeCommitment: string // e.g., "5 hours/week"
  createdAt: Date
}
