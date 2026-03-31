import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { provider, userId, address, accessToken } = await request.json()

    if (!provider || !userId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    console.log(`[v0] Connecting crypto provider: ${provider}`)

    const { syncCryptoAccounts, syncCryptoWallet } = await import("@/lib/crypto-aggregation")

    const isExchange = ["binance", "crypto.com", "kraken", "coinbase"].includes(provider)
    const isWallet = ["metamask", "phantom", "trust_wallet"].includes(provider)

    if (!isExchange && !isWallet) {
      return NextResponse.json({ success: false, error: "Invalid provider" }, { status: 400 })
    }

    if (isExchange && accessToken) {
      // Sync exchange accounts and transactions
      const accounts = await syncCryptoAccounts(userId, provider, accessToken)

      return NextResponse.json({
        success: true,
        integration: {
          id: `crypto_int_${Date.now()}`,
          provider,
          userId,
          type: "exchange",
          status: "connected",
          connectedAt: new Date().toISOString(),
          accountsCount: accounts.length,
        },
        message: `Successfully connected to ${provider} and synced ${accounts.length} accounts`,
      })
    }

    if (isWallet && address) {
      // Sync wallet balances
      const wallet = await syncCryptoWallet(userId, provider, address)

      return NextResponse.json({
        success: true,
        integration: {
          id: wallet.id,
          provider,
          userId,
          type: "wallet",
          status: "connected",
          connectedAt: new Date().toISOString(),
          address: wallet.address,
          totalValueUsd: wallet.total_value_usd,
        },
        message: `Successfully connected ${provider} wallet`,
      })
    }

    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Crypto connection error:", error)
    return NextResponse.json({ success: false, error: "Failed to connect crypto provider" }, { status: 500 })
  }
}
