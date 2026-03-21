import type { PromptTemplate } from "./types/generative"

export const PROMPT_TEMPLATES: Record<string, PromptTemplate> = {
  backingTrack: {
    id: "backing-track",
    name: "Backing Track Generator",
    type: "audio",
    template: "Create a {style} backing track in the key of {key} at {bpm} BPM. {additionalInstructions}",
    parameters: ["style", "key", "bpm", "additionalInstructions"],
  },

  techniqueVideo: {
    id: "technique-video",
    name: "Technique Demonstration",
    type: "video",
    template:
      "Create a slow-motion demonstration video of the {technique} technique in {sport}. Show proper form, key movement points, and common mistakes to avoid.",
    parameters: ["sport", "technique"],
  },

  calmingVisual: {
    id: "calming-visual",
    name: "Calming Visual",
    type: "video",
    template:
      "Create a calming, meditative visual with {theme}. Use soft colors, gentle movement, and create a peaceful atmosphere perfect for relaxation.",
    parameters: ["theme"],
  },

  motivationalImage: {
    id: "motivational-image",
    name: "Motivational Image",
    type: "image",
    template:
      "Create an inspiring, motivational image showing {subject} achieving {goal}. Style: {style}. Make it powerful and emotionally resonant.",
    parameters: ["subject", "goal", "style"],
  },

  goalVisualization: {
    id: "goal-visualization",
    name: "Goal Visualization",
    type: "image",
    template:
      "Create a photorealistic visualization of {person} successfully achieving their goal: {goalDescription}. Include specific details: {details}. Make it feel tangible and achievable.",
    parameters: ["person", "goalDescription", "details"],
  },

  practiceEnvironment: {
    id: "practice-environment",
    name: "Practice Environment",
    type: "image",
    template:
      "Create an ideal practice environment for {activity}. Include proper equipment, lighting, and atmosphere. Style: {style}.",
    parameters: ["activity", "style"],
  },
}

export function buildPromptFromTemplate(templateId: string, parameters: Record<string, string>): string {
  const template = PROMPT_TEMPLATES[templateId]
  if (!template) {
    throw new Error(`Template ${templateId} not found`)
  }

  let prompt = template.template

  for (const param of template.parameters) {
    const value = parameters[param] || ""
    prompt = prompt.replace(`{${param}}`, value)
  }

  return prompt
}
