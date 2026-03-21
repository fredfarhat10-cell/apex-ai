"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, RotateCcw, Send, Check, Sparkles, Loader2 } from "lucide-react"
import { useMomentumStore } from "@/lib/momentum-store"

type VerificationStep = "CAMERA" | "PREVIEW" | "PROCESSING" | "SUCCESS"

export default function HabitVerification() {
  const {
    verifyingHabitId,
    setVerifyingHabitId,
    habits,
    logHabit,
    xpMultiplier,
    rollXpMultiplier,
  } = useMomentumStore()

  const [step, setStep] = useState<VerificationStep>("CAMERA")
  const [caption, setCaption] = useState("")

  const habit = habits.find((h) => h.id === verifyingHabitId)

  // Reset state when habit changes
  useEffect(() => {
    if (verifyingHabitId) {
      setStep("CAMERA")
      setCaption("")
    }
  }, [verifyingHabitId])

  // Auto-advance from PROCESSING to SUCCESS
  useEffect(() => {
    if (step === "PROCESSING") {
      rollXpMultiplier()
      const timer = setTimeout(() => setStep("SUCCESS"), 1500)
      return () => clearTimeout(timer)
    }
  }, [step, rollXpMultiplier])

  if (!verifyingHabitId || !habit) return null

  const baseXP = 50
  const earnedXP = baseXP * xpMultiplier

  const handleCapture = () => {
    setStep("PREVIEW")
  }

  const handleRetake = () => {
    setStep("CAMERA")
    setCaption("")
  }

  const handleSubmit = () => {
    setStep("PROCESSING")
  }

  const handleDone = () => {
    logHabit({
      id: `log-${Date.now()}`,
      habitId: habit.id,
      date: new Date().toISOString().split("T")[0],
      status: "verified",
      xpEarned: earnedXP,
      creditChange: 0,
      note: caption || undefined,
      verifiedAt: new Date().toISOString(),
    })
    setVerifyingHabitId(null)
  }

  const pageVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: "#0B1120" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        {/* ─── CAMERA ─── */}
        {step === "CAMERA" && (
          <motion.div
            key="camera"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-1 flex-col items-center justify-between px-6 py-10"
          >
            {/* Habit name */}
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: "#64748B" }}>
                Verify Habit
              </p>
              <h2 className="mt-1 text-xl font-bold" style={{ color: "#F1F5F9" }}>
                {habit.name}
              </h2>
            </div>

            {/* Camera placeholder area */}
            <button
              onClick={handleCapture}
              className="flex aspect-[3/4] w-full max-w-xs flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed transition-colors hover:border-opacity-60"
              style={{
                borderColor: "#64748B",
                backgroundColor: "#131C2E",
              }}
            >
              <Camera className="h-16 w-16" style={{ color: "#64748B" }} />
              <span className="text-sm font-medium" style={{ color: "#64748B" }}>
                Tap to capture
              </span>
            </button>

            {/* Capture button & instruction */}
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm" style={{ color: "#64748B" }}>
                Take a photo of your activity
              </p>
              <button
                onClick={handleCapture}
                className="flex h-20 w-20 items-center justify-center rounded-full border-4"
                style={{ borderColor: "#F1F5F9" }}
              >
                <div
                  className="h-14 w-14 rounded-full transition-transform hover:scale-95 active:scale-90"
                  style={{ backgroundColor: "#3B82F6" }}
                />
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── PREVIEW ─── */}
        {step === "PREVIEW" && (
          <motion.div
            key="preview"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-1 flex-col"
          >
            {/* "Photo" placeholder */}
            <div
              className="relative flex flex-1 items-end"
              style={{
                background:
                  "linear-gradient(135deg, #1e3a5f 0%, #131C2E 40%, #0B1120 100%)",
              }}
            >
              {/* Gradient overlay at bottom */}
              <div
                className="absolute inset-x-0 bottom-0 h-40"
                style={{
                  background:
                    "linear-gradient(to top, #0B1120 0%, transparent 100%)",
                }}
              />
              <div className="relative z-10 w-full px-6 pb-2">
                <p className="text-lg font-bold" style={{ color: "#F1F5F9" }}>
                  {habit.name}
                </p>
                <p className="text-xs" style={{ color: "#64748B" }}>
                  Just now
                </p>
              </div>
            </div>

            {/* Controls */}
            <div
              className="flex flex-col gap-4 px-6 pb-8 pt-4"
              style={{ backgroundColor: "#0B1120" }}
            >
              {/* Caption input */}
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption (optional)"
                className="w-full rounded-xl border-none px-4 py-3 text-sm outline-none placeholder:text-[#64748B]"
                style={{
                  backgroundColor: "#131C2E",
                  color: "#F1F5F9",
                }}
              />

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleRetake}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors hover:bg-white/5"
                  style={{ borderColor: "#64748B", color: "#F1F5F9" }}
                >
                  <RotateCcw className="h-4 w-4" />
                  Retake
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors hover:brightness-110"
                  style={{ backgroundColor: "#3B82F6" }}
                >
                  <Send className="h-4 w-4" />
                  Submit
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── PROCESSING ─── */}
        {step === "PROCESSING" && (
          <motion.div
            key="processing"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-1 flex-col items-center justify-center gap-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-12 w-12" style={{ color: "#3B82F6" }} />
            </motion.div>
            <p className="text-lg font-semibold" style={{ color: "#F1F5F9" }}>
              Verifying...
            </p>
            <p className="text-sm" style={{ color: "#64748B" }}>
              Checking your submission
            </p>
          </motion.div>
        )}

        {/* ─── SUCCESS ─── */}
        {step === "SUCCESS" && (
          <motion.div
            key="success"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-1 flex-col items-center justify-center gap-6 px-6"
          >
            {/* Animated checkmark */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
              className="flex h-28 w-28 items-center justify-center rounded-full"
              style={{ backgroundColor: "#22C55E" }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.3 }}
              >
                <Check className="h-14 w-14 text-white" strokeWidth={3} />
              </motion.div>
            </motion.div>

            {/* XP earned */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.5 }}
              className="text-center"
            >
              <motion.p
                className="text-4xl font-extrabold"
                style={{ color: "#F1F5F9" }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                +{earnedXP} XP
              </motion.p>
              <p className="mt-1 text-sm" style={{ color: "#64748B" }}>
                {habit.name} verified!
              </p>
            </motion.div>

            {/* Multiplier badge */}
            {xpMultiplier > 1 && (
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 250, damping: 12, delay: 0.8 }}
                className="flex items-center gap-2 rounded-full px-5 py-2"
                style={{ backgroundColor: "rgba(245, 158, 11, 0.15)" }}
              >
                <Sparkles className="h-5 w-5" style={{ color: "#F59E0B" }} />
                <span
                  className="text-lg font-bold"
                  style={{ color: "#F59E0B" }}
                >
                  {"\uD83D\uDD25"} {xpMultiplier}x XP Day!
                </span>
                <Sparkles className="h-5 w-5" style={{ color: "#F59E0B" }} />
              </motion.div>
            )}

            {/* Confetti-like particles */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: ["#3B82F6", "#22C55E", "#F59E0B"][i % 3],
                    left: `${15 + i * 15}%`,
                    top: "30%",
                  }}
                  initial={{ y: 0, opacity: 1, scale: 0 }}
                  animate={{
                    y: [0, -80 - i * 20, 200],
                    x: [0, (i % 2 === 0 ? 1 : -1) * (30 + i * 10)],
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 1.6,
                    delay: 0.4 + i * 0.1,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>

            {/* Done button */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={handleDone}
              className="mt-4 w-full max-w-xs rounded-xl px-6 py-4 text-base font-bold text-white transition-colors hover:brightness-110"
              style={{ backgroundColor: "#3B82F6" }}
            >
              Done
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
