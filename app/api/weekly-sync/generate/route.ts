import { type NextRequest, NextResponse } from "next/server"
import { WellnessOracle } from "@/lib/wellness-oracle"
import { getUserAccounts, getUserTransactions, calculateFinancialVelocity } from "@/lib/account-aggregation"

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionId } = await request.json()

    console.log("[v0] Generating weekly sync report with full user context...")

    const wellnessOracle = new WellnessOracle()
    await wellnessOracle.init()

    const today = new Date().toISOString().split("T")[0]
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    // Fetch wellness data for the past 7 days
    const [recentBiometrics, morningBriefing] = await Promise.all([
      wellnessOracle["getRecentBiometricData"](userId, 7).catch(() => []),
      wellnessOracle.generateMorningBriefing(userId).catch(() => null),
    ])

    // Fetch financial data for the past 30 days
    const [accounts, recentTransactions, financialVelocity] = await Promise.all([
      getUserAccounts(userId).catch(() => []),
      getUserTransactions(userId, thirtyDaysAgo, today).catch(() => []),
      calculateFinancialVelocity(userId, 30).catch(() => null),
    ])

    // Prepare wellness data payload
    const wellnessData = {
      recent: recentBiometrics,
      briefing: morningBriefing,
      summary: {
        avgRecovery:
          recentBiometrics.reduce((sum, d) => sum + (d.recovery || d.bodyBattery || 0), 0) / recentBiometrics.length ||
          0,
        avgHrv: recentBiometrics.reduce((sum, d) => sum + (d.hrv || 0), 0) / recentBiometrics.length || 0,
        avgSleepDuration:
          recentBiometrics.reduce((sum, d) => sum + (d.sleepDuration || 0), 0) / recentBiometrics.length || 0,
        avgStrain: recentBiometrics.reduce((sum, d) => sum + (d.strain || 0), 0) / recentBiometrics.length || 0,
      },
    }

    // Prepare financial data payload
    const financialData = financialVelocity
      ? {
          accounts: accounts.map((acc) => ({
            name: acc.name,
            type: acc.type,
            balance: acc.balances.current,
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
            weeklyChange: financialVelocity.velocity * 7,
            weeklyChangePercent: financialVelocity.velocityPercent * 7,
          },
        }
      : undefined

    console.log("[v0] Wellness summary:", wellnessData.summary)
    console.log("[v0] Financial summary:", financialData?.summary)

    // Call CrewAI backend with rich context
    const crewAIEndpoint = process.env.CREWAI_BACKEND_URL || "http://localhost:8000"

    const response = await fetch(`${crewAIEndpoint}/api/weekly-sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_name: userId,
        session_id: sessionId,
        wellness_data: wellnessData,
        financial_data: financialData,
      }),
    })

    if (!response.ok) {
      throw new Error("CrewAI backend request failed")
    }

    const report = await response.json()

    return NextResponse.json({ report })
  } catch (error) {
    console.error("[v0] Error generating weekly sync report:", error)
    return NextResponse.json({ error: "Failed to generate weekly sync report" }, { status: 500 })
  }
}
