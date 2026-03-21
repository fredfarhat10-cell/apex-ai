"use client"

import type React from "react"
import { useStore } from "../store/useStore"
import { Home, Zap, Target, DollarSign, Shirt, BookOpen, Repeat, Lock, LogOut, Command, GitBranch } from "lucide-react"
import AuraIndicator from "./AuraIndicator"

interface SidebarProps {
  toggleCommandBar: () => void
  currentPage: string
  setCurrentPage: (page: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ toggleCommandBar, currentPage, setCurrentPage }) => {
  const logout = useStore((state) => state.logout)
  const userProfile = useStore((state) => state.userProfile)

  const handleLogout = () => {
    logout()
  }

  const navItems = [
    { page: "dashboard", icon: <Home size={20} />, label: "Dashboard" },
    { page: "strategy", icon: <Target size={20} />, label: "Strategy" },
    { page: "financial", icon: <DollarSign size={20} />, label: "Financial" },
    { page: "stylist", icon: <Shirt size={20} />, label: "Stylist" },
    { page: "knowledge", icon: <BookOpen size={20} />, label: "Knowledge" },
    { page: "routines", icon: <Repeat size={20} />, label: "Routines" },
    { page: "simulator", icon: <GitBranch size={20} />, label: "Simulator" },
    { page: "vault", icon: <Lock size={20} />, label: "Vault" },
  ]

  return (
    <div className="w-64 bg-apex-darker h-screen flex flex-col p-4 border-r border-gray-800">
      <div className="flex items-center gap-2 mb-8">
        <Zap className="text-apex-primary" size={28} />
        <h1 className="text-2xl font-bold text-apex-light">Apex</h1>
      </div>

      <AuraIndicator />

      <nav className="flex-grow mt-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.page}>
              <button
                onClick={() => setCurrentPage(item.page)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors w-full text-left ${
                  currentPage === item.page
                    ? "bg-apex-primary text-white"
                    : "text-apex-gray hover:bg-apex-dark hover:text-apex-light"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto">
        <button
          onClick={toggleCommandBar}
          className="w-full flex justify-between items-center text-left text-sm px-3 py-2.5 rounded-md text-apex-gray bg-apex-dark border border-gray-700 hover:bg-gray-800 transition-colors"
        >
          <span>Command...</span>
          <div className="flex items-center gap-1">
            <Command size={14} /> K
          </div>
        </button>

        <div className="border-t border-gray-800 my-4"></div>

        <div className="flex items-center gap-3 px-3">
          <div className="w-10 h-10 bg-apex-primary rounded-full flex items-center justify-center font-bold">
            {userProfile?.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-apex-light">{userProfile?.name}</p>
            <p className="text-xs text-apex-gray">{userProfile?.occupation}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full mt-4 px-3 py-2.5 rounded-md text-sm font-medium text-apex-gray hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span>Logout & Lock Vault</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
