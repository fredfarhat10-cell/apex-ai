"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MailIcon, CalendarIcon, FileTextIcon, SparklesIcon, ArrowRight } from "lucide-react"
import { mockActionItems } from "@/lib/mock-action-items"
import type { ActionItem } from "@/lib/types/action-item"
import Link from "next/link"

const getIconForType = (type: ActionItem["type"]) => {
  switch (type) {
    case "email":
      return <MailIcon className="w-4 h-4" />
    case "calendar":
      return <CalendarIcon className="w-4 h-4" />
    case "notion":
      return <FileTextIcon className="w-4 h-4" />
    case "apex-insight":
      return <SparklesIcon className="w-4 h-4" />
  }
}

const formatTimestamp = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 1000 / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (diff < 0) {
    const futureHours = Math.abs(hours)
    if (futureHours < 24) {
      return `in ${futureHours}h`
    }
    return `in ${Math.abs(days)}d`
  }

  if (minutes < 60) {
    return `${minutes}m ago`
  }
  if (hours < 24) {
    return `${hours}h ago`
  }
  return `${days}d ago`
}

export function ActionInboxWidget() {
  const [items, setItems] = useState<ActionItem[]>([])

  useEffect(() => {
    // Load action items and filter for "action" status
    const actionItems = mockActionItems.filter((item) => item.status === "action").slice(0, 3)
    setItems(actionItems)
  }, [])

  return (
    <Card className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/30">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Action Inbox</h3>
          <Badge variant="outline" className="text-xs">
            {items.length} urgent
          </Badge>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8">
            <SparklesIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">All caught up!</p>
            <p className="text-gray-500 text-xs mt-1">No urgent action items</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-black/20 rounded-lg p-3 hover:bg-black/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="text-blue-400 mt-0.5">{getIconForType(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {item.sender} · {formatTimestamp(item.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-white/10">
          <Link href="/action-inbox">
            <Button variant="ghost" size="sm" className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
              View All Items
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
