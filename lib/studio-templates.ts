import type { StudioTemplate } from "./types/studio"

export const STUDIO_TEMPLATES: Record<string, StudioTemplate> = {
  sports: {
    type: "sports",
    name: "Sports & Fitness",
    description: "Track your athletic journey and improve your performance",
    defaultModules: ["video", "tracker", "audio", "article"],
    suggestedAPIs: ["youtube", "spotify", "unsplash", "news"],
  },
  creative: {
    type: "creative",
    name: "Creative Arts",
    description: "Explore your creativity and develop your artistic skills",
    defaultModules: ["image", "video", "article", "tool"],
    suggestedAPIs: ["unsplash", "youtube", "news"],
  },
  learning: {
    type: "learning",
    name: "Learning & Education",
    description: "Expand your knowledge and master new subjects",
    defaultModules: ["video", "article", "tracker", "tool"],
    suggestedAPIs: ["youtube", "news"],
  },
  wellness: {
    type: "wellness",
    name: "Health & Wellness",
    description: "Nurture your mind, body, and spirit",
    defaultModules: ["tracker", "audio", "video", "article"],
    suggestedAPIs: ["spotify", "youtube", "news"],
  },
  productivity: {
    type: "productivity",
    name: "Productivity & Work",
    description: "Optimize your workflow and achieve your goals",
    defaultModules: ["tool", "article", "tracker", "video"],
    suggestedAPIs: ["news", "youtube"],
  },
  social: {
    type: "social",
    name: "Social & Community",
    description: "Connect with others and build meaningful relationships",
    defaultModules: ["article", "video", "tool"],
    suggestedAPIs: ["news", "youtube"],
  },
}

export function getTemplateForInterest(interest: string): StudioTemplate {
  const lowerInterest = interest.toLowerCase()

  // Sports keywords
  if (
    lowerInterest.includes("sport") ||
    lowerInterest.includes("fitness") ||
    lowerInterest.includes("gym") ||
    lowerInterest.includes("running") ||
    lowerInterest.includes("yoga") ||
    lowerInterest.includes("tennis") ||
    lowerInterest.includes("padel") ||
    lowerInterest.includes("soccer") ||
    lowerInterest.includes("basketball")
  ) {
    return STUDIO_TEMPLATES.sports
  }

  // Creative keywords
  if (
    lowerInterest.includes("art") ||
    lowerInterest.includes("music") ||
    lowerInterest.includes("paint") ||
    lowerInterest.includes("draw") ||
    lowerInterest.includes("design") ||
    lowerInterest.includes("photo") ||
    lowerInterest.includes("creative")
  ) {
    return STUDIO_TEMPLATES.creative
  }

  // Learning keywords
  if (
    lowerInterest.includes("learn") ||
    lowerInterest.includes("study") ||
    lowerInterest.includes("education") ||
    lowerInterest.includes("language") ||
    lowerInterest.includes("coding") ||
    lowerInterest.includes("programming")
  ) {
    return STUDIO_TEMPLATES.learning
  }

  // Wellness keywords
  if (
    lowerInterest.includes("health") ||
    lowerInterest.includes("wellness") ||
    lowerInterest.includes("meditation") ||
    lowerInterest.includes("mindful") ||
    lowerInterest.includes("mental")
  ) {
    return STUDIO_TEMPLATES.wellness
  }

  // Default to learning
  return STUDIO_TEMPLATES.learning
}
