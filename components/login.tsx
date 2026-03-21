"use client"

import type React from "react"
import { useState } from "react"
import { useVault } from "@/lib/vault-context"
import { Lock, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Login() {
  const { login } = useVault()
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const success = await login(password)

    if (!success) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      if (newAttempts >= 3) {
        setError(
          "Multiple failed attempts detected. Incorrect password or corrupted vault data. Your data remains encrypted and secure.",
        )
      } else {
        setError(`Incorrect password. ${3 - newAttempts} attempt(s) remaining.`)
      }
      setIsLoading(false)
    } else {
      setIsUnlocking(true)
    }
  }

  if (isUnlocking) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <Shield className="w-24 h-24 text-[#FF6B00] mx-auto animate-pulse" />
          </div>
          <p className="text-xl font-semibold text-[#FF6B00]">Vault Unlocked</p>
          <p className="text-sm text-[#888888]">Decrypting your data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-10"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 space-y-4">
          <div className="relative inline-block">
            <div className="p-6 rounded-full bg-[#111116] border border-[#2A2A2F]">
              <Lock className="w-12 h-12 text-[#FF6B00]" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Apex Vault</h1>
            <p className="text-[#888888]">Zero-knowledge encryption • Local-first AI</p>
          </div>
        </div>

        <div className="bg-[#111116] border border-[#2A2A2F] p-8 rounded-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-[#E5E5E5] block mb-2">Master Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                placeholder="Enter your password"
                className="w-full bg-[#0A0A0F] border border-[#2A2A2F] rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#FF6B00] text-white transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FF6B00] hover:bg-[#FF8533] text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>Decrypting...</span>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Unlock Vault</span>
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#2A2A2F]">
            <div className="flex items-center justify-center gap-2 text-xs text-[#888888]">
              <Shield className="w-4 h-4" />
              <span>AES-256-GCM • PBKDF2 (100k iterations)</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl">🔒</div>
            <p className="text-xs text-[#888888]">Zero-Knowledge</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">💻</div>
            <p className="text-xs text-[#888888]">Local-First</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">🚫</div>
            <p className="text-xs text-[#888888]">No Cloud</p>
          </div>
        </div>
      </div>
    </div>
  )
}
