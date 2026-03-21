"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Loader2 } from "lucide-react"

interface ApiStatus {
  name: string
  status: "working" | "configured" | "missing" | "error" | "invalid" | "unreachable" | "localhost"
  message: string
}

interface ApiResults {
  critical: ApiStatus[]
  important: ApiStatus[]
  optional: ApiStatus[]
}

export default function ApiStatusPage() {
  const [results, setResults] = useState<ApiResults | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-keys")
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("[v0] Failed to fetch API status:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "working":
      case "configured":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "missing":
        return <XCircle className="h-5 w-5 text-gray-500" />
      case "localhost":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "error":
      case "invalid":
      case "unreachable":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "working":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Working</Badge>
      case "configured":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Configured</Badge>
      case "missing":
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Missing</Badge>
      case "localhost":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Localhost</Badge>
      case "error":
      case "invalid":
      case "unreachable":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Error</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Unknown</Badge>
    }
  }

  const renderApiList = (apis: ApiStatus[], title: string, description: string) => (
    <Card className="bg-apex-dark border-apex-orange/20">
      <CardHeader>
        <CardTitle className="text-apex-light font-orbitron">{title}</CardTitle>
        <CardDescription className="text-apex-light/60">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {apis.map((api) => (
          <div
            key={api.name}
            className="flex items-center justify-between p-3 rounded-lg bg-apex-darker border border-apex-orange/10"
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(api.status)}
              <div>
                <p className="font-medium text-apex-light">{api.name}</p>
                <p className="text-sm text-apex-light/60">{api.message}</p>
              </div>
            </div>
            {getStatusBadge(api.status)}
          </div>
        ))}
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-apex-darker p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-apex-orange" />
          </div>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-apex-darker p-8">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-apex-dark border-apex-orange/20">
            <CardContent className="p-8 text-center">
              <p className="text-apex-light">Failed to load API status</p>
              <Button onClick={fetchStatus} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const workingCount = [
    ...results.critical.filter((a) => a.status === "working" || a.status === "configured"),
    ...results.important.filter((a) => a.status === "working" || a.status === "configured"),
    ...results.optional.filter((a) => a.status === "working" || a.status === "configured"),
  ].length

  const totalCount = results.critical.length + results.important.length + results.optional.length

  return (
    <div className="min-h-screen bg-apex-darker p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-apex-light font-orbitron mb-2">API Status Dashboard</h1>
            <p className="text-apex-light/60">Monitor the health of all your API integrations</p>
          </div>
          <Button onClick={fetchStatus} disabled={loading} className="bg-apex-orange hover:bg-apex-orange/80">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Summary Card */}
        <Card className="bg-gradient-to-br from-apex-orange/20 to-apex-dark border-apex-orange/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-apex-light/60 mb-1">APIs Configured</p>
                <p className="text-3xl font-bold text-apex-light font-orbitron">
                  {workingCount} / {totalCount}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-apex-light/60 mb-1">Status</p>
                <p className="text-xl font-semibold text-apex-orange">
                  {Math.round((workingCount / totalCount) * 100)}% Ready
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Lists */}
        <div className="space-y-6">
          {renderApiList(results.critical, "Critical APIs", "These APIs are essential for core functionality")}
          {renderApiList(results.important, "Important APIs", "These APIs enable major features and integrations")}
          {renderApiList(results.optional, "Optional APIs", "These APIs provide additional features and enhancements")}
        </div>
      </div>
    </div>
  )
}
