/**
 * Onboarding State Manager
 * Tracks progress through interactive onboarding flow
 */

export interface OnboardingState {
  step: number
  completed: boolean
  userName?: string
  tone?: "motivational" | "supportive" | "chill" | "professional"
  lifeFocus: string[]
  schedulePreference?: "daily-checkins" | "on-demand" | "not-sure"
  startedAt: string
  completedAt?: string
}

const ONBOARDING_KEY = "apex_onboarding_state"

export function getOnboardingState(): OnboardingState | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(ONBOARDING_KEY)
  if (!stored) return null
  return JSON.parse(stored)
}

export function saveOnboardingState(state: OnboardingState): void {
  if (typeof window === "undefined") return
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state))
}

export function clearOnboardingState(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(ONBOARDING_KEY)
}

export function initOnboardingState(): OnboardingState {
  return {
    step: 0,
    completed: false,
    lifeFocus: [],
    startedAt: new Date().toISOString(),
  }
}
