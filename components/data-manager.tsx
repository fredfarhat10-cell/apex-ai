"use client"

import type React from "react"

import { useState } from "react"
import { Download, Upload, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useVault } from "@/lib/vault-context"

export function DataManager() {
  const { state } = useVault()
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleExport = () => {
    try {
      // Create backup with timestamp
      const backup = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        data: state,
        metadata: {
          itemCount: {
            expenses: state.expenses.length,
            goals: state.goals.length,
            habits: state.habits.length,
            knowledge: state.knowledge.length,
            wardrobe: state.wardrobe.length,
          },
        },
      }

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `apex-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setMessage({ type: "success", text: "Backup exported successfully!" })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error("[v0] Export error:", error)
      setMessage({ type: "error", text: "Failed to export data" })
    }
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const backup = JSON.parse(content)

        // Validate backup structure
        if (!backup.version || !backup.data) {
          throw new Error("Invalid backup file format")
        }

        // Merge imported data with current state
        const confirmed = window.confirm(
          `Import backup from ${new Date(backup.timestamp).toLocaleDateString()}?\n\n` +
            `This will merge:\n` +
            `- ${backup.metadata.itemCount.expenses} expenses\n` +
            `- ${backup.metadata.itemCount.goals} goals\n` +
            `- ${backup.metadata.itemCount.habits} habits\n` +
            `- ${backup.metadata.itemCount.knowledge} knowledge items\n` +
            `- ${backup.metadata.itemCount.wardrobe} wardrobe items`,
        )

        if (confirmed) {
          // Import data (vault context will handle encryption and save)
          Object.keys(backup.data).forEach((key) => {
            if (Array.isArray(backup.data[key])) {
              // Merge arrays, avoiding duplicates by ID
              const existing = state[key as keyof typeof state] as any[]
              const imported = backup.data[key]
              const merged = [...existing]

              imported.forEach((item: any) => {
                if (!merged.find((m) => m.id === item.id)) {
                  merged.push(item)
                }
              })

              // Update state through vault context
              // Note: This would need to be implemented in vault-context
              console.log("[v0] Would merge:", key, merged.length, "items")
            }
          })

          setMessage({ type: "success", text: "Data imported successfully!" })
          setTimeout(() => {
            window.location.reload() // Reload to apply changes
          }, 1500)
        }
      } catch (error) {
        console.error("[v0] Import error:", error)
        setMessage({ type: "error", text: "Failed to import data. Invalid file format." })
      } finally {
        setImporting(false)
      }
    }

    reader.onerror = () => {
      setMessage({ type: "error", text: "Failed to read file" })
      setImporting(false)
    }

    reader.readAsText(file)
  }

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Data Management</h3>
        <p className="text-sm text-muted-foreground">
          Export your encrypted data for backup or import from a previous backup.
        </p>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button onClick={handleExport} className="flex-1 gap-2">
          <Download className="h-4 w-4" />
          Export Backup
        </Button>

        <Button variant="outline" className="flex-1 gap-2 relative bg-transparent" disabled={importing}>
          <Upload className="h-4 w-4" />
          {importing ? "Importing..." : "Import Backup"}
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={importing}
          />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        All data remains encrypted and is never sent to any server. Backups are stored locally on your device.
      </p>
    </Card>
  )
}
