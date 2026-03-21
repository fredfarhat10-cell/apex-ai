import { create } from "zustand"
import { persist } from "zustand/middleware"

// ======== TYPES ========

export type CoachingVoice = "drill-sergeant" | "coach" | "data-nerd" | "friend" | "silent"
export type GoalCategory = "fitness" | "focus" | "life"
export type HabitStatus = "pending" | "verified" | "partial" | "rest-day"
export type ChallengeStatus = "active" | "upcoming" | "completed"
export type PodRole = "coach" | "competitor" | "collaborator"

export interface UserProfile {
  id: string
  name: string
  avatar: string
  coachingVoice: CoachingVoice
  goalCategory: GoalCategory
  joinedAt: string
  onboardingComplete: boolean
}

export interface Habit {
  id: string
  name: string
  description: string
  category: GoalCategory
  timeWindow: string
  frequency: "daily" | "weekdays" | "custom"
  customDays?: number[]
  minDose: string
  fullDose: string
  verificationRequired: boolean
  createdAt: string
}

export interface HabitLog {
  id: string
  habitId: string
  date: string
  status: HabitStatus
  photoUrl?: string
  xpEarned: number
  creditChange: number
  note?: string
  verifiedAt?: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  rules: string[]
  startDate: string
  endDate: string
  totalDays: number
  currentDay: number
  status: ChallengeStatus
  potValue: number
  entryFee: number
  participants: ChallengeParticipant[]
  category: GoalCategory
}

export interface ChallengeParticipant {
  id: string
  name: string
  avatar: string
  completionRate: number
  rank: number
  daysCompleted: number
}

export interface Pod {
  id: string
  name: string
  members: PodMember[]
  sharedStreak: number
  todayCompleted: number
  todayTotal: number
  createdAt: string
}

export interface PodMember {
  id: string
  name: string
  avatar: string
  role: PodRole
  todayComplete: boolean
  streak: number
  online: boolean
}

export interface ActivityItem {
  id: string
  userId: string
  userName: string
  userAvatar: string
  action: string
  timestamp: string
  type: "completion" | "streak" | "challenge" | "comeback" | "pod"
}

export interface ChatMessage {
  id: string
  role: "user" | "coach"
  content: string
  timestamp: string
  quickAction?: string
}

export interface WeekDay {
  day: string
  date: number
  isToday: boolean
  status: HabitStatus | "none"
}

export interface DailyStats {
  date: string
  completed: number
  total: number
  consistency: number
}

// ======== STORE ========

interface MomentumState {
  // User
  user: UserProfile | null
  setUser: (user: UserProfile) => void
  updateCoachingVoice: (voice: CoachingVoice) => void

  // Habits
  habits: Habit[]
  habitLogs: HabitLog[]
  addHabit: (habit: Habit) => void
  logHabit: (log: HabitLog) => void

  // Streaks & Credits
  currentStreak: number
  habitCredit: number
  consistencyRate: number
  totalXP: number
  setStreak: (n: number) => void
  setHabitCredit: (n: number) => void

  // Challenges
  challenges: Challenge[]
  activeChallenge: Challenge | null
  setActiveChallenge: (c: Challenge | null) => void

  // Pod
  pod: Pod | null
  setPod: (p: Pod | null) => void

  // Chat
  chatMessages: ChatMessage[]
  addChatMessage: (msg: ChatMessage) => void

  // Activity
  activityFeed: ActivityItem[]

  // Comeback
  comebackActive: boolean
  setComebackActive: (v: boolean) => void
  lastActiveDate: string | null
  setLastActiveDate: (d: string) => void

  // Navigation
  activeTab: string
  setActiveTab: (tab: string) => void

  // Onboarding
  onboardingStep: number
  setOnboardingStep: (step: number) => void
  completeOnboarding: () => void

  // Verification
  verifyingHabitId: string | null
  setVerifyingHabitId: (id: string | null) => void

