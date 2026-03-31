"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { ShieldCheckIcon, WifiOffIcon, LockIcon, DatabaseIcon } from "./icons"
import { Badge } from "@/components/ui/badge"

export function PrivacyStatusIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [storageUsed, setStorageUsed] = useState(0)

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Calculate storage usage
    let totalSize = 0
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length
      }
    }
    setStorageUsed(Math.round(totalSize / 1024)) // KB

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <Card className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border-green-500/30 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500/40">
            <ShieldCheckIcon size={32} className="text-green-400" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-white">Local-Only: ON</h2>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            </div>
            <p className="text-sm text-apex-gray">All data processing happens on your device. Zero cloud storage.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="text-center">
            <div className="flex items-center gap-2 mb-1">
              <WifiOffIcon className="w-4 h-4 text-green-400" />
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                {isOnline ? "Online" : "Offline"}
              </Badge>
            </div>
            <p className="text-xs text-apex-gray">Network Status</p>
          </div>

          <div className="text-center">
            <div className="flex items-center gap-2 mb-1">
              <LockIcon className="w-4 h-4 text-cyan-400" />
              <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                AES-256
              </Badge>
            </div>
            <p className="text-xs text-apex-gray">Encryption</p>
          </div>

          <div className="text-center">
            <div className="flex items-center gap-2 mb-1">
              <DatabaseIcon className="w-4 h-4 text-purple-400" />
              <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                {storageUsed} KB
              </Badge>
            </div>
            <p className="text-xs text-apex-gray">Local Storage</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
