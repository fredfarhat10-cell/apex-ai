"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useVault } from "@/lib/vault-context"
import Spinner from "./spinner"

interface CommandBarProps {
  isOpen: boolean
  onClose: () => void
  setCurrentPage: (page: string) => void
}

const CommandBar: React.FC<CommandBarProps> = ({ isOpen, onClose, setCurrentPage }) => {
  const [input, setInput] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { updateState, expenses, reminders, calendarEvents, userProfile } = useVault()

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setInput("")
      setResponse("")
      inputRef.current?.focus()
    }
  }, [isOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setIsLoading(true)
    setResponse("")

    try {
      const res = await fetch("/api/ai/command-bar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: input,
          context: {
            userName: userProfile?.name || "User",
            expenses: expenses.slice(-5),
            reminders: reminders.filter((r) => !r.completed).slice(-3),
            calendarEvents: calendarEvents.slice(-5),
          },
        }),
      })

      const data = await res.json()

      if (data.action) {
        if (data.action.type === "add_expense" && data.action.expense) {
          const newExpense = {
            id: new Date().toISOString(),
            ...data.action.expense,
            date: new Date().toISOString(),
          }
          updateState("expenses", [...expenses, newExpense])
        } else if (data.action.type === "add_reminder" && data.action.reminder) {
          const newReminder = {
            id: new Date().toISOString(),
            ...data.action.reminder,
            completed: false,
          }
          updateState("reminders", [...reminders, newReminder])
        } else if (data.action.type === "navigate" && data.action.page) {
          setCurrentPage(data.action.page)
          onClose()
        } else if (data.action.type === "add_event" && data.action.event) {
          const newEvent = {
            id: new Date().toISOString(),
            ...data.action.event,
            color: data.action.event.color || "rgba(0, 255, 255, 0.2)",
            priority: data.action.event.priority || "normal",
          }
          updateState("calendarEvents", [...calendarEvents, newEvent])
        }
      }

      setResponse(data.message || "Command processed successfully!")
    } catch (error) {
      console.error("[v0] Command bar error:", error)
      setResponse("Sorry, I couldn't process that command. Please try again.")
    } finally {
      setIsLoading(false)
      setInput("")
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-apex-darker border border-gray-700 rounded-lg w-full max-w-lg shadow-2xl animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Try: 'Log $20 for coffee' or 'Remind me to call mom tomorrow'"
            className="w-full bg-transparent p-4 text-lg outline-none text-apex-light"
            disabled={isLoading}
          />
        </form>
        {(isLoading || response) && (
          <div className="p-4 border-t border-gray-700">
            {isLoading && <Spinner />}
            {response && <p className="text-apex-gray">{response}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

export default CommandBar
