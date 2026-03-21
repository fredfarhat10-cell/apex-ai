"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useStore } from "./store/useStore"
import Onboarding from "./pages/Onboarding"
import Login from "./pages/Login"
import DashboardLayout from "./layouts/DashboardLayout"
import Dashboard from "./pages/Dashboard"
import Strategy from "./pages/Strategy"
import Financial from "./pages/Financial"
import Stylist from "./pages/Stylist"
import Knowledge from "./pages/Knowledge"
import Routines from "./pages/Routines"
import Simulator from "./pages/Simulator"
import Vault from "./pages/Vault"
import Spinner from "./components/Spinner"

type Page = "dashboard" | "strategy" | "financial" | "stylist" | "knowledge" | "routines" | "simulator" | "vault"

const App: React.FC = () => {
  const isLocked = useStore((state) => state.isLocked)
  const vaultExists = useStore((state) => state.vaultExists)
  const isInitialized = useStore((state) => state.isInitialized)
  const checkVault = useStore((state) => state.checkVault)
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")

  useEffect(() => {
    checkVault()
  }, [checkVault])

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-apex-darker">
        <Spinner />
      </div>
    )
  }

  if (!vaultExists) {
    return <Onboarding />
  }

  if (isLocked) {
    return <Login />
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />
      case "strategy":
        return <Strategy />
      case "financial":
        return <Financial />
      case "stylist":
        return <Stylist />
      case "knowledge":
        return <Knowledge />
      case "routines":
        return <Routines />
      case "simulator":
        return <Simulator />
      case "vault":
        return <Vault />
      default:
        return <Dashboard />
    }
  }

  return (
    <DashboardLayout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {renderPage()}
    </DashboardLayout>
  )
}

export default App
