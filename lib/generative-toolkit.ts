import { openDB, type DBSchema, type IDBPDatabase } from "idb"
import type { GenerativeRequest, GenerativeContent } from "./types/generative"
import { RunwayAPI } from "./integrations/runway"
import { buildPromptFromTemplate } from "./prompt-templates"

interface GenerativeDB extends DBSchema {
  requests: {
    key: string
    value: GenerativeRequest
    indexes: { "by-status": string }
  }
  content: {
    key: string
    value: GenerativeContent
  }
}

export class GenerativeToolkit {
  private db: IDBPDatabase<GenerativeDB> | null = null
  private runwayAPI: RunwayAPI

  constructor() {
    this.runwayAPI = new RunwayAPI()
  }

  async init() {
    this.db = await openDB<GenerativeDB>("apex-generative-db", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("requests")) {
          const store = db.createObjectStore("requests", { keyPath: "id" })
          store.createIndex("by-status", "status")
        }
        if (!db.objectStoreNames.contains("content")) {
          db.createObjectStore("content", { keyPath: "id" })
        }
      },
    })
  }

  /**
   * Generate content from template
   */
  async generateFromTemplate(
    templateId: string,
    parameters: Record<string, string>,
    context: any = {},
  ): Promise<GenerativeRequest> {
    const prompt = buildPromptFromTemplate(templateId, parameters)

    const request: GenerativeRequest = {
      id: `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "image", // Will be determined by template
      prompt,
      context: { templateId, parameters, ...context },
      status: "pending",
      createdAt: new Date(),
    }

    await this.saveRequest(request)

    // Start generation in background
    this.processRequest(request.id)

    return request
  }

  /**
   * Generate custom content with direct prompt
   */
  async generateCustom(type: GenerativeRequest["type"], prompt: string, context: any = {}): Promise<GenerativeRequest> {
    const request: GenerativeRequest = {
      id: `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      prompt,
      context,
      status: "pending",
      createdAt: new Date(),
    }

    await this.saveRequest(request)

    // Start generation in background
    this.processRequest(request.id)

    return request
  }

  /**
   * Process generation request
   */
  private async processRequest(requestId: string) {
    const request = await this.getRequest(requestId)
    if (!request) return

    try {
      // Update status to generating
      request.status = "generating"
      await this.saveRequest(request)

      // Generate content
      const content = await this.runwayAPI.generateContent(request.type, request.prompt)

      // Save content
      await this.saveContent(content)

      // Update request with result
      request.status = "completed"
      request.result = content
      request.completedAt = new Date()
      await this.saveRequest(request)
    } catch (error) {
      console.error("Generation failed:", error)
      request.status = "failed"
      await this.saveRequest(request)
    }
  }

  /**
   * Get request status
   */
  async getRequest(requestId: string): Promise<GenerativeRequest | null> {
    if (!this.db) await this.init()
    return (await this.db!.get("requests", requestId)) || null
  }

  /**
   * Get all pending requests
   */
  async getPendingRequests(): Promise<GenerativeRequest[]> {
    if (!this.db) await this.init()
    return await this.db!.getAllFromIndex("requests", "by-status", "pending")
  }

  private async saveRequest(request: GenerativeRequest) {
    if (!this.db) await this.init()
    await this.db!.put("requests", request)
  }

  private async saveContent(content: GenerativeContent) {
    if (!this.db) await this.init()
    await this.db!.put("content", content)
  }
}
