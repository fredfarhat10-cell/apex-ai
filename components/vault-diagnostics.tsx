"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { testEncryption } from "@/lib/encryption"
import { getVaultMetadata, exportVault } from "@/lib/vault-storage"
import { useVault } from "@/lib/vault-context"

export function VaultDiagnostics() {
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const { sessionPassword } = useVault()

  const runEncryptionTest = async () => {
    setIsRunning(true)
    const result = await testEncryption()
    setTestResult(result)
    setIsRunning(false)
  }

  const handleExport = async () => {
    if (!sessionPassword) {
      alert("No active session")
      return
    }

    try {
      const backup = await exportVault(sessionPassword)
      const blob = new Blob([backup], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `apex-vault-backup-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      alert("Export failed: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const metadata = getVaultMetadata()

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-apex-dark border-apex-primary/20">
        <h3 className="text-lg font-semibold text-apex-light mb-4">Vault Diagnostics</h3>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-apex-gray">Encryption Algorithm:</span>
            <span className="text-apex-light font-mono">AES-GCM-256</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-apex-gray">Key Derivation:</span>
            <span className="text-apex-light font-mono">PBKDF2 (100k iterations)</span>
          </div>
          {metadata && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-apex-gray">Vault Version:</span>
                <span className="text-apex-light">{metadata.version}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-apex-gray">Created:</span>
                <span className="text-apex-light">{new Date(metadata.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-apex-gray">Last Modified:</span>
                <span className="text-apex-light">{new Date(metadata.lastModified).toLocaleDateString()}</span>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <Button onClick={runEncryptionTest} disabled={isRunning} className="flex-1">
            {isRunning ? "Testing..." : "Run Encryption Test"}
          </Button>
          <Button onClick={handleExport} variant="outline" className="flex-1 bg-transparent">
            Export Backup
          </Button>
        </div>

        {testResult && (
          <div
            className={`mt-4 p-3 rounded-lg ${testResult.success ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}
          >
            <p className={`text-sm ${testResult.success ? "text-green-400" : "text-red-400"}`}>{testResult.message}</p>
          </div>
        )}
      </Card>
    </div>
  )
}
