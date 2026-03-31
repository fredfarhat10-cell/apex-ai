"use client"

import type React from "react"

import { useState } from "react"
import { X, CreditCard, Lock, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PaymentModalProps {
  tier: string | null
  onClose: () => void
}

export default function PaymentModal({ tier, onClose }: PaymentModalProps) {
  const [processing, setProcessing] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    // TODO: Initialize Stripe Payment Element here
    // 1. Create a PaymentIntent on your backend
    // 2. Mount the Stripe Payment Element in the #payment-element div
    // 3. Handle payment confirmation
    // 4. Redirect to success page

    console.log("[v0] Stripe payment flow would start here")
    console.log("[v0] Selected tier:", tier)
    console.log("[v0] Customer email:", email)

    // Simulate payment processing
    setTimeout(() => {
      alert("Payment integration coming soon! This is where Stripe would process the payment.")
      setProcessing(false)
      onClose()
    }, 2000)
  }

  const tierPrices: Record<string, string> = {
    Pro: "$49/month",
    Enterprise: "Custom pricing",
  }

  const features = {
    Pro: ["Unlimited AI Calls", "Access to Claude Opus 4.1 & GPT-5", "Analytics Dashboard", "Priority Support"],
    Enterprise: ["Custom AI Employees", "Multi-user Collaboration", "Dedicated Account Manager", "SLA Guarantee"],
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-effect max-w-2xl w-full rounded-2xl border border-gray-700 p-8 animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold gradient-text">Complete Your Purchase</h2>
            <p className="text-gray-400 mt-2">
              {tier} Plan - {tierPrices[tier || "Pro"]}
            </p>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon" className="hover:bg-white/10">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="bg-white/5 border-gray-700 focus:border-[#FF6B00] text-white"
            />
          </div>

          {/* Stripe Payment Element Placeholder */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment Details
            </label>
            <div
              id="payment-element"
              className="p-6 rounded-lg bg-white/5 border-2 border-dashed border-gray-700 text-center"
            >
              <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm mb-2">Stripe Payment Element will be mounted here</p>
              <p className="text-gray-500 text-xs">
                TODO: Initialize Stripe.js and mount the Payment Element in this div
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-400 font-semibold mb-1">Secure Payment</p>
                <p className="text-xs text-gray-400">
                  Your payment information is encrypted and processed securely by Stripe. We never store your card
                  details.
                </p>
              </div>
            </div>
          </div>

          {/* Features Included */}
          <div className="p-4 rounded-lg bg-white/5 border border-gray-700">
            <p className="text-sm font-semibold text-white mb-3">What's included:</p>
            <ul className="space-y-2">
              {features[tier || "Pro"].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-[#FF6B00]" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={processing || !email}
            className="w-full bg-[#FF6B00] hover:bg-[#FF8533] text-white font-bold py-6 text-lg rounded-xl apex-glow disabled:opacity-50"
          >
            {processing ? "Processing..." : `Subscribe to ${tier}`}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By subscribing, you agree to our Terms of Service and Privacy Policy. Cancel anytime.
          </p>
        </form>
      </div>
    </div>
  )
}
