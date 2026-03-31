import { openDB, type IDBPDatabase } from "idb"

let dbInstance: IDBPDatabase | null = null

export async function getApexWidgetDB() {
  if (dbInstance) return dbInstance

  dbInstance = await openDB("apex-widgets", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("tasks")) {
        db.createObjectStore("tasks", { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains("widgets")) {
        db.createObjectStore("widgets", { keyPath: "id" })
      }
    },
  })

  return dbInstance
}

export interface ApexTask {
  id: string
  widgetId: string
  title: string
  status: "todo" | "done"
  createdAt: number
  completedAt?: number
  priority?: "high" | "medium" | "low"
  category?: string
}

export interface ApexWidgetConfig {
  id: string
  title: string
  tone: "motivating" | "friendly" | "professional"
  theme?: string
}

// Simple client <-> service worker broadcast helper
export function registerApexServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/apex-sw.js").catch((error) => {
      console.log("[v0] Apex SW registration failed:", error)
    })
  }
}
