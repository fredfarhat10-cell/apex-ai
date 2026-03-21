import type { HabitLog } from "./types"

export interface StreakInfo {
  habitId: string
  currentStreak: number
  longestStreak: number
  lastCompletedDate: string | null
  isActiveToday: boolean
}

export class StreakCalculator {
  // Calculate streak for a specific habit
  static calculateStreak(habitId: string, logs: HabitLog[]): StreakInfo {
    const habitLogs = logs
      .filter((log) => log.habitId === habitId && log.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    if (habitLogs.length === 0) {
      return {
        habitId,
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: null,
        isActiveToday: false,
      }
    }

    const today = new Date().toISOString().split("T")[0]
    const isActiveToday = habitLogs[0].date === today

    // Calculate current streak
    let currentStreak = 0
    const checkDate = new Date()

    // If not completed today, start from yesterday
    if (!isActiveToday) {
      checkDate.setDate(checkDate.getDate() - 1)
    }

    for (let i = 0; i < habitLogs.length; i++) {
      const logDate = habitLogs[i].date
      const expectedDate = checkDate.toISOString().split("T")[0]

      if (logDate === expectedDate) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    // Calculate longest streak
    let longestStreak = 0
    let tempStreak = 1
    let prevDate = new Date(habitLogs[0].date)

    for (let i = 1; i < habitLogs.length; i++) {
      const currentDate = new Date(habitLogs[i].date)
      const dayDiff = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))

      if (dayDiff === 1) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }

      prevDate = currentDate
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    return {
      habitId,
      currentStreak,
      longestStreak,
      lastCompletedDate: habitLogs[0].date,
      isActiveToday,
    }
  }

  // Get all streaks
  static calculateAllStreaks(habitIds: string[], logs: HabitLog[]): StreakInfo[] {
    return habitIds.map((id) => this.calculateStreak(id, logs))
  }

  // Check if user should be notified about breaking streak
  static shouldNotifyStreak(streak: StreakInfo): boolean {
    const today = new Date().toISOString().split("T")[0]
    return streak.currentStreak >= 3 && !streak.isActiveToday && streak.lastCompletedDate !== today
  }
}