  // XP Multiplier (variable reward)
  xpMultiplier: number
  rollXpMultiplier: () => void
}

// Demo data generators
const generateDemoHabits = (): Habit[] => [
  {
    id: "h1",
    name: "Morning Stretch",
    description: "5-minute stretch routine to start the day",
    category: "fitness",
    timeWindow: "6:00 AM - 8:00 AM",
    frequency: "daily",
    minDose: "5 min stretch",
    fullDose: "15 min yoga flow",
    verificationRequired: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "h2",
    name: "Deep Work Block",
    description: "Focused work with no distractions",
    category: "focus",
    timeWindow: "9:00 AM - 11:00 AM",
    frequency: "weekdays",
    minDose: "25 min pomodoro",
    fullDose: "2 hour deep work",
    verificationRequired: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "h3",
    name: "Evening Walk",
    description: "Get outside and clear your mind",
    category: "life",
    timeWindow: "5:00 PM - 7:00 PM",
    frequency: "daily",
    minDose: "10 min walk",
    fullDose: "30 min walk",
    verificationRequired: true,
    createdAt: new Date().toISOString(),
  },
]

const generateDemoChallenge = (): Challenge => ({
  id: "c1",
  title: "21-Day Morning Movement",
  description: "Build a morning exercise habit with your community",
  rules: [
    "Complete at least 15 minutes of movement before 9 AM",
    "Submit photo/video verification daily",
    "Minimum viable: 5 minutes counts as partial credit",
    "2 rest days allowed (use Habit Credits)",
  ],
  startDate: "2026-03-15",
  endDate: "2026-04-05",
  totalDays: 21,
  currentDay: 7,
  status: "active",
  potValue: 235,
  entryFee: 10,
  category: "fitness",
  participants: [
    { id: "p1", name: "Sarah K.", avatar: "/avatars/1.jpg", completionRate: 100, rank: 1, daysCompleted: 7 },
    { id: "p2", name: "Marcus D.", avatar: "/avatars/2.jpg", completionRate: 95, rank: 2, daysCompleted: 7 },
    { id: "p3", name: "Aisha R.", avatar: "/avatars/3.jpg", completionRate: 90, rank: 3, daysCompleted: 6 },
    { id: "p4", name: "You", avatar: "/avatars/user.jpg", completionRate: 86, rank: 4, daysCompleted: 6 },
    { id: "p5", name: "Jordan L.", avatar: "/avatars/4.jpg", completionRate: 81, rank: 5, daysCompleted: 5 },
  ],
})

const generateDemoPod = (): Pod => ({
  id: "pod1",
  name: "Morning Warriors",
  sharedStreak: 5,
  todayCompleted: 4,
  todayTotal: 6,
  createdAt: "2026-03-01",
  members: [
    { id: "m1", name: "You", avatar: "/avatars/user.jpg", role: "collaborator", todayComplete: true, streak: 12, online: true },
    { id: "m2", name: "Sarah K.", avatar: "/avatars/1.jpg", role: "coach", todayComplete: true, streak: 18, online: true },
    { id: "m3", name: "Marcus D.", avatar: "/avatars/2.jpg", role: "competitor", todayComplete: true, streak: 9, online: false },
    { id: "m4", name: "Aisha R.", avatar: "/avatars/3.jpg", role: "collaborator", todayComplete: true, streak: 14, online: true },
    { id: "m5", name: "Jordan L.", avatar: "/avatars/4.jpg", role: "competitor", todayComplete: false, streak: 6, online: false },
    { id: "m6", name: "Taylor M.", avatar: "/avatars/5.jpg", role: "collaborator", todayComplete: false, streak: 3, online: false },
  ],
})

