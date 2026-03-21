import { NextResponse } from "next/server"

// --- MOCK DATA (This simulates what the real TrueLayer API would return) ---
const mockBankData = {
  hsbc: {
    balance: { currency: "GBP", available: 12540.88, current: 12540.88 },
    transactions: [
      {
        id: "txn1",
        description: "TFL TRAVEL",
        amount: -3.4,
        category: "Transport",
        date: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "txn2",
        description: "TESCO STORES",
        amount: -45.6,
        category: "Groceries",
        date: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: "txn3",
        description: "SALARY",
        amount: 2500.0,
        category: "Income",
        date: new Date(Date.now() - 259200000).toISOString(),
      },
    ],
  },
  amex: {
    balance: { currency: "GBP", available: -543.21, current: -543.21 },
    transactions: [
      { id: "txn4", description: "PRET A MANGER", amount: -8.5, category: "Dining", date: new Date().toISOString() },
      {
        id: "txn5",
        description: "AMAZON UK",
        amount: -79.99,
        category: "Shopping",
        date: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  },
  revolut: {
    balance: { currency: "GBP", available: 850.5, current: 850.5 },
    transactions: [
      { id: "txn6", description: "UBER TRIP", amount: -12.7, category: "Transport", date: new Date().toISOString() },
    ],
  },
}

export async function POST(request: Request) {
  const { action, provider, connectionId } = await request.json()

  // Simulate a delay to feel real
  await new Promise((resolve) => setTimeout(resolve, 1500))

  if (action === "connect") {
    return NextResponse.json({
      success: true,
      connectionId: `${provider}-${Date.now()}`,
      accountName: `${provider.toUpperCase()} Connected Account`,
    })
  }

  if (action === "get_balance") {
    const bank = connectionId.split("-")[0]
    const data = mockBankData[bank as keyof typeof mockBankData]
    return NextResponse.json({ success: true, balance: data.balance })
  }

  if (action === "get_transactions") {
    const bank = connectionId.split("-")[0]
    const data = mockBankData[bank as keyof typeof mockBankData]
    return NextResponse.json({ success: true, transactions: data.transactions })
  }

  return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
}
