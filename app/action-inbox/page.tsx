"use client"

import { useState, useEffect, useCallback } from "react"
import { mockActionItems } from "@/lib/mock-action-items"
import type { ActionItem, ActionItemStatus } from "@/lib/types/action-item"
import {
  MailIcon,
  CalendarIcon,
  FileTextIcon,
  SparklesIcon,
  InboxIcon,
  ClockIcon,
  CheckCircleIcon,
  Loader2Icon,
  AlertCircleIcon,
  Lightbulb,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const getIconForType = (type: ActionItem["type"]) => {
  switch (type) {
    case "email":
      return <MailIcon className="size-4" />
    case "calendar":
      return <CalendarIcon className="size-4" />
    case "notion":
      return <FileTextIcon className="size-4" />
    case "apex-insight":
      return <SparklesIcon className="size-4" />
  }
}

const formatTimestamp = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 1000 / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (diff < 0) {
    // Future event
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

const getPriorityBadge = (priority: number) => {
  if (priority >= 8) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertCircleIcon className="size-3" />
        Urgent
      </Badge>
    )
  } else if (priority >= 5) {
    return (
      <Badge variant="default" className="gap-1">
        High
      </Badge>
    )
  } else if (priority >= 3) {
    return <Badge variant="secondary">Medium</Badge>
  } else {
    return <Badge variant="outline">Low</Badge>
  }
}

