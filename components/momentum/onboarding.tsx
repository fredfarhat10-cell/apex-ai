"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dumbbell, Brain, Heart, ChevronRight, Sparkles, Check } from "lucide-react"
import {
  type CoachingVoice,
  type GoalCategory,
  useMomentumStore,
} from "@/lib/momentum-store"

// ─── Color Palette ───────────────────────────────────────────────
const colors = {
  bg: "#0B1120",
  surface: "#131C2E",
  primary: "#3B82F6",
  success: "#22C55E",
  gold: "#F59E0B",
  text: "#F1F5F9",
  muted: "#64748B",
} as const

// ─── Slide Transition Variants ───────────────────────────────────
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
}

const transition = { type: "spring", stiffness: 300, damping: 30 }

// ─── Goal Card Data ──────────────────────────────────────────────
const goalCards: {
  category: GoalCategory
  label: string
  description: string
  icon: typeof Dumbbell
}[] = [
  {
    category: "fitness",
    label: "Fitness",
    description: "Move your body, build strength, feel alive.",
    icon: Dumbbell,
  },
  {
    category: "focus",
    label: "Focus",
    description: "Sharpen your mind, do deep work, stay present.",
    icon: Brain,
  },
  {
    category: "life",
    label: "Life",
    description: "Nurture relationships, rest well, live fully.",
    icon: Heart,
  },
]

// ─── Coaching Voice Data ─────────────────────────────────────────
const voiceOptions: {
  voice: CoachingVoice
  label: string
  description: string
}[] = [
  {
    voice: "drill-sergeant",
    label: "Drill Sergeant",
    description: "Hard truths, no sugarcoating.",
  },
  {
    voice: "coach",
    label: "Coach",
    description: "Balanced guidance and strategy.",
  },
  {
    voice: "data-nerd",
    label: "Data Nerd",
    description: "Stats, insights, and trends.",
  },
  {
    voice: "friend",
    label: "Friend",
    description: "Warm encouragement, always.",
  },
  {
    voice: "silent",
    label: "Silent System",
    description: "Just tracking, no nudges.",
  },
]

// ─── Habit Presets by Category ───────────────────────────────────
const habitPresets: Record<
  GoalCategory,
  { name: string; description: string; timeWindow: string; minDose: string; fullDose: string }
> = {
  fitness: {
    name: "Morning Stretch",
    description: "A gentle stretch routine to wake up your body and start the day right.",
    timeWindow: "6:00 AM - 8:00 AM",
    minDose: "5 min stretch",
    fullDose: "15 min yoga flow",
  },
  focus: {
    name: "Deep Work Block",
    description: "A focused session of distraction-free work on what matters most.",
    timeWindow: "9:00 AM - 11:00 AM",
    minDose: "25 min pomodoro",
    fullDose: "2 hour deep work",
  },
  life: {
    name: "Evening Walk",
    description: "Step outside, breathe fresh air, and clear your mind before winding down.",
    timeWindow: "5:00 PM - 7:00 PM",
    minDose: "10 min walk",
    fullDose: "30 min walk",
  },
}

// ─── Abstract Momentum Logo ─────────────────────────────────────
function MomentumLogo() {
  return (
    <div className="relative mx-auto mb-10 h-28 w-28">
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 180deg, ${colors.primary}, ${colors.success}, ${colors.gold}, ${colors.primary})`,
          opacity: 0.25,
        }}
      />
      {/* Middle ring */}
      <div
        className="absolute inset-2 rounded-full"
        style={{ background: colors.bg }}
      />
      {/* Inner shape */}
      <div
        className="absolute inset-4 rounded-full"
        style={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.success} 60%, ${colors.gold} 100%)`,
        }}
      />
      {/* Cut-out to create abstract arrow / momentum shape */}
      <div
        className="absolute rounded-full"
        style={{
          background: colors.bg,
          width: 40,
          height: 40,
          top: 24,
          left: 24,
        }}
      />
      {/* Accent dot */}
      <div
        className="absolute rounded-full"
        style={{
          background: colors.text,
          width: 12,
          height: 12,
          top: 38,
          left: 38,
        }}
      />
    </div>
  )
}

