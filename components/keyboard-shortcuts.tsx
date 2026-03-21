"use client"

import { useEffect } from "react"

interface KeyboardShortcutsProps {
  onNavigate: (page: string) => void
  onToggleCommandBar?: () => void
  onToggleChat?: () => void
}

export function KeyboardShortcuts({ onNavigate, onToggleCommandBar, onToggleChat }: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for command bar
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        onToggleCommandBar?.()
        return
      }

      // Cmd/Ctrl + / for chat
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault()
        onToggleChat?.()
        return
      }

      // Alt + number for navigation
      if (e.altKey && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        const shortcuts: Record<string, string> = {
          "1": "dashboard",
          "2": "strategy",
          "3": "financial",
          "4": "stylist",
          "5": "knowledge",
          "6": "routines",
          "7": "simulator",
          "8": "vault",
        }

        if (shortcuts[e.key]) {
          e.preventDefault()
          onNavigate(shortcuts[e.key])
        }
      }

      // ? for help
      if (e.key === "?" && !e.shiftKey) {
        e.preventDefault()
        // Show keyboard shortcuts help
        console.log("[v0] Show keyboard shortcuts help")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onNavigate, onToggleCommandBar, onToggleChat])

  return null
}
