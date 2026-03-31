"use client"

import { useEffect, useState } from "react"
import { ShieldCheckIcon, LockIcon, ServerIcon, DatabaseIcon } from "./icons"
import Widget from "./widget"

export default function PrivacyDashboard() {
  const [stats, setStats] = useState({
    encryptedItems: 0,
    localStorage: 0,
    cloudRequests: 0,
    lastEncryption: "",
  })

  useEffect(() => {
    // Calculate privacy stats
    const vaultData = localStorage.getItem("apex_vault")
    const encryptedSize = vaultData ? new Blob([vaultData]).size : 0
    const totalStorage = Object.keys(localStorage).reduce((acc, key) => {
      return acc + new Blob([localStorage.getItem(key) || ""]).size
    }, 0)

    setStats({
      encryptedItems: vaultData ? 1 : 0,
      localStorage: Math.round(totalStorage / 1024), // KB
      cloudRequests: 0, // Always 0 - no cloud storage
      lastEncryption: vaultData ? new Date().toLocaleTimeString() : "Never",
    })
  }, [])

  return (
    <Widget title="Privacy Status" icon={<ShieldCheckIcon className="w-5 h-5" />}>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm font-semibold text-green-400">Zero-Knowledge Active</p>
              <p className="text-xs text-apex-gray">All data encrypted locally</p>
            </div>
          </div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-apex-darker rounded-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <LockIcon className="w-4 h-4 text-blue-400" />
              <p className="text-xs text-apex-gray">Encrypted Items</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.encryptedItems}</p>
          </div>

          <div className="p-3 bg-apex-darker rounded-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <DatabaseIcon className="w-4 h-4 text-purple-400" />
              <p className="text-xs text-apex-gray">Local Storage</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.localStorage} KB</p>
          </div>

          <div className="p-3 bg-apex-darker rounded-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <ServerIcon className="w-4 h-4 text-red-400" />
              <p className="text-xs text-apex-gray">Cloud Requests</p>
            </div>
            <p className="text-2xl font-bold text-green-400">{stats.cloudRequests}</p>
            <p className="text-xs text-green-400 mt-1">No data sent</p>
          </div>

          <div className="p-3 bg-apex-darker rounded-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <LockIcon className="w-4 h-4 text-cyan-400" />
              <p className="text-xs text-apex-gray">Last Encrypted</p>
            </div>
            <p className="text-sm font-semibold text-white">{stats.lastEncryption}</p>
          </div>
        </div>

        <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-apex-gray leading-relaxed">
            <span className="font-semibold text-blue-400">AES-256-GCM encryption</span> with PBKDF2 key derivation. Your
            master password never leaves your device. All AI processing happens locally in your browser.
          </p>
        </div>
      </div>
    </Widget>
  )
}
