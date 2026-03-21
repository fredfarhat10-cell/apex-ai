export type AuraState = 'Neutral' | 'Focused' | 'Creative' | 'Stressed' | 'Energized' | 'Tired';

export interface UserProfile {
  name: string;
  occupation: string;
  skills: string[];
  interests: string[];
  financialRiskStyle: 'Conservative' | 'Moderate' | 'Aggressive';
  aiPersona: 'Collaborator' | 'Coach' | 'Oracle';
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string; // ISO string
}

export interface Reminder {
  id: string;
  text: string;
  dueDate: string; // ISO string
  completed: boolean;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  summary?: string;
  createdAt: string; // ISO string
}

export interface Habit {
  id: string;
  name: string;
  goal: string; // e.g., 'Do 5 times a week'
  createdAt: string; // ISO string
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // 'YYYY-MM-DD'
  completed: boolean;
}

export interface WardrobeItem {
  id: string;
  name: string;
  prompt: string;
  imageUrl: string; // base64 data URL
  createdAt: string; // ISO string
}

export interface SymbiontEvent {
  id: string;
  text: string;
  timestamp: string; // ISO string
}

export interface PrimePathStep {
  title: string;
  description: string;
}

export interface FinancialSimulationResult {
  strategy: 'Conservative' | 'Moderate' | 'Aggressive' | 'Error';
  projectedValue: number;
  description: string;
}

// --- Life Echo Simulator Types ---
export interface EchoPathImpact {
  dimension: 'Wellness' | 'Productivity' | 'Finances' | 'Habits' | 'Other';
  change: string; // e.g., "+20%", "-$500", "New skill acquired"
  direction: 'positive' | 'negative' | 'neutral';
}

export interface EchoPath {
  title: string;
  probability: number; // e.g., 70 for 70%
  description: string;
  impacts: EchoPathImpact[];
  grounding: string; // AI's justification for this path based on user data
}

export interface LifeSimulation {
  decision: string;
  paths: EchoPath[];
}
// --- End Simulator Types ---


export interface AppState {
  userProfile: UserProfile | null;
  strategicGoal: string;
  primePath: PrimePathStep[];
  expenses: Expense[];
  reminders: Reminder[];
  knowledgeItems: KnowledgeItem[];
  habits: Habit[];
  habitLogs: HabitLog[];
  wardrobe: WardrobeItem[];
  symbiontFeed: SymbiontEvent[];
  insights: { [key: string]: string };
  appBackground: string | null;
  aura: AuraState;
}

// Initial state for a new vault
export const initialAppState: AppState = {
  userProfile: null,
  strategicGoal: '',
  primePath: [],
  expenses: [],
  reminders: [],
  knowledgeItems: [],
  habits: [],
  habitLogs: [],
  wardrobe: [],
  symbiontFeed: [],
  insights: {},
  appBackground: null,
  aura: 'Neutral',
};
