"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plug, CheckCircle, XCircle, RefreshCw, Activity, Heart, DollarSign, Bitcoin, Wallet } from "lucide-react"
import { useVault } from "@/lib/vault-context"

interface Integration {
  id: string
  provider: string
  name: string
  description: string
  type: "wellness" | "financial"
  status: "connected" | "disconnected"
  lastSynced?: string
  logo?: string
}

interface Provider {
  id: string
  name: string
  description: string
  type: "wellness" | "financial"
  features: string[]
  logo?: string
}

export default function IntegrationHub() {
  const { userProfile } = useVault()
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null)

  const wellnessProviders: Provider[] = [
    {
      id: "whoop",
      name: "Whoop",
      description: "Recovery, HRV, Sleep, and Strain tracking",
      type: "wellness",
      features: ["Recovery Score", "HRV", "Sleep Analysis", "Strain"],
    },
    {
      id: "garmin",
      name: "Garmin",
      description: "Body Battery, steps, and activity tracking",
      type: "wellness",
      features: ["Body Battery", "Steps", "Active Minutes", "Calories"],
    },
    {
      id: "strava",
      name: "Strava",
      description: "Running, cycling, and activity data",
      type: "wellness",
      features: ["Activities", "Distance", "Duration", "Calories"],
    },
  ]

  const financialProviders: Provider[] = [
    {
      id: "plaid",
      name: "Plaid (Amex)",
      description: "Connect your American Express accounts",
      type: "financial",
      features: ["Account Balances", "Transactions", "Spending Analysis"],
    },
    {
      id: "truelayer",
      name: "TrueLayer (HSBC, Revolut UK)",
      description: "Connect your UK bank accounts",
      type: "financial",
      features: ["Account Balances", "Transactions", "Multi-Currency"],
    },
  ]

  const cryptoExchangeProviders: Provider[] = [
    {
      id: "binance",
      name: "Binance",
      description: "World's largest crypto exchange - spot, futures, and staking",
      type: "financial",
      features: ["Spot Trading", "Futures", "Staking", "Savings"],
    },
    {
      id: "crypto.com",
      name: "Crypto.com",
      description: "Buy, sell, and earn crypto with competitive rates",
      type: "financial",
      features: ["Spot Trading", "Earn", "Card Rewards", "DeFi"],
    },
    {
      id: "kraken",
      name: "Kraken",
      description: "Secure crypto exchange with advanced trading features",
      type: "financial",
      features: ["Spot Trading", "Margin", "Futures", "Staking"],
    },
    {
      id: "coinbase",
      name: "Coinbase",
      description: "User-friendly crypto platform for beginners and pros",
      type: "financial",
      features: ["Spot Trading", "Staking", "Earn", "Wallet"],
    },
  ]

  const cryptoWalletProviders: Provider[] = [
    {
      id: "metamask",
      name: "MetaMask",
      description: "Leading Ethereum wallet for Web3 and DeFi",
      type: "financial",
      features: ["Ethereum", "ERC-20 Tokens", "NFTs", "DeFi Access"],
    },
    {
      id: "phantom",
      name: "Phantom",
      description: "Solana wallet for tokens, NFTs, and DeFi",
      type: "financial",
      features: ["Solana", "SPL Tokens", "NFTs", "Staking"],
    },
    {
      id: "trust_wallet",
      name: "Trust Wallet",
      description: "Multi-chain wallet supporting 70+ blockchains",
      type: "financial",
      features: ["Multi-Chain", "NFTs", "DeFi", "Staking"],
    },
  ]

  const allProviders = [
    ...wellnessProviders,
    ...financialProviders,
    ...cryptoExchangeProviders,
    ...cryptoWalletProviders,
  ]

  useEffect(() => {
    // Load integrations from localStorage
    const stored = localStorage.getItem("apex_integrations")
    if (stored) {
      setIntegrations(JSON.parse(stored))
    }
  }, [])

  const handleConnect = async (provider: Provider) => {
    setIsLoading(true)
    try {
      const isCrypto = ["binance", "crypto.com", "kraken", "coinbase", "metamask", "phantom", "trust_wallet"].includes(
        provider.id,
      )
      const endpoint = isCrypto ? "/api/crypto/connect" : "/api/integrations/connect"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: provider.id,
          userId: userProfile?.name || "user",
        }),
      })

      const data = await response.json()

      if (data.success) {
        const newIntegration: Integration = {
          id: data.integration.id,
          provider: provider.id,
          name: provider.name,
          description: provider.description,
          type: provider.type,
          status: "connected",
          lastSynced: new Date().toISOString(),
        }

        const updated = [...integrations, newIntegration]
        setIntegrations(updated)
        localStorage.setItem("apex_integrations", JSON.stringify(updated))

        // Auto-sync after connection
        await handleSync(provider.id)
      }
    } catch (error) {
      console.error("[v0] Failed to connect:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async (providerId: string) => {
    setSyncingProvider(providerId)
    try {
      const isCrypto = ["binance", "crypto.com", "kraken", "coinbase", "metamask", "phantom", "trust_wallet"].includes(
        providerId,
      )
      const endpoint = isCrypto ? "/api/crypto/sync" : "/api/integrations/sync"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: providerId,
          userId: userProfile?.name || "user",
          days: 7,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Store synced data in localStorage
        const storageKey = `apex_${providerId}_data`
        localStorage.setItem(storageKey, JSON.stringify(data.data))

        // Update last synced time
        const updated = integrations.map((int) =>
          int.provider === providerId ? { ...int, lastSynced: new Date().toISOString() } : int,
        )
        setIntegrations(updated)
        localStorage.setItem("apex_integrations", JSON.stringify(updated))
      }
    } catch (error) {
      console.error("[v0] Failed to sync:", error)
    } finally {
      setSyncingProvider(null)
    }
  }

  const handleDisconnect = (providerId: string) => {
    const updated = integrations.filter((int) => int.provider !== providerId)
    setIntegrations(updated)
    localStorage.setItem("apex_integrations", JSON.stringify(updated))

    // Clear synced data
    localStorage.removeItem(`apex_${providerId}_data`)
  }

  const isConnected = (providerId: string) => {
    return integrations.some((int) => int.provider === providerId && int.status === "connected")
  }

  const getIntegration = (providerId: string) => {
    return integrations.find((int) => int.provider === providerId)
  }

  const connectedCount = integrations.filter((i) => i.status === "connected").length
  const wellnessCount = integrations.filter((i) => i.type === "wellness" && i.status === "connected").length
  const financialCount = integrations.filter((i) => i.type === "financial" && i.status === "connected").length
  const cryptoCount = integrations.filter(
    (i) =>
      i.status === "connected" &&
      ["binance", "crypto.com", "kraken", "coinbase", "metamask", "phantom", "trust_wallet"].includes(i.provider),
  ).length

  return (
    <div className="h-screen w-full bg-[#0a0a0f] text-white overflow-y-auto font-mono p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Integration Hub</h1>
            <p className="text-gray-400">
              Connect your wellness and financial services to unlock hyper-personalized insights
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#0f1118]/80 backdrop-blur-md border border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Connected</p>
                  <p className="text-3xl font-bold">{connectedCount}</p>
                </div>
                <Plug className="h-8 w-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1118]/80 backdrop-blur-md border border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Wellness</p>
                  <p className="text-3xl font-bold">{wellnessCount}</p>
                </div>
                <Heart className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1118]/80 backdrop-blur-md border border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Financial</p>
                  <p className="text-3xl font-bold">{financialCount}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1118]/80 backdrop-blur-md border border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Crypto</p>
                  <p className="text-3xl font-bold">{cryptoCount}</p>
                </div>
                <Bitcoin className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="wellness" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[#0f1118]/80">
            <TabsTrigger value="wellness">Wellness</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="crypto-exchanges">Crypto Exchanges</TabsTrigger>
            <TabsTrigger value="crypto-wallets">Wallets</TabsTrigger>
          </TabsList>

          <TabsContent value="wellness" className="space-y-4 mt-6">
            {wellnessProviders.map((provider) => {
              const integration = getIntegration(provider.id)
              const connected = isConnected(provider.id)

              return (
                <Card key={provider.id} className="bg-[#0f1118]/80 backdrop-blur-md border border-white/10">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4 items-start">
                        <div className="p-3 bg-red-500/10 rounded-lg">
                          <Activity className="h-6 w-6 text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-1">{provider.name}</h3>
                          <p className="text-sm text-gray-400 mb-3">{provider.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {provider.features.map((feature, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {connected ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="outline">Disconnected</Badge>
                        )}
                      </div>
                    </div>

                    {integration && integration.lastSynced && (
                      <p className="text-xs text-gray-500 mb-3">
                        Last synced: {new Date(integration.lastSynced).toLocaleString()}
                      </p>
                    )}

                    <div className="flex gap-2">
                      {connected ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSync(provider.id)}
                            disabled={syncingProvider === provider.id}
                          >
                            <RefreshCw
                              className={`h-4 w-4 mr-2 ${syncingProvider === provider.id ? "animate-spin" : ""}`}
                            />
                            {syncingProvider === provider.id ? "Syncing..." : "Sync Now"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDisconnect(provider.id)}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleConnect(provider)}
                          disabled={isLoading}
                          className="bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="financial" className="space-y-4 mt-6">
            {financialProviders.map((provider) => {
              const integration = getIntegration(provider.id)
              const connected = isConnected(provider.id)

              return (
                <Card key={provider.id} className="bg-[#0f1118]/80 backdrop-blur-md border border-white/10">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4 items-start">
                        <div className="p-3 bg-green-500/10 rounded-lg">
                          <DollarSign className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-1">{provider.name}</h3>
                          <p className="text-sm text-gray-400 mb-3">{provider.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {provider.features.map((feature, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {connected ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="outline">Disconnected</Badge>
                        )}
                      </div>
                    </div>

                    {integration && integration.lastSynced && (
                      <p className="text-xs text-gray-500 mb-3">
                        Last synced: {new Date(integration.lastSynced).toLocaleString()}
                      </p>
                    )}

                    <div className="flex gap-2">
                      {connected ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSync(provider.id)}
                            disabled={syncingProvider === provider.id}
                          >
                            <RefreshCw
                              className={`h-4 w-4 mr-2 ${syncingProvider === provider.id ? "animate-spin" : ""}`}
                            />
                            {syncingProvider === provider.id ? "Syncing..." : "Sync Now"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDisconnect(provider.id)}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleConnect(provider)}
                          disabled={isLoading}
                          className="bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="crypto-exchanges" className="space-y-4 mt-6">
            {cryptoExchangeProviders.map((provider) => {
              const integration = getIntegration(provider.id)
              const connected = isConnected(provider.id)

              return (
                <Card key={provider.id} className="bg-[#0f1118]/80 backdrop-blur-md border border-white/10">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4 items-start">
                        <div className="p-3 bg-orange-500/10 rounded-lg">
                          <Bitcoin className="h-6 w-6 text-orange-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-1">{provider.name}</h3>
                          <p className="text-sm text-gray-400 mb-3">{provider.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {provider.features.map((feature, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {connected ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="outline">Disconnected</Badge>
                        )}
                      </div>
                    </div>

                    {integration && integration.lastSynced && (
                      <p className="text-xs text-gray-500 mb-3">
                        Last synced: {new Date(integration.lastSynced).toLocaleString()}
                      </p>
                    )}

                    <div className="flex gap-2">
                      {connected ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSync(provider.id)}
                            disabled={syncingProvider === provider.id}
                          >
                            <RefreshCw
                              className={`h-4 w-4 mr-2 ${syncingProvider === provider.id ? "animate-spin" : ""}`}
                            />
                            {syncingProvider === provider.id ? "Syncing..." : "Sync Now"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDisconnect(provider.id)}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleConnect(provider)}
                          disabled={isLoading}
                          className="bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="crypto-wallets" className="space-y-4 mt-6">
            {cryptoWalletProviders.map((provider) => {
              const integration = getIntegration(provider.id)
              const connected = isConnected(provider.id)

              return (
                <Card key={provider.id} className="bg-[#0f1118]/80 backdrop-blur-md border border-white/10">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4 items-start">
                        <div className="p-3 bg-purple-500/10 rounded-lg">
                          <Wallet className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-1">{provider.name}</h3>
                          <p className="text-sm text-gray-400 mb-3">{provider.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {provider.features.map((feature, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {connected ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="outline">Disconnected</Badge>
                        )}
                      </div>
                    </div>

                    {integration && integration.lastSynced && (
                      <p className="text-xs text-gray-500 mb-3">
                        Last synced: {new Date(integration.lastSynced).toLocaleString()}
                      </p>
                    )}

                    <div className="flex gap-2">
                      {connected ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSync(provider.id)}
                            disabled={syncingProvider === provider.id}
                          >
                            <RefreshCw
                              className={`h-4 w-4 mr-2 ${syncingProvider === provider.id ? "animate-spin" : ""}`}
                            />
                            {syncingProvider === provider.id ? "Syncing..." : "Sync Now"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDisconnect(provider.id)}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleConnect(provider)}
                          disabled={isLoading}
                          className="bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
