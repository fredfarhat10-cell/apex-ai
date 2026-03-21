"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import CommandBar from "../components/CommandBar"
import GlobalChat from "../components/GlobalChat"
import DynamicBackground from "../components/DynamicBackground"
import AppTour from "../components/AppTour"

interface DashboardLayoutProps {
  currentPage: string
  setCurrentPage: (page: string) => void
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ currentPage, setCurrentPage, children }) => {
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsCommandBarOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const toggleCommandBar = () => {
    setIsCommandBarOpen((prev) => !prev)
  }

  return (
    <div className="flex h-screen bg-apex-darker text-apex-light">
      <DynamicBackground />
      <Sidebar toggleCommandBar={toggleCommandBar} currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
      <CommandBar
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
        setCurrentPage={setCurrentPage}
      />
      <GlobalChat />
      <AppTour />
    </div>
  )
}

export default DashboardLayout
