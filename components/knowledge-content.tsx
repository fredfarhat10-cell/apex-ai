"use client"

import type React from "react"

import { useState } from "react"
import { useVault } from "@/lib/vault-context"
import type { KnowledgeItem } from "@/lib/types"
import { BookOpenIcon, SparklesIcon, PlusCircleIcon, DownloadIcon } from "./icons"
import { ExportUtils } from "@/lib/export-utils"
import { Button } from "@/components/ui/button"

export default function KnowledgeContent() {
  const { knowledgeItems, updateState, symbiontFeed } = useVault()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [summarizingId, setSummarizingId] = useState<string | null>(null)

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) return
    const newItem: KnowledgeItem = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: new Date().toISOString(),
    }
    updateState("knowledgeItems", [newItem, ...knowledgeItems])
    setTitle("")
    setContent("")

    const newEvent = {
      id: Date.now().toString(),
      text: `Added knowledge item: "${title}"`,
      timestamp: new Date().toISOString(),
    }
    updateState("symbiontFeed", [newEvent, ...symbiontFeed])
  }

  const handleSummarize = async (item: KnowledgeItem) => {
    setSummarizingId(item.id)

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Summarize this knowledge item in 2-3 sentences:\n\nTitle: ${item.title}\n\nContent: ${item.content}`,
        }),
      })

      const data = await response.json()
      const summary = data.text

      const updatedItems = knowledgeItems.map((k) => (k.id === item.id ? { ...k, summary } : k))
      updateState("knowledgeItems", updatedItems)
    } catch (error) {
      console.error("[v0] Summarization error:", error)
    } finally {
      setSummarizingId(null)
    }
  }

  const handleExport = () => {
    ExportUtils.exportKnowledgeAsMarkdown(knowledgeItems)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <BookOpenIcon className="w-8 h-8" /> Knowledge Base
          </h1>
          <p className="text-apex-gray">Your secure second brain. Store notes, ideas, and research.</p>
        </div>
        {knowledgeItems.length > 0 && (
          <Button onClick={handleExport} variant="outline" className="flex items-center gap-2 bg-transparent">
            <DownloadIcon className="w-4 h-4" />
            Export as Markdown
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <form onSubmit={handleAddItem} className="bg-apex-dark p-4 rounded-lg border border-gray-800 space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-white">
              <PlusCircleIcon className="w-5 h-5" /> Add New Item
            </h3>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full bg-apex-darker border border-gray-700 rounded-md p-2 outline-none focus:ring-2 focus:ring-apex-primary text-white"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Content..."
              rows={6}
              className="w-full bg-apex-darker border border-gray-700 rounded-md p-2 outline-none focus:ring-2 focus:ring-apex-primary text-white"
            />
            <button type="submit" className="w-full bg-apex-primary text-white font-semibold py-2 rounded-md">
              Save
            </button>
          </form>
        </div>
        <div className="md:col-span-2">
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
            {knowledgeItems.length === 0 ? (
              <p className="text-apex-gray text-center py-8">No knowledge items yet. Add your first note!</p>
            ) : (
              knowledgeItems.map((item) => (
                <div key={item.id} className="bg-apex-dark p-4 rounded-lg border border-gray-800">
                  <h3 className="font-semibold text-xl text-white">{item.title}</h3>
                  <p className="text-apex-gray mt-2 whitespace-pre-wrap">{item.content}</p>
                  <div className="mt-4 border-t border-gray-700 pt-3">
                    {item.summary ? (
                      <div>
                        <h4 className="text-sm font-semibold text-apex-accent">AI Summary</h4>
                        <p className="text-sm text-apex-gray italic mt-1">{item.summary}</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSummarize(item)}
                        disabled={summarizingId === item.id}
                        className="text-sm flex items-center gap-1 text-apex-accent hover:underline disabled:opacity-50"
                      >
                        {summarizingId === item.id ? (
                          <>
                            <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-apex-accent"></div>
                            Summarizing...
                          </>
                        ) : (
                          <>
                            <SparklesIcon className="w-3.5 h-3.5" /> Summarize
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
