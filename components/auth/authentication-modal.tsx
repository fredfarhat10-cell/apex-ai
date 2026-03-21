"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Eye, EyeOff, Fingerprint, ShieldCheck, DatabaseZap, EyeOffIcon, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { calculatePasswordStrength } from "@/lib/utils/password-strength"

interface AuthenticationModalProps {
  isOpen: boolean
  onClose: () => void
  initialView?: "login" | "signup"
}

export function AuthenticationModal({ isOpen, onClose, initialView = "signup" }: AuthenticationModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">(initialView)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [keepUpdated, setKeepUpdated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasWalletExtension, setHasWalletExtension] = useState(false)
  const { signInWithProvider, signInWithEmail, signUpWithEmail } = useAuth()

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      setHasWalletExtension(true)
    }
  }, [])

  const passwordStrength = activeTab === "signup" ? calculatePasswordStrength(password) : null

  const handleOAuth = async (provider: string) => {
    setIsLoading(true)
    try {
      await signInWithProvider(provider as any)
      onClose()
    } catch (error) {
      console.error(`[v0] ${provider} authentication failed:`, error)
      alert(`Failed to authenticate with ${provider}. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasskeyLogin = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement Passkey (WebAuthn) authentication flow.
      // 1. Call the backend to get challenge options for this user.
      // 2. Use navigator.credentials.get() with the options to prompt the user for biometrics (Face ID, Touch ID, Windows Hello).
      // 3. Send the resulting credential back to the backend for verification.
      // 4. On success, log the user in.
      // Libraries like @simplewebauthn/browser can simplify this.

      console.log("[v0] Passkey authentication initiated")
      alert("Passkey authentication coming soon! This will enable Face ID, Touch ID, and Windows Hello login.")
    } catch (error) {
      console.error("[v0] Passkey authentication failed:", error)
      alert("Failed to authenticate with passkey. Please try another method.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLink = async () => {
    if (!email) {
      alert("Please enter your email address first.")
      return
    }

    setIsLoading(true)
    try {
      // TODO: Implement magic link flow. Call a backend endpoint with the user's email to send a one-time login link.
      console.log("[v0] Magic link requested for:", email)
      alert(`Magic link sent to ${email}! Check your inbox for a secure login link.`)
    } catch (error) {
      console.error("[v0] Magic link failed:", error)
      alert("Failed to send magic link. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleWalletConnect = async (wallet: string) => {
    setIsLoading(true)
    try {
      await signInWithProvider(wallet as any)

      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          const userId = `user_${Date.now()}`
          await fetch("/api/crypto/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider: wallet,
              userId,
              address: accounts[0],
            }),
          })
        }
      }

      onClose()
    } catch (error) {
      console.error(`[v0] ${wallet} connection failed:`, error)
      alert(`Failed to connect ${wallet}. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (activeTab === "login") {
        await signInWithEmail(email, password)
      } else {
        await signUpWithEmail(email, password, email.split("@")[0])
      }
      onClose()
    } catch (error) {
      console.error(`[v0] Email ${activeTab} failed:`, error)
      alert(`Failed to ${activeTab}. Please check your credentials and try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = email.length > 0 && password.length >= 8

  const walletButtons = [
    {
      id: "metamask",
      label: "Continue with MetaMask",
      onClick: () => handleWalletConnect("metamask"),
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 318.6 318.6">
          <path fill="#E2761B" d="M274.1 35.5l-99.5 73.9L193 65.8z" />
          <path
            fill="#E4761B"
            d="M44.4 35.5l98.7 74.6-17.5-44.3zm193.9 171.3l-26.5 40.6 56.7 15.6 16.3-55.3zm-204.4.9L50.1 263l56.7-15.6-26.5-40.6z"
          />
          <path
            fill="#E4761B"
            d="M103.6 138.2l-15.8 23.9 56.3 2.5-2-60.5zm111.3 0l-39-34.8-1.3 61.2 56.2-2.5zM106.8 247.4l33.8-16.5-29.2-22.8zm71.1-16.5l33.9 16.5-4.7-39.3z"
          />
          <path fill="#D7C1B3" d="M211.8 247.4l-33.9-16.5 2.7 22.1-.3 9.3zm-105 0l31.5 14.9-.2-9.3 2.5-22.1z" />
          <path fill="#233447" d="M138.8 193.5l-28.2-8.3 19.9-9.1zm40.9 0l8.3-17.4 20 9.1z" />
          <path
            fill="#CD6116"
            d="M106.8 247.4l4.8-40.6-31.3.9zM207 206.8l4.8 40.6 26.5-39.7zm23.8-44.7l-56.2 2.5 5.2 28.9 8.3-17.4 20 9.1zm-120.2 23.1l20-9.1 8.2 17.4 5.3-28.9-56.3-2.5z"
          />
          <path
            fill="#E4751F"
            d="M87.8 162.1l23.6 46-.8-22.9zm120.3 23.1l-1 22.9 23.7-46zm-64-20.6l-5.3 28.9 6.6 34.1 1.5-44.9zm30.5 0l-2.7 18 1.2 45 6.7-34.1z"
          />
          <path
            fill="#F6851B"
            d="M179.8 193.5l-6.7 34.1 4.8 3.3 29.2-22.8 1-22.9zm-69.2-8.3l.8 22.9 29.2 22.8 4.8-3.3-6.6-34.1z"
          />
          <path
            fill="#C0AD9E"
            d="M180.3 262.3l.3-9.3-2.5-2.2h-37.7l-2.3 2.2.2 9.3-31.5-14.9 11 9 22.3 15.5h38.3l22.4-15.5 11-9z"
          />
          <path fill="#161616" d="M177.9 230.9l-4.8-3.3h-27.7l-4.8 3.3-2.5 22.1 2.3-2.2h37.7l2.5 2.2z" />
          <path
            fill="#763D16"
            d="M278.3 114.2l8.5-40.8-12.7-37.9-96.2 71.4 37 31.3 52.3 15.3 11.6-13.5-5-3.6 8-7.3-6.2-4.8 8-6.1zM31.8 73.4l8.5 40.8-5.4 4 8 6.1-6.1 4.8 8 7.3-5 3.6 11.5 13.5 52.3-15.3 37-31.3-96.2-71.4z"
          />
          <path
            fill="#F6851B"
            d="M267.2 153.5l-52.3-15.3 15.9 23.9-23.7 46 31.2-.4h46.5zm-163.6-15.3l-52.3 15.3-17.4 54.2h46.4l31.1.4-23.6-46zm71 26.4l3.3-57.7 15.2-41.1h-67.5l15 41.1 3.5 57.7 1.2 18.2.1 44.8h27.7l.2-44.8z"
          />
        </svg>
      ),
      priority: hasWalletExtension,
    },
    {
      id: "trustwallet",
      label: "Continue with Trust Wallet",
      onClick: () => handleWalletConnect("trustwallet"),
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 1024 1024">
          <circle cx="512" cy="512" r="512" fill="#3375BB" />
          <path fill="white" d="M512 128L256 384l256 256 256-256-256-256zm0 640L256 512l256 256 256-256-256 256z" />
        </svg>
      ),
      priority: false,
    },
    {
      id: "wallet",
      label: "Continue with Wallet",
      onClick: () => handleWalletConnect("wallet"),
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
      priority: false,
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-[#1C1C2E] rounded-2xl shadow-2xl border border-[#2a2a3e] overflow-hidden">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Tabs */}
              <div className="flex border-b border-[#2a2a3e] px-8 pt-8">
                <button
                  onClick={() => setActiveTab("login")}
                  className={`pb-4 px-4 text-lg font-semibold transition-all relative ${
                    activeTab === "login" ? "text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Log In
                  {activeTab === "login" && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3861FB]"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("signup")}
                  className={`pb-4 px-4 text-lg font-semibold transition-all relative ${
                    activeTab === "signup" ? "text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Sign Up
                  {activeTab === "signup" && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3861FB]"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                </button>
              </div>

              {/* Content */}
              <div className="p-8 space-y-4">
                {/* Social & Exchange Login Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handlePasskeyLogin}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-[#3861FB] to-[#5B7FFF] hover:from-[#2d4fd9] hover:to-[#4a6ee6] border-2 border-[#3861FB] rounded-lg transition-all shadow-lg shadow-[#3861FB]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Fingerprint className="w-5 h-5 text-white" />
                    <span className="text-white font-semibold">Continue with Passkey</span>
                  </button>

                  {hasWalletExtension && (
                    <motion.button
                      onClick={() => handleWalletConnect("metamask")}
                      disabled={isLoading}
                      animate={{
                        boxShadow: [
                          "0 0 0 rgba(226, 118, 27, 0)",
                          "0 0 20px rgba(226, 118, 27, 0.3)",
                          "0 0 0 rgba(226, 118, 27, 0)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#252538] hover:bg-[#2d2d42] border-2 border-[#E2761B] rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {walletButtons[0].icon}
                      <span className="text-white font-medium">{walletButtons[0].label}</span>
                      <span className="ml-auto text-xs text-[#E2761B] font-semibold">DETECTED</span>
                    </motion.button>
                  )}

                  {/* Google */}
                  <button
                    onClick={() => handleOAuth("google")}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#252538] hover:bg-[#2d2d42] border border-[#3a3a4e] rounded-lg transition-all hover:border-[#4a4a5e] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-white font-medium">Continue with Google</span>
                  </button>

                  {/* Apple */}
                  <button
                    onClick={() => handleOAuth("apple")}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#252538] hover:bg-[#2d2d42] border border-[#3a3a4e] rounded-lg transition-all hover:border-[#4a4a5e] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                    <span className="text-white font-medium">Continue with Apple</span>
                  </button>

                  {/* Binance */}
                  <button
                    onClick={() => handleOAuth("binance")}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#252538] hover:bg-[#2d2d42] border border-[#3a3a4e] rounded-lg transition-all hover:border-[#4a4a5e] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 126.61 126.61" fill="#F3BA2F">
                      <path d="M38.73 53.2l24.59-24.58 24.6 24.6 14.3-14.31L63.32 0 24.43 38.89l14.3 14.31zm-14.31 10.12L10.11 77.63l14.31 14.31 14.31-14.31-14.31-14.31zM38.73 73.41l24.59 24.59 24.6-24.6 14.31 14.29-38.9 38.91-38.91-38.88v-.01l14.31-14.3zm52.57-10.12l14.31-14.31 14.31 14.31-14.31 14.31-14.31-14.31z" />
                      <path d="M77.83 63.3L63.32 48.78 52.59 59.51l-1.24 1.23-2.54 2.54 14.51 14.5 14.51-14.47v-.01z" />
                    </svg>
                    <span className="text-white font-medium">Continue with Binance</span>
                  </button>

                  {/* Crypto.com */}
                  <button
                    onClick={() => handleOAuth("crypto.com")}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#252538] hover:bg-[#2d2d42] border border-[#3a3a4e] rounded-lg transition-all hover:border-[#4a4a5e] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#003D7A">
                      <circle cx="12" cy="12" r="11" fill="#003D7A" />
                      <path
                        d="M12 6l-1.5 4.5h-3L10 12l-1.5 4.5h3L12 18l1.5-1.5h3L15 12l2.5-1.5h-3L12 6z"
                        fill="white"
                      />
                    </svg>
                    <span className="text-white font-medium">Continue with Crypto.com</span>
                  </button>

                  {/* Kraken */}
                  <button
                    onClick={() => handleOAuth("kraken")}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#252538] hover:bg-[#2d2d42] border border-[#3a3a4e] rounded-lg transition-all hover:border-[#4a4a5e] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#5741D9">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                    </svg>
                    <span className="text-white font-medium">Continue with Kraken</span>
                  </button>

                  {!hasWalletExtension && (
                    <button
                      onClick={() => handleWalletConnect("metamask")}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#252538] hover:bg-[#2d2d42] border border-[#3a3a4e] rounded-lg transition-all hover:border-[#4a4a5e] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {walletButtons[0].icon}
                      <span className="text-white font-medium">{walletButtons[0].label}</span>
                    </button>
                  )}

                  {/* Trust Wallet */}
                  <button
                    onClick={() => handleWalletConnect("trustwallet")}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#252538] hover:bg-[#2d2d42] border border-[#3a3a4e] rounded-lg transition-all hover:border-[#4a4a5e] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {walletButtons[1].icon}
                    <span className="text-white font-medium">{walletButtons[1].label}</span>
                  </button>

                  {/* Generic Wallet */}
                  <button
                    onClick={() => handleWalletConnect("wallet")}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#252538] hover:bg-[#2d2d42] border border-[#3a3a4e] rounded-lg transition-all hover:border-[#4a4a5e] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {walletButtons[2].icon}
                    <span className="text-white font-medium">{walletButtons[2].label}</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#3a3a4e]" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-[#1C1C2E] text-gray-400 font-medium">OR CONTINUE WITH EMAIL</span>
                  </div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white text-sm">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-[#252538] border-[#3a3a4e] text-white placeholder:text-gray-500 focus:border-[#3861FB] focus:ring-[#3861FB]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white text-sm">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-[#252538] border-[#3a3a4e] text-white placeholder:text-gray-500 focus:border-[#3861FB] focus:ring-[#3861FB] pr-10"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    {activeTab === "signup" && password && passwordStrength && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Password Strength</span>
                          <span style={{ color: passwordStrength.color }} className="font-semibold">
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="h-1.5 bg-[#252538] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${passwordStrength.percentage}%` }}
                            transition={{ duration: 0.3 }}
                            style={{ backgroundColor: passwordStrength.color }}
                            className="h-full rounded-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleMagicLink}
                    disabled={isLoading || !email}
                    className="w-full flex items-center justify-center gap-2 text-sm text-[#3861FB] hover:text-[#2d4fd9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email me a secure magic link</span>
                  </button>

                  {activeTab === "signup" && (
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="updates"
                        checked={keepUpdated}
                        onCheckedChange={(checked) => setKeepUpdated(checked as boolean)}
                        className="mt-1 border-[#3a3a4e] data-[state=checked]:bg-[#3861FB] data-[state=checked]:border-[#3861FB]"
                      />
                      <Label htmlFor="updates" className="text-sm text-gray-300 leading-relaxed cursor-pointer">
                        Please keep me updated by email with the latest market insights, feature updates, and AI-driven
                        research findings from Apex AI.
                      </Label>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={!isFormValid || isLoading}
                    className="w-full bg-[#3861FB] hover:bg-[#2d4fd9] text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Processing..." : activeTab === "login" ? "Log In" : "Sign Up"}
                  </Button>
                </form>

                <div className="pt-6 mt-6 border-t border-[#2a2a3e]">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <ShieldCheck className="w-5 h-5 text-green-500" />
                      <span className="text-xs text-gray-400">Zero-Knowledge Encryption</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center">
                      <DatabaseZap className="w-5 h-5 text-green-500" />
                      <span className="text-xs text-gray-400">100% Local-First Data</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center">
                      <EyeOffIcon className="w-5 h-5 text-green-500" />
                      <span className="text-xs text-gray-400">No Cloud Sync</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
