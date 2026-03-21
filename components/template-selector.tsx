"use client"

import { useState } from "react"
import { Sparkles, Check, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Template } from "@/lib/templates"

interface TemplateSelectorProps {
  templates: Template[]
  onSelectTemplate: (template: Template) => void
  onClose: () => void
}

export default function TemplateSelector({ templates, onSelectTemplate, onClose }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const handleSelect = (template: Template) => {
    setSelectedTemplate(template)
    setShowDetails(true)
  }

  const handleApply = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate)
    }
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/20 text-green-400 border-green-400/50"
      case "intermediate":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-400/50"
      case "advanced":
        return "bg-red-500/20 text-red-400 border-red-400/50"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-400/50"
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-apex-darker border border-apex-primary/30 rounded-lg">
        {/* Header */}
        <div className="sticky top-0 bg-apex-darker border-b border-apex-primary/30 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-apex-primary animate-pulse" />
                Choose Your Template
              </h2>
              <p className="text-apex-gray mt-1">Start with a pre-made template and make it yours</p>
            </div>
            <button
              onClick={onClose}
              className="text-apex-gray hover:text-white transition-colors text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showDetails ? (
            // Template Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template, index) => (
                <Card
                  key={template.id}
                  className="bg-apex-dark border-apex-primary/20 hover:border-apex-primary/50 transition-all cursor-pointer group animate-fadeIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => handleSelect(template)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-white group-hover:text-apex-primary transition-colors">
                        {template.name}
                      </CardTitle>
                      {template.difficulty && (
                        <Badge className={getDifficultyColor(template.difficulty)}>{template.difficulty}</Badge>
                      )}
                    </div>
                    <CardDescription className="text-apex-gray">{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-apex-primary/30 text-apex-primary hover:bg-apex-primary/10 bg-transparent"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Try Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Template Details
            <div className="space-y-6 animate-fadeIn">
              <button
                onClick={() => setShowDetails(false)}
                className="text-apex-primary hover:text-apex-accent transition-colors text-sm flex items-center gap-2"
              >
                ← Back to templates
              </button>

              {selectedTemplate && (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-2">{selectedTemplate.name}</h3>
                      <p className="text-apex-light">{selectedTemplate.description}</p>
                    </div>
                    {selectedTemplate.difficulty && (
                      <Badge className={getDifficultyColor(selectedTemplate.difficulty)}>
                        {selectedTemplate.difficulty}
                      </Badge>
                    )}
                  </div>

                  {/* Why It Works */}
                  <Card className="bg-apex-dark border-apex-primary/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Info className="w-5 h-5 text-apex-primary" />
                        Why This Works
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-apex-light">{selectedTemplate.whyItWorks}</p>
                    </CardContent>
                  </Card>

                  {/* Quick Tips */}
                  <Card className="bg-apex-dark border-apex-primary/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-apex-primary" />
                        Quick Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedTemplate.quickTips.map((tip, index) => (
                          <li key={index} className="text-apex-light flex items-start gap-2">
                            <Check className="w-4 h-4 text-apex-primary mt-1 flex-shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* What's Included */}
                  <Card className="bg-apex-dark border-apex-primary/20">
                    <CardHeader>
                      <CardTitle className="text-white">What's Included</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-apex-light">
                        {selectedTemplate.data.wardrobe && (
                          <p>• {selectedTemplate.data.wardrobe.length} wardrobe items</p>
                        )}
                        {selectedTemplate.data.activities && (
                          <p>• {selectedTemplate.data.activities.length} activities</p>
                        )}
                        {selectedTemplate.data.habits && <p>• {selectedTemplate.data.habits.length} habits</p>}
                        {selectedTemplate.data.knowledgeItems && (
                          <p>• {selectedTemplate.data.knowledgeItems.length} knowledge items</p>
                        )}
                        {selectedTemplate.data.calendarEvents && (
                          <p>• {selectedTemplate.data.calendarEvents.length} calendar events</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Button
                      onClick={handleApply}
                      className="flex-1 bg-gradient-to-r from-apex-primary to-apex-secondary text-white font-bold py-6 text-lg hover:scale-105 transition-all"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Make It Yours
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowDetails(false)}
                      className="border-apex-primary/30 text-apex-primary hover:bg-apex-primary/10"
                    >
                      Choose Different
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
