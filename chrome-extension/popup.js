"use client"

// Import necessary modules
const React = window.React
const ReactDOM = window.ReactDOM
const chrome = window.chrome

const e = React.createElement

function Popup() {
  const [input, setInput] = React.useState("")
  const [response, setResponse] = React.useState(
    "Apex is ready. Right-click any page and select 'Summarize with Apex'.",
  )
  const [isLoading, setIsLoading] = React.useState(false)

  // On popup open, check for a response from the background script
  React.useEffect(() => {
    chrome.storage.local.get(["lastResponse"], (result) => {
      if (result.lastResponse) {
        setResponse(result.lastResponse)
      }
    })
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!input.trim()) return

    setIsLoading(true)
    setResponse("Thinking...")

    chrome.runtime.sendMessage({ action: "ask_question", question: input }, (res) => {
      setResponse(res?.answer || "Sorry, I couldn't get a response.")
      setIsLoading(false)
      setInput("")
    })
  }

  return e(
    "div",
    {
      style: {
        padding: "20px",
        backgroundColor: "#0A0A0A",
        color: "#E5E5E5",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      },
    },
    // Header
    e(
      "div",
      {
        style: {
          marginBottom: "20px",
          borderBottom: "1px solid #333",
          paddingBottom: "15px",
        },
      },
      e(
        "h2",
        {
          style: {
            margin: "0 0 5px 0",
            fontSize: "18px",
            color: "#D4AF37",
            fontWeight: "600",
          },
        },
        "Apex Symbiont",
      ),
      e(
        "p",
        {
          style: {
            margin: 0,
            fontSize: "12px",
            color: "#888",
          },
        },
        "Your AI companion for the web",
      ),
    ),

    // Summary Display
    e(
      "div",
      {
        style: {
          flex: 1,
          backgroundColor: "#141414",
          border: "1px solid #333",
          borderRadius: "8px",
          padding: "15px",
          marginBottom: "15px",
          overflowY: "auto",
          fontSize: "13px",
          lineHeight: "1.6",
        },
      },
      response,
    ),

    // Question Input Form
    e(
      "form",
      {
        onSubmit: handleSubmit,
        style: {
          display: "flex",
          gap: "8px",
        },
      },
      e("input", {
        type: "text",
        value: input,
        onChange: (ev) => setInput(ev.target.value),
        placeholder: "Ask a follow-up question...",
        disabled: isLoading,
        style: {
          flex: 1,
          padding: "10px 12px",
          backgroundColor: "#141414",
          border: "1px solid #333",
          borderRadius: "6px",
          color: "#E5E5E5",
          fontSize: "13px",
          outline: "none",
        },
      }),
      e(
        "button",
        {
          type: "submit",
          disabled: isLoading || !input.trim(),
          style: {
            padding: "10px 16px",
            backgroundColor: isLoading || !input.trim() ? "#333" : "#D4AF37",
            color: isLoading || !input.trim() ? "#666" : "#0A0A0A",
            border: "none",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
          },
        },
        isLoading ? "Thinking..." : "Ask",
      ),
    ),
  )
}

ReactDOM.render(e(Popup), document.getElementById("root"))
