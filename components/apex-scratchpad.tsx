"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ActionExecutor } from "@/lib/action-executor"
import type { Action } from "@/lib/types"

interface ApexScratchpadProps {
  updateState: (updater: (state: any) => any) => void
}

export function ApexScratchpad({ updateState }: ApexScratchpadProps) {
  const [note, setNote] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastResult, setLastResult] = useState<string | null>(null)
  const { toast } = useToast()

  const handleProcess = async () => {
    if (!note.trim()) {
      toast({
        title: "Empty note",
        description: "Please write something first",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setLastResult(null)

    try {
      // Call the NLU backend
      const response = await fetch("/api/process-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ note: note.trim() }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to process note")
      }

      // Execute the actions
      const result = await ActionExecutor.executeActions(data.actions as Action[], updateState)

      setLastResult(result.message)
      toast({
        title: "Note processed",
        description: result.message,
      })

      // Clear the note after successful processing
      setNote("")
    } catch (error) {
      console.error("[v0] Error processing note:", error)
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Failed to process note",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Apex Scratchpad</h3>
            <p className="text-sm text-muted-foreground">Jot down anything - I'll figure out what to do with it</p>
          </div>
          <Sparkles className="h-5 w-5 text-primary" />
        </div>

        <Textarea
          placeholder="running late, need to buy milk, eggs, and bread from the supermarket after I get home..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={6}
          className="resize-none"
          disabled={isProcessing}
        />

        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">{note.length > 0 && `${note.length} characters`}</div>
          <Button onClick={handleProcess} disabled={isProcessing || !note.trim()}>
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Process Note
              </>
            )}
          </Button>
        </div>

        {lastResult && (
          <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
            <p className="text-sm text-green-800 dark:text-green-200">{lastResult}</p>
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            <strong>Examples:</strong>
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 mt-2">
            <li>• "Email Boss at 8pm schedule a call for promotion"</li>
            <li>• "Tomorrow: dentist at 2pm, pick up dry cleaning, call mom"</li>
            <li>• "Buy milk, eggs, bread when I get home"</li>
          </ul>
        </div>
      </div>
    </Card>
  )
}

export default ApexScratchpad
