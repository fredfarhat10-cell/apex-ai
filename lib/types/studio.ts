export type StudioType = "sports" | "creative" | "learning" | "wellness" | "productivity" | "social"

export interface Studio {
  id: string
  userId: string
  name: string
  type: StudioType
  interest: string
  skillLevel: "beginner" | "intermediate" | "advanced" | "expert"
  backgroundImage: string
  createdAt: Date
  lastVisited?: Date
  modules: StudioModule[]
  progress: StudioProgress
}

export interface StudioModule {
  id: string
  type: "video" | "audio" | "article" | "image" | "tool" | "tracker"
  title: string
  description?: string
  content: any
  source: string
}

export interface StudioProgress {
  sessionsLogged: number
  totalTimeMinutes: number
  lastSession?: Date
  milestones: Milestone[]
  skillProgression: number // 0-100
}

export interface Milestone {
  id: string
  title: string
  description: string
  achieved: boolean
  achievedAt?: Date
}

export interface StudioTemplate {
  type: StudioType
  name: string
  description: string
  defaultModules: string[]
  suggestedAPIs: string[]
}

export interface ContentAggregation {
  videos: YouTubeVideo[]
  playlists: SpotifyPlaylist[]
  images: UnsplashImage[]
  articles: NewsArticle[]
}

export interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
  channelName: string
  url: string
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  imageUrl: string
  url: string
}

export interface UnsplashImage {
  id: string
  url: string
  photographer: string
  description: string
}

export interface NewsArticle {
  id: string
  title: string
  description: string
  url: string
  source: string
  publishedAt: Date
}

export interface SynergyRule {
  id: string
  type: "motivational" | "scheduling" | "financial" | "progress"
  sourceStudioId: string
  targetStudioId: string
  condition: string
  action: string
  message: string
}
