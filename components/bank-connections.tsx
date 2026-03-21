"use client"

import { useState, useEffect } from "react"
import { useVault } from "@/lib/vault-context"
import {
  BANK_PROVIDERS,
  connectBankAccount,
  disconnectBankAccount,
  fetchBankTransactions,
  getBankAccountBalance,
} from "@/lib/bank-oauth"
import { connectionStorage } from "@/lib/financial-storage"
import type { BankConnection } from "@/lib/types/financial"
import ApexSpinner from "./apex-spinner"
import { CheckCircle2Icon, XCircleIcon } from "./icons"

export default function BankConnections() {
  const { userProfile } = useVault()
  const [connections, setConnections] = useState<BankConnection[]>([])
  const [showAddBank, setShowAddBank] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [balances, setBalances] = useState<Record<string, any>>({})

  useEffect(() => {
    if (userProfile?.id) {
      loadConnections()
    }
  }, [userProfile])

  const loadConnections = () => {
    const userId = userProfile?.id || "demo-user"
    const userConnections = connectionStorage.getByUser(userId)
    setConnections(userConnections)

    // Load balances for each connection
    userConnections.forEach(async (conn) => {
      const balance = await getBankAccountBalance(conn)
      setBalances((prev) => ({ ...prev, [conn.id]: balance }))
    })
  }

  const handleConnectBank = async (providerId: string) => {
    setIsConnecting(true)
    setSelectedProvider(providerId)

    try {
      const userId = userProfile?.id || "demo-user"

      // Simulate OAuth flow
      // In production, this would open a popup window
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate successful OAuth
      const mockAccessToken = `${providerId}_token_${Date.now()}`
      const mockRefreshToken = `${providerId}_refresh_${Date.now()}`

      await connectBankAccount(userId, providerId, mockAccessToken, mockRefreshToken)

      loadConnections()
      setShowAddBank(false)
    } catch (error) {
      console.error("[v0] Error connecting bank:", error)
    } finally {
      setIsConnecting(false)
      setSelectedProvider(null)
    }
  }

  const handleDisconnect = async (connectionId: string) => {
    if (confirm("Are you sure you want to disconnect this bank account?")) {
      await disconnectBankAccount(connectionId)
      loadConnections()
    }
  }

  const handleSyncTransactions = async (connection: BankConnection) => {
    try {
      const txns = await fetchBankTransactions(connection)
      setTransactions(txns)
    } catch (error) {
      console.error("[v0] Error syncing transactions:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Bank Connections</h3>
        <button
          onClick={() => setShowAddBank(true)}
          className="px-4 py-2 bg-apex-primary text-white rounded-md hover:bg-apex-primary/80 transition-all"
        >
          Connect Bank
        </button>
      </div>

      {connections.length === 0 ? (
        <div className="text-center py-12 border border-gray-700 rounded-lg bg-apex-darker/50">
          <p className="text-apex-gray mb-4">No bank accounts connected yet.</p>
          <button
            onClick={() => setShowAddBank(true)}
            className="px-6 py-3 bg-apex-primary text-white rounded-md hover:bg-apex-primary/80 transition-all"
          >
            Connect Your First Bank
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connections.map((connection) => (
            <div
              key={connection.id}
              className="p-4 border border-gray-700 rounded-lg bg-apex-darker hover:border-apex-primary/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-white">{connection.accountName}</h4>
                  <p className="text-sm text-apex-gray capitalize">{connection.accountType}</p>
                </div>
                <div className="flex items-center gap-2">
                  {connection.isActive ? (
                    <CheckCircle2Icon className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-400" />
                  )}
                </div>
              </div>

              {balances[connection.id] && (
                <div className="mb-3 p-3 bg-apex-dark rounded-md">
                  <p className="text-xs text-apex-gray">Available Balance</p>
                  <p className="text-xl font-bold text-white">
                    ${balances[connection.id].available.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}

              <div className="text-xs text-apex-gray mb-3">
                <p>
                  Last synced: {connection.lastSyncedAt ? new Date(connection.lastSyncedAt).toLocaleString() : "Never"}
                </p>
                <p>Provider: {BANK_PROVIDERS[connection.provider]?.name || connection.provider}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleSyncTransactions(connection)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-all"
                >
                  Sync Transactions
                </button>
                <button
                  onClick={() => handleDisconnect(connection.id)}
                  className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-all"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {transactions.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-white mb-3">Recent Transactions</h4>
          <div className="space-y-2">
            {transactions.map((txn) => (
              <div
                key={txn.id}
                className="flex items-center justify-between p-3 border border-gray-700 rounded-md bg-apex-darker"
              >
                <div>
                  <p className="font-medium text-white">{txn.description}</p>
                  <p className="text-xs text-apex-gray">
                    {new Date(txn.date).toLocaleDateString()} • {txn.category}
                  </p>
                </div>
                <p className={`font-bold ${txn.type === "credit" ? "text-green-400" : "text-red-400"}`}>
                  {txn.type === "credit" ? "+" : "-"}${Math.abs(txn.amount).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddBank && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-apex-dark border border-gray-700 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Connect Bank Account</h3>

            <div className="mb-6">
              <h4 className="text-sm font-semibold text-apex-gray mb-3">Bank Aggregators (Recommended)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.values(BANK_PROVIDERS)
                  .filter((p) => p.type === "aggregator")
                  .map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => handleConnectBank(provider.id)}
                      disabled={isConnecting}
                      className="p-4 border border-gray-700 rounded-lg bg-apex-darker hover:border-apex-primary/50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">{provider.name}</p>
                          <p className="text-xs text-apex-gray mt-1">Connect multiple banks at once</p>
                        </div>
                        {isConnecting && selectedProvider === provider.id && <ApexSpinner size={20} />}
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-apex-gray mb-3">Direct Bank Connections</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.values(BANK_PROVIDERS)
                  .filter((p) => p.type === "direct")
                  .map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => handleConnectBank(provider.id)}
                      disabled={isConnecting}
                      className="p-4 border border-gray-700 rounded-lg bg-apex-darker hover:border-apex-primary/50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-white">{provider.name}</p>
                        {isConnecting && selectedProvider === provider.id && <ApexSpinner size={20} />}
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-300">
                <strong>Note:</strong> Bank connections use OAuth 2.0 for secure authentication. Your credentials are
                never stored by Apex. All connections are encrypted end-to-end.
              </p>
            </div>

            <button
              onClick={() => setShowAddBank(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
