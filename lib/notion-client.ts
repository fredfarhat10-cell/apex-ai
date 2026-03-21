import type { NotionPage, NotionTask, NotionExportRequest } from "./types/notion"

class NotionClient {
  private baseUrl = process.env.NEXT_PUBLIC_CREWAI_API_URL || "http://localhost:8000"

  async getMeetingBrief(eventTitle: string, notionDatabaseId: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/notion/meeting-brief`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_title: eventTitle,
          notion_database_id: notionDatabaseId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to get meeting brief: ${response.statusText}`)
      }

      const data = await response.json()
      return data.brief
    } catch (error) {
      console.error("[v0] Error getting meeting brief:", error)
      throw error
    }
  }

  async createTaskFromVoice(taskTitle: string, notionTasksDatabaseId: string): Promise<NotionTask> {
    try {
      const response = await fetch(`${this.baseUrl}/api/notion/create-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_title: taskTitle,
          notion_tasks_database_id: notionTasksDatabaseId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.statusText}`)
      }

      const data = await response.json()
      return data.task
    } catch (error) {
      console.error("[v0] Error creating task:", error)
      throw error
    }
  }

  async exportToNotion(exportRequest: NotionExportRequest): Promise<NotionPage> {
    try {
      const response = await fetch(`${this.baseUrl}/api/notion/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exportRequest),
      })

      if (!response.ok) {
        throw new Error(`Failed to export to Notion: ${response.statusText}`)
      }

      const data = await response.json()
      return data.page
    } catch (error) {
      console.error("[v0] Error exporting to Notion:", error)
      throw error
    }
  }

  async queryDatabase(databaseId: string, filterQuery?: string): Promise<NotionPage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/notion/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          database_id: databaseId,
          filter_query: filterQuery,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to query database: ${response.statusText}`)
      }

      const data = await response.json()
      return data.pages
    } catch (error) {
      console.error("[v0] Error querying database:", error)
      throw error
    }
  }
}

export const notionClient = new NotionClient()
