// Service Worker registration for PWA support
export function registerServiceWorker() {
  if (typeof window === "undefined") return

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[v0] Service Worker registered:", registration.scope)

          // Check for updates periodically
          setInterval(() => {
            registration.update()
          }, 60000) // Check every minute
        })
        .catch((error) => {
          console.error("[v0] Service Worker registration failed:", error)
        })
    })
  }
}

// Unregister service worker (for development/testing)
export function unregisterServiceWorker() {
  if (typeof window === "undefined") return

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister()
        console.log("[v0] Service Worker unregistered")
      })
      .catch((error) => {
        console.error("[v0] Service Worker unregistration failed:", error)
      })
  }
}
