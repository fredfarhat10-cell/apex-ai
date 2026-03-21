"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface RegretEntry {
  id: string
  timestamp: string
  description: string
  ruSaved: number
  category: "family" | "career" | "financial" | "health" | "social"
  status: "prevented" | "mitigated" | "occurred"
}

export default function RegretLedger() {
  const [totalRUSaved, setTotalRUSaved] = useState(24350)
  const [quarterlyTrend, setQuarterlyTrend] = useState(12.5)
  const [recentRegrets, setRecentRegrets] = useState<RegretEntry[]>([
    {
      id: "1",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Missed Daughter's Recital",
      ruSaved: 7800,
      category: "family",
      status: "prevented",
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      description: "FOMO Trade on NVDA",
      ruSaved: 1100,
      category: "financial",
      status: "prevented",
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Marathon DNF (Recovery Low)",
      ruSaved: 4200,
      category: "health",
      status: "prevented",
    },
    {
      id: "4",
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Missed Networking Event",
      ruSaved: 2500,
      category: "career",
      status: "mitigated",
    },
    {
      id: "5",
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Tax-Loss Harvesting Opportunity",
      ruSaved: 8750,
      category: "financial",
      status: "prevented",
    },
  ])

  const getCategoryColor = (category: RegretEntry["category"]) => {
    const colors = {
      family: "text-pink-500",
      career: "text-blue-500",
      financial: "text-green-500",
      health: "text-orange-500",
      social: "text-purple-500",
    }
    return colors[category]
  }

  const getCategoryBg = (category: RegretEntry["category"]) => {
    const colors = {
      family: "bg-pink-500/10 border-pink-500/20",
      career: "bg-blue-500/10 border-blue-500/20",
      financial: "bg-green-500/10 border-green-500/20",
      health: "bg-orange-500/10 border-orange-500/20",
      social: "bg-purple-500/10 border-purple-500/20",
    }
    return colors[category]
  }

  const getStatusIcon = (status: RegretEntry["status"]) => {
    switch (status) {
      case "prevented":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case "mitigated":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "occurred":
        return <Clock className="w-4 h-4 text-red-500" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  // Generate sparkline data (last 12 weeks)
  const sparklineData = Array.from({ length: 12 }, (_, i) => {
    const baseValue = 1800
    const trend = i * 50
    const variance = Math.random() * 400 - 200
    return Math.max(0, baseValue + trend + variance)
  })

  const maxSparkline = Math.max(...sparklineData)

  return (
    <Card className="p-6 bg-black/60 backdrop-blur-xl border-[#D4AF37]/20">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Regret Minimization Engine™</h3>
          <Badge variant="outline" className="text-[#D4AF37] border-[#D4AF37]/30">
            Active
          </Badge>
        </div>

        {/* Main RU Score */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-6 border-y border-[#D4AF37]/20"
        >
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Regret Units Saved This Quarter</p>
          <motion.p
            className="text-5xl font-bold text-[#D4AF37] mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {totalRUSaved.toLocaleString()}
          </motion.p>
          <div className="flex items-center justify-center gap-2">
            {quarterlyTrend > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={cn("text-sm font-medium", quarterlyTrend > 0 ? "text-green-500" : "text-red-500")}>
              {quarterlyTrend > 0 ? "+" : ""}
              {quarterlyTrend}% vs last quarter
            </span>
          </div>
        </motion.div>

        {/* Sparkline */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">12-Week Trend</p>
          <div className="flex items-end gap-1 h-16">
            {sparklineData.map((value, index) => (
              <motion.div
                key={index}
                className="flex-1 bg-gradient-to-t from-[#D4AF37] to-[#D4AF37]/40 rounded-t"
                initial={{ height: 0 }}
                animate={{ height: `${(value / maxSparkline) * 100}%` }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              />
            ))}
          </div>
        </div>

        {/* Recent Regrets Prevented */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-white">Recent Regrets Prevented</p>
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-[#D4AF37]/20">
            {recentRegrets.map((regret, index) => (
              <motion.div
                key={regret.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-3 rounded-lg border transition-all hover:scale-[1.02]",
                  getCategoryBg(regret.category),
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(regret.status)}
                      <p className="text-sm font-medium text-white truncate">{regret.description}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className={cn("capitalize", getCategoryColor(regret.category))}>{regret.category}</span>
                      <span>•</span>
                      <span>{formatTimestamp(regret.timestamp)}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-[#D4AF37]">+{regret.ruSaved.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">RU</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
