"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Activity, TrendingUp, Target, Clock } from "lucide-react"

type Timeframe = "week" | "month" | "ytd"

export default function AnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState<Timeframe>("week")

  // Sample data for training metrics
  const trainingData = {
    week: [
      { date: "Mon", distance: 8, duration: 45, heartRate: 145 },
      { date: "Tue", distance: 0, duration: 0, heartRate: 0 },
      { date: "Wed", distance: 12, duration: 68, heartRate: 152 },
      { date: "Thu", distance: 6, duration: 35, heartRate: 140 },
      { date: "Fri", distance: 10, duration: 55, heartRate: 148 },
      { date: "Sat", distance: 18, duration: 105, heartRate: 155 },
      { date: "Sun", distance: 0, duration: 0, heartRate: 0 },
    ],
    month: [
      { date: "Week 1", distance: 45, duration: 280, heartRate: 148 },
      { date: "Week 2", distance: 52, duration: 310, heartRate: 150 },
      { date: "Week 3", distance: 48, duration: 295, heartRate: 147 },
      { date: "Week 4", distance: 55, duration: 325, heartRate: 151 },
    ],
    ytd: [
      { date: "Jan", distance: 180, duration: 1100, heartRate: 145 },
      { date: "Feb", distance: 195, duration: 1200, heartRate: 147 },
      { date: "Mar", distance: 210, duration: 1280, heartRate: 149 },
      { date: "Apr", distance: 225, duration: 1350, heartRate: 150 },
    ],
  }

  // Sample data for financial metrics
  const financialData = {
    week: [
      { date: "Mon", value: 100000, change: 0 },
      { date: "Tue", value: 101200, change: 1.2 },
      { date: "Wed", value: 100800, change: -0.4 },
      { date: "Thu", value: 102500, change: 1.7 },
      { date: "Fri", value: 103200, change: 0.7 },
      { date: "Sat", value: 103200, change: 0 },
      { date: "Sun", value: 103200, change: 0 },
    ],
    month: [
      { date: "Week 1", value: 100000, change: 0 },
      { date: "Week 2", value: 102000, change: 2.0 },
      { date: "Week 3", value: 104500, change: 2.5 },
      { date: "Week 4", value: 106800, change: 2.3 },
    ],
    ytd: [
      { date: "Jan", value: 100000, change: 0 },
      { date: "Feb", value: 105000, change: 5.0 },
      { date: "Mar", value: 108500, change: 3.5 },
      { date: "Apr", value: 112000, change: 3.5 },
    ],
  }

  const currentTrainingData = trainingData[timeframe]
  const currentFinancialData = financialData[timeframe]

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Metrics & Analytics</h1>
          <p className="text-[#888888] mt-2">Deep dive into your performance data</p>
        </div>

        <div className="flex gap-2 bg-[#111111] p-1 rounded-xl border border-[#222222]">
          <Button
            variant={timeframe === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeframe("week")}
            className={timeframe === "week" ? "bg-[#FF6B00] hover:bg-[#FF8533]" : "hover:bg-[#1A1A1A] text-[#888888]"}
          >
            This Week
          </Button>
          <Button
            variant={timeframe === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeframe("month")}
            className={timeframe === "month" ? "bg-[#FF6B00] hover:bg-[#FF8533]" : "hover:bg-[#1A1A1A] text-[#888888]"}
          >
            This Month
          </Button>
          <Button
            variant={timeframe === "ytd" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeframe("ytd")}
            className={timeframe === "ytd" ? "bg-[#FF6B00] hover:bg-[#FF8533]" : "hover:bg-[#1A1A1A] text-[#888888]"}
          >
            YTD
          </Button>
        </div>
      </div>

      <Tabs defaultValue="training" className="space-y-8">
        <TabsList className="bg-[#111111] border border-[#222222]">
          <TabsTrigger value="training" className="data-[state=active]:bg-[#FF6B00]">
            Training Metrics
          </TabsTrigger>
          <TabsTrigger value="financial" className="data-[state=active]:bg-[#FF6B00]">
            Financial Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="training" className="space-y-8">
          {/* Training Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-[#111111] border-[#222222] p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/20 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-[#FF6B00]" />
                </div>
                <div>
                  <p className="text-sm text-[#888888] uppercase tracking-wider">Total Distance</p>
                  <p className="text-2xl font-bold">54 km</p>
                </div>
              </div>
            </Card>

            <Card className="bg-[#111111] border-[#222222] p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-[#00FFC6]/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#00FFC6]" />
                </div>
                <div>
                  <p className="text-sm text-[#888888] uppercase tracking-wider">Total Time</p>
                  <p className="text-2xl font-bold">5h 28m</p>
                </div>
              </div>
            </Card>

            <Card className="bg-[#111111] border-[#222222] p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-[#FF6B00]" />
                </div>
                <div>
                  <p className="text-sm text-[#888888] uppercase tracking-wider">Avg Heart Rate</p>
                  <p className="text-2xl font-bold">148 bpm</p>
                </div>
              </div>
            </Card>

            <Card className="bg-[#111111] border-[#222222] p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#FF6B00]" />
                </div>
                <div>
                  <p className="text-sm text-[#888888] uppercase tracking-wider">Weekly Load</p>
                  <p className="text-2xl font-bold">85</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Training Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-[#111111] border-[#222222] p-8">
              <h3 className="text-xl font-semibold mb-6">Distance Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={currentTrainingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                  <XAxis dataKey="date" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111111", border: "1px solid #222222", borderRadius: "8px" }}
                    labelStyle={{ color: "#E5E7EB" }}
                  />
                  <Bar dataKey="distance" fill="#FF6B00" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="bg-[#111111] border-[#222222] p-8">
              <h3 className="text-xl font-semibold mb-6">Heart Rate Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={currentTrainingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                  <XAxis dataKey="date" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111111", border: "1px solid #222222", borderRadius: "8px" }}
                    labelStyle={{ color: "#E5E7EB" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="heartRate"
                    stroke="#FF6B00"
                    strokeWidth={3}
                    dot={{ fill: "#FF6B00" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-8">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-[#111111] border-[#222222] p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#FF6B00]" />
                </div>
                <div>
                  <p className="text-sm text-[#888888] uppercase tracking-wider">Portfolio Value</p>
                  <p className="text-2xl font-bold">$103.2k</p>
                </div>
              </div>
            </Card>

            <Card className="bg-[#111111] border-[#222222] p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#FF6B00]" />
                </div>
                <div>
                  <p className="text-sm text-[#888888] uppercase tracking-wider">Total Gain</p>
                  <p className="text-2xl font-bold text-[#FF6B00]">+$3.2k</p>
                </div>
              </div>
            </Card>

            <Card className="bg-[#111111] border-[#222222] p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-[#FF6B00]" />
                </div>
                <div>
                  <p className="text-sm text-[#888888] uppercase tracking-wider">Return</p>
                  <p className="text-2xl font-bold text-[#FF6B00]">+3.2%</p>
                </div>
              </div>
            </Card>

            <Card className="bg-[#111111] border-[#222222] p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/20 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-[#FF6B00]" />
                </div>
                <div>
                  <p className="text-sm text-[#888888] uppercase tracking-wider">Risk Score</p>
                  <p className="text-2xl font-bold">78</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Financial Charts */}
          <div className="grid grid-cols-1 gap-8">
            <Card className="bg-[#111111] border-[#222222] p-8">
              <h3 className="text-xl font-semibold mb-6">Portfolio Performance</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={currentFinancialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                  <XAxis dataKey="date" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111111", border: "1px solid #222222", borderRadius: "8px" }}
                    labelStyle={{ color: "#E5E7EB" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#FF6B00"
                    strokeWidth={3}
                    dot={{ fill: "#FF6B00", r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
