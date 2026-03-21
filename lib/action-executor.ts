/**
 * Action Executor
 * Processes structured actions from the NLU backend and executes them
 * in the user's vault (local state management)
 */

import type { Action, Reminder, ShoppingList, ShoppingListItem, KnowledgeItem } from "./types"

export class ActionExecutor {
  /**
   * Execute a batch of actions returned from the NLU backend
   */
  static async executeActions(
    actions: Action[],
    updateState: (updater: (state: any) => any) => void,
  ): Promise<{ success: boolean; message: string; executedCount: number }> {
    let executedCount = 0

    for (const action of actions) {
      try {
        switch (action.action_type) {
          case "create_reminder":
            await this.createReminder(action.payload, updateState)
            executedCount++
            break

          case "create_list":
            await this.createOrUpdateList(action.payload, updateState)
            executedCount++
            break

          case "create_contextual_reminder":
            await this.createContextualReminder(action.payload, updateState)
            executedCount++
            break

          case "create_event":
            await this.createEvent(action.payload, updateState)
            executedCount++
            break

          case "save_thought":
            await this.saveThought(action.payload, updateState)
            executedCount++
            break

          default:
            console.warn(`[v0] Unknown action type: ${action.action_type}`)
        }
      } catch (error) {
        console.error(`[v0] Error executing action ${action.action_type}:`, error)
      }
    }

    return {
      success: executedCount > 0,
      message: `Successfully executed ${executedCount} of ${actions.length} actions`,
      executedCount,
    }
  }

  /**
   * Create a standard reminder
   */
  private static async createReminder(
    payload: any,
    updateState: (updater: (state: any) => any) => void,
  ): Promise<void> {
    const reminder: Reminder = {
      id: crypto.randomUUID(),
      text: payload.text,
      dueDate: payload.due_date || new Date().toISOString().split("T")[0],
      dueTime: payload.due_time,
      completed: false,
      priority: payload.priority || "normal",
      preReminders: payload.pre_reminders,
    }

    updateState((state) => ({
      ...state,
      reminders: [...(state.reminders || []), reminder],
    }))
  }

  /**
   * Create a contextual reminder (triggered by user context)
   */
  private static async createContextualReminder(
    payload: any,
    updateState: (updater: (state: any) => any) => void,
  ): Promise<void> {
    const reminder: Reminder = {
      id: crypto.randomUUID(),
      text: payload.text,
      dueDate: new Date().toISOString().split("T")[0],
      completed: false,
      priority: "normal",
      triggerContext: payload.trigger_context,
    }

    updateState((state) => ({
      ...state,
      reminders: [...(state.reminders || []), reminder],
    }))
  }

  /**
   * Create or update a shopping list
   */
  private static async createOrUpdateList(
    payload: any,
    updateState: (updater: (state: any) => any) => void,
  ): Promise<void> {
    const listName = payload.list_name || "Shopping List"
    const items = payload.items || []

    updateState((state) => {
      const existingLists = state.shoppingLists || []
      const existingList = existingLists.find((list: ShoppingList) => list.name === listName)

      if (existingList) {
        // Add items to existing list
        const newItems: ShoppingListItem[] = items.map((itemText: string) => ({
          id: crypto.randomUUID(),
          text: itemText,
          completed: false,
          addedAt: new Date().toISOString(),
        }))

        return {
          ...state,
          shoppingLists: existingLists.map((list: ShoppingList) =>
            list.id === existingList.id
              ? {
                  ...list,
                  items: [...list.items, ...newItems],
                  updatedAt: new Date().toISOString(),
                }
              : list,
          ),
        }
      } else {
        // Create new list
        const newList: ShoppingList = {
          id: crypto.randomUUID(),
          name: listName,
          items: items.map((itemText: string) => ({
            id: crypto.randomUUID(),
            text: itemText,
            completed: false,
            addedAt: new Date().toISOString(),
          })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        return {
          ...state,
          shoppingLists: [...existingLists, newList],
        }
      }
    })
  }

  /**
   * Create a calendar event
   */
  private static async createEvent(payload: any, updateState: (updater: (state: any) => any) => void): Promise<void> {
    // Note: This would integrate with the calendar system
    // For now, we'll create a reminder as a placeholder
    const reminder: Reminder = {
      id: crypto.randomUUID(),
      text: `Event: ${payload.title}`,
      dueDate: payload.start_time?.split("T")[0] || new Date().toISOString().split("T")[0],
      dueTime: payload.start_time?.split("T")[1]?.substring(0, 8),
      completed: false,
      priority: payload.priority || "normal",
      preReminders: [60, 15], // 1 hour and 15 minutes before
    }

    updateState((state) => ({
      ...state,
      reminders: [...(state.reminders || []), reminder],
    }))
  }

  /**
   * Save a thought or note
   */
  private static async saveThought(payload: any, updateState: (updater: (state: any) => any) => void): Promise<void> {
    const thought: KnowledgeItem = {
      id: crypto.randomUUID(),
      title: payload.category || "Thought",
      content: payload.content,
      createdAt: new Date().toISOString(),
    }

    updateState((state) => ({
      ...state,
      thoughts: [...(state.thoughts || []), thought],
    }))
  }
}