export default function ActionInboxPage() {
  const [items, setItems] = useState<ActionItem[]>(mockActionItems)
  const [selectedView, setSelectedView] = useState<ActionItemStatus | "action">("action")
  const [selectedItemId, setSelectedItemId] = useState<string | null>(items[0]?.id || null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isDraftingReply, setIsDraftingReply] = useState(false)
  const [draftReply, setDraftReply] = useState<string | null>(null)
  const [showDraftEditor, setShowDraftEditor] = useState(false)

  const filteredItems = items.filter((item) => {
    if (selectedView === "action") return item.status === "action"
    return item.status === selectedView
  })

  const selectedItem = items.find((item) => item.id === selectedItemId)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key.toLowerCase()) {
        case "j":
          e.preventDefault()
          setSelectedIndex((prev) => {
            const newIndex = Math.min(prev + 1, filteredItems.length - 1)
            setSelectedItemId(filteredItems[newIndex]?.id || null)
            return newIndex
          })
          break
        case "k":
          e.preventDefault()
          setSelectedIndex((prev) => {
            const newIndex = Math.max(prev - 1, 0)
            setSelectedItemId(filteredItems[newIndex]?.id || null)
            return newIndex
          })
          break
        case "e":
          e.preventDefault()
          if (selectedItemId) {
            handleMarkAsDone(selectedItemId)
          }
          break
        case "h":
          e.preventDefault()
          if (selectedItemId) {
            handleSnooze(selectedItemId)
          }
          break
        case "r":
          e.preventDefault()
          if (selectedItemId) {
            handleReply(selectedItemId)
          }
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [selectedItemId, filteredItems])

  const handleMarkAsDone = useCallback((itemId: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status: "done" as ActionItemStatus } : item)),
    )
  }, [])

  const handleSnooze = useCallback((itemId: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status: "snoozed" as ActionItemStatus } : item)),
    )
  }, [])

  const handleReply = useCallback((itemId: string) => {
    console.log("[v0] Reply to item:", itemId)
  }, [])

  const handleDraftWithApex = useCallback(async (item: ActionItem) => {
    if (item.type !== "email") {
      return
    }

    setIsDraftingReply(true)
    setShowDraftEditor(true)

    try {
      const response = await fetch("/api/draft-reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailContent: item.content,
          senderEmail: item.source,
          emailSubject: item.title,
          itemId: item.id,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setDraftReply(data.draft)
      } else {
        console.error("[v0] Error drafting reply:", data.error)
        setDraftReply("Error generating draft. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Error drafting reply:", error)
      setDraftReply("Error generating draft. Please try again.")
    } finally {
      setIsDraftingReply(false)
    }
  }, [])

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Action Inbox</h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <kbd className="px-2 py-1 rounded bg-muted border">j/k</kbd>
            <span>Navigate</span>
            <kbd className="px-2 py-1 rounded bg-muted border">e</kbd>
            <span>Done</span>
            <kbd className="px-2 py-1 rounded bg-muted border">h</kbd>
            <span>Snooze</span>
            <kbd className="px-2 py-1 rounded bg-muted border">r</kbd>
            <span>Reply</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r bg-muted/30 p-4">
          <nav className="space-y-1">
            <button
              onClick={() => {
                setSelectedView("action")
                setSelectedIndex(0)
                setSelectedItemId(items.filter((i) => i.status === "action")[0]?.id || null)
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                selectedView === "action" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              <InboxIcon className="size-4" />
              <span>Action Items</span>
              <span className="ml-auto text-xs">{items.filter((i) => i.status === "action").length}</span>
            </button>

            <button
              onClick={() => {
                setSelectedView("snoozed")
                setSelectedIndex(0)
                setSelectedItemId(items.filter((i) => i.status === "snoozed")[0]?.id || null)
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                selectedView === "snoozed" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              <ClockIcon className="size-4" />
              <span>Snoozed</span>
              <span className="ml-auto text-xs">{items.filter((i) => i.status === "snoozed").length}</span>
            </button>

            <button
              onClick={() => {
                setSelectedView("done")
                setSelectedIndex(0)
                setSelectedItemId(items.filter((i) => i.status === "done")[0]?.id || null)
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                selectedView === "done" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              <CheckCircleIcon className="size-4" />
              <span>Done</span>
              <span className="ml-auto text-xs">{items.filter((i) => i.status === "done").length}</span>
            </button>
          </nav>
        </div>

        <div className="w-96 border-r overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <CheckCircleIcon className="size-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">All caught up!</p>
              <p className="text-sm text-muted-foreground mt-2">No items in this view</p>
            </div>
          ) : (
            <div>
              {filteredItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedItemId(item.id)
                    setSelectedIndex(index)
                  }}
                  className={cn(
                    "w-full text-left p-4 border-b transition-colors",
                    selectedItemId === item.id ? "bg-primary/10 border-l-4 border-l-primary" : "hover:bg-muted/50",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("mt-1", selectedItemId === item.id ? "text-primary" : "text-muted-foreground")}>
                      {getIconForType(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm truncate">{item.title}</h3>
                        {getPriorityBadge(item.priority)}
                      </div>
                      {item.summary && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.summary}</p>
                      )}
                      <p className="text-xs text-muted-foreground mb-1">
                        {item.sender} · {item.source}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatTimestamp(item.timestamp)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {selectedItem ? (
            <div className="p-8">
              <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    {getIconForType(selectedItem.type)}
                    <span>{selectedItem.source}</span>
                    <span>·</span>
                    <span>{formatTimestamp(selectedItem.timestamp)}</span>
                    {getPriorityBadge(selectedItem.priority)}
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{selectedItem.title}</h1>
                  <p className="text-muted-foreground">From: {selectedItem.sender}</p>
                </div>

                {selectedItem.summary && (
                  <div className="mb-6 p-4 border rounded-lg bg-primary/5 border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <SparklesIcon className="size-4 text-primary" />
                      <h3 className="text-sm font-semibold text-primary">AI Summary</h3>
                    </div>
                    <p className="text-sm text-foreground">{selectedItem.summary}</p>
                  </div>
                )}

                {selectedItem.suggestedAction && (
                  <div className="mb-6 p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="size-4 text-orange-500" />
                      <h3 className="text-sm font-semibold">Suggested Next Action</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedItem.suggestedAction}</p>
                  </div>
                )}

                <div className="prose prose-sm dark:prose-invert max-w-none mb-8">
                  <div className="whitespace-pre-wrap">{selectedItem.content}</div>
                </div>

                {showDraftEditor && selectedItem.type === "email" && (
                  <div className="mb-8 p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <SparklesIcon className="size-4 text-primary" />
                        AI-Generated Draft
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowDraftEditor(false)
                          setDraftReply(null)
                        }}
                      >
                        Close
                      </Button>
                    </div>

                    {isDraftingReply ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2Icon className="size-6 animate-spin text-primary" />
                        <span className="ml-2 text-sm text-muted-foreground">Drafting contextual reply...</span>
                      </div>
                    ) : (
                      <>
                        <Textarea
                          value={draftReply || ""}
                          onChange={(e) => setDraftReply(e.target.value)}
                          className="min-h-[200px] mb-4 font-mono text-sm"
                          placeholder="Your AI-generated draft will appear here..."
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              console.log("[v0] Sending reply:", draftReply)
                              setShowDraftEditor(false)
                              setDraftReply(null)
                              handleMarkAsDone(selectedItem.id)
                            }}
                          >
                            Send Reply
                          </Button>
                          <Button variant="outline" onClick={() => handleDraftWithApex(selectedItem)}>
                            Regenerate
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-6 border-t">
                  {selectedItem.type === "email" && !showDraftEditor && (
                    <Button onClick={() => handleDraftWithApex(selectedItem)} className="gap-2 bg-primary">
                      <SparklesIcon className="size-4" />
                      <span>Draft with Apex</span>
                    </Button>
                  )}
                  {selectedItem.type === "email" && (
                    <Button onClick={() => handleReply(selectedItem.id)} variant="outline" className="gap-2">
                      <span>Reply</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-background/50 text-xs">r</kbd>
                    </Button>
                  )}
                  <Button onClick={() => handleMarkAsDone(selectedItem.id)} variant="outline" className="gap-2">
                    <span>Mark as Done</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-background text-xs">e</kbd>
                  </Button>
                  <Button onClick={() => handleSnooze(selectedItem.id)} variant="outline" className="gap-2">
                    <span>Snooze</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-background text-xs">h</kbd>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Select an item to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
