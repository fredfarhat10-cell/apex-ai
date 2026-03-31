import { type NextRequest, NextResponse } from "next/server"
import type { BiometricData } from "@/lib/types/wellness"
import type { PlaidAccount, PlaidTransaction } from "@/lib/types/plaid"

export async function POST(request: NextRequest) {
  try {
    const { provider, userId, days = 7 } = await request.json()

    if (!provider || !userId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    console.log(`[v0] Syncing data from ${provider} for user ${userId}`)

    let data: any = null

    switch (provider.toLowerCase()) {
      case "whoop":
        data = generateWhoopData(days)
        break
      case "garmin":
        data = generateGarminData(days)
        break
      case "strava":
        data = generateStravaData(days)
        break
      case "plaid":
      case "amex":
        data = generatePlaidData(days)
        break
      case "truelayer":
      case "hsbc":
      case "revolut":
        data = generateTrueLayerData(days)
        break
      default:
        return NextResponse.json({ success: false, error: "Unknown provider" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      provider,
      data,
      syncedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Integration sync error:", error)
    return NextResponse.json({ success: false, error: "Failed to sync data" }, { status: 500 })
  }
}

function generateWhoopData(days: number): BiometricData[] {
  const data: BiometricData[] = []
  const today = new Date()

  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    data.push({
      date: date.toISOString().split("T")[0],
      recovery: Math.floor(Math.random() * 30) + 60, // 60-90
      hrv: Math.floor(Math.random() * 50) + 50, // 50-100ms
      rhr: Math.floor(Math.random() * 15) + 50, // 50-65 bpm
      sleepDuration: Math.random() * 2 + 6, // 6-8 hours
      sleepEfficiency: Math.floor(Math.random() * 20) + 75, // 75-95%
      strain: Math.random() * 10 + 8, // 8-18
    })
  }

  return data
}

function generateGarminData(days: number): BiometricData[] {
  const data: BiometricData[] = []
  const today = new Date()

  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    data.push({
      date: date.toISOString().split("T")[0],
      bodyBattery: Math.floor(Math.random() * 30) + 60, // 60-90
      hrv: Math.floor(Math.random() * 50) + 50,
      rhr: Math.floor(Math.random() * 15) + 50,
      sleepDuration: Math.random() * 2 + 6,
      steps: Math.floor(Math.random() * 5000) + 7000, // 7000-12000
      activeMinutes: Math.floor(Math.random() * 60) + 30, // 30-90
      calories: Math.floor(Math.random() * 1000) + 2000, // 2000-3000
    })
  }

  return data
}

function generateStravaData(days: number) {
  const activities = []
  const today = new Date()

  for (let i = 0; i < Math.min(days, 5); i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i * 2)

    activities.push({
      id: `activity_${Date.now()}_${i}`,
      name: ["Morning Run", "Evening Cycle", "Lunch Walk", "Weekend Hike"][Math.floor(Math.random() * 4)],
      type: ["Run", "Ride", "Walk", "Hike"][Math.floor(Math.random() * 4)],
      date: date.toISOString(),
      distance: Math.random() * 10 + 2, // 2-12 km
      duration: Math.floor(Math.random() * 3600) + 1800, // 30-90 minutes
      calories: Math.floor(Math.random() * 500) + 200,
    })
  }

  return activities
}

function generatePlaidData(days: number) {
  const accounts: PlaidAccount[] = [
    {
      account_id: "acc_amex_checking",
      balances: {
        available: 15420.5,
        current: 15420.5,
        limit: null,
        iso_currency_code: "USD",
        unofficial_currency_code: null,
      },
      mask: "4532",
      name: "Amex Checking",
      official_name: "American Express Checking Account",
      type: "depository",
      subtype: "checking",
    },
    {
      account_id: "acc_amex_credit",
      balances: {
        available: 8500.0,
        current: -1500.0,
        limit: 10000.0,
        iso_currency_code: "USD",
        unofficial_currency_code: null,
      },
      mask: "1234",
      name: "Amex Platinum",
      official_name: "American Express Platinum Card",
      type: "credit",
      subtype: "credit card",
    },
  ]

  const transactions: PlaidTransaction[] = []
  const today = new Date()

  for (let i = 0; i < days * 3; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - Math.floor(i / 3))

    transactions.push({
      transaction_id: `txn_${Date.now()}_${i}`,
      account_id: Math.random() > 0.5 ? "acc_amex_checking" : "acc_amex_credit",
      amount: Math.random() * 200 - 50, // -50 to 150
      iso_currency_code: "USD",
      date: date.toISOString().split("T")[0],
      name: ["Whole Foods", "Uber", "Netflix", "Amazon", "Starbucks", "Shell Gas"][Math.floor(Math.random() * 6)],
      merchant_name: ["Whole Foods", "Uber", "Netflix", "Amazon", "Starbucks", "Shell"][Math.floor(Math.random() * 6)],
      category: [
        ["Food and Drink", "Groceries"],
        ["Travel", "Taxi"],
        ["Service", "Subscription"],
      ][Math.floor(Math.random() * 3)],
      category_id: "13005000",
      pending: Math.random() > 0.9,
      payment_channel: Math.random() > 0.5 ? "online" : "in store",
    })
  }

  return { accounts, transactions }
}

function generateTrueLayerData(days: number) {
  const accounts = [
    {
      account_id: "acc_hsbc_current",
      provider: "HSBC UK",
      account_type: "TRANSACTION",
      display_name: "HSBC Current Account",
      currency: "GBP",
      account_number: {
        number: "12345678",
        sort_code: "40-47-84",
      },
      balance: {
        current: 8750.25,
        available: 8750.25,
        overdraft: 1000.0,
      },
    },
    {
      account_id: "acc_revolut_current",
      provider: "Revolut",
      account_type: "TRANSACTION",
      display_name: "Revolut GBP",
      currency: "GBP",
      balance: {
        current: 2340.8,
        available: 2340.8,
      },
    },
  ]

  const transactions = []
  const today = new Date()

  for (let i = 0; i < days * 2; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - Math.floor(i / 2))

    transactions.push({
      transaction_id: `txn_uk_${Date.now()}_${i}`,
      account_id: Math.random() > 0.5 ? "acc_hsbc_current" : "acc_revolut_current",
      amount: Math.random() * 150 - 30,
      currency: "GBP",
      timestamp: date.toISOString(),
      description: ["Tesco", "TfL", "Spotify", "Amazon UK", "Pret", "BP Petrol"][Math.floor(Math.random() * 6)],
      transaction_type: Math.random() > 0.3 ? "DEBIT" : "CREDIT",
      transaction_category: ["PURCHASE", "ATM", "TRANSFER"][Math.floor(Math.random() * 3)],
    })
  }

  return { accounts, transactions }
}
