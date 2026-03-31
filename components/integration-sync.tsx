"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Mail, FileText, Activity, Heart, Database } from "lucide-react"

interface SyncResult {
  provider: string
  syncType: string
  data: any
  timestamp: string
}

export function IntegrationSync({ integrationId, provider }: { integrationId: string; provider: string }) {
  const [issyncing, setIsSyncing] = useState(false)
  const [results, setResults] = useState<SyncResult[]>([])

  const handleSync = async (syncType: string) => {
    setIsSyncing(true)
    try {
      const response = await fetch(`/api/integrations/${provider}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integrationId, syncType }),
      })

      if (response.ok) {
        const { data } = await response.json()
        setResults([
          ...results,
          {
            provider,
            syncType,
            data,
            timestamp: new Date().toISOString(),
          },
        ])
      }
    } catch (error) {
      console.error("[v0] Sync failed:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  const getSyncOptions = () => {
    switch (provider) {
      case "google_workspace":
        return [
          { type: "gmail", label: "Gmail Messages", icon: <Mail className="h-4 w-4" /> },
          { type: "drive", label: "Drive Files", icon: <FileText className="h-4 w-4" /> },
        ]
      case "strava":
        return [
          { type: "activities", label: "Activities", icon: <Activity className="h-4 w-4" /> },
          { type: "stats", label: "Statistics", icon: <Database className="h-4 w-4" /> },
        ]
      case "health_kit":
        return [
          { type: "data", label: "Health Data", icon: <Heart className="h-4 w-4" /> },
          { type: "summary", label: "Summary", icon: <Database className="h-4 w-4" /> },
        ]
      case "notion":
        return [
          { type: "pages", label: "Pages", icon: <FileText className="h-4 w-4" /> },
          { type: "databases", label: "Databases", icon: <Database className="h-4 w-4" /> },
        ]
      default:
        return []
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Sync Data
        </CardTitle>
        <CardDescription>Sync data from your connected integration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {getSyncOptions().map((option) => (
            <Button
              key={option.type}
              size="sm"
              onClick={() => handleSync(option.type)}
              disabled={issyncing}
              variant="outline"
            >
              {option.icon}
              <span className="ml-2">{option.label}</span>
            </Button>
          ))}
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Recent Syncs</h3>
            {results.map((result, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-secondary/50 rounded">
                <div>
                  <p className="text-sm font-medium">{result.syncType}</p>
                  <p className="text-xs text-muted-foreground">
                    {Array.isArray(result.data) ? `${result.data.length} items` : "Synced"}
                  </p>
                </div>
                <Badge variant="outline">{new Date(result.timestamp).toLocaleTimeString()}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
