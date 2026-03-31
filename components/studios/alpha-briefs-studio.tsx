"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FileTextIcon, TrendingUpIcon, AlertTriangleIcon, CheckCircle2Icon } from "@/components/icons"

export default function AlphaBriefsStudio() {
  const [ticker, setTicker] = useState("")
  const [loading, setLoading] = useState(false)
  const [brief, setBrief] = useState<any>(null)

  const generateBrief = async () => {
    if (!ticker.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/alpha-brief/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: ticker.toUpperCase() }),
      })

      const data = await response.json()
      if (data.success) {
        setBrief(data.brief)
      }
    } catch (error) {
      console.error("[v0] Alpha Brief generation error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen w-full bg-[#0a0a0f] text-white overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileTextIcon size={32} className="text-cyan-400" />
            <h1 className="text-4xl font-bold gradient-text">Alpha Brief Research Engine</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Get AI-powered financial analysis and investment insights for any stock ticker.
          </p>
        </div>

        {/* Input Section */}
        <Card className="bg-[#0f1118] border border-white/10 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">Generate Alpha Brief</h2>
          <div className="flex gap-4">
            <Input
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="Enter stock ticker (e.g., AAPL, TSLA, GOOGL)"
              className="bg-[#14161e] border-white/20 text-white text-lg"
              onKeyDown={(e) => e.key === "Enter" && generateBrief()}
            />
            <Button
              onClick={generateBrief}
              disabled={loading || !ticker.trim()}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-8"
            >
              {loading ? "Analyzing..." : "Generate Brief"}
            </Button>
          </div>
        </Card>

        {loading && (
          <div className="space-y-6">
            {/* Overview Skeleton */}
            <Card className="bg-[#0f1118] border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-3/4" />
            </Card>

            {/* Metrics Skeletons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-[#0f1118] border border-white/10 p-6">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-8 w-20" />
                </Card>
              ))}
            </div>

            {/* Analysis Skeleton */}
            <Card className="bg-[#0f1118] border border-white/10 p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#14161e] p-4 rounded-lg border border-white/10">
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Results Section */}
        {brief && !loading && (
          <div className="space-y-6">
            {/* Overview */}
            <Card className="bg-[#0f1118] border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{brief.ticker}</h2>
                <span className="text-sm text-gray-400">{brief.timestamp}</span>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">{brief.overview}</p>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-[#0f1118] border border-green-500/30 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUpIcon className="text-green-400" />
                  <h3 className="text-sm uppercase tracking-widest text-gray-400">Recommendation</h3>
                </div>
                <p className="text-2xl font-bold text-green-400">{brief.recommendation}</p>
              </Card>

              <Card className="bg-[#0f1118] border border-blue-500/30 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2Icon className="text-blue-400" />
                  <h3 className="text-sm uppercase tracking-widest text-gray-400">Confidence</h3>
                </div>
                <p className="text-2xl font-bold text-blue-400">{brief.confidence}%</p>
              </Card>

              <Card className="bg-[#0f1118] border border-yellow-500/30 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangleIcon className="text-yellow-400" />
                  <h3 className="text-sm uppercase tracking-widest text-gray-400">Risk Level</h3>
                </div>
                <p className="text-2xl font-bold text-yellow-400">{brief.riskLevel}</p>
              </Card>
            </div>

            {/* Detailed Analysis */}
            <Card className="bg-[#0f1118] border border-white/10 p-6">
              <h3 className="text-xl font-semibold mb-4 text-cyan-400">Detailed Analysis</h3>
              <div className="space-y-4">
                {brief.analysis?.map((section: any, idx: number) => (
                  <div key={idx} className="bg-[#14161e] p-4 rounded-lg border border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-2">{section.title}</h4>
                    <p className="text-gray-300 leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Key Insights */}
            {brief.insights && brief.insights.length > 0 && (
              <Card className="bg-[#0f1118] border border-purple-500/30 p-6">
                <h3 className="text-xl font-semibold mb-4 text-purple-400">Key Insights</h3>
                <ul className="space-y-3">
                  {brief.insights.map((insight: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-purple-400 mt-1">•</span>
                      <span className="text-gray-300">{insight}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}

        {/* Empty State */}
        {!brief && !loading && (
          <Card className="bg-[#0f1118] border border-white/10 p-12 text-center">
            <FileTextIcon size={64} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Brief Generated Yet</h3>
            <p className="text-gray-500">Enter a stock ticker above to generate your first Alpha Brief.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
