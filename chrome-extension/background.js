// Declare the chrome variable
const chrome = window.chrome

chrome.runtime.onInstalled.addListener(() => {
  console.log("Apex Symbiont installed.")
  chrome.contextMenus.create({
    id: "apex_summarize",
    title: "Summarize with Apex",
    contexts: ["page"],
  })
})

// Function to call the summarize API
async function summarizePage(content) {
  // For local testing, use http://localhost:3000. For production, use your deployed URL.
  const API_ENDPOINT = "http://localhost:3000/api/summarize"

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    const result = await response.json()
    return result.summary
  } catch (error) {
    console.error("Failed to summarize:", error)
    return "Error: Could not connect to Apex AI. Please ensure the application is running."
  }
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "apex_summarize" && tab && tab.id) {
    // Show a "thinking" state
    chrome.storage.local.set({
      lastResponse: "Apex is analyzing the page...",
      pageContent: "",
    })

    // Get the page content from the content script
    chrome.tabs.sendMessage(tab.id, { action: "get_page_content" }, async (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error:", chrome.runtime.lastError.message)
        chrome.storage.local.set({
          lastResponse: "Error: Could not access page content.",
          pageContent: "",
        })
        return
      }

      if (response && response.content) {
        const pageContent = response.content.substring(0, 4000) // Limit context size
        const summary = await summarizePage(pageContent)

        // Store both summary and content for follow-up questions
        chrome.storage.local.set({
          lastResponse: summary,
          pageContent: pageContent,
        })
      }
    })
  }
})

// Handle messages from popup for follow-up questions
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "ask_question") {
    // Get the stored page content
    chrome.storage.local.get(["pageContent"], async (result) => {
      const pageContent = result.pageContent || ""
      const question = request.question

      // Combine page content with question for context-aware answer
      const prompt = `Based on this page content:\n\n${pageContent}\n\nAnswer this question: ${question}`

      try {
        const answer = await summarizePage(prompt)
        sendResponse({ answer })
      } catch (error) {
        sendResponse({ answer: "Error: Could not get an answer." })
      }
    })

    return true // Indicates asynchronous response
  }
})
