"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Flame, Check, Zap, Target, Wallet, ChevronRight } from "lucide-react"
import { useMomentumStore } from "@/lib/momentum-store"

const categoryAccent: Record<string, string> = {
  fitness: "bg-emerald-500",
  focus: "bg-blue-500",
  life: "bg-amber-500",
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Good Morning"
  if (h < 18) return "Good Afternoon"
  return "Good Evening"
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

export default function HomeDashboard() {
  const {
    user,
    habits,
    habitLogs,
    currentStreak,
    habitCredit,
    totalXP,
    consistencyRate,
    activeChallenge,
    setVerifyingHabitId,
    setActiveTab,
  } = useMomentumStore()

  const todayStr = new Date().toISOString().slice(0, 10)

  const todayStatuses = useMemo(() => {
    const map: Record<string, string> = {}
    for (const log of habitLogs) {
      if (log.date.slice(0, 10) === todayStr) {
        map[log.habitId] = log.status
      }
    }
    return map
  }, [habitLogs, todayStr])

  const displayName = user?.name ?? "there"

  // Challenge helpers
  const userParticipant = activeChallenge?.participants.find(
    (p) => p.name === "You"
  )
  const challengeProgress = activeChallenge
    ? (activeChallenge.currentDay / activeChallenge.totalDays) * 100
    : 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0B1120" }}>
      <motion.div
        className="max-w-md mx-auto p-4 pb-28 space-y-5"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* ── Greeting ── */}
        <motion.div
          variants={item}
          className="flex items-start justify-between pt-2"
        >
          <div>
            <p className="text-sm" style={{ color: "#64748B" }}>
              {getGreeting()}
            </p>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "#F1F5F9" }}
            >
              {displayName}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Streak badge */}
            <div className="flex items-center gap-1">
              <Flame className="w-5 h-5" style={{ color: "#F59E0B" }} />
              <span
                className="text-lg font-semibold tabular-nums"
                style={{ color: "#F59E0B" }}
              >
                {currentStreak}
              </span>
            </div>

            {/* Habit credit badge */}
            <div
              className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: "rgba(59,130,246,0.15)",
                color: "#3B82F6",
              }}
            >
              <Wallet className="w-3 h-3" />
              {habitCredit}
            </div>
          </div>
        </motion.div>

        {/* ── Today's Habits ── */}
        <motion.div variants={item}>
          <p
            className="text-xs font-medium uppercase tracking-wider mb-3"
            style={{ color: "#64748B" }}
          >
            Today&apos;s Habits
          </p>

          <div className="space-y-3">
            {habits.slice(0, 3).map((habit, i) => {
              const verified =
                todayStatuses[habit.id] === "verified" ||
                todayStatuses[habit.id] === "partial"

              return (
                <motion.div
                  key={habit.id}
                  variants={item}
                  className="relative overflow-hidden rounded-2xl border"
                  style={{
                    backgroundColor: "#131C2E",
                    borderColor: "rgba(255,255,255,0.05)",
                  }}
                >
                  {/* Category accent bar */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${
                      categoryAccent[habit.category] ?? "bg-blue-500"
                    }`}
                  />

                  <div className="flex items-center justify-between px-4 py-3.5 pl-5">
                    <div className="min-w-0">
                      <p
                        className="font-semibold text-sm leading-tight"
                        style={{ color: "#F1F5F9" }}
                      >
                        {habit.name}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "#64748B" }}
                      >
                        {habit.timeWindow}
                      </p>
                    </div>

                    {verified ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                          delay: i * 0.05,
                        }}
                        className="flex items-center justify-center w-9 h-9 rounded-full"
                        style={{ backgroundColor: "rgba(34,197,94,0.15)" }}
                      >
                        <Check
                          className="w-4.5 h-4.5"
                          style={{ color: "#22C55E" }}
                          strokeWidth={2.5}
                        />
                      </motion.div>
                    ) : (
                      <button
                        onClick={() => setVerifyingHabitId(habit.id)}
                        className="rounded-full px-4 py-1.5 text-xs font-semibold transition-colors hover:brightness-110"
                        style={{
                          backgroundColor: "#3B82F6",
                          color: "#F1F5F9",
                        }}
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* ── Active Challenge ── */}
        {activeChallenge && (
          <motion.div variants={item}>
            <button
              onClick={() => setActiveTab("challenges")}
              className="w-full text-left rounded-2xl overflow-hidden border transition-colors hover:border-white/10"
              style={{ borderColor: "rgba(255,255,255,0.05)" }}
            >
              <div
                className="p-4"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(99,102,241,0.12) 100%)",
                  backgroundColor: "#131C2E",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="min-w-0">
                    <p
                      className="font-semibold text-sm"
                      style={{ color: "#F1F5F9" }}
                    >
                      {activeChallenge.title}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "#64748B" }}
                    >
                      Day {activeChallenge.currentDay} of{" "}
                      {activeChallenge.totalDays}
                    </p>
                  </div>
                  <ChevronRight
                    className="w-4 h-4 shrink-0"
                    style={{ color: "#64748B" }}
                  />
                </div>

                {/* Progress bar */}
                <div
                  className="h-1.5 rounded-full overflow-hidden mb-3"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: "#3B82F6" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${challengeProgress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                  />
                </div>

                {/* Rank & pot */}
                <div className="flex items-center gap-4 text-xs">
                  <span style={{ color: "#F1F5F9" }}>
                    <span style={{ color: "#64748B" }}>Rank </span>#
                    {userParticipant?.rank ?? "–"}
                    <span style={{ color: "#64748B" }}>
                      {" "}
                      of {activeChallenge.participants.length}
                    </span>
                  </span>
                  <span style={{ color: "#F59E0B" }} className="font-medium">
                    £{activeChallenge.potValue} pot
                  </span>
                </div>
              </div>
            </button>
          </motion.div>
        )}

        {/* ── Quick Stats ── */}
        <motion.div variants={item} className="grid grid-cols-3 gap-3">
          {/* XP */}
          <div
            className="rounded-2xl border p-3 text-center"
            style={{
              backgroundColor: "#131C2E",
              borderColor: "rgba(255,255,255,0.05)",
            }}
          >
            <Zap
              className="w-4 h-4 mx-auto mb-1.5"
              style={{ color: "#3B82F6" }}
            />
            <p
              className="text-base font-bold tabular-nums"
              style={{ color: "#F1F5F9" }}
            >
              {totalXP.toLocaleString()}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: "#64748B" }}>
              Total XP
            </p>
          </div>

          {/* Consistency */}
          <div
            className="rounded-2xl border p-3 text-center"
            style={{
              backgroundColor: "#131C2E",
              borderColor: "rgba(255,255,255,0.05)",
            }}
          >
            <Target
              className="w-4 h-4 mx-auto mb-1.5"
              style={{ color: "#22C55E" }}
            />
            <p
              className="text-base font-bold tabular-nums"
              style={{ color: "#F1F5F9" }}
            >
              {consistencyRate}%
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: "#64748B" }}>
              Consistency
            </p>
          </div>

          {/* Credit Balance */}
          <div
            className="rounded-2xl border p-3 text-center"
            style={{
              backgroundColor: "#131C2E",
              borderColor: "rgba(255,255,255,0.05)",
            }}
          >
            <Wallet
              className="w-4 h-4 mx-auto mb-1.5"
              style={{ color: "#F59E0B" }}
            />
            <p
              className="text-base font-bold tabular-nums"
              style={{ color: "#F1F5F9" }}
            >
              {habitCredit}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: "#64748B" }}>
              Credits
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
