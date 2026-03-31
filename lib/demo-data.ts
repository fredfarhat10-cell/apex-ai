export interface DemoMessage {
  role: "user" | "apex"
  text: string
  typing?: boolean
  replies?: string[]
  thinkTime?: number
}

export interface DemoVariant {
  [key: string]: DemoMessage[]
}

export interface DemoScenario {
  id: string
  title: string
  subtitle: string
  bgTheme: "fitness" | "writing" | "productivity"
  icon: string
  messages: DemoMessage[]
  variants: DemoVariant
}

export const demoScenarios: DemoScenario[] = [
  {
    id: "fitness",
    title: "Fitness Coach",
    subtitle: "Your personal training companion",
    bgTheme: "fitness",
    icon: "💪",
    messages: [
      {
        role: "user",
        text: "I want to get in better shape but I'm not sure where to start.",
      },
      {
        role: "apex",
        text: "I'll help you build a personalized fitness journey! First, let me understand your goals. What matters most to you right now?",
        typing: true,
        replies: ["Build Muscle", "Lose Weight", "General Health"],
        thinkTime: 800,
      },
    ],
    variants: {
      "Build Muscle": [
        {
          role: "apex",
          text: "Perfect! Building muscle requires progressive resistance training and proper nutrition. I'll create a strength program tailored to your schedule. How many days per week can you commit to training?",
          typing: true,
          replies: ["3 days", "4-5 days", "6+ days"],
        },
      ],
      "Lose Weight": [
        {
          role: "apex",
          text: "Great choice! Sustainable weight loss combines smart nutrition with consistent movement. I'll help you create a calorie deficit that feels manageable. What's your preferred approach?",
          typing: true,
          replies: ["Cardio Focus", "Strength + Cardio", "Diet First"],
        },
      ],
      "General Health": [
        {
          role: "apex",
          text: "Excellent! Overall wellness is about balance—movement, nutrition, sleep, and stress management. Let's start with building a sustainable routine. What area needs the most attention?",
          typing: true,
          replies: ["More Movement", "Better Sleep", "Stress Relief"],
        },
      ],
    },
  },
  {
    id: "writing",
    title: "Creative Writing",
    subtitle: "Craft compelling stories together",
    bgTheme: "writing",
    icon: "✍️",
    messages: [
      {
        role: "user",
        text: "Help me write a short story about a time traveler.",
      },
      {
        role: "apex",
        text: "Let's craft something compelling! Every great story needs a strong foundation. What genre should we explore for your time traveler's journey?",
        typing: true,
        replies: ["Mystery", "Romance", "Adventure"],
        thinkTime: 900,
      },
    ],
    variants: {
      Mystery: [
        {
          role: "apex",
          text: "Intriguing! A noir-style time travel mystery. Picture this: Your protagonist discovers they can only travel to moments where unsolved crimes occurred. What's their motivation—justice, redemption, or something darker?",
          typing: true,
          replies: ["Justice", "Redemption", "Personal Gain"],
        },
      ],
      Romance: [
        {
          role: "apex",
          text: "Beautiful! A love story across time. Imagine meeting someone in a different era, knowing you can never stay. Should this be bittersweet or hopeful?",
          typing: true,
          replies: ["Bittersweet", "Hopeful", "Tragic"],
        },
      ],
      Adventure: [
        {
          role: "apex",
          text: "Exciting! An action-packed temporal adventure. Your traveler could be fixing historical mistakes or preventing future disasters. What's their mission?",
          typing: true,
          replies: ["Fix History", "Prevent Disaster", "Explore Eras"],
        },
      ],
    },
  },
  {
    id: "productivity",
    title: "Productivity Partner",
    subtitle: "Optimize your workflow and focus",
    bgTheme: "productivity",
    icon: "🎯",
    messages: [
      {
        role: "user",
        text: "I'm struggling to stay focused and get things done.",
      },
      {
        role: "apex",
        text: "I understand—focus is challenging in our distracted world. Let's identify what's blocking your productivity. What's your biggest challenge right now?",
        typing: true,
        replies: ["Too Many Tasks", "Procrastination", "Distractions"],
        thinkTime: 750,
      },
    ],
    variants: {
      "Too Many Tasks": [
        {
          role: "apex",
          text: "Overwhelm is real! Let's use the Eisenhower Matrix to prioritize. I'll help you identify what's truly urgent vs. important. Ready to categorize your tasks?",
          typing: true,
          replies: ["Yes, let's do it", "Tell me more", "Different approach"],
        },
      ],
      Procrastination: [
        {
          role: "apex",
          text: "Procrastination often stems from perfectionism or unclear next steps. Let's break your work into tiny, manageable chunks. What project are you avoiding?",
          typing: true,
          replies: ["Work project", "Personal goal", "Learning something"],
        },
      ],
      Distractions: [
        {
          role: "apex",
          text: "Digital distractions are productivity killers! Let's create a focused work environment. Would you prefer time-blocking, the Pomodoro technique, or deep work sessions?",
          typing: true,
          replies: ["Time-blocking", "Pomodoro", "Deep work"],
        },
      ],
    },
  },
]

export function getScenario(id: string): DemoScenario | undefined {
  return demoScenarios.find((s) => s.id === id)
}