// ─── Progress Dots ──────────────────────────────────────────────
function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 pt-6 pb-4">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className="rounded-full"
          animate={{
            width: i === current ? 24 : 8,
            backgroundColor: i === current ? colors.primary : colors.muted,
            opacity: i === current ? 1 : 0.4,
          }}
          transition={{ duration: 0.3 }}
          style={{ height: 8 }}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Screen 1 — Welcome
// ═══════════════════════════════════════════════════════════════
function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, ...transition }}
      >
        <MomentumLogo />
      </motion.div>

      <motion.h1
        className="mb-4 text-4xl font-bold leading-tight tracking-tight"
        style={{ color: colors.text }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, ...transition }}
      >
        Build habits
        <br />
        that stick.
      </motion.h1>

      <motion.p
        className="mb-12 max-w-xs text-base leading-relaxed"
        style={{ color: colors.muted }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, ...transition }}
      >
        Momentum transforms every stumble into fuel. Small steps, real
        progress — starting right now.
      </motion.p>

      <motion.button
        onClick={onNext}
        className="flex items-center gap-2 rounded-2xl px-10 py-4 text-lg font-semibold text-white"
        style={{ background: colors.primary }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.55, ...transition }}
      >
        Let&apos;s Start
        <ChevronRight className="h-5 w-5" />
      </motion.button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Screen 2 — Goal Selection
