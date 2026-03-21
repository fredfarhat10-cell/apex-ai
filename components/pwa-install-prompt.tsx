"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { XIcon, UploadCloudIcon } from "./icons"

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    console.log("[v0] PWA install outcome:", outcome)

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("pwa-prompt-dismissed", "true")
  }

  if (!showPrompt || localStorage.getItem("pwa-prompt-dismissed")) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-4">
      <Card className="p-4 bg-apex-dark border-apex-primary/30 shadow-lg">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <UploadCloudIcon className="text-apex-primary" size={20} />
            <h3 className="font-semibold text-apex-light">Install Apex AI</h3>
          </div>
          <button onClick={handleDismiss} className="text-apex-gray hover:text-apex-light">
            <XIcon size={16} />
          </button>
        </div>
        <p className="text-sm text-apex-gray mb-4">
          Install Apex AI for offline access, faster performance, and a native app experience.
        </p>
        <div className="flex gap-2">
          <Button onClick={handleInstall} size="sm" className="flex-1">
            Install
          </Button>
          <Button onClick={handleDismiss} size="sm" variant="outline" className="flex-1 bg-transparent">
            Not Now
          </Button>
        </div>
      </Card>
    </div>
  )
}
