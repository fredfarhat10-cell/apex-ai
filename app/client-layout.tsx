"use client"

import type React from "react"
import { VaultProvider } from "@/lib/vault-context"
import { CustomizationProvider } from "@/lib/customization-context"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "@/components/toaster"
import { useEffect } from "react"
import { initErrorMonitoring } from "@/lib/error-monitor"

function ErrorMonitoringInit({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      initErrorMonitoring()

      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
      if (mediaQuery.matches) {
        document.documentElement.classList.add("reduce-motion")
      }

      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/sw.js")
          .then(() => {
            // Service worker registered successfully (silent)
          })
          .catch(() => {
            // Service worker registration failed (silent - not critical for core functionality)
          })
      }
    }
  }, [])

  return <>{children}</>
}

export default function ClientLayout({
  children,
  className,
}: Readonly<{
  children: React.ReactNode
  className?: string
}>) {
  return (
    <html lang="en" className={className}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#22d3ee" />
        <link rel="apple-touch-icon" href="/icon-192.jpg" />
      </head>
      <body className="antialiased">
        <ErrorBoundary>
          <ErrorMonitoringInit>
            <VaultProvider>
              <CustomizationProvider>
                {children}
                <Toaster />
              </CustomizationProvider>
            </VaultProvider>
          </ErrorMonitoringInit>
        </ErrorBoundary>
      </body>
    </html>
  )
}
