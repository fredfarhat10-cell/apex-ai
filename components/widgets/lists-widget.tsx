"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import type { ShoppingList, ShoppingListItem } from "@/lib/types"
import { Plus, Trash2, ShoppingCart } from "lucide-react"

interface ListsWidgetProps {
  lists: ShoppingList[]
  onUpdateList: (listId: string, items: ShoppingListItem[]) => void
  onDeleteList: (listId: string) => void
  onCreateList: (name: string) => void
}

export function ListsWidget({ lists, onUpdateList, onDeleteList, onCreateList }: ListsWidgetProps) {
  const [newListName, setNewListName] = useState("")
  const [showNewListInput, setShowNewListInput] = useState(false)

  const handleToggleItem = (listId: string, itemId: string) => {
    const list = lists.find((l) => l.id === listId)
    if (!list) return

    const updatedItems = list.items.map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item))
    onUpdateList(listId, updatedItems)
  }

  const handleDeleteItem = (listId: string, itemId: string) => {
    const list = lists.find((l) => l.id === listId)
    if (!list) return

    const updatedItems = list.items.filter((item) => item.id !== itemId)
    onUpdateList(listId, updatedItems)
  }

  const handleCreateList = () => {
    if (newListName.trim()) {
      onCreateList(newListName.trim())
      setNewListName("")
      setShowNewListInput(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Lists
        </h3>
        {!showNewListInput && (
          <Button variant="outline" size="sm" onClick={() => setShowNewListInput(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New List
          </Button>
        )}
      </div>

      {showNewListInput && (
        <Card className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="List name..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
            />
            <Button onClick={handleCreateList}>Create</Button>
            <Button variant="ghost" onClick={() => setShowNewListInput(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {lists.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No lists yet. Create one or use the scratchpad to add items.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {lists.map((list) => (
            <Card key={list.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">{list.name}</h4>
                <Button variant="ghost" size="sm" onClick={() => onDeleteList(list.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {list.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No items in this list</p>
                ) : (
                  list.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 group">
                      <Checkbox checked={item.completed} onCheckedChange={() => handleToggleItem(list.id, item.id)} />
                      <span className={`flex-1 text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                        {item.text}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteItem(list.id, item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                {list.items.filter((i) => i.completed).length} of {list.items.length} completed
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
