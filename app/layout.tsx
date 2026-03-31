import type React from "react"
// In app/layout.tsx

import type { Metadata } from "next"
import { Orbitron } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers" // We will create this next
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import { validateEnvironmentVariables, EnvValidationErrorOverlay } from "@/lib/env-validator"

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
})

export const metadata: Metadata = {
  title: {
    default: "Apex AI - Your Life OS",
    template: "%s | Apex AI",
  },
  description:
    "Privacy-first AI co-pilot that evolves with you. Regret Minimization Engine, Active Genome Mutation, and Pre-Cognition triggers. Zero-knowledge architecture, infinite possibilities.",
  keywords: [
    "AI assistant",
    "life OS",
    "productivity",
    "privacy-first",
    "zero-knowledge",
    "personal AI",
    "regret minimization",
    "life optimization",
  ],
  authors: [{ name: "Apex AI Team" }],
  creator: "Apex AI",
  publisher: "Apex AI",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://apex-ai.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Apex AI - Your Life OS",
    description:
      "Privacy-first AI co-pilot that evolves with you. Zero-knowledge architecture, infinite possibilities.",
    siteName: "Apex AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Apex AI - Your Life OS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Apex AI - Your Life OS",
    description: "Privacy-first AI co-pilot that evolves with you.",
    images: ["/og-image.png"],
    creator: "@apexai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Apex AI",
  },
  formatDetection: {
    telephone: false,
  },
    generator: 'v0.app'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const validation = validateEnvironmentVariables()

  if (!validation.isValid) {
    return (
      <html lang="en">
        <body className={orbitron.variable}>
          <EnvValidationErrorOverlay missingVars={validation.missingVars} />
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <body className={orbitron.variable}>
        <Providers>{children}</Providers>
        <Analytics />
        <Script
          src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}
