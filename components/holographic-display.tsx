"use client"

import { motion } from "framer-motion"
import { X, TrendingUp, TrendingDown } from "lucide-react"
import { Line, LineChart, ResponsiveContainer } from "recharts"

interface HolographicDisplayProps {
  guildType: "financial" | "wellness" | "career"
  onClose: () => void
}

export function HolographicDisplay({ guildType, onClose }: HolographicDisplayProps) {
  const getGuildData = () => {
    switch (guildType) {
      case "financial":
        return {
          title: "Financial Guild",
          color: "#FFD700",
          metrics: [
            { label: "Portfolio Value", value: "$127,450", change: "+2.3%", trend: "up" },
            { label: "Monthly Income", value: "$8,200", change: "+5.1%", trend: "up" },
            { label: "Expenses", value: "$3,450", change: "-1.2%", trend: "down" },
          ],
          chartData: [{ value: 120000 }, { value: 122000 }, { value: 121500 }, { value: 125000 }, { value: 127450 }],
        }
      case "wellness":
        return {
          title: "Wellness Guild",
          color: "#10B981",
          metrics: [
            { label: "Recovery Score", value: "87%", change: "+3%", trend: "up" },
            { label: "Sleep Quality", value: "92%", change: "+5%", trend: "up" },
            { label: "Strain", value: "14.2", change: "-2%", trend: "down" },
          ],
          chartData: [{ value: 82 }, { value: 85 }, { value: 84 }, { value: 86 }, { value: 87 }],
        }
      case "career":
        return {
          title: "Career Guild",
          color: "#00D9FF",
          metrics: [
            { label: "Productivity", value: "94%", change: "+7%", trend: "up" },
            { label: "Tasks Completed", value: "42", change: "+12", trend: "up" },
            { label: "Focus Time", value: "6.5h", change: "+0.5h", trend: "up" },
          ],
          chartData: [{ value: 85 }, { value: 88 }, { value: 90 }, { value: 92 }, { value: 94 }],
        }
    }
  }

  const data = getGuildData()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      style={{ pointerEvents: "none" }}
    >
      <div
        className="relative w-full max-w-2xl bg-black/80 backdrop-blur-xl border rounded-2xl p-8 shadow-2xl"
        style={{
          borderColor: data.color,
          boxShadow: `0 0 40px ${data.color}40`,
          pointerEvents: "auto",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
          style={{ color: data.color }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="text-3xl font-bold mb-6" style={{ color: data.color }}>
          {data.title}
        </h2>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {data.metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
            >
              <p className="text-xs text-gray-400 mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-white mb-1">{metric.value}</p>
              <div className="flex items-center gap-1">
                {metric.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className={metric.trend === "up" ? "text-green-400 text-sm" : "text-red-400 text-sm"}>
                  {metric.change}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sparkline Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
        >
          <p className="text-sm text-gray-400 mb-3">7-Day Trend</p>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={data.chartData}>
              <Line type="monotone" dataKey="value" stroke={data.color} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Holographic effect overlay */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${data.color}10, transparent 70%)`,
          }}
        />
      </div>
    </motion.div>
  )
}
