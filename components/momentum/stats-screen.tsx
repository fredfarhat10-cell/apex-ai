"use client"

import { motion } from "framer-motion"
import { Flame, Target, Wallet, Lightbulb, TrendingUp } from "lucide-react"
import { useMomentumStore } from "@/lib/momentum-store"

// 8-week fake trend data (upward trend)
const weeklyTrend = [62, 68, 71, 65, 74, 79, 83, 87]
const weekLabels = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]

// 7-day heatmap data: "completed" | "partial" | "rest"
const heatmapData: { day: string; status: "completed" | "partial" | "rest" }[] = [
  { day: "Mon", status: "completed" },
  { day: "Tue", status: "completed" },
  { day: "Wed", status: "partial" },
  { day: "Thu", status: "completed" },
  { day: "Fri", status: "completed" },
  { day: "Sat", status: "rest" },
  { day: "Sun", status: "completed" },
]

function buildSvgPath(data: number[]): string {
  const width = 280
  const height = 100
  const padding = 8
  const maxVal = Math.max(...data)
  const minVal = Math.min(...data) - 5
  const range = maxVal - minVal || 1
  const stepX = (width - padding * 2) / (data.length - 1)

  const points = data.map((v, i) => ({
    x: padding + i * stepX,
    y: height - padding - ((v - minVal) / range) * (height - padding * 2),
  }))

  // Smooth curve with quadratic bezier
  let path = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const cpx = (points[i - 1].x + points[i].x) / 2
    path += ` Q ${cpx} ${points[i - 1].y} ${points[i].x} ${points[i].y}`
  }

  return path
}

