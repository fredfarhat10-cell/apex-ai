"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BookOpen, Check, Loader2 } from "lucide-react"
import { notionClient } from "@/lib/notion-client"
import type { NotionExportRequest } from "@/lib/types/notion"
import { useToast } from "@/hooks/use-toast"

interface SaveToNotionButtonProps {
  contentTitle: string
  contentType: "alpha_brief" | "travel_itinerary" | "weekly_sync" | "career_review" | "general"
  content: string
  userId: string
}

export function SaveToNotionButton({ contentTitle, contentType, content, userId }: SaveToNotionButtonProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const exportRequest: NotionExportRequest = {
        contentTitle,
        contentType,
        content,
        userId,
      }

      const page = await notionClient.exportToNotion(exportRequest)

      setIsSaved(true)
      toast({
        title: "Saved to Notion!",
        description: (
          <div className="space-y-2">
            <p>Your {contentType.replace("_", " ")} has been saved to Notion.</p>
            <a href={page.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Open in Notion →
            </a>
          </div>
        ),
      })

      // Reset after 3 seconds
      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      console.error("[v0] Error saving to Notion:", error)
      toast({
        title: "Failed to save",
        description: "There was an error saving to Notion. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Button onClick={handleSave} disabled={isSaving || isSaved} variant="outline" className="gap-2 bg-transparent">
      {isSaving ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : isSaved ? (
        <>
          <Check className="h-4 w-4" />
          Saved!
        </>
      ) : (
        <>
          <BookOpen className="h-4 w-4" />
          Save to Notion
        </>
      )}
    </Button>
  )
}