const generateDemoActivity = (): ActivityItem[] => [
  { id: "a1", userId: "m2", userName: "Sarah K.", userAvatar: "/avatars/1.jpg", action: "completed Morning Stretch", timestamp: "8 min ago", type: "completion" },
  { id: "a2", userId: "m3", userName: "Marcus D.", userAvatar: "/avatars/2.jpg", action: "crushed his workout", timestamp: "23 min ago", type: "completion" },
  { id: "a3", userId: "m4", userName: "Aisha R.", userAvatar: "/avatars/3.jpg", action: "hit a 14-day streak!", timestamp: "1h ago", type: "streak" },
  { id: "a4", userId: "m1", userName: "You", userAvatar: "/avatars/user.jpg", action: "entered 21-Day Morning Movement", timestamp: "2h ago", type: "challenge" },
  { id: "a5", userId: "m5", userName: "Jordan L.", userAvatar: "/avatars/4.jpg", action: "completed a comeback sprint!", timestamp: "3h ago", type: "comeback" },
]

export const useMomentumStore = create<MomentumState>()(
  persist(
    (set, get) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),
      updateCoachingVoice: (voice) =>
        set((s) => s.user ? { user: { ...s.user, coachingVoice: voice } } : {}),

      // Habits
      habits: generateDemoHabits(),
      habitLogs: [],
      addHabit: (habit) => set((s) => ({ habits: [...s.habits, habit] })),
      logHabit: (log) =>
        set((s) => ({
          habitLogs: [...s.habitLogs, log],
          totalXP: s.totalXP + log.xpEarned,
          habitCredit: s.habitCredit + log.creditChange,
        })),

      // Streaks
      currentStreak: 12,
      habitCredit: 3,
      consistencyRate: 87,
      totalXP: 2450,
      setStreak: (n) => set({ currentStreak: n }),
      setHabitCredit: (n) => set({ habitCredit: n }),

      // Challenges
      challenges: [generateDemoChallenge()],
      activeChallenge: generateDemoChallenge(),
      setActiveChallenge: (c) => set({ activeChallenge: c }),

      // Pod
      pod: generateDemoPod(),
      setPod: (p) => set({ pod: p }),

      // Chat
      chatMessages: [
        {
          id: "welcome",
          role: "coach",
          content: "Hey! I'm your Momentum coach. I'm here to help you stay on track — not to judge, just to support. What's on your mind?",
          timestamp: new Date().toISOString(),
        },
      ],
      addChatMessage: (msg) =>
        set((s) => ({ chatMessages: [...s.chatMessages, msg] })),

      // Activity
      activityFeed: generateDemoActivity(),

      // Comeback
      comebackActive: false,
      setComebackActive: (v) => set({ comebackActive: v }),
      lastActiveDate: new Date().toISOString(),
      setLastActiveDate: (d) => set({ lastActiveDate: d }),

      // Navigation
      activeTab: "home",
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Onboarding
      onboardingStep: 0,
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      completeOnboarding: () =>
        set((s) => ({
          onboardingStep: 4,
          user: s.user ? { ...s.user, onboardingComplete: true } : null,
        })),

      // Verification
      verifyingHabitId: null,
      setVerifyingHabitId: (id) => set({ verifyingHabitId: id }),

      // XP Multiplier
      xpMultiplier: 1,
      rollXpMultiplier: () => {
        const roll = Math.random()
        const multiplier = roll < 0.6 ? 1 : roll < 0.85 ? 2 : 5
        set({ xpMultiplier: multiplier })
      },
    }),
    {
      name: "momentum-storage",
      partialize: (state) => ({
        user: state.user,
        habits: state.habits,
        habitLogs: state.habitLogs,
        currentStreak: state.currentStreak,
        habitCredit: state.habitCredit,
        consistencyRate: state.consistencyRate,
        totalXP: state.totalXP,
        chatMessages: state.chatMessages,
        comebackActive: state.comebackActive,
        lastActiveDate: state.lastActiveDate,
        onboardingStep: state.onboardingStep,
      }),
    }
  )
)
