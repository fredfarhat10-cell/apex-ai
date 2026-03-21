import { type NextRequest, NextResponse } from "next/server"
import {
  syncCryptoAccounts,
  syncCryptoTransactions,
  syncCryptoWallet,
  getCryptoPortfolio,
} from "@/lib/crypto-aggregation"

export async function POST(request: NextRequest) {
  try {
    const { provider, userId, accessToken, address, days = 30 } = await request.json()

    if (!provider || !userId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    console.log(`[v0] Syncing crypto data for ${provider}`)

    const isExchange = ["binance", "crypto.com", "kraken", "coinbase"].includes(provider)
    const isWallet = ["metamask", "phantom", "trust_wallet"].includes(provider)

    let syncedData: any = {}

    if (isExchange) {
      // Sync exchange accounts and transactions
      const accounts = await syncCryptoAccounts(userId, provider, accessToken || "mock_token")

      // Sync transactions for each account
      const allTransactions = []
      for (const account of accounts) {
        const transactions = await syncCryptoTransactions(userId, account.account_id, provider, days)
        allTransactions.push(...transactions)
      }

      syncedData = {
        type: "exchange",
        accounts,
        transactions: allTransactions,
        totalValue: accounts.reduce((sum, acc) => sum + acc.total_value_usd, 0),
      }
    } else if (isWallet) {
      // Sync wallet balances
      const wallet = await syncCryptoWallet(userId, provider, address || `0x${Math.random().toString(16).slice(2, 42)}`)

      syncedData = {
        type: "wallet",
        wallet,
        totalValue: wallet.total_value_usd,
      }
    }

    return NextResponse.json({
      success: true,
      data: syncedData,
      message: `Successfully synced ${provider} data`,
    })
  } catch (error) {
    console.error("[v0] Crypto sync error:", error)
    return NextResponse.json({ success: false, error: "Failed to sync crypto data" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 })
    }

    const portfolio = await getCryptoPortfolio(userId)

    return NextResponse.json({
      success: true,
      portfolio,
    })
  } catch (error) {
    console.error("[v0] Failed to get crypto portfolio:", error)
    return NextResponse.json({ success: false, error: "Failed to get portfolio" }, { status: 500 })
  }
}
