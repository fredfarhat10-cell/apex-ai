/**
 * Jest setup for Web Crypto API polyfill
 */

import { TextEncoder, TextDecoder } from "node:util"
import { webcrypto } from "node:crypto"

// Polyfill Web Crypto API for Node.js test environment
Object.defineProperty(global, "crypto", {
  value: webcrypto,
})

// Polyfill TextEncoder/TextDecoder
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
})
