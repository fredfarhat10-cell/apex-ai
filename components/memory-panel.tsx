"use client"

import { useState, useEffect } from "react"
import { Search, Brain, Trash2, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AdaptiveMemoryManager, type AdaptiveMemory } from "@/lib/adaptive-memory"

export default function MemoryPanel() {
  const [memories, setMemories] = useState<AdaptiveMemory[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<AdaptiveMemory[]>([])
  const [stats, setStats] = useState<{ total: number; byCategory: Record<string, number>; avgImportance: number }>({
    total: 0,
    byCategory: {},
    avgImportance: 0,
  })
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const memoryManager = AdaptiveMemoryManager.getInstance()

  useEffect(() => {
    loadMemories()
    loadStats()
  }, [])

  const loadMemories = async () => {
    const recent = await memoryManager.getRecentMemories(20)
    setMemories(recent)
  }

  const loadStats = async () => {
    const memoryStats = await memoryManager.getMemoryStats()
    setStats(memoryStats)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    const results = await memoryManager.searchMemories(searchQuery, 10)
    setSearchResults(results)
  }

  const handleCategoryFilter = async (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null)
      loadMemories()
    } else {
      setSelectedCategory(category)
      const filtered = await memoryManager.getMemoriesByCategory(category as any, 20)
      setMemories(filtered)
    }
  }

  const handleDeleteMemory = async (memoryId: string) => {
    await memoryManager.deleteMemory(memoryId)
    loadMemories()
    loadStats()
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      preference: "text-blue-400 bg-blue-400/10 border-blue-400/30",
      pattern: "text-purple-400 bg-purple-400/10 border-purple-400/30",
      feedback: "text-green-400 bg-green-400/10 border-green-400/30",
      goal: "text-[#FF6B00] bg-[#FF6B00]/10 border-[#FF6B00]/30",
      communication: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
    }
    return colors[category] || "text-gray-400 bg-gray-400/10 border-gray-400/30"
  }

  const displayMemories = searchResults.length > 0 ? searchResults : memories

  return (
    <div className="h-full flex flex-col bg-[#0A0A0F] text-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-[#FF6B00]" />
          <h2 className="text-2xl font-bold gradient-text">AI Memory</h2>
        </div>
        <p className="text-gray-400 text-sm">Everything Apex has learned about you. {stats.total} memories stored.</p>
      </div>

      {/* Stats */}
      <div className="p-6 border-b border-gray-800">
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-effect p-4 rounded-xl border border-gray-700">
            <div className="text-2xl font-bold text-[#FF6B00] mb-1">{stats.total}</div>
            <div className="text-xs text-gray-400">Total Memories</div>
          </div>
          <div className="glass-effect p-4 rounded-xl border border-gray-700">
            <div className="text-2xl font-bold text-[#FF6B00] mb-1">{stats.avgImportance.toFixed(1)}</div>
            <div className="text-xs text-gray-400">Avg Importance</div>
          </div>
          <div className="glass-effect p-4 rounded-xl border border-gray-700">
            <div className="text-2xl font-bold text-[#FF6B00] mb-1">{Object.keys(stats.byCategory).length}</div>
            <div className="text-xs text-gray-400">Categories</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search memories..."
              className="pl-10 bg-white/5 border-gray-700 focus:border-[#FF6B00]"
            />
          </div>
          <Button onClick={handleSearch} className="bg-[#FF6B00] hover:bg-[#FF8533]">
            Search
          </Button>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {Object.entries(stats.byCategory).map(([category, count]) => (
            <button
              key={category}
              onClick={() => handleCategoryFilter(category)}
              className={`px-3 py-1 rounded-full text-xs border transition-all ${
                selectedCategory === category
                  ? "bg-[#FF6B00] border-[#FF6B00] text-white"
                  : "bg-white/5 border-gray-700 text-gray-400 hover:border-[#FF6B00]/50"
              }`}
            >
              {category} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Memories list */}
      <div className="flex-1 overflow-y-auto p-6">
        {displayMemories.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">No memories found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayMemories.map((memory) => (
              <div
                key={memory.id}
                className="glass-effect p-4 rounded-xl border border-gray-700 hover:border-[#FF6B00]/50 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${getCategoryColor(memory.category)}`}>
                      {memory.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-[#FF6B00]" />
                      <span className="text-xs text-gray-500">{memory.importance}/10</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeleteMemory(memory.id)}
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-sm text-gray-300 mb-2">{memory.content}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{new Date(memory.timestamp).toLocaleDateString()}</span>
                  <span>Accessed {memory.accessCount} times</span>
                  {memory.context?.source && <span>Source: {memory.context.source}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
