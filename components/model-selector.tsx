"use client"

import { useState, useEffect } from "react"
import { CpuIcon } from "./icons"

export default function ModelSelector() {
  const [selectedModel, setSelectedModel] = useState("google/gemini-2.0-flash-exp")

  useEffect(() => {
    const savedModel = localStorage.getItem("apex_selected_model")
    if (savedModel) {
      setSelectedModel(savedModel)
    }
  }, [])

  const models = [
    { id: "google/gemini-2.0-flash-exp", name: "Gemini 2.0 Flash", speed: "Fast", quality: "High" },
    { id: "google/gemini-1.5-pro", name: "Gemini 1.5 Pro", speed: "Medium", quality: "Very High" },
    { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", speed: "Fast", quality: "High" },
    { id: "anthropic/claude-3-5-sonnet", name: "Claude 3.5 Sonnet", speed: "Medium", quality: "Very High" },
  ]

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId)
    localStorage.setItem("apex_selected_model", modelId)
    console.log("[v0] AI model changed to:", modelId)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <CpuIcon className="w-5 h-5 text-apex-primary" />
        <h3 className="text-sm font-semibold text-apex-light">AI Model Selection</h3>
      </div>

      <div className="space-y-2">
        {models.map((model) => (
          <button
            key={model.id}
            onClick={() => handleModelChange(model.id)}
            className={`w-full p-3 rounded-lg border transition-all text-left hover:scale-[1.02] active:scale-[0.98] ${
              selectedModel === model.id
                ? "bg-apex-primary/10 border-apex-primary shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                : "bg-apex-darker border-gray-700 hover:border-gray-600 hover:bg-apex-darker/80"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-apex-light">{model.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-apex-gray">Speed: {model.speed}</span>
                  <span className="text-xs text-apex-gray">Quality: {model.quality}</span>
                </div>
              </div>
              {selectedModel === model.id && <div className="w-2 h-2 bg-apex-primary rounded-full animate-pulse" />}
            </div>
          </button>
        ))}
      </div>

      <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-apex-gray leading-relaxed">
          All models run through Vercel AI Gateway. Your API keys are stored locally and never sent to Apex servers.
          Switch models anytime based on your needs.
        </p>
      </div>
    </div>
  )
}
