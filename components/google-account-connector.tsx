"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Mail, AlertCircle } from "lucide-react"

export default function GoogleAccountConnector() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    // Check URL params for OAuth callback results
    const params = new URLSearchParams(window.location.search)
    const success = params.get("success")
    const errorParam = params.get("error")

    if (success === "true") {
      setIsConnected(true)
      setError(null)
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname)
    } else if (errorParam) {
      setError(getErrorMessage(errorParam))
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  const handleConnect = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/auth/google")
      const data = await response.json()

      if (data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl
      } else {
        throw new Error("Failed to get authorization URL")
      }
    } catch (err) {
      console.error("[v0] Error connecting Google account:", err)
      setError("Failed to initiate Google connection. Please try again.")
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // TODO: Get the actual token from your secure storage
      const token = "stored_access_token"

      const response = await fetch("/api/auth/google/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      if (response.ok) {
        setIsConnected(false)
        setUserEmail(null)
      } else {
        throw new Error("Failed to disconnect")
      }
    } catch (err) {
      console.error("[v0] Error disconnecting Google account:", err)
      setError("Failed to disconnect Google account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getErrorMessage = (errorCode: string): string => {
    const errorMessages: Record<string, string> = {
      no_code: "Authorization code not received",
      callback_failed: "Failed to complete authorization",
      access_denied: "You denied access to your Google account",
    }
    return errorMessages[errorCode] || "An unknown error occurred"
  }

  return (
    <Card className="bg-[#0f1118] border border-white/10 p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Mail className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">Google Account</h3>

          {isConnected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">Connected</span>
              </div>

              {userEmail && <p className="text-sm text-gray-400">{userEmail}</p>}

              <div className="text-xs text-gray-500 space-y-1">
                <p>✓ Gmail read access</p>
                <p>✓ Gmail modify access</p>
              </div>

              <Button
                onClick={handleDisconnect}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="mt-4 bg-transparent"
              >
                {isLoading ? "Disconnecting..." : "Disconnect"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-400">
                Connect your Google account to enable Gmail integration for automated email management and career
                opportunities tracking.
              </p>

              <div className="text-xs text-gray-500 space-y-1">
                <p>• Read and organize emails</p>
                <p>• Track job applications</p>
                <p>• Manage professional communications</p>
              </div>

              <Button onClick={handleConnect} disabled={isLoading} className="mt-4 bg-blue-600 hover:bg-blue-700">
                {isLoading ? "Connecting..." : "Connect Google Account"}
              </Button>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
