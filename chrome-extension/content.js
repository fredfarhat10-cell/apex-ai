const chrome = window.chrome // Declare the chrome variable

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "get_page_content") {
    sendResponse({ content: document.body.innerText })
  }
})
