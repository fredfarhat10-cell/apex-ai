"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronDown,
  ChevronUp,
  Trophy,
  Zap,
  Clock,
  CheckCircle2,
} from "lucide-react"
import { useMomentumStore } from "@/lib/momentum-store"

// ── Color tokens ──
const colors = {
  bg: "#0B1120",
  surface: "#131C2E",
  primary: "#3B82F6",
  success: "#22C55E",
  gold: "#F59E0B",
  text: "#F1F5F9",
  muted: "#64748B",
}

// ── Avatar helper ──
function AvatarCircle({
  name,
  color,
  size = 36,
}: {
  name: string
  color: string
  size?: number
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: size * 0.36,
      }}
    >
      {initials}
    </div>
  )
}

// ── Palette for participant avatars ──
const avatarColors = ["#3B82F6", "#22C55E", "#F59E0B", "#8B5CF6", "#EF4444"]

export default function ChallengeDetail() {
  const { activeChallenge, activityFeed, setVerifyingHabitId, habits } =
    useMomentumStore()
  const [rulesOpen, setRulesOpen] = useState(false)

  if (!activeChallenge) return null

  const {
    title,
    currentDay,
    totalDays,
    rules,
    participants,
    potValue,
    description,
  } = activeChallenge

  const progress = currentDay / totalDays
  const circumference = 2 * Math.PI * 44
  const strokeDashoffset = circumference * (1 - progress)

  // Top 5 sorted by rank
  const leaderboard = [...participants].sort((a, b) => a.rank - b.rank).slice(0, 5)

  // Latest 3 activity items
  const recentActivity = activityFeed.slice(0, 3)

  // Prize breakdown
  const prizeBreakdown = [
    { label: "1st", pct: 50, color: colors.gold },
    { label: "2nd-5th", pct: 30, color: colors.primary },
    { label: "Finishers", pct: 20, color: colors.success },
  ]

  const handleComplete = () => {
    // Trigger verification for the first habit (demo behavior)
    if (habits.length > 0) {
      setVerifyingHabitId(habits[0].id)
    }
  }

  return (
    <div
      className="mx-auto min-h-screen max-w-md px-4 pb-32 pt-6"
      style={{ backgroundColor: colors.bg }}
    >
      {/* ─── 1. HEADER ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl p-6"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}22 0%, ${colors.surface} 100%)`,
        }}
      >
        <div className="flex items-center gap-5">
          {/* Progress ring */}
          <div className="relative shrink-0">
            <svg width="100" height="100" viewBox="0 0 100 100">
              {/* Track */}
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke={colors.surface}
                strokeWidth="6"
              />
              {/* Progress */}
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke={colors.primary}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 50 50)"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-2xl font-extrabold leading-none"
                style={{ color: colors.text }}
              >
                {currentDay}
              </span>
              <span
                className="text-[10px] font-medium uppercase tracking-wider"
                style={{ color: colors.muted }}
              >
                of {totalDays}
              </span>
            </div>
          </div>

          {/* Title & description */}
          <div className="min-w-0 flex-1">
            <h1
              className="text-lg font-bold leading-tight"
              style={{ color: colors.text }}
            >
              {title}
            </h1>
            <p className="mt-1 text-sm" style={{ color: colors.muted }}>
              {description}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ─── 2. RULES ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mt-4 rounded-2xl p-4"
        style={{ backgroundColor: colors.surface }}
      >
        <button
          onClick={() => setRulesOpen(!rulesOpen)}
          className="flex w-full items-center justify-between"
        >
          <span className="text-sm font-semibold" style={{ color: colors.text }}>
            Challenge Rules
          </span>
          {rulesOpen ? (
            <ChevronUp className="h-4 w-4" style={{ color: colors.muted }} />
          ) : (
            <ChevronDown className="h-4 w-4" style={{ color: colors.muted }} />
          )}
        </button>
        <AnimatePresence>
          {rulesOpen && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-2">
                {rules.map((rule, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm"
                    style={{ color: colors.muted }}
                  >
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: colors.success }}
                    />
                    <span>{rule}</span>
                  </li>
                ))}
              </div>
            </motion.ul>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ─── 3. LEADERBOARD ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-4 rounded-2xl p-4"
        style={{ backgroundColor: colors.surface }}
      >
        <div className="mb-3 flex items-center gap-2">
          <Trophy className="h-4 w-4" style={{ color: colors.gold }} />
          <span className="text-sm font-semibold" style={{ color: colors.text }}>
            Leaderboard
          </span>
        </div>

        <div className="space-y-2">
          {leaderboard.map((p, i) => {
            const isCurrentUser = p.name === "You"
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl px-3 py-2"
                style={{
                  backgroundColor: isCurrentUser
                    ? `${colors.primary}15`
                    : "transparent",
                  border: isCurrentUser
                    ? `1px solid ${colors.primary}40`
                    : "1px solid transparent",
                }}
              >
                {/* Rank */}
                <span
                  className="w-5 text-center text-sm font-bold"
                  style={{
                    color:
                      p.rank === 1
                        ? colors.gold
                        : p.rank <= 3
                          ? colors.text
                          : colors.muted,
                  }}
                >
                  {p.rank}
                </span>

                {/* Avatar */}
                <AvatarCircle
                  name={p.name}
                  color={avatarColors[i % avatarColors.length]}
                  size={32}
                />

                {/* Name & bar */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className="truncate text-sm font-medium"
                      style={{ color: colors.text }}
                    >
                      {p.name}
                    </span>
                    <span
                      className="ml-2 shrink-0 text-xs font-semibold"
                      style={{ color: colors.muted }}
                    >
                      {p.completionRate}%
                    </span>
                  </div>
                  {/* Completion bar */}
                  <div
                    className="mt-1 h-1.5 w-full overflow-hidden rounded-full"
                    style={{ backgroundColor: `${colors.muted}30` }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: isCurrentUser
                          ? colors.primary
                          : colors.success,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${p.completionRate}%` }}
                      transition={{ duration: 0.8, delay: 0.15 + i * 0.05 }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Position text */}
        <p
          className="mt-3 text-center text-xs"
          style={{ color: colors.muted }}
        >
          You&apos;re <span style={{ color: colors.text }}>#4 of 23</span> &mdash;{" "}
          <span style={{ color: colors.gold }}>2 spots from prize zone</span>
        </p>
      </motion.div>

      {/* ─── 4. PRIZE POOL ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-4 rounded-2xl p-4"
        style={{ backgroundColor: colors.surface }}
      >
        <div className="mb-1 flex items-center gap-2">
          <Zap className="h-4 w-4" style={{ color: colors.gold }} />
          <span className="text-sm font-semibold" style={{ color: colors.text }}>
            Prize Pool
          </span>
        </div>

        <p
          className="mb-4 text-3xl font-extrabold"
          style={{ color: colors.text }}
        >
          &pound;{potValue}
        </p>

        {/* Stacked horizontal bar */}
        <div className="mb-3 flex h-4 overflow-hidden rounded-full">
          {prizeBreakdown.map((seg) => (
            <motion.div
              key={seg.label}
              className="h-full"
              style={{ backgroundColor: seg.color }}
              initial={{ width: 0 }}
              animate={{ width: `${seg.pct}%` }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-between">
          {prizeBreakdown.map((seg) => (
            <div key={seg.label} className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-xs" style={{ color: colors.muted }}>
                {seg.label}:{" "}
                <span style={{ color: colors.text }}>{seg.pct}%</span>
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ─── 5. CTA ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6"
      >
        <button
          onClick={handleComplete}
          className="w-full rounded-xl py-4 text-base font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
          style={{ backgroundColor: colors.primary }}
        >
          Complete Today&apos;s Challenge
        </button>
      </motion.div>

      {/* ─── 6. ACTIVITY FEED ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-6"
      >
        <h3
          className="mb-3 text-sm font-semibold"
          style={{ color: colors.text }}
        >
          Recent Activity
        </h3>

        <div className="space-y-2">
          {recentActivity.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl p-3"
              style={{ backgroundColor: colors.surface }}
            >
              <AvatarCircle
                name={item.userName}
                color={
                  avatarColors[
                    Math.abs(item.userName.charCodeAt(0)) %
                      avatarColors.length
                  ]
                }
                size={32}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm" style={{ color: colors.text }}>
                  <span className="font-semibold">{item.userName}</span>{" "}
                  <span style={{ color: colors.muted }}>{item.action}</span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Clock className="h-3 w-3" style={{ color: colors.muted }} />
                <span className="text-xs" style={{ color: colors.muted }}>
                  {item.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
