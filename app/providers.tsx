"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { GlobalCommandBar } from "@/components/global-command-bar"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      {children}
      <GlobalCommandBar />
    </ThemeProvider>
  )
}
