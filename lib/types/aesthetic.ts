export interface StyleModifier {
  term: string
  category: "color" | "mood" | "style" | "texture" | "era"
  confidence: number
}

export interface UserAestheticProfile {
  userId: string
  styleModifiers: StyleModifier[]
  preferredColors: string[]
  preferredMoods: string[]
  confirmedStyles: string[]
  confidenceScore: number
  lastUpdated: Date
}

export interface PinterestPin {
  id: string
  imageUrl: string
  title: string
  description: string
  link: string
  saves: number
  repins: number
  engagementScore: number
}

export interface AestheticQuery {
  interest: string
  styleModifiers: string[]
  skillLevel?: string
  searchQuery: string
}

export interface StyleChoice {
  id: string
  name: string
  description: string
  imageUrl: string
  keywords: string[]
}
