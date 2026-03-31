export interface NotionConfig {
  apiKey: string
  tasksDatabase: string
  meetingsDatabase: string
  financialDatabase: string
  travelDatabase: string
  weeklyReviewsDatabase: string
  generalNotesDatabase: string
}

export interface NotionPage {
  id: string
  title: string
  content: string
  url: string
  createdTime: string
  lastEditedTime: string
}

export interface NotionTask {
  id: string
  title: string
  status: string
  dueDate?: string
  tags?: string[]
}

export interface NotionExportRequest {
  contentTitle: string
  contentType: "alpha_brief" | "travel_itinerary" | "weekly_sync" | "career_review" | "general"
  content: string
  userId: string
}
