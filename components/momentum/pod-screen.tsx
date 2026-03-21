"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Flame, Phone, Send, Users, MessageCircle } from "lucide-react"
import { useMomentumStore } from "@/lib/momentum-store"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const avatarColors = [
  "bg-[#3B82F6]",
  "bg-[#8B5CF6]",
  "bg-[#EC4899]",
  "bg-[#F59E0B]",
  "bg-[#22C55E]",
  "bg-[#06B6D4]",
]

export default function PodScreen() {
  const { pod, activityFeed } = useMomentumStore()
  const [message, setMessage] = useState("")
  const [tooltip, setTooltip] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  if (!pod) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[#0B1120] flex items-center justify-center">
        <p className="text-[#64748B]">No pod joined yet.</p>
      </div>
    )
  }

  const completedCount = pod.members.filter((m) => m.todayComplete).length
  const totalCount = pod.members.length
  const progressPercent = Math.round((completedCount / totalCount) * 100)
  const onlineMembers = pod.members.filter((m) => m.online)

  const handleSend = () => {
    if (!message.trim()) return
    setMessage("")
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#0B1120] flex flex-col">
      {/* HEADER */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-bold text-[#F1F5F9]">{pod.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[#64748B] text-sm flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {pod.members.length} members
              </span>
              <span className="text-[#F59E0B] text-sm flex items-center gap-1 font-medium">
                <Flame className="w-3.5 h-3.5" />
                {pod.sharedStreak}-day shared streak
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MEMBER GRID — horizontal scroll */}
      <div className="px-5 pb-4">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2" ref={scrollRef}>
          {pod.members.map((member, idx) => (
            <motion.button
              key={member.id}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                setTooltip(tooltip === member.id ? null : member.id)
              }
              className="flex flex-col items-center gap-1.5 flex-shrink-0 relative"
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-semibold text-white ring-2 ring-offset-2 ring-offset-[#0B1120] ${
                  avatarColors[idx % avatarColors.length]
                } ${
                  member.todayComplete
                    ? "ring-[#22C55E]"
                    : "ring-[#334155]"
                }`}
              >
                {getInitials(member.name)}
              </div>
              {/* Tooltip */}
              {tooltip === member.id && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-7 whitespace-nowrap bg-[#1E293B] text-[#F1F5F9] text-xs px-2.5 py-1 rounded-lg z-10"
                >
                  {member.name}
                </motion.div>
              )}
              <span className="text-[10px] text-[#64748B] truncate w-14 text-center">
                {member.name.split(" ")[0]}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* SHARED PROGRESS */}
      <div className="px-5 pb-4">
        <div className="rounded-xl bg-[#131C2E] p-4">
          <p className="text-[#94A3B8] text-sm mb-2.5">
            Your pod completed{" "}
            <span className="text-[#F1F5F9] font-semibold">
              {completedCount} of {totalCount}
            </span>{" "}
            habits today
          </p>
          <div className="w-full h-2.5 bg-[#1E293B] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-[#22C55E] rounded-full"
            />
          </div>
          <p className="text-right text-[#64748B] text-xs mt-1.5">
            {progressPercent}%
          </p>
        </div>
      </div>

      {/* ACTIVITY FEED */}
      <div className="flex-1 px-5 pb-3 overflow-y-auto">
        <h2 className="text-[#64748B] text-xs uppercase tracking-wide font-medium mb-3">
          Activity
        </h2>
        <div className="space-y-3">
          {activityFeed.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-start gap-3"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 ${
                  avatarColors[idx % avatarColors.length]
                }`}
              >
                {getInitials(item.userName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[#F1F5F9] text-sm">
                  <span className="font-medium">{item.userName}</span>{" "}
                  <span className="text-[#94A3B8]">{item.action}</span>
                </p>
                <p className="text-[#64748B] text-xs mt-0.5">
                  {item.timestamp}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* POD CALL CTA */}
      <div className="px-5 pb-3">
        <div className="rounded-xl bg-[#131C2E] border border-[#1E293B] p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Phone className="w-4 h-4 text-[#3B82F6]" />
                <h3 className="text-[#F1F5F9] text-sm font-semibold">
                  Weekly Check-in
                </h3>
              </div>
              {/* Online members mini-avatars */}
              <div className="flex items-center gap-1 mt-2">
                <div className="flex -space-x-2">
                  {onlineMembers.slice(0, 3).map((m, i) => (
                    <div
                      key={m.id}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white ring-2 ring-[#131C2E] ${
                        avatarColors[
                          pod.members.findIndex((pm) => pm.id === m.id) %
                            avatarColors.length
                        ]
                      } relative`}
                    >
                      {getInitials(m.name)}
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#22C55E] rounded-full ring-1 ring-[#131C2E]" />
                    </div>
                  ))}
                </div>
                <span className="text-[#64748B] text-xs ml-1">
                  {onlineMembers.length} online
                </span>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-xl bg-[#3B82F6] text-white text-sm font-medium hover:bg-[#2563EB] transition-colors"
            >
              Start Pod Call
            </motion.button>
          </div>
        </div>
      </div>

      {/* CHAT INPUT */}
      <div className="px-5 pb-5 pt-2">
        <div className="flex items-center gap-2 rounded-xl bg-[#131C2E] border border-[#1E293B] px-4 py-2.5">
          <MessageCircle className="w-4 h-4 text-[#64748B] flex-shrink-0" />
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Message your pod..."
            className="flex-1 bg-transparent text-[#F1F5F9] text-sm placeholder:text-[#64748B] outline-none"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            className={`p-1.5 rounded-lg transition-colors ${
              message.trim()
                ? "bg-[#3B82F6] text-white"
                : "bg-transparent text-[#334155]"
            }`}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
