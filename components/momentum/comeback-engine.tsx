"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Sparkles, ArrowRight } from "lucide-react"
import { useMomentumStore } from "@/lib/momentum-store"

const reasonChips = [
  "Got busy",
  "Wasn't feeling it",
  "Something came up",
] as const

export default function ComebackEngine() {
  const { comebackActive, setComebackActive, setActiveTab } = useMomentumStore()
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)

  if (!comebackActive) return null

  const handleStartFresh = () => {
    setStarting(true)
    setTimeout(() => {
      setComebackActive(false)
      setActiveTab("home")
    }, 600)
  }

  return (
    <div className="relative min-h-screen max-w-md mx-auto overflow-hidden">
      {/* Soft gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B1120] via-[#0F1A2E] to-[#0B2027]" />

      {/* Abstract warm illustration — CSS shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large soft circle — warm gold glow */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#F59E0B]/[0.04] blur-3xl" />
        {/* Soft green circle */}
        <div className="absolute top-1/3 -left-16 w-56 h-56 rounded-full bg-[#22C55E]/[0.05] blur-3xl" />
        {/* Reaching hand abstraction — layered circles */}
        <div className="absolute bottom-32 right-8 flex flex-col items-center gap-1 opacity-[0.08]">
          <div className="w-10 h-10 rounded-full bg-[#22C55E]" />
          <div className="w-8 h-14 rounded-full bg-[#22C55E]" />
          <div className="w-16 h-16 rounded-full bg-[#F59E0B]" />
          <div className="w-24 h-24 rounded-full bg-[#22C55E]" />
        </div>
        {/* Floating small circles */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-48 right-12 w-4 h-4 rounded-full bg-[#F59E0B]/20"
        />
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-64 left-10 w-3 h-3 rounded-full bg-[#22C55E]/20"
        />
      </div>

      {/* Content */}
      <AnimatePresence>
        {!starting && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex flex-col px-6 pt-16 pb-8 min-h-screen"
          >
            {/* Warm icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#22C55E]/10 flex items-center justify-center">
                <Heart className="w-8 h-8 text-[#22C55E]" />
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-[#F1F5F9] leading-tight mb-3"
            >
              Life got in the way?{" "}
              <span className="text-[#F59E0B]">No problem.</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-[#94A3B8] text-base leading-relaxed mb-8"
            >
              Momentum is about progress, not perfection. Here&apos;s how we get
              back on track.
            </motion.p>

            {/* 3-Day Reset Sprint Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl bg-[#131C2E] border border-[#22C55E]/20 p-5 mb-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#22C55E]" />
                </div>
                <div>
                  <h3 className="text-[#F1F5F9] font-semibold text-lg">
                    3-Day Reset Sprint
                  </h3>
                </div>
              </div>
              <p className="text-[#94A3B8] text-sm leading-relaxed mb-4">
                3 simple days, reduced requirements, no catch-up needed. Just
                ease back in at your own pace.
              </p>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-xs font-medium">
                No catch-up required
              </span>
            </motion.div>

            {/* Optional reason chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <p className="text-[#64748B] text-xs mb-3 uppercase tracking-wide">
                What happened? (optional)
              </p>
              <div className="flex flex-wrap gap-2">
                {reasonChips.map((reason) => (
                  <button
                    key={reason}
                    onClick={() =>
                      setSelectedReason(selectedReason === reason ? null : reason)
                    }
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      selectedReason === reason
                        ? "bg-[#64748B]/30 text-[#F1F5F9] border border-[#64748B]/50"
                        : "bg-[#131C2E] text-[#64748B] border border-[#1E293B] hover:border-[#64748B]/40"
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Primary CTA */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartFresh}
              className="w-full py-4 rounded-xl bg-[#22C55E] text-white font-semibold text-lg flex items-center justify-center gap-2 hover:bg-[#16A34A] transition-colors mb-4"
            >
              Start Fresh
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            {/* Secondary link */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-[#64748B] text-sm py-2 hover:text-[#94A3B8] transition-colors"
            >
              Take More Time
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
