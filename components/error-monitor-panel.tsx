"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getErrorLogs, clearErrorLogs, exportErrorLogs, getErrorStats, type ErrorLog } from "@/lib/error-monitor"
import { ActivityIcon, ChevronDownIcon, ChevronUpIcon } from "./icons"

export function ErrorMonitorPanel() {
  const [logs, setLogs] = useState<ErrorLog[]>([])
  const [stats, setStats] = useState<ReturnType<typeof getErrorStats> | null>(null)
  const [expandedLog, setExpandedLog] = useState<string | null>(null)

  useEffect(() => {
    refreshLogs()
  }, [])

  const refreshLogs = () => {
    setLogs(getErrorLogs())
    setStats(getErrorStats())
  }

  const handleClear = () => {
    if (confirm("Clear all error logs?")) {
      clearErrorLogs()
      refreshLogs()
    }
  }

  const handleExport = () => {
    const data = exportErrorLogs()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `apex-error-logs-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getTypeColor = (type: ErrorLog["type"]) => {
    switch (type) {
      case "error":
        return "text-red-400"
      case "warning":
        return "text-yellow-400"
      case "info":
        return "text-blue-400"
      default:
        return "text-apex-gray"
    }
  }

  return (
    <Card className="p-6 bg-apex-dark border-apex-primary/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-apex-light flex items-center gap-2">
          <ActivityIcon className="text-apex-primary" />
          Error Monitor
        </h3>
        <div className="flex gap-2">
          <Button onClick={refreshLogs} size="sm" variant="outline" className="bg-transparent">
            Refresh
          </Button>
          <Button
            onClick={handleExport}
            size="sm"
            variant="outline"
            className="bg-transparent"
            disabled={logs.length === 0}
          >
            Export
          </Button>
          <Button
            onClick={handleClear}
            size="sm"
            variant="outline"
            className="bg-transparent"
            disabled={logs.length === 0}
          >
            Clear
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-3 bg-apex-darker rounded-lg">
            <p className="text-xs text-apex-gray">Total Logs</p>
            <p className="text-2xl font-bold text-apex-light">{stats.total}</p>
          </div>
          <div className="p-3 bg-apex-darker rounded-lg">
            <p className="text-xs text-apex-gray">Errors</p>
            <p className="text-2xl font-bold text-red-400">{stats.byType.error || 0}</p>
          </div>
          <div className="p-3 bg-apex-darker rounded-lg">
            <p className="text-xs text-apex-gray">Warnings</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.byType.warning || 0}</p>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-sm text-apex-gray text-center py-8">No errors logged. Your app is running smoothly!</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-3 bg-apex-darker rounded-lg border border-apex-gray/10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold uppercase ${getTypeColor(log.type)}`}>{log.type}</span>
                    <span className="text-xs text-apex-gray">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-apex-light">{log.message}</p>
                </div>
                <button
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                  className="text-apex-gray hover:text-apex-light"
                >
                  {expandedLog === log.id ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
                </button>
              </div>

              {expandedLog === log.id && (
                <div className="mt-3 pt-3 border-t border-apex-gray/10">
                  {log.stack && (
                    <div className="mb-2">
                      <p className="text-xs text-apex-gray mb-1">Stack Trace:</p>
                      <pre className="text-xs text-apex-light bg-apex-darker p-2 rounded overflow-x-auto">
                        {log.stack}
                      </pre>
                    </div>
                  )}
                  {log.context && (
                    <div className="mb-2">
                      <p className="text-xs text-apex-gray mb-1">Context:</p>
                      <pre className="text-xs text-apex-light bg-apex-darker p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.context, null, 2)}
                      </pre>
                    </div>
                  )}
                  <div className="text-xs text-apex-gray">
                    <p>URL: {log.url}</p>
                    <p className="truncate">User Agent: {log.userAgent}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
