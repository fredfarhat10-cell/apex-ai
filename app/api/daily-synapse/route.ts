import { type NextRequest, NextResponse } from "next/server"
import { WellnessOracle } from "@/lib/wellness-oracle"
import { getUserAccounts, getUserTransactions, calculateFinancialVelocity } from "@/lib/account-aggregation"

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

const mockDailySynapse = {
  date: new Date().toISOString(),
  stateOfUnion:
    "Your portfolio gained 2.3% overnight while you achieved your best sleep score this week. Today brings 4 meetings but also a 3-hour deep work window. The synergy between your wellness and productivity metrics suggests this is your moment to tackle complex challenges.",
  guildStatus: {
    financial: {
      status: "Strong",
      metric: "Portfolio +2.3% | Budget 78% utilized",
    },
    career: {
      status: "Busy",
      metric: "4 meetings scheduled | 3h deep work available",
    },
    wellness: {
      status: "Excellent",
      metric: "Sleep: 88% | Energy: High",
    },
    social: {
      status: "Active",
      metric: "2 connections pending | 3 messages",
    },
    time: {
      status: "Moderate",
      metric: "Calendar density: 65% | 5h free time",
    },
    goals: {
      status: "On Track",
      metric: "Q1 Progress: 62% | 3 milestones ahead",
    },
  },
  crossGuildInsight:
    "SYNAPSE DETECTED: Your exceptional 8.5hr sleep score (highest this month) combined with today's light meeting load (only 2 scheduled vs. your 5-meeting average) creates a rare 4-hour uninterrupted deep work window. Historical data shows you complete complex analytical tasks 3x faster on high-sleep, low-meeting days. This is your optimal window to tackle that financial model you've postponed for 2 weeks.",
  priorities: {
    topPriority:
      "Complete financial model during morning deep work block (9am-1pm) - optimal cognitive conditions detected",
    opportunities: [
      "Review portfolio gains (+2.3%) and consider rebalancing tech sector while market momentum is positive",
      "Connect with 2 pending LinkedIn requests from industry leaders - your profile views are up 40% this week",
      "Schedule Q2 planning session while energy is high - your calendar shows flexibility next week",
    ],
    risks: [
      "Back-to-back meetings 2-4pm may drain energy reserves - consider 10min buffer between calls",
      "Email backlog (23 unread) could derail morning focus if not triaged early - batch process at 8:30am",
      "Afternoon energy dip predicted around 3pm based on your circadian patterns - plan light tasks or movement break",
    ],
  },
  energyStrategy: {
    morning:
      "High Energy Zone (8am-12pm): Deep work on complex tasks, strategic thinking, creative problem-solving. Your cognitive peak hours - protect this time fiercely.",
    afternoon:
      "Moderate Energy (12pm-5pm): Meetings, collaboration, routine tasks, email processing. Social energy is high, analytical energy declining.",
    evening:
      "Recovery Mode (5pm-9pm): Light admin, planning tomorrow, reflection, wind-down activities. Avoid complex decisions or new commitments.",
  },
  closingMotivation:
    "You're operating at peak capacity today with rare alignment across all life domains. Trust your preparation, leverage your energy wisely, and remember: excellence is built in moments like these. Your future self will thank you for showing up fully.",
}

export async function POST(request: NextRequest) {
  if (isDemoMode) {
    // Demo mode: return mock data with enhanced intelligence
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return NextResponse.json({
      success: true,
      synapse: mockDailySynapse,
    })
  }

  try {
    const { userId } = await request.json()

    console.log("[v0] Fetching integrated data for Daily Synapse...")

    // Fetch wellness data from IndexedDB
    const wellnessOracle = new WellnessOracle()
    await wellnessOracle.init()

    const today = new Date().toISOString().split("T")[0]
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    const [todayBiometrics, recentBiometrics, morningBriefing] = await Promise.all([
      wellnessOracle["getBiometricData"](userId, today),
      wellnessOracle["getRecentBiometricData"](userId, 7),
      wellnessOracle.generateMorningBriefing(userId).catch(() => null),
    ])

    // Fetch financial data from IndexedDB
    const [accounts, recentTransactions, financialVelocity] = await Promise.all([
      getUserAccounts(userId),
      getUserTransactions(userId, sevenDaysAgo, today),
      calculateFinancialVelocity(userId, 30),
    ])

    // Prepare wellness data payload
    const wellnessData = {
      today: todayBiometrics,
      recent: recentBiometrics,
      briefing: morningBriefing,
      summary: {
        recovery: todayBiometrics?.recovery || todayBiometrics?.bodyBattery || null,
        hrv: todayBiometrics?.hrv || null,
        rhr: todayBiometrics?.rhr || null,
        sleepDuration: todayBiometrics?.sleepDuration || null,
        sleepEfficiency: todayBiometrics?.sleepEfficiency || null,
        strain: todayBiometrics?.strain || null,
      },
    }

    // Prepare financial data payload
    const financialData = {
      accounts: accounts.map((acc) => ({
        name: acc.name,
        type: acc.type,
        subtype: acc.subtype,
        balance: acc.balances.current,
        currency: acc.balances.iso_currency_code,
      })),
      transactions: recentTransactions.map((txn) => ({
        date: txn.date,
        amount: txn.amount,
        name: txn.name,
        category: txn.category,
      })),
      velocity: financialVelocity,
      summary: {
        totalNetWorth: financialVelocity.currentNetWorth,
        monthlyChange: financialVelocity.velocity * 30,
        monthlyChangePercent: financialVelocity.velocityPercent * 30,
      },
    }

    console.log("[v0] Wellness data summary:", wellnessData.summary)
    console.log("[v0] Financial data summary:", financialData.summary)

    const backendUrl = process.env.CREWAI_BACKEND_URL || "http://localhost:8000"
    const response = await fetch(`${backendUrl}/api/synapse/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        wellnessData, // Real biometric data from Whoop/Garmin
        financialData, // Real financial data from Plaid/TrueLayer
      }),
    })

    if (!response.ok) {
      throw new Error("Backend request failed")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Daily Synapse API error:", error)

    // Fallback to enhanced mock data on error
    return NextResponse.json({
      success: true,
      synapse: mockDailySynapse,
      fallback: true,
    })
  }
}
