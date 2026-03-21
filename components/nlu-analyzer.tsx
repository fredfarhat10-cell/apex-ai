"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Brain, Sparkles, TrendingUp, Tag, MessageSquare } from "lucide-react"
import { processNLU } from "@/lib/nlu-pipeline"
import type { NLUResult } from "@/lib/types/nlu"

export function NLUAnalyzer() {
  const [inputText, setInputText] = useState("")
  const [result, setResult] = useState<NLUResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAnalyze = async () => {
    if (!inputText.trim()) return

    setIsProcessing(true)
    try {
      const nluResult = await processNLU(inputText)
      setResult(nluResult)
    } catch (error) {
      console.error("[v0] NLU analysis failed:", error)
      alert("Failed to analyze text. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const getSentimentColor = (label: string) => {
    switch (label) {
      case "positive":
        return "bg-green-500/20 text-green-400 border-green-500/50"
      case "negative":
        return "bg-red-500/20 text-red-400 border-red-500/50"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50"
    }
  }

  const getEntityColor = (type: string) => {
    const colors: Record<string, string> = {
      person: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      organization: "bg-purple-500/20 text-purple-400 border-purple-500/50",
      location: "bg-green-500/20 text-green-400 border-green-500/50",
      date: "bg-orange-500/20 text-orange-400 border-orange-500/50",
      time: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      money: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
      email: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
      phone: "bg-pink-500/20 text-pink-400 border-pink-500/50",
      url: "bg-indigo-500/20 text-indigo-400 border-indigo-500/50",
    }
    return colors[type] || "bg-gray-500/20 text-gray-400 border-gray-500/50"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            NLU Pipeline Analyzer
          </CardTitle>
          <CardDescription>
            Natural Language Understanding with entity extraction, intent classification, and sentiment analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Enter text to analyze..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <Button onClick={handleAnalyze} disabled={isProcessing || !inputText.trim()} className="w-full">
              <Sparkles className="h-4 w-4 mr-2" />
              {isProcessing ? "Analyzing..." : "Analyze Text"}
            </Button>
          </div>

          {result && (
            <div className="space-y-4 pt-4 border-t">
              {/* Sentiment */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Sentiment
                </h3>
                <Badge className={getSentimentColor(result.sentiment.label)}>
                  {result.sentiment.label.toUpperCase()} ({(result.sentiment.confidence * 100).toFixed(0)}% confidence)
                </Badge>
              </div>

              {/* Intents */}
              {result.intents.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Intents
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.intents.map((intent, idx) => (
                      <Badge key={idx} variant="secondary">
                        {intent.name} ({(intent.confidence * 100).toFixed(0)}%)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Entities */}
              {result.entities.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Entities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.entities.map((entity, idx) => (
                      <Badge key={idx} className={getEntityColor(entity.type)}>
                        {entity.type}: {entity.value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords */}
              {result.keywords.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map((keyword, idx) => (
                      <Badge key={idx} variant="outline">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics */}
              {result.topics.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.topics.map((topic, idx) => (
                      <Badge key={idx} variant="outline">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
