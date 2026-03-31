"use client"

import { useState, useEffect } from "react"
import { getApexWidgetDB, type ApexTask, type ApexWidgetConfig } from "@/lib/apex-widget-db"

export function useApexWidget(widgetId: string) {
  const [widget, setWidget] = useState<{ id: string; config: ApexWidgetConfig }>({
    id: widgetId,
    config: { id: widgetId, title: "Today", tone: "motivating" },
  })
  const [tasks, setTasks] = useState<ApexTask[]>([])

  useEffect(() => {
    loadWidget()
  }, [widgetId])

  async function loadWidget() {
    try {
      const db = await getApexWidgetDB()
      const tx = db.transaction("tasks", "readonly")
      const all = await tx.store.getAll()
      setTasks(all.filter((t) => t.widgetId === widgetId))
    } catch (error) {
      console.error("[v0] Failed to load widget:", error)
    }
  }

  async function toggleTask(id: string) {
    try {
      const db = await getApexWidgetDB()
      const tx = db.transaction("tasks", "readwrite")
      const task = await tx.store.get(id)
      if (task) {
        task.status = task.status === "done" ? "todo" : "done"
        task.completedAt = task.status === "done" ? Date.now() : undefined
        await tx.store.put(task)
        await loadWidget()
        return task
      }
    } catch (error) {
      console.error("[v0] Failed to toggle task:", error)
    }
  }

  async function addTask(title: string) {
    try {
      const db = await getApexWidgetDB()
      const tx = db.transaction("tasks", "readwrite")
      const task: ApexTask = {
        id: crypto.randomUUID(),
        widgetId,
        title,
        status: "todo",
        createdAt: Date.now(),
      }
      await tx.store.put(task)
      await loadWidget()
    } catch (error) {
      console.error("[v0] Failed to add task:", error)
    }
  }

  return { widget, tasks, addTask, toggleTask }
}
