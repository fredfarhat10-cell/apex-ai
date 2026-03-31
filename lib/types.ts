export type AuraState = "Neutral" | "Focused" | "Creative" | "Stressed" | "Energized" | "Tired"

export interface UserProfile {
  name: string
  occupation: string
  skills: string[]
  interests: string[]
  hobbies?: string[]
  financialRiskStyle: "Conservative" | "Moderate" | "Aggressive"
  aiPersona: "Collaborator" | "Coach" | "Oracle" | "Financial Advisor"
  country?: string
  goal?: string
}

export interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
}

export interface Reminder {
  id: string
  text: string
  dueDate: string
  dueTime?: string
  completed: boolean
  priority: "critical" | "high" | "normal" | "low"
  preReminders?: number[] // minutes before
  triggerContext?: "user_is_home" | "user_is_at_work" | "user_is_commuting" | "user_is_in_focus_mode"
}

export interface ShoppingList {
  id: string
  name: string
  items: ShoppingListItem[]
  createdAt: string
  updatedAt: string
}

export interface ShoppingListItem {
  id: string
  text: string
  completed: boolean
  addedAt: string
}

export interface KnowledgeItem {
  id: string
  title: string
  content: string
  summary?: string
  createdAt: string
}

export interface Habit {
  id: string
  name: string
  goal: string
  createdAt: string
}

export interface HabitLog {
  id: string
  habitId: string
  date: string
  completed: boolean
}

export interface WardrobeItem {
  id: string
  name: string
  prompt: string
  imageUrl: string
  createdAt: string
}

export interface SymbiontEvent {
  id: string
  text: string
  timestamp: string
}

export interface PrimePathStep {
  title: string
  description: string
}

export interface FinancialSimulationResult {
  strategy: "Conservative" | "Moderate" | "Aggressive" | "Error"
  projectedValue: number
  description: string
}

export interface EchoPathImpact {
  dimension: "Wellness" | "Productivity" | "Finances" | "Habits" | "Other"
  change: string
  direction: "positive" | "negative" | "neutral"
}

export interface EchoPath {
  title: string
  probability: number
  description: string
  impacts: EchoPathImpact[]
  grounding: string
}

export interface LifeSimulation {
  decision: string
  paths: EchoPath[]
}

export interface MoodEntry {
  id: string
  aura: AuraState
  intensity: number
  energy: number
  stress: number
  motivation: number
  timestamp: string
  notes?: string
}

export interface TrendAnalysis {
  spendingPattern: "increasing" | "decreasing" | "stable"
  habitCompletionRate: number
  productivityTrend: "improving" | "declining" | "stable"
  stressPattern: "high" | "moderate" | "low"
  recommendations: string[]
  lastUpdated: string
}

export type StudioType = "nexus" | "music" | "art" | "fitness" | "coding" | "gaming" | "reading" | "cooking"

export interface StudioPreference {
  type: StudioType
  lighting: "warm" | "cool" | "purple" | "cyan"
  intensity: number
}

export interface Activity {
  id: string
  name: string
  category: string
  studioType: StudioType
  description?: string
  createdAt: string
  completedCount: number
  lastCompleted?: string
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  category: string
  studioType?: StudioType
  color: string
  isRecurring?: boolean
  linkedActivityId?: string
  priority: "critical" | "high" | "normal" | "leisure"
}

export interface CalendarIntegration {
  id: string
  name: "Google Calendar" | "Notion" | "Apple Calendar"
  connected: boolean
  lastSync?: string
}

export interface Position {
  id: string
  ticker: string
  quantity: number
  avgCost: number
  marketValue?: number
  unrealizedPnl?: number
}

export interface Portfolio {
  positions: Position[]
}

export interface Goal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  deadline: string // ISO Date
}

export interface AdvisorReport {
  totalValue: number
  totalPnl: number
  riskLevel: "Low" | "Moderate" | "High"
  summary: string
  recommendations: string[]
}

export type ActionType =
  | "create_reminder"
  | "create_list"
  | "create_contextual_reminder"
  | "create_event"
  | "save_thought"

export interface Action {
  action_type: ActionType
  payload: Record<string, any>
}

export interface AppState {
  userProfile: UserProfile | null
  strategicGoal: string
  expenses: Expense[]
  habits: Habit[]
  habitLogs: HabitLog[]
  aura: AuraState
  moodHistory: MoodEntry[]
  trendAnalysis: TrendAnalysis | null
  portfolio: Portfolio | null
  goals: Goal[]
  reminders: Reminder[]
  shoppingLists: ShoppingList[]
  thoughts: KnowledgeItem[]
}

export const initialAppState: AppState = {
  userProfile: null,
  strategicGoal: "",
  expenses: [],
  habits: [],
  habitLogs: [],
  aura: "Neutral",
  moodHistory: [],
  trendAnalysis: null,
  portfolio: null,
  goals: [],
  reminders: [],
  shoppingLists: [],
  thoughts: [],
}
