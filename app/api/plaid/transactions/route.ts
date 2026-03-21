import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { accessToken, startDate, endDate } = await request.json()

    // In production, this would call the actual Plaid API
    // For demo, return mock transactions
    const mockTransactions = [
      {
        transaction_id: "txn_001",
        account_id: "acc_checking_001",
        amount: -45.5,
        iso_currency_code: "USD",
        date: "2025-01-20",
        name: "Starbucks",
        merchant_name: "Starbucks",
        category: ["Food and Drink", "Restaurants", "Coffee Shop"],
        category_id: "13005043",
        pending: false,
        payment_channel: "in store" as const,
      },
      {
        transaction_id: "txn_002",
        account_id: "acc_checking_001",
        amount: -120.0,
        iso_currency_code: "USD",
        date: "2025-01-19",
        name: "Amazon",
        merchant_name: "Amazon",
        category: ["Shops", "Digital Purchase"],
        category_id: "19013000",
        pending: false,
        payment_channel: "online" as const,
      },
      {
        transaction_id: "txn_003",
        account_id: "acc_checking_001",
        amount: 2500.0,
        iso_currency_code: "USD",
        date: "2025-01-15",
        name: "Payroll Deposit",
        merchant_name: null,
        category: ["Transfer", "Payroll"],
        category_id: "21009000",
        pending: false,
        payment_channel: "other" as const,
      },
    ]

    return NextResponse.json({ transactions: mockTransactions })
  } catch (error) {
    console.error("[v0] Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}
