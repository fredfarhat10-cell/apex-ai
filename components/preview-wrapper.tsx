"use client"

import type React from "react"

import { ChakraProvider, extendTheme } from "@chakra-ui/react"

// This is a simplified version of your theme from app/providers.tsx
const apexTheme = extendTheme({
  fonts: {
    heading: "var(--font-orbitron), sans-serif",
    body: "system-ui, sans-serif",
  },
  colors: {
    apex: {
      dark: "#0a0a0f",
      primary: "#22d3ee",
      accent: "#a855f7",
    },
  },
  styles: {
    global: {
      body: {
        bg: "#0a0a0f",
        color: "white",
      },
    },
  },
})

// This wrapper provides the Chakra theme for isolated V0 previews.
export function PreviewWrapper({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={apexTheme}>{children}</ChakraProvider>
}
