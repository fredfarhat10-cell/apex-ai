"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, CheckCircle2, AlertCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ProactiveNotification {
  id: string
  type: "morning_architect" | "evening_recovery" | "overnight_monitor"
  title: string
  message: string
  priority: "high" | "medium" | "low"
  timestamp: string
  read: boolean
}

export function ProactiveNotifications() {
  const [notifications, setNotifications] = useState<ProactiveNotification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Fetch notifications on mount
    fetchNotifications()

    // Poll for new notifications every minute
    const interval = setInterval(fetchNotifications, 60000)

    const handleNewNotification = (event: CustomEvent) => {
      const newNotification = event.detail
      setNotifications((prev) => [newNotification, ...prev])
      setUnreadCount((prev) => prev + 1)
      setIsOpen(true) // Auto-open panel when new notification arrives
    }

    window.addEventListener("new-proactive-notification", handleNewNotification as EventListener)

    return () => {
      clearInterval(interval)
      window.removeEventListener("new-proactive-notification", handleNewNotification as EventListener)
    }
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/proactive-notifications")
      const data = await response.json()

      if (data.notifications) {
        setNotifications(data.notifications)
        setUnreadCount(data.notifications.filter((n: ProactiveNotification) => !n.read).length)
      }
    } catch (error) {
      console.error("[v0] Error fetching notifications:", error)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case "medium":
        return <Info className="w-5 h-5 text-yellow-500" />
      default:
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
    }
  }

  return (
    <>
      {/* Notification Bell Button */}
      <Button variant="ghost" size="icon" className="relative" onClick={() => setIsOpen(!isOpen)}>
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {/* Notifications Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-4 top-20 w-96 max-h-[600px] z-50"
          >
            <Card className="p-4 bg-background/95 backdrop-blur-lg border shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Proactive Updates</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No proactive updates yet</p>
                ) : (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-lg border ${notification.read ? "bg-muted/50" : "bg-primary/5"}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        {getPriorityIcon(notification.priority)}
                        <div className="flex-1">
                          <h4 className="text-sm font-medium mb-1">{notification.title}</h4>
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
