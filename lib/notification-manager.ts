export class NotificationManager {
  private static hasPermission = false

  // Request notification permission
  static async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.log("[v0] Notifications not supported")
      return false
    }

    if (Notification.permission === "granted") {
      this.hasPermission = true
      return true
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission()
      this.hasPermission = permission === "granted"
      return this.hasPermission
    }

    return false
  }

  // Send a notification
  static async send(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.hasPermission) {
      const granted = await this.requestPermission()
      if (!granted) return
    }

    try {
      new Notification(title, {
        icon: "/icon-192.jpg",
        badge: "/icon-192.jpg",
        ...options,
      })
    } catch (error) {
      console.error("[v0] Notification error:", error)
    }
  }

  // Schedule a daily reminder
  static scheduleDailyReminder(hour: number, minute: number, message: string): void {
    const now = new Date()
    const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0)

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1)
    }

    const timeUntilReminder = scheduledTime.getTime() - now.getTime()

    setTimeout(() => {
      this.send("Apex AI Assistant", {
        body: message,
        tag: "daily-reminder",
      })

      // Reschedule for next day
      this.scheduleDailyReminder(hour, minute, message)
    }, timeUntilReminder)
  }
}
