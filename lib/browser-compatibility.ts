// Browser compatibility checker for Apex AI Assistant
// Ensures all required features are available

interface CompatibilityCheck {
  feature: string
  supported: boolean
  required: boolean
}

export function checkBrowserCompatibility(): {
  compatible: boolean
  checks: CompatibilityCheck[]
  warnings: string[]
} {
  const checks: CompatibilityCheck[] = []
  const warnings: string[] = []

  // Check for required features
  checks.push({
    feature: "Web Crypto API",
    supported: typeof crypto !== "undefined" && typeof crypto.subtle !== "undefined",
    required: true,
  })

  checks.push({
    feature: "LocalStorage",
    supported: typeof localStorage !== "undefined",
    required: true,
  })

  checks.push({
    feature: "IndexedDB",
    supported: typeof indexedDB !== "undefined",
    required: false,
  })

  checks.push({
    feature: "Service Workers",
    supported: "serviceWorker" in navigator,
    required: false,
  })

  checks.push({
    feature: "Web Audio API",
    supported: typeof AudioContext !== "undefined" || typeof (window as any).webkitAudioContext !== "undefined",
    required: false,
  })

  checks.push({
    feature: "Canvas API",
    supported: typeof HTMLCanvasElement !== "undefined",
    required: false,
  })

  // Check browser version
  const userAgent = navigator.userAgent
  const isChrome = /Chrome\/(\d+)/.test(userAgent)
  const isFirefox = /Firefox\/(\d+)/.test(userAgent)
  const isSafari = /Safari\/(\d+)/.test(userAgent) && !/Chrome/.test(userAgent)
  const isEdge = /Edg\/(\d+)/.test(userAgent)

  if (isChrome) {
    const version = Number.parseInt(userAgent.match(/Chrome\/(\d+)/)?.[1] || "0")
    if (version < 90) {
      warnings.push("Chrome version is outdated. Please update to version 90 or higher.")
    }
  } else if (isFirefox) {
    const version = Number.parseInt(userAgent.match(/Firefox\/(\d+)/)?.[1] || "0")
    if (version < 88) {
      warnings.push("Firefox version is outdated. Please update to version 88 or higher.")
    }
  } else if (isSafari) {
    const version = Number.parseInt(userAgent.match(/Version\/(\d+)/)?.[1] || "0")
    if (version < 14) {
      warnings.push("Safari version is outdated. Please update to version 14 or higher.")
    }
  } else if (isEdge) {
    const version = Number.parseInt(userAgent.match(/Edg\/(\d+)/)?.[1] || "0")
    if (version < 90) {
      warnings.push("Edge version is outdated. Please update to version 90 or higher.")
    }
  }

  // Check for unsupported features
  checks.forEach((check) => {
    if (check.required && !check.supported) {
      warnings.push(`${check.feature} is required but not supported in your browser.`)
    } else if (!check.required && !check.supported) {
      warnings.push(`${check.feature} is not supported. Some features may be limited.`)
    }
  })

  const compatible = checks.filter((c) => c.required).every((c) => c.supported)

  return { compatible, checks, warnings }
}

// Display compatibility warnings to user
export function displayCompatibilityWarnings() {
  if (typeof window === "undefined") return

  const { compatible, warnings } = checkBrowserCompatibility()

  if (!compatible) {
    console.error("[v0] Browser compatibility check failed:", warnings)
    alert(
      "Your browser does not support all required features for Apex AI Assistant.\n\n" +
        warnings.join("\n") +
        "\n\nPlease use a modern browser like Chrome, Firefox, Safari, or Edge.",
    )
  } else if (warnings.length > 0) {
    console.warn("[v0] Browser compatibility warnings:", warnings)
  } else {
    console.log("[v0] Browser compatibility check passed")
  }
}
