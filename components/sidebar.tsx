"use client"

import { useVault } from "@/lib/vault-context"
import {
  HomeIcon,
  ZapIcon,
  TargetIcon,
  DollarSignIcon,
  LogOutIcon,
  SettingsIcon,
  FileTextIcon,
  CalendarIcon,
} from "./icons"
import AuraIndicator from "./aura-indicator"
import { ThemeToggle } from "./theme-toggle"
import { Boxes, LogIn } from "lucide-react"
import { useState } from "react"
import { AuthenticationModal } from "./auth/authentication-modal"

interface SidebarProps {
  currentPage: string
  setCurrentPage: (page: string) => void
}

export default function Sidebar({ currentPage, setCurrentPage }: SidebarProps) {
  const { logout, userProfile } = useVault()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const navItems = [
    { page: "dashboard", icon: <HomeIcon />, label: "Dashboard", shortcut: "Alt+1" },
    { page: "nexus", icon: <Boxes className="w-5 h-5" />, label: "Apex Nexus", shortcut: "Alt+2" },
    { page: "goals", icon: <TargetIcon />, label: "Goals", shortcut: "Alt+3" },
    { page: "financial", icon: <DollarSignIcon />, label: "Financial", shortcut: "Alt+4" },
    { page: "alpha-briefs", icon: <FileTextIcon />, label: "Alpha Briefs", shortcut: "Alt+5" },
    { page: "calendar", icon: <CalendarIcon />, label: "Calendar", shortcut: "Alt+6" },
    { page: "integrations", icon: <ZapIcon />, label: "Integrations", shortcut: "Alt+7" },
    { page: "settings", icon: <SettingsIcon />, label: "Settings", shortcut: "Alt+8" },
  ]

  return (
    <>
      <aside
        className="w-64 bg-apex-dark h-screen flex flex-col p-4 border-r border-gray-800 sidebar-nav"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-2 mb-8">
          <ZapIcon size={28} className="text-apex-primary" />
          <h1 className="text-2xl font-bold text-apex-light">Apex</h1>
        </div>

        <div className="aura-indicator">
          <AuraIndicator />
        </div>

        <div className="mt-4 mb-4">
          <ThemeToggle />
        </div>

        <nav className="flex-grow mt-4" aria-label="Primary navigation">
          <ul className="space-y-1" role="list">
            {navItems.map((item) => (
              <li key={item.page}>
                <button
                  onClick={() => setCurrentPage(item.page)}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors w-full text-left ${
                    currentPage === item.page
                      ? "bg-apex-primary text-white"
                      : "text-apex-gray hover:bg-apex-darker hover:text-apex-light"
                  }`}
                  aria-label={`Navigate to ${item.label}`}
                  aria-current={currentPage === item.page ? "page" : undefined}
                >
                  <span className="flex items-center gap-3">
                    {item.icon}
                    {item.label}
                  </span>
                  <kbd className="hidden md:inline-block text-xs opacity-50 font-mono">
                    {item.shortcut.replace("Alt+", "⌥")}
                  </kbd>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto">
          <div className="border-t border-gray-800 my-4"></div>

          {userProfile ? (
            <>
              <div className="flex items-center gap-3 px-3 mb-4">
                <div
                  className="w-10 h-10 bg-apex-primary rounded-full flex items-center justify-center font-bold text-white"
                  aria-label={`User avatar for ${userProfile?.name}`}
                >
                  {userProfile?.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-apex-light">{userProfile?.name}</p>
                  <p className="text-xs text-apex-gray">{userProfile?.occupation}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-apex-gray hover:bg-red-500/10 hover:text-red-400 transition-colors"
                aria-label="Logout and lock vault"
              >
                <LogOutIcon />
                <span>Logout & Lock Vault</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center justify-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium bg-apex-primary text-white hover:bg-apex-primary/90 transition-colors"
              aria-label="Login or Sign Up"
            >
              <LogIn className="w-4 h-4" />
              <span>Login / Sign Up</span>
            </button>
          )}
        </div>
      </aside>

      <AuthenticationModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}
