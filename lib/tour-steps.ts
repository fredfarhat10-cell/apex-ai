export interface TourStep {
  target: string
  content: string
  title: string
  placement?: "top" | "bottom" | "left" | "right" | "center"
  disableBeacon?: boolean
}

export const dashboardTourSteps: TourStep[] = [
  {
    target: ".aura-indicator",
    title: "Your Aura",
    content:
      "Set your current mental state. The AI adapts all responses based on your Aura - from energized to stressed, focused to creative.",
    placement: "bottom",
  },
  {
    target: ".strategic-goal-widget",
    title: "Strategic Goal",
    content:
      "Define your north star. Everything in Apex aligns with this goal - from habit suggestions to financial simulations.",
    placement: "bottom",
  },
  {
    target: ".synapse-widget",
    title: "Synapse Insights",
    content:
      "Get AI-powered insights based on your complete data. The more you use Apex, the smarter these recommendations become.",
    placement: "left",
  },
  {
    target: ".symbiont-feed",
    title: "Symbiont Feed",
    content:
      "Your AI companion observes your actions and provides contextual commentary. It learns your patterns over time.",
    placement: "left",
  },
  {
    target: ".sidebar-nav",
    title: "Navigation",
    content:
      "Explore all modules: Financial tracking, Routines, Knowledge base, AI Stylist, Life Simulator, and more. Each module is privacy-first.",
    placement: "right",
  },
]

export const routinesTourSteps: TourStep[] = [
  {
    target: ".habits-list",
    title: "Daily Habits",
    content:
      "Track your habits with streak counting. Enable notifications to get reminders when you risk breaking a streak.",
    placement: "right",
  },
  {
    target: ".habit-architect",
    title: "AI Habit Architect",
    content: "Let AI suggest new habits aligned with your strategic goal and current lifestyle patterns.",
    placement: "left",
  },
]

export const knowledgeTourSteps: TourStep[] = [
  {
    target: ".knowledge-form",
    title: "Add Knowledge",
    content: "Store notes, ideas, and research. Everything is encrypted locally - your second brain stays private.",
    placement: "right",
  },
  {
    target: ".knowledge-list",
    title: "AI Summarization",
    content: "Use AI to summarize long notes. Export your entire knowledge base as markdown for backup.",
    placement: "left",
  },
]

export const simulatorTourSteps: TourStep[] = [
  {
    target: ".simulator-input",
    title: "Life Echo Simulator",
    content:
      "Explore potential futures by simulating decisions. AI generates multiple paths with probability scores and impact analysis.",
    placement: "bottom",
  },
  {
    target: ".simulator-export",
    title: "Export Reports",
    content: "Generate PDF reports of your simulations for reflection or sharing with mentors.",
    placement: "left",
  },
]
