"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Share2, Download, Copy, Lock, Globe, Eye } from "lucide-react"
import type { PerformanceDNA, LegacyCloneShare } from "@/lib/types/legacy-clone"

export function LegacyCloneDashboard() {
  const [dna, setDna] = useState<PerformanceDNA | null>(null)
  const [share, setShare] = useState<LegacyCloneShare | null>(null)
  const [loading, setLoading] = useState(false)

  const generateDNA = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/legacy-clone/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "current-user" }),
      })
      const data = await response.json()
      setDna(data.dna)
    } catch (error) {
      console.error("Failed to generate DNA:", error)
    } finally {
      setLoading(false)
    }
  }

  const createShare = async (requireAccessCode: boolean, expiresInDays?: number) => {
    if (!dna) return

    setLoading(true)
    try {
      const response = await fetch("/api/legacy-clone/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dna, requireAccessCode, expiresInDays }),
      })
      const data = await response.json()
      setShare(data.share)
    } catch (error) {
      console.error("Failed to create share:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyShareLink = () => {
    if (share) {
      navigator.clipboard.writeText(share.shareUrl)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Legacy Clone</h1>
          <p className="text-muted-foreground">Export and share your performance DNA</p>
        </div>
        {!dna && (
          <Button onClick={generateDNA} disabled={loading}>
            {loading ? "Generating..." : "Generate DNA"}
          </Button>
        )}
      </div>

      {dna && (
        <>
          {/* DNA Overview */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">{dna.metadata.name}</h2>
                <p className="text-sm text-muted-foreground">{dna.metadata.description}</p>
              </div>
              <Badge variant={dna.metadata.visibility === "public" ? "default" : "secondary"}>
                {dna.metadata.visibility === "public" ? (
                  <Globe className="w-3 h-3 mr-1" />
                ) : (
                  <Lock className="w-3 h-3 mr-1" />
                )}
                {dna.metadata.visibility}
              </Badge>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {Object.entries(dna.metrics).map(([key, value]) => (
                <div key={key} className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground capitalize mb-1">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </div>
                  <div className="text-2xl font-bold">{value}</div>
                </div>
              ))}
            </div>

            {/* Archetype */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Archetype Profile</h3>
              <div className="flex gap-2 mb-3">
                <Badge variant="default">{dna.archetype.primary}</Badge>
                <Badge variant="outline">{dna.archetype.secondary}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(dna.archetype.traits).map(([trait, score]) => (
                  <div key={trait} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{trait}</span>
                    <span className="font-medium">{score}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Regret Profile */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Regret Profile</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-green-500">{dna.regretProfile.totalRUSaved}</div>
                  <div className="text-xs text-muted-foreground">RU Saved</div>
                </div>
                <div className="text-center p-3 bg-red-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-red-500">{dna.regretProfile.totalRUSpent}</div>
                  <div className="text-xs text-muted-foreground">RU Spent</div>
                </div>
                <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-blue-500">{dna.regretProfile.netRU}</div>
                  <div className="text-xs text-muted-foreground">Net RU</div>
                </div>
              </div>
            </div>

            {/* Top Habits */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Top Habits</h3>
              <div className="space-y-2">
                {dna.habits.slice(0, 5).map((habit, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <div className="font-medium">{habit.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {habit.frequency}x/week • {habit.consistency}% consistency
                      </div>
                    </div>
                    <Badge variant="outline">{habit.impact} RU</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Share Actions */}
            <div className="flex gap-2">
              <Button onClick={() => createShare(false)} disabled={loading}>
                <Share2 className="w-4 h-4 mr-2" />
                Create Public Link
              </Button>
              <Button onClick={() => createShare(true, 30)} variant="outline" disabled={loading}>
                <Lock className="w-4 h-4 mr-2" />
                Create Private Link
              </Button>
              <Button variant="outline" disabled={loading}>
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </Card>

          {/* Share Link */}
          {share && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Share Link Created</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={share.shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm"
                  />
                  <Button onClick={copyShareLink} variant="outline">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                {share.accessCode && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Access Code</div>
                    <div className="text-2xl font-mono font-bold">{share.accessCode}</div>
                  </div>
                )}

                <div className="flex gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {share.viewCount} views
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    {share.clonedCount} clones
                  </div>
                  {share.expiresAt && <div>Expires: {new Date(share.expiresAt).toLocaleDateString()}</div>}
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
