import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json()

    // In production, this would call the actual Plaid API
    // For demo, return mock accounts
    const mockAccounts = [
      {
        account_id: "acc_checking_001",
        balances: {
          available: 5420.5,
          current: 5420.5,
          limit: null,
          iso_currency_code: "USD",
          unofficial_currency_code: null,
        },
        mask: "0000",
        name: "Plaid Checking",
        official_name: "Plaid Gold Standard 0% Interest Checking",
        type: "depository" as const,
        subtype: "checking",
      },
      {
        account_id: "acc_savings_001",
        balances: {
          available: 15230.75,
          current: 15230.75,
          limit: null,
          iso_currency_code: "USD",
          unofficial_currency_code: null,
        },
        mask: "1111",
        name: "Plaid Saving",
        official_name: "Plaid Silver Standard 0.1% Interest Saving",
        type: "depository" as const,
        subtype: "savings",
      },
      {
        account_id: "acc_investment_001",
        balances: {
          available: null,
          current: 125430.0,
          limit: null,
          iso_currency_code: "USD",
          unofficial_currency_code: null,
        },
        mask: "2222",
        name: "Plaid Investment",
        official_name: "Plaid Platinum Standard Investment Account",
        type: "investment" as const,
        subtype: "brokerage",
      },
    ]

    return NextResponse.json({ accounts: mockAccounts })
  } catch (error) {
    console.error("[v0] Error fetching accounts:", error)
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 })
  }
}
