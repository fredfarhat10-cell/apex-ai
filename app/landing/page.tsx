"use client"

import { motion } from "framer-motion"
import { ArrowRight, FileCode, Zap, ShieldCheck, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[#00FFFF] rounded-full"
              initial={{
                x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1920),
                y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1080),
                opacity: 0.2,
              }}
              animate={{
                y: [null, Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1080)],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: Math.random() * 15 + 10,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
            style={{
              background: "linear-gradient(to right, #FFFFFF, #00FFFF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ApexAI is your all-in-one thinking assistant that understands your workflow and automates the boring parts
            of your creative and business work — not just chat, but real actions.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Button
              size="lg"
              className="bg-[#00FFFF] hover:bg-[#00CCFF] text-black font-bold px-10 py-7 text-lg rounded-xl shadow-[0_0_30px_rgba(0,255,255,0.5)] transition-all"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* 2. CORE FEATURES SECTION */}
      <section className="py-32 px-4 bg-gradient-to-b from-[#0A0A0F] to-[#0A0A0F]">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-bold text-center mb-20"
            style={{
              background: "linear-gradient(to right, #FFFFFF, #00FFFF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Automate, accelerate, and simplify your workflow.
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: FileCode,
                title: "Multi-Repository Indexing",
                description: "Indexes code patterns and dependencies across all your repositories simultaneously.",
              },
              {
                icon: Zap,
                title: "Multi-file Operations",
                description: "Generates and modifies code across multiple files simultaneously.",
              },
              {
                icon: ShieldCheck,
                title: "Automated Validation & Fixes",
                description: "Validates code against syntax rules, project conventions, and integration requirements.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#00FFFF]/10 flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-[#00FFFF]" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-[#888888] text-lg leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. LIVE DEMO SECTION */}
      <section className="py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-bold text-center mb-20"
            style={{
              background: "linear-gradient(to right, #FFFFFF, #00FFFF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Ship Products Faster.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#111116] border border-[#2A2A2F] rounded-2xl p-8"
          >
            {/* Command Input */}
            <div className="mb-6 p-4 bg-[#0A0A0F] border border-[#2A2A2F] rounded-xl">
              <p className="text-[#888888] text-sm mb-2">Natural Language Command:</p>
              <p className="text-white text-lg font-mono">
                "Virtualize long list in ui.tsx; keep behavior identical; include before/after render timings; PR."
              </p>
            </div>

            {/* Action Buttons (Disabled UI) */}
            <div className="flex flex-wrap gap-4 mb-6">
              <button
                disabled
                className="px-6 py-3 bg-[#00FFFF]/10 border border-[#00FFFF]/30 rounded-lg text-[#00FFFF] font-semibold opacity-50 cursor-not-allowed"
              >
                Apply changes
              </button>
              <button
                disabled
                className="px-6 py-3 bg-transparent border border-[#2A2A2F] rounded-lg text-[#888888] opacity-50 cursor-not-allowed"
              >
                Context options
              </button>
            </div>

            {/* Model Selection */}
            <div className="p-4 bg-[#0A0A0F] border border-[#2A2A2F] rounded-xl">
              <p className="text-[#888888] text-sm mb-3">Model:</p>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded border-2 border-[#00FFFF] bg-[#00FFFF] flex items-center justify-center">
                  <Check className="w-3 h-3 text-black" />
                </div>
                <span className="text-white font-semibold">Sonnet 4.5 Parallel Thinking</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. INCLUDED IN ALL PLANS SECTION */}
      <section className="py-32 px-4 bg-[#111116]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left Side */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-5xl font-bold mb-6 text-white">Included in all plans</h2>
              <p className="text-[#888888] text-xl leading-relaxed">
                Every ApexAI subscription comes with enterprise-grade features, unlimited access to premium AI models,
                and a complete suite of productivity tools.
              </p>
            </motion.div>

            {/* Right Side - Feature Grid */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {[
                "Premium Models (GPT-5, Claude Opus 4.1)",
                "Coding Agent",
                "Zen Agents",
                "Command Bar Interface",
                "Multi-file Operations",
                "Analytics Dashboard",
                "Zero-Knowledge Encryption",
                "On-device Processing",
                "Unlimited Studios",
                "Project Echo Simulator",
                "Priority Support",
                "API Access",
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <Check className="w-5 h-5 text-[#00FFFF] flex-shrink-0 mt-0.5" />
                  <span className="text-white">{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left Side */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:sticky lg:top-32"
            >
              <h2 className="text-5xl font-bold mb-6 text-white">Everything you need. For less than a coffee a day.</h2>
              <p className="text-[#888888] text-xl leading-relaxed">
                ApexAI is designed to be your most valuable productivity investment. Get started free, upgrade when
                you're ready.
              </p>
            </motion.div>

            {/* Right Side - FAQ Accordion */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Accordion type="single" collapsible className="space-y-4">
                {[
                  {
                    q: "What makes ApexAI different from ChatGPT?",
                    a: "ApexAI is not just a chatbot - it's an action-oriented AI that integrates with your entire workflow. It can execute tasks, manage your data, and automate complex operations across multiple tools.",
                  },
                  {
                    q: "Is my data secure?",
                    a: "Absolutely. ApexAI uses zero-knowledge encryption and processes everything on your device. Your data never leaves your control, and we can't access it even if we wanted to.",
                  },
                  {
                    q: "Can I use ApexAI for my team?",
                    a: "Yes! Our Enterprise plan includes multi-user collaboration, dedicated AI employees for your team, and on-premise deployment options.",
                  },
                  {
                    q: "What AI models does ApexAI use?",
                    a: "ApexAI gives you access to the latest and most powerful AI models including GPT-5, Claude Opus 4.1, and specialized models for coding, analysis, and creative work.",
                  },
                  {
                    q: "Do you offer a free trial?",
                    a: "Yes! Every new user gets a 14-day full-access trial with no credit card required. Experience the full power of ApexAI before committing.",
                  },
                ].map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    className="bg-[#111116] border border-[#2A2A2F] rounded-xl px-6 data-[state=open]:border-[#00FFFF]/50"
                  >
                    <AccordionTrigger className="text-white text-lg font-semibold hover:text-[#00FFFF] transition-colors">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-[#888888] text-base leading-relaxed">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 px-4 bg-gradient-to-b from-[#0A0A0F] to-[#111116]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-bold mb-8"
            style={{
              background: "linear-gradient(to right, #FFFFFF, #00FFFF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Ready to transform your workflow?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-[#888888] mb-12 max-w-2xl mx-auto"
          >
            Join thousands of professionals who have unlocked their full potential with ApexAI.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Button
              size="lg"
              className="bg-[#00FFFF] hover:bg-[#00CCFF] text-black font-bold px-12 py-8 text-xl rounded-xl shadow-[0_0_40px_rgba(0,255,255,0.6)] transition-all"
            >
              Start Free Trial
              <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-[#2A2A2F]">
        <div className="max-w-7xl mx-auto text-center text-[#888888]">
          <p>2025 ApexAI. Built with precision. Designed for excellence.</p>
        </div>
      </footer>
    </div>
  )
}
