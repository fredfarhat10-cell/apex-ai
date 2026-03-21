"use client"

import { useState } from "react"
import type { StyleChoice } from "@/lib/types/aesthetic"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface StyleSelectorProps {
  interest: string
  choices: StyleChoice[]
  onSelect: (choice: StyleChoice) => void
}

export function StyleSelector({ interest, choices, onSelect }: StyleSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleSelect = (choice: StyleChoice) => {
    setSelectedId(choice.id)
    onSelect(choice)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-4xl w-full p-6">
        <h2 className="text-2xl font-bold mb-2">Choose Your {interest} Studio Style</h2>
        <p className="text-muted-foreground mb-6">Select the aesthetic that resonates with you most</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {choices.map((choice) => (
            <Card
              key={choice.id}
              className={`cursor-pointer transition-all hover:scale-105 ${
                selectedId === choice.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => handleSelect(choice)}
            >
              <CardContent className="p-0">
                {choice.imageUrl && (
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    <img
                      src={choice.imageUrl || "/placeholder.svg"}
                      alt={choice.name}
                      className="w-full h-full object-cover"
                    />
                    {selectedId === choice.id && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="bg-primary rounded-full p-2">
                          <Check className="w-6 h-6 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{choice.name}</h3>
                  <p className="text-sm text-muted-foreground">{choice.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedId && (
          <div className="mt-6 flex justify-end">
            <Button size="lg" onClick={() => onSelect(choices.find((c) => c.id === selectedId)!)}>
              Continue with Selected Style
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