// ═══════════════════════════════════════════════════════════════
function GoalScreen({
  selected,
  onSelect,
  onNext,
}: {
  selected: GoalCategory | null
  onSelect: (c: GoalCategory) => void
  onNext: () => void
}) {
  return (
    <div className="flex flex-1 flex-col px-6 pt-8">
      <motion.h2
        className="mb-2 text-2xl font-bold"
        style={{ color: colors.text }}
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        What matters most
        <br />
        right now?
      </motion.h2>
      <motion.p
        className="mb-8 text-sm"
        style={{ color: colors.muted }}
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Pick a focus — you can always change it later.
      </motion.p>

      <div className="flex flex-col gap-4">
        {goalCards.map(({ category, label, description, icon: Icon }, i) => {
          const isActive = selected === category
          return (
            <motion.button
              key={category}
              onClick={() => onSelect(category)}
              className="relative overflow-hidden rounded-2xl p-5 text-left"
              style={{
                background: colors.surface,
                border: `1.5px solid ${isActive ? colors.primary : "transparent"}`,
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{
                y: 0,
                opacity: 1,
                scale: isActive ? 1.03 : 1,
              }}
              transition={{ delay: 0.15 + i * 0.1, ...transition }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Glow effect */}
              {isActive && (
                <motion.div
                  layoutId="goalGlow"
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: `radial-gradient(ellipse at 30% 50%, ${colors.primary}22, transparent 70%)`,
                  }}
                />
              )}

              <div className="relative flex items-start gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: isActive
                      ? `${colors.primary}20`
                      : `${colors.muted}15`,
                  }}
                >
                  <Icon
                    className="h-6 w-6"
                    style={{
                      color: isActive ? colors.primary : colors.muted,
                    }}
                  />
                </div>
                <div>
                  <span
                    className="block text-lg font-semibold"
                    style={{
                      color: isActive ? colors.text : colors.muted,
                    }}
                  >
                    {label}
                  </span>
                  <span
                    className="mt-0.5 block text-sm"
                    style={{ color: colors.muted }}
                  >
                    {description}
                  </span>
                </div>

                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                    style={{ background: colors.primary }}
                  >
                    <Check className="h-3.5 w-3.5 text-white" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>

      <div className="mt-auto pb-4 pt-8">
        <motion.button
          onClick={onNext}
          disabled={!selected}
          className="w-full rounded-2xl py-4 text-center text-lg font-semibold text-white disabled:opacity-30"
          style={{ background: colors.primary }}
          whileHover={selected ? { scale: 1.02 } : {}}
          whileTap={selected ? { scale: 0.98 } : {}}
        >
          Continue
        </motion.button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Screen 3 — Accountability Style
// ═══════════════════════════════════════════════════════════════
function VoiceScreen({
  selected,
  onSelect,
  onNext,
}: {
  selected: CoachingVoice | null
  onSelect: (v: CoachingVoice) => void
  onNext: () => void
}) {
  return (
    <div className="flex flex-1 flex-col px-6 pt-8">
      <motion.h2
        className="mb-2 text-2xl font-bold"
        style={{ color: colors.text }}
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        How should I
        <br />
        support you?
      </motion.h2>
      <motion.p
        className="mb-8 text-sm"
        style={{ color: colors.muted }}
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Choose the voice that keeps you going.
      </motion.p>

      <div className="flex flex-col gap-3">
        {voiceOptions.map(({ voice, label, description }, i) => {
          const isActive = selected === voice
          return (
            <motion.button
              key={voice}
              onClick={() => onSelect(voice)}
              className="relative flex items-center gap-3 rounded-2xl px-5 py-4 text-left"
              style={{
                background: isActive ? `${colors.primary}18` : colors.surface,
                border: `1.5px solid ${isActive ? colors.primary : "transparent"}`,
              }}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 + i * 0.08, ...transition }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Blue glow on selection */}
              {isActive && (
                <motion.div
                  layoutId="voiceGlow"
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    boxShadow: `0 0 20px ${colors.primary}30, inset 0 0 20px ${colors.primary}08`,
                  }}
                />
              )}

              <div className="relative flex-1">
                <span
                  className="block text-base font-semibold"
                  style={{ color: isActive ? colors.text : colors.muted }}
                >
                  {label}
                </span>
                <span
                  className="mt-0.5 block text-xs"
                  style={{ color: colors.muted }}
                >
                  {description}
                </span>
              </div>

              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  style={{ background: colors.primary }}
                >
                  <Check className="h-3.5 w-3.5 text-white" />
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      <div className="mt-auto pb-4 pt-8">
        <motion.button
          onClick={onNext}
          disabled={!selected}
          className="w-full rounded-2xl py-4 text-center text-lg font-semibold text-white disabled:opacity-30"
          style={{ background: colors.primary }}
          whileHover={selected ? { scale: 1.02 } : {}}
          whileTap={selected ? { scale: 0.98 } : {}}
        >
          Continue
        </motion.button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Screen 4 — First Habit
// ═══════════════════════════════════════════════════════════════
function FirstHabitScreen({
  category,
  voice,
  onComplete,
  onSkip,
}: {
  category: GoalCategory
  voice: CoachingVoice
  onComplete: () => void
  onSkip: () => void
}) {
  const habit = habitPresets[category]

  return (
    <div className="flex flex-1 flex-col items-center px-6 pt-8 text-center">
      <motion.div
        className="mb-2 flex h-14 w-14 items-center justify-center rounded-full"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.success})`,
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Sparkles className="h-7 w-7 text-white" />
      </motion.div>

      <motion.h2
        className="mb-1 text-2xl font-bold"
        style={{ color: colors.text }}
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Your first habit is ready.
      </motion.h2>
      <motion.p
        className="mb-8 text-sm"
        style={{ color: colors.muted }}
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Start small. You can always level up later.
      </motion.p>

      {/* Habit card */}
      <motion.div
        className="w-full rounded-3xl p-6 text-left"
        style={{
          background: colors.surface,
          border: `1px solid ${colors.primary}30`,
        }}
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35, ...transition }}
      >
        <div className="mb-4 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: `${colors.primary}20` }}
          >
            {category === "fitness" && (
              <Dumbbell className="h-5 w-5" style={{ color: colors.primary }} />
            )}
            {category === "focus" && (
              <Brain className="h-5 w-5" style={{ color: colors.primary }} />
            )}
            {category === "life" && (
              <Heart className="h-5 w-5" style={{ color: colors.primary }} />
            )}
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: colors.text }}>
              {habit.name}
            </p>
            <p className="text-xs" style={{ color: colors.muted }}>
              {habit.timeWindow}
            </p>
          </div>
        </div>

        <p className="mb-5 text-sm leading-relaxed" style={{ color: colors.muted }}>
          {habit.description}
        </p>

        <div className="flex gap-3">
          <div
            className="flex-1 rounded-xl px-3 py-2 text-center"
            style={{ background: `${colors.success}12` }}
          >
            <p className="text-[10px] uppercase tracking-wider" style={{ color: colors.muted }}>
              Min dose
            </p>
            <p className="mt-0.5 text-sm font-medium" style={{ color: colors.success }}>
              {habit.minDose}
            </p>
          </div>
          <div
            className="flex-1 rounded-xl px-3 py-2 text-center"
            style={{ background: `${colors.gold}12` }}
          >
            <p className="text-[10px] uppercase tracking-wider" style={{ color: colors.muted }}>
              Full dose
            </p>
            <p className="mt-0.5 text-sm font-medium" style={{ color: colors.gold }}>
              {habit.fullDose}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="mt-auto w-full pb-4 pt-8">
        <motion.button
          onClick={onComplete}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-semibold text-white"
          style={{ background: colors.primary }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Complete It Now
          <Check className="h-5 w-5" />
        </motion.button>

        <motion.button
          onClick={onSkip}
          className="mt-3 w-full py-2 text-sm font-medium"
          style={{ color: colors.muted }}
          whileTap={{ opacity: 0.6 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
        >
          I&apos;ll do it later
        </motion.button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Main Onboarding Component
// ═══════════════════════════════════════════════════════════════
export default function MomentumOnboarding() {
  const { setUser, completeOnboarding, addHabit, logHabit, setOnboardingStep } =
    useMomentumStore()

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [goalCategory, setGoalCategory] = useState<GoalCategory | null>(null)
  const [coachingVoice, setCoachingVoice] = useState<CoachingVoice | null>(null)

  const goTo = useCallback(
    (next: number) => {
      setDirection(next > step ? 1 : -1)
      setStep(next)
      setOnboardingStep(next)
    },
    [step, setOnboardingStep],
  )

  const finishOnboarding = useCallback(
    (markComplete: boolean) => {
      if (!goalCategory || !coachingVoice) return

      // Create user profile
      setUser({
        id: crypto.randomUUID(),
        name: "You",
        avatar: "/avatars/user.jpg",
        coachingVoice,
        goalCategory,
        joinedAt: new Date().toISOString(),
        onboardingComplete: true,
      })

      // Add the starter habit
      const preset = habitPresets[goalCategory]
      const habitId = `h-${Date.now()}`
      addHabit({
        id: habitId,
        name: preset.name,
        description: preset.description,
        category: goalCategory,
        timeWindow: preset.timeWindow,
        frequency: "daily",
        minDose: preset.minDose,
        fullDose: preset.fullDose,
        verificationRequired: false,
        createdAt: new Date().toISOString(),
      })

      // If completing now, log it
      if (markComplete) {
        logHabit({
          id: `log-${Date.now()}`,
          habitId,
          date: new Date().toISOString().split("T")[0],
          status: "verified",
          xpEarned: 50,
          creditChange: 1,
          note: "First habit completed during onboarding!",
          verifiedAt: new Date().toISOString(),
        })
      }

      completeOnboarding()
    },
    [goalCategory, coachingVoice, setUser, addHabit, logHabit, completeOnboarding],
  )

  return (
    <div
      className="relative mx-auto flex min-h-screen max-w-md flex-col overflow-hidden"
      style={{ background: colors.bg }}
    >
      {/* Progress dots */}
      <ProgressDots current={step} total={4} />

      {/* Animated screens */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
          className="flex flex-1 flex-col"
        >
          {step === 0 && <WelcomeScreen onNext={() => goTo(1)} />}

          {step === 1 && (
            <GoalScreen
              selected={goalCategory}
              onSelect={setGoalCategory}
              onNext={() => goTo(2)}
            />
          )}

          {step === 2 && (
            <VoiceScreen
              selected={coachingVoice}
              onSelect={setCoachingVoice}
              onNext={() => goTo(3)}
            />
          )}

          {step === 3 && goalCategory && coachingVoice && (
            <FirstHabitScreen
              category={goalCategory}
              voice={coachingVoice}
              onComplete={() => finishOnboarding(true)}
              onSkip={() => finishOnboarding(false)}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
