"use client"

import { Card } from "@/components/ui/card"
import { LightbulbIcon, TrendingUpIcon, AlertTriangleIcon, SparklesIcon } from "@/components/icons"
import { useVault } from "@/lib/vault-context"

export default function ProactiveInsightsPanel() {
  const { trendAnalysis } = useVault()

  if (!trendAnalysis || trendAnalysis.recommendations.length === 0) {
    return (
      <Card className="bg-[#0f1118] border border-white/10 p-6 rounded-2xl">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <LightbulbIcon className="text-yellow-400" size={20} />
          Proactive Insights
        </h3>
        <p className="text-sm text-gray-400">
          As you use Apex, I will identify patterns and provide personalized insights here.
        </p>
      </Card>
    )
  }

  const getIconForRec = (rec: string) => {
    const lowerRec = rec.toLowerCase()
    if (lowerRec.includes("spending") || lowerRec.includes("budget"))
      return <AlertTriangleIcon className="text-yellow-400 w-5 h-5" size={20} />
    if (lowerRec.includes("productive") || lowerRec.includes("momentum"))
      return <TrendingUpIcon className="text-green-400 w-5 h-5" size={20} />
    return <LightbulbIcon className="text-cyan-400 w-5 h-5" size={20} />
  }

  return (
    <Card className="bg-[#0f1118] border border-purple-500/30 p-6 rounded-2xl shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <SparklesIcon className="text-purple-400" size={20} />
        Proactive Insights
      </h3>
      <div className="space-y-4">
        {trendAnalysis.recommendations.slice(0, 3).map((rec, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-black/30 rounded-lg border border-gray-700">
            <div className="flex-shrink-0 mt-1">{getIconForRec(rec)}</div>
            <p className="text-sm text-gray-300 leading-relaxed">{rec}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-black/20 p-2 rounded">
            <span className="text-gray-400">Habit Rate:</span>
            <span className="text-white font-semibold ml-1">{trendAnalysis.habitCompletionRate}%</span>
          </div>
          <div className="bg-black/20 p-2 rounded">
            <span className="text-gray-400">Spending:</span>
            <span className="text-white font-semibold ml-1 capitalize">{trendAnalysis.spendingPattern}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
