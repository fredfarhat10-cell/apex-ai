"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
} from "lucide-react"
import { useVault } from "@/lib/vault-context"

interface EmotionalPLData {
  totalRUSaved: number
  totalRUSpent: number
  netRU: number
  weeklyTrend: number
  monthlyTrend: number
  decisionsMade: number
  decisionsAvoided: number
  topRegretCategory: string
  topSavingsCategory: string
}

interface DecisionHistory {
  id: string
  date: string
  decision: string
  category: string
  ruImpact: number
  outcome: "saved" | "spent" | "pending"
  status: "success" | "regret" | "neutral"
}

export default function EmotionalPLDashboard() {
  const vault = useVault()
  const [plData, setPLData] = useState<EmotionalPLData>({
    totalRUSaved: 1847,
    totalRUSpent: 423,
    netRU: 1424,
    weeklyTrend: 12.5,
    monthlyTrend: 8.3,
    decisionsMade: 47,
    decisionsAvoided: 12,
    topRegretCategory: "Career",
    topSavingsCategory: "Financial",
  })

  const [decisionHistory, setDecisionHistory] = useState<DecisionHistory[]>([
    {
      id: "1",
      date: "2025-01-28",
      decision: "Declined job offer with 50% pay cut",
      category: "Career",
      ruImpact: 245,
      outcome: "saved",
      status: "success",
    },
    {
      id: "2",
      date: "2025-01-27",
      decision: "Booked Rio flight during price window",
      category: "Travel",
      ruImpact: 180,
      outcome: "saved",
      status: "success",
    },
    {
      id: "3",
      date: "2025-01-26",
      decision: "Skipped gym for work project",
      category: "Health",
      ruImpact: -45,
      outcome: "spent",
      status: "regret",
    },
    {
      id: "4",
      date: "2025-01-25",
      decision: "Invested in education course",
      category: "Growth",
      ruImpact: 320,
      outcome: "saved",
      status: "success",
    },
    {
      id: "5",
      date: "2025-01-24",
      decision: "Impulse purchase luxury item",
      category: "Financial",
      ruImpact: -120,
      outcome: "spent",
      status: "regret",
    },
  ])

  const [selectedTimeframe, setSelectedTimeframe] = useState<"week" | "month" | "year">("month")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categoryBreakdown = [
    { category: "Career", saved: 450, spent: 80, net: 370 },
    { category: "Financial", saved: 520, spent: 120, net: 400 },
    { category: "Health", saved: 280, spent: 90, net: 190 },
    { category: "Relationships", saved: 310, spent: 65, net: 245 },
    { category: "Growth", saved: 287, spent: 68, net: 219 },
  ]

  const weeklyData = [
    { week: "Week 1", saved: 420, spent: 85 },
    { week: "Week 2", saved: 380, spent: 120 },
    { week: "Week 3", saved: 510, spent: 95 },
    { week: "Week 4", saved: 537, spent: 123 },
  ]

  const getOutcomeColor = (outcome: DecisionHistory["outcome"]) => {
    switch (outcome) {
      case "saved":
        return "text-green-500"
      case "spent":
        return "text-red-500"
      case "pending":
        return "text-yellow-500"
    }
  }

  const getStatusIcon = (status: DecisionHistory["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "regret":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "neutral":
        return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-green-500">RU Saved</h3>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-4xl font-bold text-white mb-1">{plData.totalRUSaved.toLocaleString()}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span>+{plData.weeklyTrend}% this week</span>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6 bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-red-500">RU Spent</h3>
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-4xl font-bold text-white mb-1">{plData.totalRUSpent.toLocaleString()}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingDown className="w-3 h-3 text-red-500" />
              <span>-3.2% this week</span>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6 bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 border-[#D4AF37]/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-[#D4AF37]">Net RU</h3>
              <Target className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <p className="text-4xl font-bold text-white mb-1">+{plData.netRU.toLocaleString()}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 text-[#D4AF37]" />
              <span>+{plData.monthlyTrend}% this month</span>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-blue-500">Decisions</h3>
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-4xl font-bold text-white mb-1">{plData.decisionsMade}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>{plData.decisionsAvoided} regrets avoided</span>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted/30">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Decision History</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* RU Flow Chart */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">RU Flow (Last 4 Weeks)</h3>
                <Button variant="ghost" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>

              <div className="space-y-4">
                {weeklyData.map((week, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{week.week}</span>
                      <span className="font-medium text-white">Net: +{week.saved - week.spent}</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-green-500">Saved</span>
                          <span className="text-green-500">{week.saved}</span>
                        </div>
                        <Progress value={(week.saved / 600) * 100} className="h-2 bg-green-500/20">
                          <div className="h-full bg-green-500 rounded-full" />
                        </Progress>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-red-500">Spent</span>
                          <span className="text-red-500">{week.spent}</span>
                        </div>
                        <Progress value={(week.spent / 600) * 100} className="h-2 bg-red-500/20">
                          <div className="h-full bg-red-500 rounded-full" />
                        </Progress>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Category Breakdown */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Category Breakdown</h3>
                <Button variant="ghost" size="sm">
                  <PieChart className="w-4 h-4 mr-2" />
                  View Chart
                </Button>
              </div>

              <div className="space-y-4">
                {categoryBreakdown.map((cat, idx) => (
                  <motion.div
                    key={cat.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedCategory(cat.category)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{cat.category}</span>
                      <Badge variant={cat.net > 300 ? "default" : "secondary"}>Net: +{cat.net}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-green-500">Saved: {cat.saved}</span>
                      </div>
                      <div>
                        <span className="text-red-500">Spent: {cat.spent}</span>
                      </div>
                    </div>
                    <Progress value={(cat.net / 500) * 100} className="h-1 mt-2" />
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          {/* Top Insights */}
          <Card className="p-6 bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 border-[#D4AF37]/20">
            <h3 className="text-lg font-semibold text-white mb-4">Key Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-background/50">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-semibold text-green-500">Best Decision</span>
                </div>
                <p className="text-sm text-white">Invested in education course</p>
                <p className="text-xs text-muted-foreground mt-1">Saved 320 RU</p>
              </div>

              <div className="p-4 rounded-lg bg-background/50">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-semibold text-yellow-500">Watch Out</span>
                </div>
                <p className="text-sm text-white">Health decisions trending down</p>
                <p className="text-xs text-muted-foreground mt-1">3 regrets this week</p>
              </div>

              <div className="p-4 rounded-lg bg-background/50">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-sm font-semibold text-[#D4AF37]">Opportunity</span>
                </div>
                <p className="text-sm text-white">Career decisions high impact</p>
                <p className="text-xs text-muted-foreground mt-1">Focus area for growth</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Decision History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Recent Decisions</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Date Range
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {decisionHistory.map((decision, idx) => (
                <motion.div
                  key={decision.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 rounded-lg border border-border hover:border-[#D4AF37]/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(decision.status)}
                      <div className="flex-1">
                        <p className="font-medium text-white mb-1">{decision.decision}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{new Date(decision.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {decision.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getOutcomeColor(decision.outcome)}`}>
                        {decision.ruImpact > 0 ? "+" : ""}
                        {decision.ruImpact}
                      </p>
                      <p className="text-xs text-muted-foreground">RU</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryBreakdown.map((cat, idx) => (
              <motion.div
                key={cat.category}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold text-white mb-4">{cat.category}</h3>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-green-500">RU Saved</span>
                        <span className="font-bold text-green-500">{cat.saved}</span>
                      </div>
                      <Progress value={(cat.saved / 600) * 100} className="h-2 bg-green-500/20">
                        <div className="h-full bg-green-500 rounded-full" />
                      </Progress>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-red-500">RU Spent</span>
                        <span className="font-bold text-red-500">{cat.spent}</span>
                      </div>
                      <Progress value={(cat.spent / 600) * 100} className="h-2 bg-red-500/20">
                        <div className="h-full bg-red-500 rounded-full" />
                      </Progress>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Net Impact</span>
                        <span className="text-xl font-bold text-[#D4AF37]">+{cat.net}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Performance Trends</h3>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Weekly RU Saved Trend</span>
                  <Badge variant="default" className="bg-green-500">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12.5%
                  </Badge>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-green-400"
                    initial={{ width: 0 }}
                    animate={{ width: "78%" }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Monthly Net RU Growth</span>
                  <Badge variant="default" className="bg-[#D4AF37] text-black">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +8.3%
                  </Badge>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-yellow-400"
                    initial={{ width: 0 }}
                    animate={{ width: "85%" }}
                    transition={{ duration: 1, delay: 0.4 }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Regret Reduction Rate</span>
                  <Badge variant="default" className="bg-blue-500">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    -15.2%
                  </Badge>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                    initial={{ width: 0 }}
                    animate={{ width: "92%" }}
                    transition={{ duration: 1, delay: 0.6 }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
