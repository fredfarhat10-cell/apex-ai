import { openDB, type DBSchema, type IDBPDatabase } from "idb"
import type { SynergyCanvas, CanvasBlock, CanvasCommand } from "./types/generative"
import { GenerativeToolkit } from "./generative-toolkit"

interface CanvasDB extends DBSchema {
  canvases: {
    key: string
    value: SynergyCanvas
    indexes: { "by-user": string }
  }
}

export class SynergyCanvasManager {
  private db: IDBPDatabase<CanvasDB> | null = null
  private generativeToolkit: GenerativeToolkit

  constructor() {
    this.generativeToolkit = new GenerativeToolkit()
  }

  async init() {
    this.db = await openDB<CanvasDB>("apex-canvas-db", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("canvases")) {
          const store = db.createObjectStore("canvases", { keyPath: "id" })
          store.createIndex("by-user", "userId")
        }
      },
    })

    await this.generativeToolkit.init()
  }

  /**
   * Create new canvas
   */
  async createCanvas(userId: string, name: string): Promise<SynergyCanvas> {
    const canvas: SynergyCanvas = {
      id: `canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      name,
      blocks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await this.saveCanvas(canvas)
    return canvas
  }

  /**
   * Execute canvas command
   */
  async executeCommand(canvasId: string, command: CanvasCommand): Promise<SynergyCanvas> {
    const canvas = await this.getCanvas(canvasId)
    if (!canvas) {
      throw new Error("Canvas not found")
    }

    switch (command.action) {
      case "add":
        await this.addBlock(canvas, command)
        break

      case "move":
        this.moveBlock(canvas, command)
        break

      case "resize":
        this.resizeBlock(canvas, command)
        break

      case "delete":
        this.deleteBlock(canvas, command)
        break

      case "generate":
        await this.generateBlock(canvas, command)
        break
    }

    canvas.updatedAt = new Date()
    await this.saveCanvas(canvas)

    return canvas
  }

  /**
   * Parse natural language command
   */
  parseCommand(text: string): CanvasCommand | null {
    const lowerText = text.toLowerCase()

    // Generate commands
    if (lowerText.includes("generate") || lowerText.includes("create")) {
      if (lowerText.includes("image") || lowerText.includes("picture")) {
        return {
          action: "generate",
          blockType: "image",
          prompt: text,
        }
      } else if (lowerText.includes("video")) {
        return {
          action: "generate",
          blockType: "video",
          prompt: text,
        }
      } else if (lowerText.includes("audio") || lowerText.includes("music")) {
        return {
          action: "generate",
          blockType: "audio",
          prompt: text,
        }
      }
    }

    // Add text commands
    if (lowerText.includes("add text") || lowerText.includes("write")) {
      return {
        action: "add",
        blockType: "text",
        content: text.replace(/add text|write/gi, "").trim(),
      }
    }

    // Move commands
    if (lowerText.includes("move") && lowerText.includes("to")) {
      // Simplified - would need more sophisticated parsing
      return {
        action: "move",
        blockId: "last", // Would need to identify which block
        position: { x: 0, y: 0 }, // Would need to parse position
      }
    }

    return null
  }

  private async addBlock(canvas: SynergyCanvas, command: CanvasCommand) {
    const block: CanvasBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: command.blockType!,
      content: command.content,
      position: command.position || { x: 100, y: 100 },
      size: command.size || { width: 300, height: 200 },
      zIndex: canvas.blocks.length,
    }

    canvas.blocks.push(block)
  }

  private moveBlock(canvas: SynergyCanvas, command: CanvasCommand) {
    const block = canvas.blocks.find((b) => b.id === command.blockId)
    if (block && command.position) {
      block.position = command.position
    }
  }

  private resizeBlock(canvas: SynergyCanvas, command: CanvasCommand) {
    const block = canvas.blocks.find((b) => b.id === command.blockId)
    if (block && command.size) {
      block.size = command.size
    }
  }

  private deleteBlock(canvas: SynergyCanvas, command: CanvasCommand) {
    canvas.blocks = canvas.blocks.filter((b) => b.id !== command.blockId)
  }

  private async generateBlock(canvas: SynergyCanvas, command: CanvasCommand) {
    if (!command.prompt || !command.blockType) return

    // Start generation
    const request = await this.generativeToolkit.generateCustom(
      command.blockType === "text" ? "image" : (command.blockType as any),
      command.prompt,
    )

    // Add placeholder block
    const block: CanvasBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: command.blockType,
      content: { requestId: request.id, status: "generating" },
      position: command.position || { x: 100, y: 100 },
      size: command.size || { width: 400, height: 300 },
      zIndex: canvas.blocks.length,
    }

    canvas.blocks.push(block)
  }

  async getCanvas(canvasId: string): Promise<SynergyCanvas | null> {
    if (!this.db) await this.init()
    return (await this.db!.get("canvases", canvasId)) || null
  }

  async getCanvasesByUser(userId: string): Promise<SynergyCanvas[]> {
    if (!this.db) await this.init()
    return await this.db!.getAllFromIndex("canvases", "by-user", userId)
  }

  private async saveCanvas(canvas: SynergyCanvas) {
    if (!this.db) await this.init()
    await this.db!.put("canvases", canvas)
  }
}
