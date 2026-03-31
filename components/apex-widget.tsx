"use client"

import type React from "react"
import { useState } from "react"
import { useApexWidget } from "@/hooks/use-apex-widget"
import { getReply } from "@/lib/apex-responses"
import { CheckCircle2Icon, CircleIcon, PlusIcon, SettingsIcon } from "./icons"
import { cn } from "@/lib/utils"

interface ApexWidgetProps {
  widgetId?: string
  className?: string
}

export default function ApexWidget({ widgetId = "prod-default-1", className }: ApexWidgetProps) {
  const { widget, tasks, addTask, toggleTask } = useApexWidget(widgetId)
  const [message, setMessage] = useState("")
  const [inputValue, setInputValue] = useState("")

  const completed = tasks.filter((t) => t.status === "done").length
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0

  const handleToggle = async (task: any) => {
    const updated = await toggleTask(task.id)
    const reply = getReply({ type: "task_completed", task: updated }, widget.config)
    setMessage(reply)
    setTimeout(() => setMessage(""), 4000)
  }

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const title = inputValue.trim()
    if (!title) return
    await addTask(title)
    setInputValue("")
  }

  return (
    <div
      className={cn(
        "relative backdrop-blur-md bg-slate-900/40 rounded-2xl border border-cyan-500/30 p-6 shadow-2xl overflow-hidden",
        className,
      )}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 animate-gradient-shift" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* Avatar with pulse animation */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 shadow-lg animate-pulse-slow" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/50 to-purple-500/50 blur-md animate-pulse" />
          </div>

          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              {widget.config.title}
            </h2>
            <p className="text-xs text-gray-400">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Progress ring */}
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="url(#progress-gradient)"
              strokeWidth="3"
              strokeDasharray="100"
              strokeDashoffset={100 - progress}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-cyan-400">
            {progress}%
          </span>
        </div>
      </div>

      {/* Task list */}
      <div className="relative z-10 space-y-2 mb-4 max-h-64 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No tasks yet. Add one below!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => handleToggle(task)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 group",
                "hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30",
                task.status === "done" && "opacity-60",
              )}
            >
              <div className="relative">
                {task.status === "done" ? (
                  <CheckCircle2Icon className="w-5 h-5 text-green-400 animate-scale-in" />
                ) : (
                  <CircleIcon className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                )}
              </div>
              <span
                className={cn(
                  "flex-1 text-left text-sm transition-all",
                  task.status === "done" ? "line-through text-gray-500" : "text-gray-200",
                )}
              >
                {task.title}
              </span>
            </button>
          ))
        )}
      </div>

      {/* Quick add form */}
      <form onSubmit={handleAdd} className="relative z-10 mb-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="+ Add quick task..."
            className="flex-1 bg-transparent border-b border-gray-600 focus:border-cyan-400 outline-none px-2 py-2 text-sm text-gray-200 placeholder-gray-500 transition-colors"
          />
          <button
            type="submit"
            className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 transition-colors"
          >
            <PlusIcon className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </form>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between min-h-6">
        <div
          className={cn(
            "text-xs text-cyan-400 transition-all duration-300",
            message ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
          )}
        >
          {message}
        </div>
        <button className="p-1 text-gray-400 hover:text-cyan-400 transition-colors">
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }
        @keyframes scale-in {
          0% {
            transform: scale(0.8);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.2, 0.9, 0.2, 1);
        }
      `}</style>
    </div>
  )
}
