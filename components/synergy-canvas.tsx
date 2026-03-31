"use client"

import { useState, useEffect } from "react"
import type { SynergyCanvas, CanvasBlock } from "@/lib/types/generative"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Send } from "lucide-react"

interface SynergyCanvasProps {
  canvasId: string
}

export function SynergyCanvasComponent({ canvasId }: SynergyCanvasProps) {
  const [canvas, setCanvas] = useState<SynergyCanvas | null>(null)
  const [command, setCommand] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadCanvas()
  }, [canvasId])

  const loadCanvas = async () => {
    // Load canvas from API
    // Implementation would fetch from backend
  }

  const executeCommand = async () => {
    if (!command.trim()) return

    setProcessing(true)
    try {
      // Parse and execute command
      // Implementation would call API
      setCommand("")
    } catch (error) {
      console.error("Command execution failed:", error)
    } finally {
      setProcessing(false)
    }
  }

  const renderBlock = (block: CanvasBlock) => {
    const style = {
      position: "absolute" as const,
      left: block.position.x,
      top: block.position.y,
      width: block.size.width,
      height: block.size.height,
      zIndex: block.zIndex,
    }

    switch (block.type) {
      case "text":
        return (
          <Card key={block.id} style={style} className="p-4">
            <p>{block.content}</p>
          </Card>
        )

      case "image":
        return (
          <Card key={block.id} style={style} className="overflow-hidden">
            {block.content.status === "generating" ? (
              <div className="w-full h-full flex items-center justify-center bg-secondary">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <img
                src={block.content.url || "/placeholder.svg"}
                alt="Generated"
                className="w-full h-full object-cover"
              />
            )}
          </Card>
        )

      case "video":
        return (
          <Card key={block.id} style={style} className="overflow-hidden">
            {block.content.status === "generating" ? (
              <div className="w-full h-full flex items-center justify-center bg-secondary">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <video src={block.content.url} controls className="w-full h-full" />
            )}
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Canvas Area */}
      <div className="flex-1 relative bg-secondary/20 overflow-auto">
        {canvas?.blocks.map((block) => renderBlock(block))}
      </div>

      {/* Command Input */}
      <div className="border-t p-4 bg-background">
        <div className="flex gap-2">
          <Input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && executeCommand()}
            placeholder="Tell me what to create or add... (e.g., 'generate an image of a sunset' or 'add text: My Goals')"
            disabled={processing}
          />
          <Button onClick={executeCommand} disabled={processing || !command.trim()}>
            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
