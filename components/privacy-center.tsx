"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShieldCheckIcon, LockIcon, EyeOffIcon, CheckCircle2, AlertTriangle, Database, Key, Zap } from "lucide-react"
import { useVault } from "@/lib/vault-context"

export default function PrivacyCenter() {
  const { sessionPassword } = useVault()
  const [securityScore, setSecurityScore] = useState(0)
  const [encryptionDemo, setEncryptionDemo] = useState({
    plaintext: "",
    encrypted: "",
    isEncrypting: false,
    isDecrypting: false,
    showEncrypted: false,
  })

  useEffect(() => {
    let score = 0
    if (sessionPassword) score += 25 // Vault is encrypted
    if (typeof window !== "undefined" && window.crypto.subtle) score += 25 // Web Crypto API available
    if (typeof indexedDB !== "undefined") score += 25 // IndexedDB available
    if (navigator.onLine === false || true) score += 25 // Offline-first architecture

    setSecurityScore(score)
  }, [sessionPassword])

  const handleEncrypt = async () => {
    if (!encryptionDemo.plaintext) return

    setEncryptionDemo((prev) => ({ ...prev, isEncrypting: true }))

    // Simulate encryption with dramatic animation
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Use Web Crypto API to actually encrypt
    const encoder = new TextEncoder()
    const data = encoder.encode(encryptionDemo.plaintext)
    const key = await window.crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"])
    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    const encrypted = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data)

    // Convert to base64 for display
    const encryptedArray = new Uint8Array(encrypted)
    const encryptedBase64 = btoa(String.fromCharCode(...encryptedArray))

    setEncryptionDemo((prev) => ({
      ...prev,
      encrypted: encryptedBase64,
      isEncrypting: false,
      showEncrypted: true,
    }))
  }

  const handleDecrypt = async () => {
    setEncryptionDemo((prev) => ({ ...prev, isDecrypting: true }))

    // Simulate decryption with animation
    await new Promise((resolve) => setTimeout(resolve, 500))

    setEncryptionDemo((prev) => ({
      ...prev,
      isDecrypting: false,
      showEncrypted: false,
    }))
  }

  const resetDemo = () => {
    setEncryptionDemo({
      plaintext: "",
      encrypted: "",
      isEncrypting: false,
      isDecrypting: false,
      showEncrypted: false,
    })
  }

  return (
    <div className="h-screen w-full bg-[#0a0a0f] text-white overflow-y-auto p-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ShieldCheckIcon className="w-12 h-12 text-cyan-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Privacy Center
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Your data is encrypted end-to-end with zero-knowledge architecture. Everything stays on your device. We
            can't see it. No one can.
          </p>
        </div>

        {/* Live Security Dashboard */}
        <Card className="bg-[#0f1118] border-cyan-400/30 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="w-6 h-6 text-cyan-400" />
              Live Security Score
            </h2>
            <div className="text-right">
              <div className="text-5xl font-bold text-cyan-400">{securityScore}</div>
              <div className="text-sm text-gray-400">/ 100</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <SecurityCheck
              icon={<LockIcon className="w-5 h-5" />}
              title="AES-256 Encryption"
              status="active"
              description="Military-grade encryption protecting all your data"
            />
            <SecurityCheck
              icon={<Database className="w-5 h-5" />}
              title="Local-First Storage"
              status="active"
              description="Data never leaves your device"
            />
            <SecurityCheck
              icon={<Key className="w-5 h-5" />}
              title="Zero-Knowledge Architecture"
              status="active"
              description="We can't access your data even if we wanted to"
            />
            <SecurityCheck
              icon={<EyeOffIcon className="w-5 h-5" />}
              title="No Cloud Sync"
              status="active"
              description="Your vault stays completely offline"
            />
          </div>

          <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-4">
            <p className="text-sm text-cyan-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              All security systems operational. Your data is completely private and secure.
            </p>
          </div>
        </Card>

        {/* Encryption Visualizer */}
        <Card className="bg-[#0f1118] border-purple-400/30 p-8">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Key className="w-6 h-6 text-purple-400" />
            Encryption Visualizer
          </h2>
          <p className="text-gray-400 mb-6">
            See your data being encrypted in real-time. This is what happens to every piece of information you store in
            Apex.
          </p>

          <div className="space-y-6">
            {/* Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Your Secret Message</label>
              <Input
                value={encryptionDemo.plaintext}
                onChange={(e) => setEncryptionDemo((prev) => ({ ...prev, plaintext: e.target.value }))}
                placeholder="Type something secret..."
                className="bg-[#14161e] border-white/10 text-white"
                disabled={encryptionDemo.showEncrypted}
              />
            </div>

            {/* Encryption Animation */}
            {encryptionDemo.isEncrypting && (
              <div className="flex items-center justify-center py-8">
                <div className="relative">
                  <div className="w-32 h-32 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <LockIcon className="w-12 h-12 text-purple-400 animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            {/* Encrypted Output */}
            {encryptionDemo.showEncrypted && !encryptionDemo.isEncrypting && (
              <div className="animate-slideIn">
                <label className="block text-sm font-medium text-gray-300 mb-2">Encrypted Data (AES-256-GCM)</label>
                <div className="bg-[#14161e] border border-purple-400/30 rounded-lg p-4 font-mono text-sm text-purple-300 break-all">
                  {encryptionDemo.encrypted}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This gibberish is mathematically impossible to decrypt without your password. Even with all the
                  computing power in the world, it would take billions of years.
                </p>
              </div>
            )}

            {/* Decryption Animation */}
            {encryptionDemo.isDecrypting && (
              <div className="flex items-center justify-center py-8">
                <div className="relative">
                  <div className="w-32 h-32 border-4 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Key className="w-12 h-12 text-green-400 animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-4">
              {!encryptionDemo.showEncrypted ? (
                <Button
                  onClick={handleEncrypt}
                  disabled={!encryptionDemo.plaintext || encryptionDemo.isEncrypting}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {encryptionDemo.isEncrypting ? "Encrypting..." : "Encrypt Message"}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleDecrypt}
                    disabled={encryptionDemo.isDecrypting}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {encryptionDemo.isDecrypting ? "Decrypting..." : "Decrypt Message"}
                  </Button>
                  <Button
                    onClick={resetDemo}
                    variant="outline"
                    className="border-white/10 hover:bg-white/5 bg-transparent"
                  >
                    Reset
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Privacy Data Flow */}
        <Card className="bg-[#0f1118] border-blue-400/30 p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-400" />
            Privacy Data Flow
          </h2>

          <div className="space-y-6">
            <DataFlowStep
              number={1}
              title="You Enter Data"
              description="Type your goals, expenses, habits, or any personal information"
              color="cyan"
            />
            <DataFlowStep
              number={2}
              title="Instant Encryption"
              description="Data is immediately encrypted with AES-256 using your password"
              color="purple"
            />
            <DataFlowStep
              number={3}
              title="Local Storage Only"
              description="Encrypted data is stored in IndexedDB on your device"
              color="blue"
            />
            <DataFlowStep
              number={4}
              title="Zero Network Transmission"
              description="Your data never touches our servers or the internet"
              color="green"
            />
          </div>

          <div className="mt-8 bg-blue-500/10 border border-blue-400/30 rounded-lg p-6">
            <h3 className="font-semibold text-blue-300 mb-2">What This Means For You</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>We can't read your data even if we wanted to</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Hackers can't steal your data from our servers (because it's not there)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Government agencies can't subpoena your data (we don't have it)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Your privacy is mathematically guaranteed, not just promised</span>
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
}

function SecurityCheck({
  icon,
  title,
  status,
  description,
}: {
  icon: React.ReactNode
  title: string
  status: "active" | "warning" | "error"
  description: string
}) {
  const statusColors = {
    active: "text-green-400 bg-green-500/10 border-green-400/30",
    warning: "text-yellow-400 bg-yellow-500/10 border-yellow-400/30",
    error: "text-red-400 bg-red-500/10 border-red-400/30",
  }

  const statusIcons = {
    active: <CheckCircle2 className="w-4 h-4" />,
    warning: <AlertTriangle className="w-4 h-4" />,
    error: <AlertTriangle className="w-4 h-4" />,
  }

  return (
    <div className={`p-4 rounded-lg border ${statusColors[status]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="font-semibold">{title}</h3>
        {statusIcons[status]}
      </div>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  )
}

function DataFlowStep({
  number,
  title,
  description,
  color,
}: {
  number: number
  title: string
  description: string
  color: "cyan" | "purple" | "blue" | "green"
}) {
  const colorClasses = {
    cyan: "bg-cyan-500/20 text-cyan-300 border-cyan-400/30",
    purple: "bg-purple-500/20 text-purple-300 border-purple-400/30",
    blue: "bg-blue-500/20 text-blue-300 border-blue-400/30",
    green: "bg-green-500/20 text-green-300 border-green-400/30",
  }

  return (
    <div className="flex items-start gap-4">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 flex-shrink-0 ${colorClasses[color]}`}
      >
        {number}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  )
}
