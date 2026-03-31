"use client"

import { useEffect, useState } from "react"
import { Check, Cloud, AlertCircle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportVault } from "@/lib/indexeddb-persistence"
import { useToast } from "@/hooks/use-toast"

export type SaveStatus = "idle" | "saving" | "saved" | "error"

interface SaveStatusIndicatorProps {
  status: SaveStatus
  lastSaved?: Date
  error?: string
  onExport?: () => void
}

export function SaveStatusIndicator({ status, lastSaved, error, onExport }: SaveStatusIndicatorProps) {
  const [showStatus, setShowStatus] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (status === "saving" || status === "saved" || status === "error") {
      setShowStatus(true)

      // Hide "saved" status after 3 seconds
      if (status === "saved") {
        const timer = setTimeout(() => setShowStatus(false), 3000)
        return () => clearTimeout(timer)
      }
    }
  }, [status])

  const handleExport = async () => {
    try {
      const result = await exportVault()

      if (!result.success || !result.blob) {
        toast({
          title: "Export Failed",
          description: result.error || "Failed to export vault",
          variant: "destructive",
        })
        return
      }

      // Download file
      const url = URL.createObjectURL(result.blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `apex-vault-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Export Successful",
        description: "Your encrypted vault has been downloaded",
      })

      onExport?.()
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Save Status */}
      {showStatus && (
        <div
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all ${
            status === "saving"
              ? "bg-cyan-500/10 text-cyan-400"
              : status === "saved"
                ? "bg-green-500/10 text-green-400"
                : status === "error"
                  ? "bg-red-500/10 text-red-400"
                  : "bg-gray-500/10 text-gray-400"
          }`}
        >
          {status === "saving" && (
            <>
              <Cloud className="h-4 w-4 animate-pulse" />
              <span>Saving...</span>
            </>
          )}
          {status === "saved" && (
            <>
              <Check className="h-4 w-4" />
              <span>Saved</span>
              {lastSaved && (
                <span className="text-xs opacity-70">
                  {new Date(lastSaved).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </>
          )}
          {status === "error" && (
            <>
              <AlertCircle className="h-4 w-4" />
              <span>{error || "Save failed"}</span>
            </>
          )}
        </div>
      )}

      {/* Export Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleExport}
        className="h-8 gap-2 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
        title="Export encrypted backup"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Export</span>
      </Button>
    </div>
  )
}
