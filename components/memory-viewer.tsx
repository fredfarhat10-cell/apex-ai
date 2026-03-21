"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Search, Trash2, Download, Upload, TrendingUp } from "lucide-react"
import {
  getAllMemories,
  searchMemories,
  deleteMemory,
  clearAllMemories,
  getMemoryStats,
  exportMemories,
  importMemories,
  addMemory,
} from "@/lib/vector-memory"
import type { VectorMemory, MemorySearchResult, MemoryStats } from "@/lib/types/memory"

export function MemoryViewer() {
  const [memories, setMemories] = useState<VectorMemory[]>([])
  const [searchResults, setSearchResults] = useState<MemorySearchResult[]>([])
  const [stats, setStats] = useState<MemoryStats | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [newMemoryContent, setNewMemoryContent] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    loadMemories()
    loadStats()
  }, [])

  const loadMemories = async () => {
    const allMemories = await getAllMemories()
    setMemories(allMemories)
  }

  const loadStats = async () => {
    const memoryStats = await getMemoryStats()
    setStats(memoryStats)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const results = await searchMemories(searchQuery, 10, 0.6)
      setSearchResults(results)
    } catch (error) {
      console.error("[v0] Search failed:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddMemory = async () => {
    if (!newMemoryContent.trim()) return

    setIsAdding(true)
    try {
      await addMemory(newMemoryContent, {
        timestamp: new Date().toISOString(),
        source: "user-input",
        category: "manual",
        importance: 5,
      })
      setNewMemoryContent("")
      await loadMemories()
      await loadStats()
    } catch (error) {
      console.error("[v0] Failed to add memory:", error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteMemory = async (id: string) => {
    await deleteMemory(id)
    await loadMemories()
    await loadStats()
  }

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to delete all memories? This cannot be undone.")) {
      await clearAllMemories()
      setMemories([])
      setSearchResults([])
      await loadStats()
    }
  }

  const handleExport = async () => {
    const data = await exportMemories()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `apex-memories-${Date.now()}.json`
    a.click()
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()
    const count = await importMemories(text)
    alert(`Imported ${count} memories`)
    await loadMemories()
    await loadStats()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Vector Memory Store
          </CardTitle>
          <CardDescription>Semantic memory storage with AI-powered search</CardDescription>
        </CardHeader>
        <CardContent>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Memories</p>
                <p className="text-2xl font-bold">{stats.totalMemories}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{Object.keys(stats.categories).length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Avg Importance</p>
                <p className="text-2xl font-bold">{stats.averageImportance.toFixed(1)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Actions</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleExport}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <label>
                      <Upload className="h-4 w-4" />
                      <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                    </label>
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleClearAll}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="all">All Memories</TabsTrigger>
              <TabsTrigger value="add">Add Memory</TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search memories semantically..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  <Search className="h-4 w-4 mr-2" />
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>

              <div className="space-y-3">
                {searchResults.map((result) => (
                  <Card key={result.memory.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2">
                          <Badge variant="secondary">{result.memory.metadata.category}</Badge>
                          <Badge variant="outline">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {(result.similarity * 100).toFixed(1)}% match
                          </Badge>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteMemory(result.memory.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm mb-2">{result.memory.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(result.memory.metadata.timestamp).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
                {searchResults.length === 0 && searchQuery && !isSearching && (
                  <p className="text-center text-muted-foreground py-8">No similar memories found</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="all" className="space-y-3">
              {memories.map((memory) => (
                <Card key={memory.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2">
                        <Badge variant="secondary">{memory.metadata.category}</Badge>
                        <Badge variant="outline">Importance: {memory.metadata.importance}</Badge>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteMemory(memory.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm mb-2">{memory.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(memory.metadata.timestamp).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
              {memories.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No memories stored yet</p>
              )}
            </TabsContent>

            <TabsContent value="add" className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Enter memory content..."
                  value={newMemoryContent}
                  onChange={(e) => setNewMemoryContent(e.target.value)}
                />
                <Button onClick={handleAddMemory} disabled={isAdding} className="w-full">
                  {isAdding ? "Adding..." : "Add Memory"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
