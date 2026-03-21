"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AdaptiveMemoryManager, type AdaptiveMemory } from "@/lib/adaptive-memory"
import { Brain, Search, Trash2, TrendingUp, Clock, Tag, Edit } from "lucide-react"

export function MemoryVault() {
  const [memories, setMemories] = useState<AdaptiveMemory[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | AdaptiveMemory["category"]>("all")
  const [stats, setStats] = useState({ total: 0, byCategory: {}, avgImportance: 0 })
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  useEffect(() => {
    loadMemories()
    loadStats()
  }, [filter])

  const loadMemories = async () => {
    setLoading(true)
    const memoryManager = AdaptiveMemoryManager.getInstance()

    if (filter === "all") {
      const recentMemories = await memoryManager.getRecentMemories(50)
      setMemories(recentMemories)
    } else {
      const categoryMemories = await memoryManager.getMemoriesByCategory(filter, 50)
      setMemories(categoryMemories)
    }

    setLoading(false)
  }

  const loadStats = async () => {
    const memoryManager = AdaptiveMemoryManager.getInstance()
    const memoryStats = await memoryManager.getMemoryStats()
    setStats(memoryStats)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadMemories()
      return
    }

    setLoading(true)
    const memoryManager = AdaptiveMemoryManager.getInstance()
    const results = await memoryManager.searchMemories(searchQuery, 20)
    setMemories(results)
    setLoading(false)
  }

  const handleDelete = async (memoryId: string) => {
    const memoryManager = AdaptiveMemoryManager.getInstance()
    await memoryManager.deleteMemory(memoryId)
    loadMemories()
    loadStats()
  }

  const handleEdit = (memory: AdaptiveMemory) => {
    setEditingId(memory.id)
    setEditContent(memory.content)
  }

  const handleSaveEdit = async (memoryId: string) => {
    const memoryManager = AdaptiveMemoryManager.getInstance()
    await memoryManager.updateMemory(memoryId, { content: editContent })
    setEditingId(null)
    setEditContent("")
    loadMemories()
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditContent("")
  }

  const getCategoryColor = (category: AdaptiveMemory["category"]) => {
    switch (category) {
      case "preference":
        return "bg-blue-500"
      case "pattern":
        return "bg-purple-500"
      case "feedback":
        return "bg-green-500"
      case "goal":
        return "bg-orange-500"
      case "communication":
        return "bg-cyan-500"
    }
  }

  const getCategoryIcon = (category: AdaptiveMemory["category"]) => {
    switch (category) {
      case "preference":
        return "❤️"
      case "pattern":
        return "📊"
      case "feedback":
        return "💬"
      case "goal":
        return "🎯"
      case "communication":
        return "🗣️"
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-cyan-500" />
          <div>
            <h2 className="text-2xl font-bold">Memory Vault</h2>
            <p className="text-sm text-muted-foreground">Apex's adaptive learning system</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Memories</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Brain className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Importance</p>
              <p className="text-2xl font-bold">{stats.avgImportance.toFixed(1)}/10</p>
            </div>
            <TrendingUp className="h-8 w-8 text-cyan-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-2xl font-bold">{Object.keys(stats.byCategory).length}</p>
            </div>
            <Tag className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
            All
          </Button>
          <Button variant={filter === "preference" ? "default" : "outline"} onClick={() => setFilter("preference")}>
            Preferences
          </Button>
          <Button variant={filter === "pattern" ? "default" : "outline"} onClick={() => setFilter("pattern")}>
            Patterns
          </Button>
          <Button variant={filter === "feedback" ? "default" : "outline"} onClick={() => setFilter("feedback")}>
            Feedback
          </Button>
          <Button variant={filter === "goal" ? "default" : "outline"} onClick={() => setFilter("goal")}>
            Goals
          </Button>
        </div>
      </div>

      {/* Memory List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading memories...</p>
        ) : memories.length === 0 ? (
          <Card className="p-8 text-center">
            <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold">No memories found</p>
            <p className="text-sm text-muted-foreground">Apex will learn from your interactions over time</p>
          </Card>
        ) : (
          memories.map((memory) => (
            <Card key={memory.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-2xl mt-1">{getCategoryIcon(memory.category)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getCategoryColor(memory.category)}>{memory.category}</Badge>
                      <Badge variant="outline">Importance: {memory.importance}/10</Badge>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {memory.accessCount} accesses
                      </Badge>
                    </div>
                    {editingId === memory.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSaveEdit(memory.id)}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium mb-1">{memory.content}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(memory.timestamp).toLocaleDateString()} at{" "}
                          {new Date(memory.timestamp).toLocaleTimeString()}
                        </p>
                        {memory.context?.source && (
                          <p className="text-xs text-muted-foreground mt-1">Source: {memory.context.source}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {editingId !== memory.id && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(memory)}>
                      <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(memory.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