function buildAreaPath(data: number[]): string {
  const width = 280
  const height = 100
  const padding = 8
  const maxVal = Math.max(...data)
  const minVal = Math.min(...data) - 5
  const range = maxVal - minVal || 1
  const stepX = (width - padding * 2) / (data.length - 1)

  const points = data.map((v, i) => ({
    x: padding + i * stepX,
    y: height - padding - ((v - minVal) / range) * (height - padding * 2),
  }))

  let path = `M ${points[0].x} ${height - padding}`
  path += ` L ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const cpx = (points[i - 1].x + points[i].x) / 2
    path += ` Q ${cpx} ${points[i - 1].y} ${points[i].x} ${points[i].y}`
  }
  path += ` L ${points[points.length - 1].x} ${height - padding} Z`

  return path
}

const heatmapColor: Record<string, string> = {
  completed: "bg-[#22C55E]",
  partial: "bg-[#334155]",
  rest: "bg-transparent border border-[#1E293B]",
}

export default function StatsScreen() {
  const { currentStreak, consistencyRate, habitCredit } = useMomentumStore()

  const isTrendingUp =
    weeklyTrend[weeklyTrend.length - 1] > weeklyTrend[weeklyTrend.length - 3]

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#0B1120] pb-8">
      {/* HEADER */}
      <div className="px-5 pt-6 pb-5">
        <h1 className="text-2xl font-bold text-[#F1F5F9]">Your Progress</h1>
      </div>

      {/* KEY METRICS ROW */}
      <div className="px-5 pb-5">
        <div className="grid grid-cols-3 gap-3">
          {/* Current Streak */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl bg-[#131C2E] p-3.5 text-center"
          >
            <div className="w-9 h-9 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center mx-auto mb-2">
              <Flame className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <p className="text-2xl font-bold text-[#F1F5F9]">{currentStreak}</p>
            <p className="text-[#64748B] text-[10px] mt-0.5 leading-tight">
              Day Streak
            </p>
          </motion.div>

          {/* Consistency Rate — North Star */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl bg-[#131C2E] border border-[#22C55E]/20 p-3.5 text-center relative"
          >
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2">
              <span className="text-[8px] bg-[#22C55E]/20 text-[#22C55E] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider">
                North Star
              </span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-[#22C55E]/10 flex items-center justify-center mx-auto mb-2">
              <Target className="w-5 h-5 text-[#22C55E]" />
            </div>
            <p className="text-2xl font-bold text-[#22C55E]">
              {consistencyRate}%
            </p>
            <p className="text-[#64748B] text-[10px] mt-0.5 leading-tight">
              Consistency
            </p>
          </motion.div>

          {/* Habit Credit */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl bg-[#131C2E] p-3.5 text-center"
          >
            <div className="w-9 h-9 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center mx-auto mb-2">
              <Wallet className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <p className="text-2xl font-bold text-[#F1F5F9]">{habitCredit}</p>
            <p className="text-[#64748B] text-[10px] mt-0.5 leading-tight">
              Habit Credits
            </p>
          </motion.div>
        </div>
      </div>

      {/* WEEKLY HEATMAP */}
      <div className="px-5 pb-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl bg-[#131C2E] p-4"
        >
          <h2 className="text-[#F1F5F9] text-sm font-semibold mb-3">
            This Week
          </h2>
          <div className="grid grid-cols-7 gap-2">
            {heatmapData.map((d) => (
              <div key={d.day} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-[#64748B] font-medium">
                  {d.day}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg ${heatmapColor[d.status]}`}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#1E293B]">
            <span className="flex items-center gap-1.5 text-[10px] text-[#64748B]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#22C55E]" />
              Completed
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-[#64748B]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#334155]" />
              Partial
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-[#64748B]">
              <span className="w-2.5 h-2.5 rounded-sm border border-[#1E293B]" />
              Rest Day
            </span>
          </div>
        </motion.div>
      </div>

      {/* TREND GRAPH */}
      <div className="px-5 pb-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl bg-[#131C2E] p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[#F1F5F9] text-sm font-semibold">
              8-Week Trend
            </h2>
            {isTrendingUp && (
              <span className="flex items-center gap-1 text-[#22C55E] text-xs font-medium bg-[#22C55E]/10 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" />
                Improving!
              </span>
            )}
          </div>

          {/* SVG Chart */}
          <div className="w-full">
            <svg
              viewBox="0 0 280 100"
              className="w-full h-auto"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Grid lines */}
              {[0, 1, 2, 3].map((i) => (
                <line
                  key={i}
                  x1={8}
                  y1={8 + i * 28}
                  x2={272}
                  y2={8 + i * 28}
                  stroke="#1E293B"
                  strokeWidth={0.5}
                />
              ))}

              {/* Area fill */}
              <path
                d={buildAreaPath(weeklyTrend)}
                fill="url(#areaGradient)"
              />

              {/* Line */}
              <motion.path
                d={buildSvgPath(weeklyTrend)}
                fill="none"
                stroke="#22C55E"
                strokeWidth={2}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />

              {/* Dots at data points */}
              {weeklyTrend.map((v, i) => {
                const width = 280
                const height = 100
                const padding = 8
                const maxVal = Math.max(...weeklyTrend)
                const minVal = Math.min(...weeklyTrend) - 5
                const range = maxVal - minVal || 1
                const stepX = (width - padding * 2) / (weeklyTrend.length - 1)
                const x = padding + i * stepX
                const y =
                  height -
                  padding -
                  ((v - minVal) / range) * (height - padding * 2)
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={2.5}
                    fill="#22C55E"
                    stroke="#131C2E"
                    strokeWidth={1.5}
                  />
                )
              })}

              <defs>
                <linearGradient
                  id="areaGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#22C55E" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Week labels */}
          <div className="flex justify-between px-1 mt-1">
            {weekLabels.map((label) => (
              <span key={label} className="text-[9px] text-[#64748B]">
                {label}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI INSIGHTS */}
      <div className="px-5 pb-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl bg-[#131C2E] border border-[#F59E0B]/15 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lightbulb className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div className="flex-1">
              <h3 className="text-[#F1F5F9] text-sm font-semibold mb-1">
                AI Insight
              </h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed mb-3">
                Your best days are Monday mornings. Wednesdays need support
                &mdash; want me to adjust your schedule?
              </p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] text-sm font-medium hover:bg-[#F59E0B]/20 transition-colors"
              >
                Yes, adjust
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
