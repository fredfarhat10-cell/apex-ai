"use client"

import { useState } from "react"
import { Share2, Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import html2canvas from "html2canvas"

interface ShareableOutputCardProps {
  title: string
  content: string
  timestamp: Date
  type: string
}

export default function ShareableOutputCard({ title, content, timestamp, type }: ShareableOutputCardProps) {
  const [copied, setCopied] = useState(false)
  const [sharing, setSharing] = useState(false)

  const handleShare = async () => {
    setSharing(true)
    try {
      const element = document.getElementById(`output-${timestamp.getTime()}`)
      if (!element) return

      const canvas = await html2canvas(element, {
        backgroundColor: "#0A0A0F",
        scale: 2,
      })

      canvas.toBlob(async (blob) => {
        if (!blob) return

        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": blob,
            }),
          ])
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch (err) {
          console.error("[v0] Failed to copy image:", err)
        }
      })
    } catch (error) {
      console.error("[v0] Failed to generate image:", error)
    } finally {
      setSharing(false)
    }
  }

  const handleCopyText = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      id={`output-${timestamp.getTime()}`}
      className="glass-effect p-6 rounded-2xl border border-gray-700 hover:border-[#FF6B00]/50 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-[#FF6B00] mb-1">{title}</h3>
          <p className="text-sm text-gray-500">
            {timestamp.toLocaleTimeString()} • {type}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCopyText} variant="ghost" size="icon" className="hover:bg-white/10" title="Copy text">
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button
            onClick={handleShare}
            variant="ghost"
            size="icon"
            className="hover:bg-white/10"
            title="Share as image"
            disabled={sharing}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="prose prose-invert max-w-none">
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  )
}
