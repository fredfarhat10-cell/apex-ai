"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { SunIcon, MoonIcon, MonitorIcon } from "./icons"

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const currentTheme = theme === "system" ? systemTheme : theme

  return (
    <div className="flex items-center gap-1 bg-apex-dark/50 rounded-lg p-1 border border-gray-800">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded transition-all ${
          theme === "light" ? "bg-apex-primary text-white" : "text-apex-gray hover:text-white hover:bg-apex-darker"
        }`}
        aria-label="Light mode"
        title="Light mode"
      >
        <SunIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded transition-all ${
          theme === "system" ? "bg-apex-primary text-white" : "text-apex-gray hover:text-white hover:bg-apex-darker"
        }`}
        aria-label="System theme"
        title="System theme"
      >
        <MonitorIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded transition-all ${
          theme === "dark" ? "bg-apex-primary text-white" : "text-apex-gray hover:text-white hover:bg-apex-darker"
        }`}
        aria-label="Dark mode"
        title="Dark mode"
      >
        <MoonIcon className="w-4 h-4" />
      </button>
    </div>
  )
}
