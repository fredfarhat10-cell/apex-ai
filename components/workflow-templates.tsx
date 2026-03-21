"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Target, TrendingUp, PieChart, CheckCircle2, ArrowRight, X } from "lucide-react"

interface WorkflowStep {
  id: number
  question: string
  placeholder: string
  type: "text" | "date" | "select"
  options?: string[]
}

interface WorkflowTemplate {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  steps: WorkflowStep[]
}

const templates: WorkflowTemplate[] = [
  {
    id: "marathon",
    title: "Marathon Training Plan",
    description: "Get a personalized training schedule based on your race date and current fitness level",
    icon: <Target className="w-8 h-8" />,
    color: "#FF6B00",
    steps: [
      { id: 1, question: "When is your race?", placeholder: "Select race date", type: "date" },
      { id: 2, question: "What's your current weekly mileage?", placeholder: "e.g., 20 miles", type: "text" },
      {
        id: 3,
        question: "What's your fitness level?",
        placeholder: "Select level",
        type: "select",
        options: ["Beginner", "Intermediate", "Advanced"],
      },
      { id: 4, question: "How many days per week can you train?", placeholder: "e.g., 5 days", type: "text" },
    ],
  },
  {
    id: "business",
    title: "Business Q4 Growth Plan",
    description: "Create a strategic roadmap for achieving your Q4 business objectives",
    icon: <TrendingUp className="w-8 h-8" />,
    color: "#FF6B00",
    steps: [
      { id: 1, question: "What's your primary Q4 goal?", placeholder: "e.g., Increase revenue by 30%", type: "text" },
      { id: 2, question: "What's your current monthly revenue?", placeholder: "e.g., $50,000", type: "text" },
      {
        id: 3,
        question: "Which growth channel will you focus on?",
        placeholder: "Select channel",
        type: "select",
        options: ["Sales", "Marketing", "Product", "Partnerships"],
      },
      { id: 4, question: "What's your budget for Q4?", placeholder: "e.g., $10,000", type: "text" },
    ],
  },
  {
    id: "portfolio",
    title: "Investment Portfolio Rebalance Routine",
    description: "Optimize your portfolio allocation based on your risk tolerance and goals",
    icon: <PieChart className="w-8 h-8" />,
    color: "#FF6B00",
    steps: [
      { id: 1, question: "What's your current portfolio value?", placeholder: "e.g., $100,000", type: "text" },
      {
        id: 2,
        question: "What's your risk tolerance?",
        placeholder: "Select tolerance",
        type: "select",
        options: ["Conservative", "Moderate", "Aggressive"],
      },
      {
        id: 3,
        question: "What's your investment timeline?",
        placeholder: "Select timeline",
        type: "select",
        options: ["< 5 years", "5-10 years", "> 10 years"],
      },
      { id: 4, question: "What's your target annual return?", placeholder: "e.g., 8%", type: "text" },
    ],
  },
]

export default function WorkflowTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)

  const handleTemplateClick = (template: WorkflowTemplate) => {
    setSelectedTemplate(template)
    setCurrentStep(0)
    setAnswers({})
  }

  const handleNext = () => {
    if (selectedTemplate && currentStep < selectedTemplate.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleGenerate()
    }
  }

  const handleGenerate = () => {
    setIsGenerating(true)
    // TODO: Send answers to AI backend to generate personalized plan
    console.log("[v0] Generating plan with answers:", answers)
    setTimeout(() => {
      setIsGenerating(false)
      alert(`Your ${selectedTemplate?.title} has been generated! Check your dashboard for the full plan.`)
      setSelectedTemplate(null)
    }, 2000)
  }

  const handleClose = () => {
    setSelectedTemplate(null)
    setCurrentStep(0)
    setAnswers({})
  }

  const progress = selectedTemplate ? ((currentStep + 1) / selectedTemplate.steps.length) * 100 : 0

  if (selectedTemplate) {
    const currentStepData = selectedTemplate.steps[currentStep]

    return (
      <div className="fixed inset-0 bg-[#0A0A0A]/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-[#0A0A0A] border-[#222222] p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div style={{ color: selectedTemplate.color }}>{selectedTemplate.icon}</div>
              <h2 className="text-2xl font-bold text-white">{selectedTemplate.title}</h2>
            </div>
            <Button onClick={handleClose} variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">
                Step {currentStep + 1} of {selectedTemplate.steps.length}
              </span>
              <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
            </div>
            <Progress
              value={progress}
              className="h-2"
              style={{
                backgroundColor: "#1A1A1A",
              }}
            />
          </div>

          <div className="mb-8">
            <Label className="text-lg text-white mb-4 block">{currentStepData.question}</Label>
            {currentStepData.type === "select" ? (
              <select
                value={answers[currentStepData.id] || ""}
                onChange={(e) => setAnswers({ ...answers, [currentStepData.id]: e.target.value })}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-[#6E56CF]"
              >
                <option value="">{currentStepData.placeholder}</option>
                {currentStepData.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                type={currentStepData.type}
                placeholder={currentStepData.placeholder}
                value={answers[currentStepData.id] || ""}
                onChange={(e) => setAnswers({ ...answers, [currentStepData.id]: e.target.value })}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-800 text-white placeholder:text-gray-500 focus:border-[#6E56CF]"
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <Button
                onClick={() => setCurrentStep(currentStep - 1)}
                variant="outline"
                className="flex-1 border-[#222222] text-white hover:bg-[#1A1A1A]"
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!answers[currentStepData.id] || isGenerating}
              className="flex-1 bg-[#FF6B00] hover:bg-[#FF8533] text-white"
            >
              {isGenerating ? (
                "Generating..."
              ) : currentStep === selectedTemplate.steps.length - 1 ? (
                <>
                  Generate Plan <CheckCircle2 className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          <div className="mt-6 flex items-center gap-2">
            {selectedTemplate.steps.map((step, index) => (
              <div
                key={step.id}
                className={`h-2 flex-1 rounded-full transition-all ${
                  index <= currentStep ? "bg-[#FF6B00]" : "bg-[#222222]"
                }`}
              />
            ))}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">Workflow Templates</h1>
          <p className="text-[#888888] text-lg">
            Choose a template to get started with a guided, step-by-step workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template) => (
            <Card
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              className="bg-[#111111] border-[#222222] p-8 cursor-pointer hover:border-[#FF6B00] transition-all group"
            >
              <div className="mb-6 text-[#FF6B00]">{template.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#FF6B00] transition-colors">
                {template.title}
              </h3>
              <p className="text-[#888888] text-sm mb-6 leading-relaxed">{template.description}</p>
              <div className="flex items-center text-[#FF6B00] text-sm font-semibold">
                Start <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
