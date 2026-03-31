import type { WardrobeItem, Activity, CalendarEvent, Habit, KnowledgeItem } from "./types"

export interface Template {
  id: string
  name: string
  category: "stylist" | "music" | "fitness" | "writing" | "art" | "strategy" | "calendar"
  description: string
  whyItWorks: string
  quickTips: string[]
  data: {
    wardrobe?: WardrobeItem[]
    activities?: Activity[]
    calendarEvents?: CalendarEvent[]
    habits?: Habit[]
    knowledgeItems?: KnowledgeItem[]
    customData?: any
  }
  previewImage?: string
  difficulty?: "beginner" | "intermediate" | "advanced"
}

export const TEMPLATES: Template[] = [
  // STYLIST TEMPLATES
  {
    id: "stylist-cyberpunk-warrior",
    name: "Cyberpunk Warrior",
    category: "stylist",
    description: "Bold neon aesthetics with futuristic edge. Perfect for creative professionals and tech enthusiasts.",
    whyItWorks:
      "High-contrast neon colors create visual impact and convey confidence. The cyberpunk aesthetic signals innovation and forward-thinking.",
    quickTips: [
      "Pair neon accents with dark bases for maximum impact",
      "Use geometric patterns to enhance the tech aesthetic",
      "Balance bold colors with neutral pieces",
    ],
    difficulty: "intermediate",
    data: {
      wardrobe: [
        {
          id: "cw-1",
          name: "Neon Tokyo Street",
          prompt: "Cyberpunk neon-lit Tokyo street at night with rain reflections",
          imageUrl: "/cyberpunk-neon-tokyo-street-night-rain.jpg",
          createdAt: new Date().toISOString(),
        },
        {
          id: "cw-2",
          name: "Digital Grid Matrix",
          prompt: "Abstract digital grid with cyan and purple flowing data streams",
          imageUrl: "/abstract-digital-flow-cyan-purple.jpg",
          createdAt: new Date().toISOString(),
        },
        {
          id: "cw-3",
          name: "Holographic Waves",
          prompt: "Holographic waves with iridescent purple and cyan gradients",
          imageUrl: "/holographic-waves-purple-cyan.jpg",
          createdAt: new Date().toISOString(),
        },
      ],
    },
  },
  {
    id: "stylist-nature-zen",
    name: "Nature Zen",
    category: "stylist",
    description: "Calming earth tones and natural textures. Ideal for wellness professionals and mindful living.",
    whyItWorks:
      "Natural colors reduce stress and promote calm. Earth tones are universally flattering and create approachable, grounded presence.",
    quickTips: [
      "Layer different natural textures for depth",
      "Use warm earth tones for approachability",
      "Add green accents to enhance the wellness vibe",
    ],
    difficulty: "beginner",
    data: {
      wardrobe: [
        {
          id: "nz-1",
          name: "Mountain Sunrise",
          prompt: "Peaceful mountain sunrise with misty valley and warm golden light",
          imageUrl: "/mountain-sunrise-misty-valley-peaceful.jpg",
          createdAt: new Date().toISOString(),
        },
        {
          id: "nz-2",
          name: "Forest Canopy",
          prompt: "Lush green forest canopy with dappled sunlight filtering through leaves",
          imageUrl: "/forest-canopy-sunlight-green.jpg",
          createdAt: new Date().toISOString(),
        },
        {
          id: "nz-3",
          name: "Desert Dunes",
          prompt: "Warm desert sand dunes at golden hour with soft shadows",
          imageUrl: "/desert-dunes-golden-hour.jpg",
          createdAt: new Date().toISOString(),
        },
      ],
    },
  },
  {
    id: "stylist-luxury-minimal",
    name: "Luxury Minimal",
    category: "stylist",
    description: "Sophisticated monochrome with premium textures. Perfect for executives and luxury brands.",
    whyItWorks:
      "Minimalism signals confidence and sophistication. Monochrome palettes are timeless and convey professionalism.",
    quickTips: [
      "Focus on quality over quantity",
      "Use texture to add interest to monochrome",
      "Invest in statement pieces that elevate basics",
    ],
    difficulty: "advanced",
    data: {
      wardrobe: [
        {
          id: "lm-1",
          name: "Marble Elegance",
          prompt: "White and black marble texture with gold veins, luxury aesthetic",
          imageUrl: "/marble-white-black-gold-luxury.jpg",
          createdAt: new Date().toISOString(),
        },
        {
          id: "lm-2",
          name: "Silk Shadows",
          prompt: "Flowing black silk fabric with subtle highlights and shadows",
          imageUrl: "/black-silk-fabric-shadows.jpg",
          createdAt: new Date().toISOString(),
        },
        {
          id: "lm-3",
          name: "Concrete Chic",
          prompt: "Modern concrete texture with soft lighting, minimalist aesthetic",
          imageUrl: "/concrete-texture-minimalist.jpg",
          createdAt: new Date().toISOString(),
        },
      ],
    },
  },

  // MUSIC STUDIO TEMPLATES
  {
    id: "music-rock-band",
    name: "Rock Band Essentials",
    category: "music",
    description: "Classic rock setup with guitar, bass, and drums. Perfect for aspiring rock musicians.",
    whyItWorks:
      "Structured practice routine builds muscle memory. Focusing on fundamentals creates a strong foundation for improvisation.",
    quickTips: [
      "Practice with a metronome to develop timing",
      "Record yourself to identify areas for improvement",
      "Learn songs you love to stay motivated",
    ],
    difficulty: "intermediate",
    data: {
      activities: [
        {
          id: "rb-1",
          name: "Guitar Practice",
          category: "music",
          studioType: "music",
          description: "Daily guitar scales and chord progressions",
          createdAt: new Date().toISOString(),
          completedCount: 0,
        },
        {
          id: "rb-2",
          name: "Band Rehearsal",
          category: "music",
          studioType: "music",
          description: "Weekly full band practice session",
          createdAt: new Date().toISOString(),
          completedCount: 0,
        },
        {
          id: "rb-3",
          name: "Song Writing",
          category: "music",
          studioType: "music",
          description: "Compose new riffs and lyrics",
          createdAt: new Date().toISOString(),
          completedCount: 0,
        },
      ],
      customData: {
        tracks: ["Rhythm Guitar", "Lead Guitar", "Bass", "Drums"],
        genre: "Rock",
        bpm: 120,
      },
    },
  },
  {
    id: "music-electronic-producer",
    name: "Electronic Producer",
    category: "music",
    description: "Modern electronic music production workflow. Ideal for EDM and electronic artists.",
    whyItWorks:
      "Layered approach to production creates depth. Regular experimentation with sounds develops unique style.",
    quickTips: [
      "Start with a strong drum pattern as foundation",
      "Use sidechain compression for that pumping effect",
      "Reference professional tracks for mixing guidance",
    ],
    difficulty: "advanced",
    data: {
      activities: [
        {
          id: "ep-1",
          name: "Sound Design",
          category: "music",
          studioType: "music",
          description: "Create unique synth patches and samples",
          createdAt: new Date().toISOString(),
          completedCount: 0,
        },
        {
          id: "ep-2",
          name: "Beat Making",
          category: "music",
          studioType: "music",
          description: "Produce drum patterns and rhythms",
          createdAt: new Date().toISOString(),
          completedCount: 0,
        },
        {
          id: "ep-3",
          name: "Mixing & Mastering",
          category: "music",
          studioType: "music",
          description: "Polish tracks to professional quality",
          createdAt: new Date().toISOString(),
          completedCount: 0,
        },
      ],
      customData: {
        tracks: ["Kick", "Bass", "Synth Lead", "Pads", "FX"],
        genre: "Electronic",
        bpm: 128,
      },
    },
  },

  // FITNESS TEMPLATES
  {
    id: "fitness-beginner-30day",
    name: "30-Day Beginner Plan",
    category: "fitness",
    description: "Complete beginner-friendly workout program. Build strength and endurance from scratch.",
    whyItWorks: "Progressive overload ensures steady improvement. Rest days prevent burnout and allow recovery.",
    quickTips: [
      "Focus on form over speed or weight",
      "Stay hydrated and fuel properly",
      "Track progress to stay motivated",
      "Listen to your body and rest when needed",
    ],
    difficulty: "beginner",
    data: {
      activities: [
        {
          id: "f30-1",
          name: "Full Body Workout",
          category: "fitness",
          studioType: "fitness",
          description: "Bodyweight exercises: push-ups, squats, planks",
          createdAt: new Date().toISOString(),
          completedCount: 0,
        },
        {
          id: "f30-2",
          name: "Cardio Day",
          category: "fitness",
          studioType: "fitness",
          description: "20-30 minutes of walking or light jogging",
          createdAt: new Date().toISOString(),
          completedCount: 0,
        },
        {
          id: "f30-3",
          name: "Flexibility & Stretching",
          category: "fitness",
          studioType: "fitness",
          description: "Yoga-inspired stretching routine",
          createdAt: new Date().toISOString(),
          completedCount: 0,
        },
      ],
      habits: [
        {
          id: "fh-1",
          name: "Morning Workout",
          goal: "Exercise 4 times per week",
          createdAt: new Date().toISOString(),
        },
        {
          id: "fh-2",
          name: "Drink 8 Glasses of Water",
          goal: "Stay hydrated daily",
          createdAt: new Date().toISOString(),
        },
      ],
      customData: {
        weeklySchedule: ["Full Body", "Cardio", "Rest", "Full Body", "Cardio", "Flexibility", "Rest"],
        duration: "30 days",
      },
    },
  },
  {
    id: "fitness-hiit-intense",
    name: "HIIT Intensity",
    category: "fitness",
    description: "High-intensity interval training for maximum results. For experienced fitness enthusiasts.",
    whyItWorks: "HIIT maximizes calorie burn in minimal time. Varied exercises prevent plateaus and boredom.",
    quickTips: [
      "Warm up thoroughly before intense intervals",
      "Push hard during work periods, recover fully during rest",
      "Modify exercises to match your fitness level",
      "Track heart rate to ensure proper intensity",
    ],
    difficulty: "advanced",
    data: {
      activities: [
        {
          id: "hiit-1",
          name: "Tabata Training",
          category: "fitness",
          studioType: "fitness",
          description: "20 seconds work, 10 seconds rest, 8 rounds",
          createdAt: new Date().toISOString(),
          completedCount: 0,
        },
        {
          id: "hiit-2",
          name: "Circuit Training",
          category: "fitness",
          studioType: "fitness",
          description: "5 exercises, 45 seconds each, 3 rounds",
          createdAt: new Date().toISOString(),
          completedCount: 0,
        },
        {
          id: "hiit-3",
          name: "Sprint Intervals",
          category: "fitness",
          studioType: "fitness",
          description: "30 second sprints with 90 second recovery",
          createdAt: new Date().toISOString(),
          completedCount: 0,
        },
      ],
      customData: {
        weeklySchedule: ["HIIT", "Active Recovery", "HIIT", "Rest", "HIIT", "Active Recovery", "Rest"],
        duration: "8 weeks",
      },
    },
  },

  // WRITING TEMPLATES
  {
    id: "writing-poetry-collection",
    name: "Poetry Collection",
    category: "writing",
    description: "Curated poetry writing prompts and structure. Explore different poetic forms and themes.",
    whyItWorks: "Structured prompts overcome writer's block. Exploring various forms develops versatility and voice.",
    quickTips: [
      "Write daily, even if just for 10 minutes",
      "Read poetry widely to absorb different styles",
      "Revise ruthlessly - first drafts are just beginnings",
      "Share your work for feedback and growth",
    ],
    difficulty: "intermediate",
    data: {
      activities: [
        {
          id: "pc-1",
          name: "Daily Poetry Practice",
          category: "writing",
          studioType: "reading",
          description: "Write one poem per day using prompts",
          createdAt: new Date().toISOString(),
          completedCount: 0,
        },
        {
          id: "pc-2",
          name: "Form Study",
          category: "writing",
          studioType: "reading",
          description: "Practice sonnets, haikus, free verse",
          createdAt: new Date().toISOString(),
          completedCount: 0,
        },
      ],
      knowledgeItems: [
        {
          id: "pk-1",
          title: "Poetic Devices",
          content: "Metaphor, simile, alliteration, assonance, imagery, symbolism",
          summary: "Essential tools for crafting powerful poetry",
          createdAt: new Date().toISOString(),
        },
      ],
      customData: {
        genres: ["Nature", "Love", "Social Commentary", "Personal Reflection"],
        forms: ["Sonnet", "Haiku", "Free Verse", "Villanelle"],
      },
    },
  },
  {
    id: "writing-novel-outline",
    name: "Novel Outline Builder",
    category: "writing",
    description: "Complete framework for planning your first novel. From concept to chapter breakdown.",
    whyItWorks:
      "Outlining prevents plot holes and maintains momentum. Clear structure makes the writing process less overwhelming.",
    quickTips: [
      "Start with character motivations, not plot",
      "Outline in layers: broad strokes first, details later",
      "Be flexible - outlines can evolve as you write",
      "Set realistic daily word count goals",
    ],
    difficulty: "advanced",
    data: {
      activities: [
        {
          id: "no-1",
          name: "Character Development",
          category: "writing",
          studioType: "reading",
          description: "Create detailed character profiles and arcs",
          createdAt: new Date().toISOString(),
          completedCount: 0,
        },
        {
          id: "no-2",
          name: "Plot Structuring",
          category: "writing",
          studioType: "reading",
          description: "Map out three-act structure and key plot points",
          createdAt: new Date().toISOString(),
          completedCount: 0,
        },
        {
          id: "no-3",
          name: "Daily Writing",
          category: "writing",
          studioType: "reading",
          description: "Write 1000 words per day",
          createdAt: new Date().toISOString(),
          completedCount: 0,
        },
      ],
      knowledgeItems: [
        {
          id: "nk-1",
          title: "Three-Act Structure",
          content: "Act 1: Setup (25%), Act 2: Confrontation (50%), Act 3: Resolution (25%)",
          summary: "Classic story structure for novels",
          createdAt: new Date().toISOString(),
        },
      ],
      customData: {
        targetWordCount: 80000,
        chapters: 30,
        genre: "Fiction",
      },
    },
  },
]

export function getTemplatesByCategory(category: Template["category"]): Template[] {
  return TEMPLATES.filter((t) => t.category === category)
}

export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id)
}
