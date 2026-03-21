"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DatabaseIcon, DownloadIcon, XCircleIcon, RefreshCwIcon } from "./icons"
import { useToast } from "@/hooks/use-toast"
import { exportVault, deleteVault } from "@/lib/indexeddb-persistence"
import { getVaultMetadata } from "@/lib/vault-storage"

interface StorageItem {
  key: string
  size: number
  encrypted: boolean
  lastModified: string
}

export function PrivacyAuditTrail() {
  const [storageItems, setStorageItems] = useState<StorageItem[]>([])
  const [totalSize, setTotalSize] = useState(0)
  const { toast } = useToast()

  const scanStorage = () => {
    const items: StorageItem[] = []
    let total = 0

    // Scan localStorage
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage[key]
        const size = (value.length + key.length) * 2 // Approximate bytes
        total += size

        // Check if encrypted (base64 pattern and no readable JSON)
        const isEncrypted = !value.includes("{") && !value.includes("userProfile") && value.length > 100

        items.push({
          key,
          size,
          encrypted: isEncrypted,
          lastModified: getVaultMetadata()?.lastModified || new Date().toISOString(),
        })
      }
    }

    setStorageItems(items.sort((a, b) => b.size - a.size))
    setTotalSize(total)
  }

  useEffect(() => {
    scanStorage()
  }, [])

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
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete ALL local data? This action cannot be undone!")
    if (!confirmed) return

    const doubleConfirm = window.confirm(
      "This will permanently delete your encrypted vault. Have you exported a backup? Type 'DELETE' to confirm.",
    )
    if (!doubleConfirm) return

    try {
      const result = await deleteVault()
      if (result.success) {
        localStorage.clear()
        sessionStorage.clear()
        toast({
          title: "Data Deleted",
          description: "All local data has been permanently deleted",
        })
        setTimeout(() => window.location.reload(), 2000)
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="bg-apex-dark/50 border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Storage Audit Trail</h3>
            <p className="text-sm text-apex-gray">Complete inventory of what's stored locally on your device</p>
          </div>
          <Button onClick={scanStorage} variant="outline" size="sm" className="gap-2 bg-transparent">
            <RefreshCwIcon className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-apex-darker rounded-lg border border-gray-700">
            <p className="text-sm text-apex-gray mb-1">Total Items</p>
            <p className="text-2xl font-bold text-white">{storageItems.length}</p>
          </div>
          <div className="p-4 bg-apex-darker rounded-lg border border-gray-700">
            <p className="text-sm text-apex-gray mb-1">Total Size</p>
            <p className="text-2xl font-bold text-white">{Math.round(totalSize / 1024)} KB</p>
          </div>
          <div className="p-4 bg-apex-darker rounded-lg border border-gray-700">
            <p className="text-sm text-apex-gray mb-1">Encrypted Items</p>
            <p className="text-2xl font-bold text-green-400">{storageItems.filter((i) => i.encrypted).length}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleExport}
            className="flex-1 gap-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30"
          >
            <DownloadIcon className="w-4 h-4" />
            Export Encrypted Backup
          </Button>
          <Button
            onClick={handleDelete}
            variant="outline"
            className="gap-2 bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
          >
            <XCircleIcon className="w-4 h-4" />
            Delete All Data
          </Button>
        </div>
      </Card>

      {/* Storage Items List */}
      <Card className="bg-apex-dark/50 border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Stored Items</h3>
        <div className="space-y-2">
          {storageItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-apex-darker rounded-lg border border-gray-700"
            >
              <div className="flex items-center gap-3 flex-1">
                <DatabaseIcon className="w-4 h-4 text-cyan-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{item.key}</p>
                  <p className="text-xs text-apex-gray">
                    Last modified: {new Date(item.lastModified).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-apex-gray">{Math.round(item.size / 1024)} KB</span>
                {item.encrypted ? (
                  <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded border border-green-500/30">
                    Encrypted
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-500/10 text-gray-400 text-xs rounded border border-gray-500/30">
                    Plain
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
