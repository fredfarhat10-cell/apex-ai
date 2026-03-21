"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ErrorHandler, type ErrorLog } from "@/lib/error-handler"
import { AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react"

export function QADashboard() {
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [filter, setFilter] = useState<"all" | "unresolved" | "critical">("unresolved")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadErrors()
  }, [filter])

  const loadErrors = async () => {
    setLoading(true)
    const errorHandler = ErrorHandler.getInstance()

    const filters: any = {}
    if (filter === "unresolved") {
      filters.resolved = false
    } else if (filter === "critical") {
      filters.severity = "critical"
    }

    const errorList = await errorHandler.getErrors(filters)
    setErrors(errorList)
    setLoading(false)
  }

  const resolveError = async (errorId: string) => {
    const errorHandler = ErrorHandler.getInstance()
    await errorHandler.resolveError(errorId)
    loadErrors()
  }

  const getSeverityColor = (severity: ErrorLog["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-blue-500"
    }
  }

  const getTypeIcon = (type: ErrorLog["type"]) => {
    switch (type) {
      case "api_error":
        return <XCircle className="h-4 w-4" />
      case "network_error":
        return <AlertTriangle className="h-4 w-4" />
      case "validation_error":
        return <AlertTriangle className="h-4 w-4" />
      case "system_error":
        return <XCircle className="h-4 w-4" />
    }
  }

  const stats = {
    total: errors.length,
    unresolved: errors.filter((e) => !e.resolved).length,
    critical: errors.filter((e) => e.severity === "critical").length,
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">QA Dashboard</h2>
        <div className="flex gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
            All ({stats.total})
          </Button>
          <Button variant={filter === "unresolved" ? "default" : "outline"} onClick={() => setFilter("unresolved")}>
            Unresolved ({stats.unresolved})
          </Button>
          <Button variant={filter === "critical" ? "default" : "outline"} onClick={() => setFilter("critical")}>
            Critical ({stats.critical})
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Errors</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Unresolved</p>
              <p className="text-2xl font-bold">{stats.unresolved}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Critical</p>
              <p className="text-2xl font-bold">{stats.critical}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Error List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading errors...</p>
        ) : errors.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <p className="text-lg font-semibold">No errors found</p>
            <p className="text-sm text-muted-foreground">System is running smoothly</p>
          </Card>
        ) : (
          errors.map((error) => (
            <Card key={error.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">{getTypeIcon(error.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getSeverityColor(error.severity)}>{error.severity}</Badge>
                      <Badge variant="outline">{error.type}</Badge>
                      {error.resolved && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500">
                          Resolved
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium mb-1">{error.message}</p>
                    <p className="text-xs text-muted-foreground">{new Date(error.timestamp).toLocaleString()}</p>
                    {error.context && (
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer">View context</summary>
                        <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-auto">
                          {JSON.stringify(error.context, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
                {!error.resolved && (
                  <Button size="sm" variant="outline" onClick={() => resolveError(error.id)}>
                    Resolve
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
