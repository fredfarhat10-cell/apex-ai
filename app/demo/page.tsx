"use client"

import { useState } from "react"
import Onboarding from "@/components/onboarding"
import Login from "@/components/login"
import Sidebar from "@/components/sidebar"
import DashboardContent from "@/components/dashboard-content"
import StrategyContent from "@/components/strategy-content"
import FinancialContent from "@/components/financial-content"
import VaultContent from "@/components/vault-content"

export default function DemoPage() {
  const [view, setView] = useState<"onboarding" | "login" | "dashboard" | "strategy" | "financial" | "vault">(
    "onboarding",
  )

  const views = [
    { id: "onboarding", label: "Onboarding" },
    { id: "login", label: "Login" },
    { id: "dashboard", label: "Dashboard" },
    { id: "strategy", label: "Strategy" },
    { id: "financial", label: "Financial" },
    { id: "vault", label: "Vault" },
  ]

  if (view === "onboarding") {
    return (
      <div className="relative">
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-black/80 p-2 rounded-lg">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id as any)}
              className={`px-3 py-1 rounded text-sm ${
                view === v.id ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <Onboarding />
      </div>
    )
  }

  if (view === "login") {
    return (
      <div className="relative">
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-black/80 p-2 rounded-lg">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id as any)}
              className={`px-3 py-1 rounded text-sm ${
                view === v.id ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <Login />
      </div>
    )
  }

  const renderContent = () => {
    switch (view) {
      case "dashboard":
        return <DashboardContent />
      case "strategy":
        return <StrategyContent />
      case "financial":
        return <FinancialContent />
      case "vault":
        return <VaultContent />
      default:
        return <DashboardContent />
    }
  }

  return (
    <div className="relative">
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-black/80 p-2 rounded-lg">
        {views.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id as any)}
            className={`px-3 py-1 rounded text-sm ${
              view === v.id ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
      <div className="flex h-screen bg-apex-darker text-apex-light overflow-hidden">
        <Sidebar currentPage={view} setCurrentPage={setView as any} />
        <main className="flex-1 overflow-y-auto p-8">{renderContent()}</main>
      </div>
    </div>
  )
}
