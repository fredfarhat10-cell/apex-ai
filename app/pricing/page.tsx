"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import PaymentModal from "@/components/payment-modal"

export default function PricingPage() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState(false)

  const tiers = [
    {
      name: "Free",
      subtitle: "Get Started",
      price: "$0",
      period: "forever",
      description: "Perfect for trying out ApexAI",
      features: [
        "14-Day Full-Access Trial",
        "Basic AI Assistant (GPT-4 Mini)",
        "On-device Encryption",
        "1 Personal Studio",
        "Command Bar Interface",
        "Basic Memory System",
      ],
      cta: "Start Free",
      highlighted: false,
      badge: null,
    },
    {
      name: "Pro",
      subtitle: "Most Popular",
      price: "$49",
      period: "per month",
      description: "For professionals who want the full power",
      features: [
        "Everything in Free",
        "Unlimited AI Calls",
        "Access to Claude Opus 4.1",
        "Access to GPT-5",
        "Unlimited Personal Studios",
        "Analytics Dashboard",
        "Project Echo Simulator",
        "Proactive Notifications",
        "Priority Support",
        "Advanced Memory System",
      ],
      cta: "Get Advanced",
      highlighted: true,
      badge: "MOST POPULAR",
    },
    {
      name: "Enterprise",
      subtitle: "For Teams",
      price: "Custom",
      period: "contact us",
      description: "Dedicated AI for your entire organization",
      features: [
        "Everything in Pro",
        "Dedicated AI Employees",
        "Multi-user Collaboration",
        "On-premise Deployment",
        "Custom Integrations",
        "Advanced Security Controls",
        "Dedicated Account Manager",
        "SLA Guarantee",
        "Custom Training",
      ],
      cta: "Get Max",
      highlighted: false,
      badge: null,
    },
  ]

  const handleSelectTier = (tierName: string) => {
    if (tierName === "Free") {
      window.location.href = "/"
    } else {
      setSelectedTier(tierName)
      setShowPayment(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#111116]">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8533] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">ApexAI</span>
          </div>
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-white"
            onClick={() => (window.location.href = "/")}
          >
            Back to Home
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-6 gradient-text"
          >
            Choose Your Level of Symbiosis
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 mb-4 max-w-3xl mx-auto"
          >
            Start free, upgrade when you're ready to unlock the full power of your AI co-pilot
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-gray-500 mb-12"
          >
            All plans include zero-knowledge encryption and on-device processing
          </motion.p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: tier.highlighted ? 1.02 : 1.05 }}
                className={`relative glass-effect p-8 rounded-2xl ${
                  tier.highlighted
                    ? "apex-glow-strong scale-105 border-2 border-[#FF6B00]"
                    : "border border-gray-700 hover:border-[#FF6B00]/50"
                } transition-all duration-300`}
              >
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FF6B00] to-[#FF8533] text-white px-6 py-2 rounded-full text-sm font-bold apex-glow">
                    {tier.badge}
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-[#FF6B00] text-sm font-semibold mb-6">{tier.subtitle}</p>

                  <div className="mb-4">
                    <span className="text-5xl font-bold gradient-text">{tier.price}</span>
                    {tier.period && <span className="text-gray-400 text-lg ml-2">/ {tier.period}</span>}
                  </div>

                  <p className="text-gray-400 text-sm">{tier.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300">
                      <Check className="w-5 h-5 text-[#FF6B00] flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectTier(tier.name)}
                  className={`w-full ${
                    tier.highlighted
                      ? "bg-[#FF6B00] hover:bg-[#FF8533] text-white apex-glow"
                      : "bg-transparent border-2 border-[#FF6B00] hover:bg-[#FF6B00]/10 text-[#FF6B00]"
                  } font-bold py-6 rounded-xl transition-all text-lg`}
                >
                  {tier.cta}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-[#111116]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 gradient-text">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "Can I switch plans anytime?",
                a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
              },
              {
                q: "Is my data secure?",
                a: "Absolutely. All data is encrypted with zero-knowledge encryption and processed on your device. We never see your data.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, debit cards, and digital wallets through Stripe.",
              },
              {
                q: "Do you offer refunds?",
                a: "Yes, we offer a 30-day money-back guarantee for all paid plans. No questions asked.",
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-effect p-6 rounded-xl border border-gray-700"
              >
                <h3 className="text-xl font-semibold text-white mb-3">{faq.q}</h3>
                <p className="text-gray-400 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          <p>2025 ApexAI. Your data. Your device. Your fortress.</p>
        </div>
      </footer>

      {/* Payment Modal */}
      {showPayment && <PaymentModal tier={selectedTier} onClose={() => setShowPayment(false)} />}
    </div>
  )
}
