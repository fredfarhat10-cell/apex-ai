"use client"

import { useState } from "react"
import { AuthenticationModal } from "@/components/auth/authentication-modal"
import { Button } from "@/components/ui/button"

export default function AuthDemoPage() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Authentication Modal Demo</h1>
          <p className="text-muted-foreground text-lg">
            Click the button below to see the CoinMarketCap-inspired authentication modal with all crypto exchange and
            wallet integrations.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => setIsOpen(true)} size="lg" className="text-lg px-8">
            Open Authentication Modal
          </Button>
        </div>

        <div className="mt-12 p-6 bg-card rounded-lg border border-border">
          <h2 className="text-xl font-semibold mb-4">Features Included:</h2>
          <ul className="text-left space-y-2 text-muted-foreground">
            <li>✓ Social Login (Google, Apple)</li>
            <li>✓ Crypto Exchange Integration (Binance, Crypto.com, Kraken, Coinbase)</li>
            <li>✓ Wallet Connections (MetaMask, Trust Wallet, Generic Wallet)</li>
            <li>✓ Traditional Email/Password Authentication</li>
            <li>✓ Dark Theme with Apex AI Aesthetic</li>
            <li>✓ Smooth Animations with Framer Motion</li>
            <li>✓ Responsive Design</li>
          </ul>
        </div>
      </div>

      <AuthenticationModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  )
}
