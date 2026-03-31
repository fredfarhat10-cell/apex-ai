import { NextResponse } from "next/server"

export async function GET() {
  const results = {
    critical: [] as any[],
    important: [] as any[],
    crypto: [] as any[],
    optional: [] as any[],
  }

  // Test OpenAI
  try {
    const openaiKey = process.env.OPENAI_API_KEY
    if (openaiKey && openaiKey !== "your-openai-api-key") {
      const response = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${openaiKey}` },
      })
      results.critical.push({
        name: "OpenAI",
        status: response.ok ? "working" : "invalid",
        message: response.ok ? "Connected successfully" : "Invalid API key",
      })
    } else {
      results.critical.push({ name: "OpenAI", status: "missing", message: "API key not configured" })
    }
  } catch (error) {
    results.critical.push({ name: "OpenAI", status: "error", message: "Connection failed" })
  }

  // Test CrewAI Backend
  try {
    const crewaiUrl = process.env.CREWAI_BACKEND_URL
    if (crewaiUrl && crewaiUrl !== "http://localhost:8000") {
      const response = await fetch(`${crewaiUrl}/health`, { method: "GET" })
      results.critical.push({
        name: "CrewAI Backend",
        status: response.ok ? "working" : "unreachable",
        message: response.ok ? "Backend is running" : "Backend not responding",
      })
    } else {
      results.critical.push({ name: "CrewAI Backend", status: "localhost", message: "Using localhost (start backend)" })
    }
  } catch (error) {
    results.critical.push({ name: "CrewAI Backend", status: "error", message: "Backend not running" })
  }

  // Test Plaid
  try {
    const plaidClientId = process.env.PLAID_CLIENT_ID
    const plaidSecret = process.env.PLAID_SECRET
    if (plaidClientId && plaidSecret && plaidClientId !== "your-plaid-client-id") {
      results.important.push({
        name: "Plaid",
        status: "configured",
        message: `Sandbox mode - ${plaidClientId.substring(0, 8)}...`,
      })
    } else {
      results.important.push({ name: "Plaid", status: "missing", message: "API keys not configured" })
    }
  } catch (error) {
    results.important.push({ name: "Plaid", status: "error", message: "Configuration error" })
  }

  // Test Google OAuth
  try {
    const googleClientId = process.env.GOOGLE_CLIENT_ID
    const googleSecret = process.env.GOOGLE_CLIENT_SECRET
    if (googleClientId && googleSecret && !googleClientId.includes("your-")) {
      results.important.push({
        name: "Google OAuth",
        status: "configured",
        message: "Client ID and Secret configured",
      })
    } else {
      results.important.push({ name: "Google OAuth", status: "missing", message: "OAuth credentials not configured" })
    }
  } catch (error) {
    results.important.push({ name: "Google OAuth", status: "error", message: "Configuration error" })
  }

  // Test Strava
  try {
    const stravaClientId = process.env.STRAVA_CLIENT_ID
    const stravaSecret = process.env.STRAVA_CLIENT_SECRET
    if (stravaClientId && stravaSecret && stravaClientId !== "your-strava-client-id") {
      results.important.push({
        name: "Strava",
        status: "configured",
        message: `Client ID: ${stravaClientId}`,
      })
    } else {
      results.important.push({ name: "Strava", status: "missing", message: "API keys not configured" })
    }
  } catch (error) {
    results.important.push({ name: "Strava", status: "error", message: "Configuration error" })
  }

  // Test Notion
  try {
    const notionToken = process.env.NOTION_TOKEN
    if (notionToken && notionToken !== "your_notion_api_key_here" && notionToken.startsWith("ntn_")) {
      results.optional.push({
        name: "Notion",
        status: "configured",
        message: `Token: ${notionToken.substring(0, 10)}...`,
      })
    } else {
      results.optional.push({ name: "Notion", status: "missing", message: "API token not configured" })
    }
  } catch (error) {
    results.optional.push({ name: "Notion", status: "error", message: "Configuration error" })
  }

  // Test Trello
  try {
    const trelloKey = process.env.TRELLO_API_KEY
    const trelloToken = process.env.TRELLO_TOKEN
    if (trelloKey && trelloToken && !trelloKey.includes("your-")) {
      results.optional.push({
        name: "Trello",
        status: "configured",
        message: "API key and token configured",
      })
    } else {
      results.optional.push({ name: "Trello", status: "missing", message: "API credentials not configured" })
    }
  } catch (error) {
    results.optional.push({ name: "Trello", status: "error", message: "Configuration error" })
  }

  // Test YouTube
  try {
    const youtubeKey = process.env.YOUTUBE_API_KEY
    if (youtubeKey && youtubeKey !== "your_youtube_api_key_here") {
      results.optional.push({
        name: "YouTube",
        status: "configured",
        message: `Key: ${youtubeKey.substring(0, 10)}...`,
      })
    } else {
      results.optional.push({ name: "YouTube", status: "missing", message: "API key not configured" })
    }
  } catch (error) {
    results.optional.push({ name: "YouTube", status: "error", message: "Configuration error" })
  }

  // Test Unsplash
  try {
    const unsplashKey = process.env.UNSPLASH_API_KEY
    if (unsplashKey && unsplashKey !== "your-unsplash-api-key") {
      results.optional.push({
        name: "Unsplash",
        status: "configured",
        message: `Key: ${unsplashKey.substring(0, 10)}...`,
      })
    } else {
      results.optional.push({ name: "Unsplash", status: "missing", message: "API key not configured" })
    }
  } catch (error) {
    results.optional.push({ name: "Unsplash", status: "error", message: "Configuration error" })
  }

  // Test News API
  try {
    const newsKey = process.env.NEWS_API_KEY
    if (newsKey && newsKey !== "your-news-api-key") {
      results.optional.push({
        name: "News API",
        status: "configured",
        message: `Key: ${newsKey.substring(0, 10)}...`,
      })
    } else {
      results.optional.push({ name: "News API", status: "missing", message: "API key not configured" })
    }
  } catch (error) {
    results.optional.push({ name: "News API", status: "error", message: "Configuration error" })
  }

  // Test Binance
  try {
    const binanceKey = process.env.BINANCE_CLIENT_ID
    const binanceSecret = process.env.BINANCE_CLIENT_SECRET
    if (binanceKey && binanceSecret && binanceKey.length > 20) {
      results.crypto.push({
        name: "Binance",
        status: "configured",
        message: `Key: ${binanceKey.substring(0, 10)}...`,
      })
    } else {
      results.crypto.push({ name: "Binance", status: "missing", message: "API keys not configured" })
    }
  } catch (error) {
    results.crypto.push({ name: "Binance", status: "error", message: "Configuration error" })
  }

  // Test Crypto.com
  try {
    const cryptoComKey = process.env.CRYPTO_COM_API_KEY
    const cryptoComSecret = process.env.CRYPTO_COM_API_SECRET
    if (cryptoComKey && cryptoComSecret && cryptoComKey.length > 10) {
      results.crypto.push({
        name: "Crypto.com",
        status: "configured",
        message: `Key: ${cryptoComKey.substring(0, 10)}...`,
      })
    } else {
      results.crypto.push({ name: "Crypto.com", status: "missing", message: "API keys not configured" })
    }
  } catch (error) {
    results.crypto.push({ name: "Crypto.com", status: "error", message: "Configuration error" })
  }

  // Test Kraken
  try {
    const krakenKey = process.env.KRAKEN_API_KEY
    const krakenSecret = process.env.KRAKEN_API_SECRET
    if (krakenKey && krakenSecret && krakenKey.length > 20) {
      results.crypto.push({
        name: "Kraken",
        status: "configured",
        message: `Key: ${krakenKey.substring(0, 10)}...`,
      })
    } else {
      results.crypto.push({ name: "Kraken", status: "missing", message: "API keys not configured" })
    }
  } catch (error) {
    results.crypto.push({ name: "Kraken", status: "error", message: "Configuration error" })
  }

  // Test Coinbase
  try {
    const coinbaseId = process.env.COINBASE_CLIENT_ID
    const coinbaseSecret = process.env.COINBASE_CLIENT_SECRET
    if (coinbaseId && coinbaseSecret && coinbaseId.includes("organizations")) {
      results.crypto.push({
        name: "Coinbase",
        status: "configured",
        message: "API credentials configured",
      })
    } else {
      results.crypto.push({ name: "Coinbase", status: "missing", message: "API keys not configured" })
    }
  } catch (error) {
    results.crypto.push({ name: "Coinbase", status: "error", message: "Configuration error" })
  }

  // Test Alchemy
  try {
    const alchemyKey = process.env.ALCHEMY_API_KEY
    if (alchemyKey && alchemyKey.startsWith("alcht_")) {
      results.crypto.push({
        name: "Alchemy",
        status: "configured",
        message: `Key: ${alchemyKey.substring(0, 12)}...`,
      })
    } else {
      results.crypto.push({ name: "Alchemy", status: "missing", message: "API key not configured" })
    }
  } catch (error) {
    results.crypto.push({ name: "Alchemy", status: "error", message: "Configuration error" })
  }

  // Test Helius
  try {
    const heliusKey = process.env.HELIUS_API_KEY
    if (heliusKey && heliusKey.length > 20) {
      results.crypto.push({
        name: "Helius",
        status: "configured",
        message: `Key: ${heliusKey.substring(0, 10)}...`,
      })
    } else {
      results.crypto.push({ name: "Helius", status: "missing", message: "API key not configured" })
    }
  } catch (error) {
    results.crypto.push({ name: "Helius", status: "error", message: "Configuration error" })
  }

  return NextResponse.json(results)
}
