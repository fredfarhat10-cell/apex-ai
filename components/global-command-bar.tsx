"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DollarSignIcon,
  FileTextIcon,
  BellIcon,
  PlaneIcon,
  MessageSquareIcon,
  SearchIcon,
  CalendarIcon,
  BriefcaseIcon,
} from "lucide-react"

interface Action {
  id: string
  label: string
  icon: React.ReactNode
  keywords: string[]
  form?: "expense" | "task" | "reminder" | "trip" | "ask"
}

const actions: Action[] = [
  {
    id: "add-expense",
    label: "Add Expense...",
    icon: <DollarSignIcon className="size-4" />,
    keywords: ["expense", "money", "spend", "cost", "payment"],
    form: "expense",
  },
  {
    id: "create-task",
    label: "Create Notion Task...",
    icon: <FileTextIcon className="size-4" />,
    keywords: ["task", "todo", "notion", "note"],
    form: "task",
  },
  {
    id: "set-reminder",
    label: "Set Reminder...",
    icon: <BellIcon className="size-4" />,
    keywords: ["reminder", "alert", "notify"],
    form: "reminder",
  },
  {
    id: "plan-trip",
    label: "Plan a Trip...",
    icon: <PlaneIcon className="size-4" />,
    keywords: ["trip", "travel", "vacation", "flight"],
    form: "trip",
  },
  {
    id: "ask-apex",
    label: "Ask Apex...",
    icon: <MessageSquareIcon className="size-4" />,
    keywords: ["ask", "question", "apex", "ai", "help"],
    form: "ask",
  },
  {
    id: "view-calendar",
    label: "View Calendar",
    icon: <CalendarIcon className="size-4" />,
    keywords: ["calendar", "schedule", "events", "meetings"],
  },
  {
    id: "career-guild",
    label: "Career & Business Guild",
    icon: <BriefcaseIcon className="size-4" />,
    keywords: ["career", "business", "job", "work", "professional"],
  },
]

export function GlobalCommandBar() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [activeForm, setActiveForm] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter actions based on search
  const filteredActions = actions.filter(
    (action) =>
      action.label.toLowerCase().includes(search.toLowerCase()) ||
      action.keywords.some((keyword) => keyword.includes(search.toLowerCase())),
  )

  // Keyboard shortcut to open command bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearch("")
      setSelectedIndex(0)
      setActiveForm(null)
      setFormData({})
    } else {
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (activeForm) {
        // In form mode, only handle Escape
        if (e.key === "Escape") {
          setActiveForm(null)
          setFormData({})
        }
        return
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % filteredActions.length)
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length)
          break
        case "Enter":
          e.preventDefault()
          if (filteredActions[selectedIndex]) {
            handleActionSelect(filteredActions[selectedIndex])
          }
          break
        case "Escape":
          setOpen(false)
          break
      }
    },
    [filteredActions, selectedIndex, activeForm],
  )

  const handleActionSelect = (action: Action) => {
    if (action.form) {
      setActiveForm(action.form)
    } else {
      // Navigate to the action
      console.log("[v0] Executing action:", action.id)
      setOpen(false)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Submitting form:", activeForm, formData)

    // Call appropriate API route based on form type
    // TODO: Implement API calls

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-2xl p-0 gap-0 bg-background/80 backdrop-blur-xl border-primary/20 shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)]"
        showCloseButton={false}
      >
        <div className="flex flex-col" onKeyDown={handleKeyDown}>
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-primary/10">
            <SearchIcon className="size-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setSelectedIndex(0)
              }}
              placeholder="Type a command or search..."
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
            />
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              ESC
            </kbd>
          </div>

          {/* Action List or Form */}
          {!activeForm ? (
            <div className="max-h-[400px] overflow-y-auto">
              {filteredActions.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">No actions found</div>
              ) : (
                <div className="py-2">
                  {filteredActions.map((action, index) => (
                    <button
                      key={action.id}
                      onClick={() => handleActionSelect(action)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        index === selectedIndex ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                      }`}
                    >
                      <div className={index === selectedIndex ? "text-primary" : "text-muted-foreground"}>
                        {action.icon}
                      </div>
                      <span className="text-sm font-medium">{action.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="p-4 space-y-4">
              {activeForm === "expense" && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Amount</label>
                    <Input
                      type="number"
                      placeholder="$20"
                      value={formData.amount || ""}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Input
                      placeholder="Coffee"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </>
              )}

              {activeForm === "task" && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Task Title</label>
                    <Input
                      placeholder="Complete project proposal"
                      value={formData.title || ""}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Notes</label>
                    <Input
                      placeholder="Additional details..."
                      value={formData.notes || ""}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </>
              )}

              {activeForm === "reminder" && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Reminder</label>
                    <Input
                      placeholder="Call dentist"
                      value={formData.reminder || ""}
                      onChange={(e) => setFormData({ ...formData, reminder: e.target.value })}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">When</label>
                    <Input
                      type="datetime-local"
                      value={formData.when || ""}
                      onChange={(e) => setFormData({ ...formData, when: e.target.value })}
                    />
                  </div>
                </>
              )}

              {activeForm === "trip" && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Destination</label>
                    <Input
                      placeholder="Paris, France"
                      value={formData.destination || ""}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Dates</label>
                    <Input
                      placeholder="June 15-22, 2025"
                      value={formData.dates || ""}
                      onChange={(e) => setFormData({ ...formData, dates: e.target.value })}
                    />
                  </div>
                </>
              )}

              {activeForm === "ask" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Ask Apex</label>
                  <Input
                    placeholder="What's on my schedule today?"
                    value={formData.question || ""}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    autoFocus
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setActiveForm(null)
                    setFormData({})
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Submit</Button>
              </div>
            </form>
          )}

          {/* Keyboard Hints */}
          {!activeForm && (
            <div className="flex items-center justify-between px-4 py-2 border-t border-primary/10 bg-muted/30 text-xs text-muted-foreground">
              <div className="flex gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-background border">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-background border">↵</kbd>
                  Select
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-background border">ESC</kbd>
                Close
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
