import type { StudioType } from "./types"

export const hobbyToStudioMap: Record<string, StudioType> = {
  // Music related
  guitar: "music",
  piano: "music",
  drums: "music",
  singing: "music",
  music: "music",
  dj: "music",
  production: "music",

  // Art related
  painting: "art",
  drawing: "art",
  art: "art",
  sketching: "art",
  illustration: "art",
  design: "art",
  photography: "art",

  // Fitness related
  gym: "fitness",
  fitness: "fitness",
  running: "fitness",
  yoga: "fitness",
  sports: "fitness",
  workout: "fitness",
  cycling: "fitness",

  // Coding related
  coding: "coding",
  programming: "coding",
  development: "coding",
  software: "coding",
  web: "coding",
  app: "coding",

  // Gaming related
  gaming: "gaming",
  games: "gaming",
  esports: "gaming",
  streaming: "gaming",

  // Reading related
  reading: "reading",
  books: "reading",
  writing: "reading",
  literature: "reading",

  // Cooking related
  cooking: "cooking",
  baking: "cooking",
  culinary: "cooking",
  food: "cooking",
}

export function detectStudioFromHobbies(hobbies: string[]): StudioType[] {
  const studios = new Set<StudioType>()

  hobbies.forEach((hobby) => {
    const normalized = hobby.toLowerCase().trim()
    const studio = hobbyToStudioMap[normalized]
    if (studio) {
      studios.add(studio)
    }
  })

  return Array.from(studios)
}

export function getStudioDescription(studio: StudioType): string {
  const descriptions: Record<StudioType, string> = {
    nexus: "A neutral space with infinite potential",
    music: "Your personal music studio with holographic instruments",
    art: "A creative atelier bathed in inspiring light",
    fitness: "An energizing training space for peak performance",
    coding: "A futuristic development lab with flowing data streams",
    gaming: "An immersive gaming arena with neon accents",
    reading: "A cozy library sanctuary for deep focus",
    cooking: "A modern culinary lab for gastronomic exploration",
  }

  return descriptions[studio]
}
