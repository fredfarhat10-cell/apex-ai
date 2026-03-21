# Apex AI - Complete API Setup Guide

This guide provides a comprehensive list of all APIs needed to transform Apex AI from a demo into a fully functional production application.

## 🎯 Quick Overview

**Status Legend:**
- ✅ **CRITICAL** - Required for core functionality
- 🔶 **IMPORTANT** - Needed for major features
- 🔵 **OPTIONAL** - Enhances specific features

---

## ✅ CRITICAL APIs (Must Have)

### 1. OpenAI API
**Purpose:** Powers all AI agents, embeddings, memory, and intelligence features

**How to Get:**
1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

**Environment Variable:**
\`\`\`bash
OPENAI_API_KEY="sk-..."
\`\`\`

**Cost:** Pay-as-you-go. Expect $20-100/month depending on usage.

**Used In:**
- All CrewAI agents (Daily Synapse, Weekly Sync, Echo Chamber)
- MemoryTool for semantic search
- NLU processing
- Speech-to-text
- Image analysis
- Embeddings generation

---

### 2. CrewAI Backend URL
**Purpose:** Connects frontend to Python backend for all AI orchestration

**How to Set Up:**
1. **Local Development:**
   \`\`\`bash
   NEXT_PUBLIC_CREWAI_API_URL="http://localhost:8000"
   CREWAI_BACKEND_URL="http://localhost:8000"
   \`\`\`

2. **Production (Deploy to Render/Railway):**
   - Deploy the `crewai-backend` folder to Render or Railway
   - Get your deployment URL (e.g., `https://apex-ai-backend.onrender.com`)
   - Set:
   \`\`\`bash
   NEXT_PUBLIC_CREWAI_API_URL="https://apex-ai-backend.onrender.com"
   CREWAI_BACKEND_URL="https://apex-ai-backend.onrender.com"
   \`\`\`

**Cost:** Free tier available on Render/Railway

**Used In:**
- Daily Synapse generation
- Weekly Sync sessions
- Echo Chamber simulations
- Action Inbox AI triage
- Voice command processing
- All CrewAI agent interactions

---

## 🔶 IMPORTANT APIs (Highly Recommended)

### 3. Google OAuth (Calendar & Gmail)
**Purpose:** Enables Google Calendar integration and Gmail Action Inbox

**How to Get:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable APIs:
   - Google Calendar API
   - Gmail API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - Local: `http://localhost:3000/api/auth/google/callback`
   - Production: `https://your-domain.com/api/auth/google/callback`
7. Copy Client ID and Client Secret

**Environment Variables:**
\`\`\`bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
NEXT_PUBLIC_GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
\`\`\`

**Cost:** Free

**Used In:**
- Calendar integration for proactive logistics
- Gmail integration for Action Inbox
- Event scheduling and reminders

---

### 4. Plaid API (Financial Data)
**Purpose:** Connects to US banks (Amex, Chase, etc.) for financial intelligence

**How to Get:**
1. Go to [Plaid Dashboard](https://dashboard.plaid.com/)
2. Sign up for a free account
3. Get your Client ID and Sandbox Secret from "Team Settings" → "Keys"
4. Start with Sandbox environment (free, unlimited)

**Environment Variables:**
\`\`\`bash
PLAID_CLIENT_ID="your-plaid-client-id"
PLAID_SECRET="your-plaid-sandbox-secret"
PLAID_ENV="sandbox"
\`\`\`

**Cost:** 
- Sandbox: Free forever
- Development: Free for 100 items
- Production: $0.50-$1.00 per item/month

**Used In:**
- Financial Velocity widget
- Account aggregation
- Transaction analysis
- Cross-domain insights (spending vs. wellness)

---

### 5. Whoop API (Wellness Data)
**Purpose:** Real biometric data from Whoop wearables

**How to Get:**
1. Go to [Whoop Developer Portal](https://developer.whoop.com/)
2. Create a developer account
3. Register your application
4. Get OAuth credentials

**Environment Variables:**
\`\`\`bash
WHOOP_CLIENT_ID="your-whoop-client-id"
WHOOP_CLIENT_SECRET="your-whoop-client-secret"
\`\`\`

**Alternative:** Currently using mock data. Real integration requires:
- OAuth flow implementation
- Webhook setup for real-time data
- User consent flow

**Cost:** Free for developers

**Used In:**
- Wellness Briefing widget
- Aura inference
- Cross-domain insights (sleep vs. spending)
- Daily Synapse generation

---

### 6. Garmin Connect API (Wellness Data)
**Purpose:** Alternative to Whoop for biometric data

**How to Get:**
1. Go to [Garmin Connect Developer](https://developer.garmin.com/)
2. Apply for API access
3. Wait for approval (can take 1-2 weeks)

**Environment Variables:**
\`\`\`bash
GARMIN_CONSUMER_KEY="your-garmin-key"
GARMIN_CONSUMER_SECRET="your-garmin-secret"
\`\`\`

**Cost:** Free

**Used In:**
- Same as Whoop (alternative wellness data source)

---

### 7. Strava API (Activity Data)
**Purpose:** Fitness activity tracking and analysis

**How to Get:**
1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. Create an application
3. Get Client ID and Client Secret

**Environment Variables:**
\`\`\`bash
STRAVA_CLIENT_ID="your-strava-client-id"
STRAVA_CLIENT_SECRET="your-strava-client-secret"
\`\`\`

**Cost:** Free (rate limited to 100 requests per 15 minutes)

**Used In:**
- Activity tracking
- Wellness data supplementation

---

### 8. Binance API (Crypto Exchange)
**Purpose:** Connect to Binance for crypto portfolio tracking and trading data

**How to Get:**
1. Go to [Binance API Management](https://www.binance.com/en/my/settings/api-management)
2. Create a new API key
3. Enable "Enable Reading" permission (do NOT enable trading for security)
4. Save API Key and Secret Key
5. Whitelist your server IP (optional but recommended)

**Environment Variables:**
\`\`\`bash
BINANCE_API_KEY="your-binance-api-key"
BINANCE_API_SECRET="your-binance-secret-key"
\`\`\`

**Cost:** Free

**Used In:**
- Crypto portfolio tracking
- Exchange balance monitoring
- Transaction history
- Cross-domain insights (crypto vs. spending)

---

### 9. Crypto.com API
**Purpose:** Connect to Crypto.com exchange for portfolio tracking

**How to Get:**
1. Go to [Crypto.com Exchange](https://crypto.com/exchange)
2. Navigate to Settings → API Keys
3. Create a new API key with read-only permissions
4. Save API Key and Secret

**Environment Variables:**
\`\`\`bash
CRYPTO_COM_API_KEY="your-crypto-com-api-key"
CRYPTO_COM_API_SECRET="your-crypto-com-secret"
\`\`\`

**Cost:** Free

**Used In:**
- Crypto portfolio tracking
- Exchange balance monitoring

---

### 10. Kraken API
**Purpose:** Connect to Kraken exchange for portfolio tracking

**How to Get:**
1. Go to [Kraken API Settings](https://www.kraken.com/u/security/api)
2. Generate new API key
3. Select "Query Funds" and "Query Open Orders & Trades" permissions
4. Save API Key and Private Key

**Environment Variables:**
\`\`\`bash
KRAKEN_API_KEY="your-kraken-api-key"
KRAKEN_API_SECRET="your-kraken-private-key"
\`\`\`

**Cost:** Free

**Used In:**
- Crypto portfolio tracking
- Exchange balance monitoring

---

### 11. Coinbase API
**Purpose:** Connect to Coinbase for crypto portfolio tracking

**How to Get:**
1. Go to [Coinbase API Settings](https://www.coinbase.com/settings/api)
2. Create a new API key
3. Select "wallet:accounts:read" and "wallet:transactions:read" permissions
4. Save API Key and API Secret

**Environment Variables:**
\`\`\`bash
COINBASE_API_KEY="your-coinbase-api-key"
COINBASE_API_SECRET="your-coinbase-api-secret"
\`\`\`

**Cost:** Free

**Used In:**
- Crypto portfolio tracking
- Exchange balance monitoring

---

### 12. Web3 Provider (MetaMask/Phantom/Trust Wallet)
**Purpose:** Connect crypto wallets for on-chain portfolio tracking

**How to Get:**
- **MetaMask:** Browser extension automatically provides Web3 API
- **Phantom:** Browser extension for Solana wallets
- **Trust Wallet:** WalletConnect integration

**Implementation:**
\`\`\`typescript
// Frontend Web3 connection (no API key needed)
// Uses browser wallet extensions
\`\`\`

**For Blockchain Data APIs:**
1. **Alchemy** (Ethereum/Polygon): [https://www.alchemy.com/](https://www.alchemy.com/)
2. **Helius** (Solana): [https://www.helius.dev/](https://www.helius.dev/)

**Environment Variables:**
\`\`\`bash
ALCHEMY_API_KEY="your-alchemy-key"  # For Ethereum/Polygon data
HELIUS_API_KEY="your-helius-key"    # For Solana data
\`\`\`

**Cost:** Free tiers available

**Used In:**
- Wallet balance tracking
- NFT portfolio
- DeFi position monitoring
- Cross-chain portfolio aggregation

---

## 🔵 OPTIONAL APIs (Feature Enhancements)

### 13. Notion API
**Purpose:** Project management and note-taking integration

**How to Get:**
1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Create a new integration
3. Copy the Internal Integration Token

**Environment Variables:**
\`\`\`bash
NOTION_API_KEY="secret_..."
NOTION_DATABASE_ID="your-database-id"
\`\`\`

**Cost:** Free

**Used In:**
- Scratchpad note processing
- Project management integration
- Action item extraction

---

### 14. Google Maps API
**Purpose:** Location services and proactive logistics

**How to Get:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "Maps JavaScript API" and "Geocoding API"
3. Create API key in "Credentials"

**Environment Variables:**
\`\`\`bash
GOOGLE_MAPS_API_KEY="your-google-maps-key"
\`\`\`

**Cost:** $200 free credit per month, then pay-as-you-go

**Used In:**
- Proactive logistics engine
- Travel time calculations
- Location-based suggestions

---

### 15. Uber API
**Purpose:** Ride-sharing integration for proactive logistics

**How to Get:**
1. Go to [Uber Developer Portal](https://developer.uber.com/)
2. Create an application
3. Get Client ID and Secret

**Environment Variables:**
\`\`\`bash
UBER_CLIENT_ID="your-uber-client-id"
UBER_CLIENT_SECRET="your-uber-client-secret"
\`\`\`

**Cost:** Free (pay for actual rides)

**Used In:**
- Proactive ride booking suggestions
- Travel logistics

---

### 16. Lyft API
**Purpose:** Alternative ride-sharing option

**How to Get:**
1. Go to [Lyft Developer Portal](https://www.lyft.com/developers)
2. Create an application
3. Get Client ID and Secret

**Environment Variables:**
\`\`\`bash
LYFT_CLIENT_ID="your-lyft-client-id"
LYFT_CLIENT_SECRET="your-lyft-client-secret"
\`\`\`

**Cost:** Free (pay for actual rides)

---

### 17. Skyscanner API (via RapidAPI)
**Purpose:** Flight search for travel planning

**How to Get:**
1. Go to [RapidAPI Skyscanner](https://rapidapi.com/skyscanner/api/skyscanner-flight-search)
2. Subscribe to a plan (free tier available)
3. Copy your RapidAPI key

**Environment Variables:**
\`\`\`bash
SKYSCANNER_API_KEY="your-rapidapi-key"
\`\`\`

**Cost:** Free tier: 100 requests/month

---

### 18. Booking.com API (via RapidAPI)
**Purpose:** Hotel search for travel planning

**How to Get:**
1. Go to [RapidAPI Booking.com](https://rapidapi.com/apidojo/api/booking)
2. Subscribe to a plan
3. Copy your RapidAPI key

**Environment Variables:**
\`\`\`bash
BOOKING_API_KEY="your-rapidapi-key"
\`\`\`

**Cost:** Free tier: 500 requests/month

---

### 19. Viator API (via RapidAPI)
**Purpose:** Tours and activities for travel planning

**How to Get:**
1. Go to [RapidAPI Viator](https://rapidapi.com/apidojo/api/viator)
2. Subscribe to a plan
3. Copy your RapidAPI key

**Environment Variables:**
\`\`\`bash
VIATOR_API_KEY="your-rapidapi-key"
\`\`\`

**Cost:** Free tier: 500 requests/month

---

### 20. LinkedIn API
**Purpose:** Career profile analysis and networking

**How to Get:**
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create an application
3. Request API access (requires approval)

**Environment Variables:**
\`\`\`bash
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
\`\`\`

**Cost:** Free (approval required)

---

### 21. Asana API
**Purpose:** Project management integration

**How to Get:**
1. Go to [Asana Developer Console](https://app.asana.com/0/developer-console)
2. Create a Personal Access Token

**Environment Variables:**
\`\`\`bash
ASANA_API_KEY="your-asana-token"
\`\`\`

**Cost:** Free

---

### 22. Trello API
**Purpose:** Alternative project management

**How to Get:**
1. Go to [Trello Power-Ups](https://trello.com/power-ups/admin)
2. Create a new Power-Up
3. Get API Key and Token

**Environment Variables:**
\`\`\`bash
TRELLO_API_KEY="your-trello-key"
TRELLO_API_TOKEN="your-trello-token"
\`\`\`

**Cost:** Free

---

### 23. TrueLayer API (UK Banks)
**Purpose:** UK bank integration (HSBC, Revolut, etc.)

**How to Get:**
1. Go to [TrueLayer Console](https://console.truelayer.com/)
2. Create an application
3. Get Client ID and Secret

**Environment Variables:**
\`\`\`bash
TRUELAYER_CLIENT_ID="your-truelayer-client-id"
TRUELAYER_CLIENT_SECRET="your-truelayer-client-secret"
\`\`\`

**Cost:** Free for development, paid for production

---

### 24. Supabase (Optional Database)
**Purpose:** User authentication and data persistence

**How to Get:**
1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Get URL and anon key from project settings

**Environment Variables:**
\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL="http://localhost:3000"
\`\`\`

**Cost:** Free tier: 500MB database, 2GB bandwidth

---

### 25. Gemini API (Alternative AI)
**Purpose:** Google's AI model (currently used in some routes)

**How to Get:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key

**Environment Variables:**
\`\`\`bash
GEMINI_API_KEY="your-gemini-key"
\`\`\`

**Cost:** Free tier available

**Note:** Most routes can use OpenAI instead. Gemini is optional.

---

## 📋 Setup Priority Order

### Phase 1: Core Functionality (Start Here)
1. ✅ **OpenAI API** - Required for all AI features
2. ✅ **CrewAI Backend URL** - Deploy backend first
3. 🔶 **Google OAuth** - Critical for calendar and email

### Phase 2: Intelligence Features
4. 🔶 **Plaid API** - Financial intelligence (use Sandbox)
5. 🔶 **Whoop/Garmin/Strava** - Wellness intelligence (start with mock data)
6. 🔶 **Crypto Exchanges** - Binance/Coinbase/Kraken (optional but recommended)

### Phase 3: Enhanced Features
7. 🔵 **Crypto Wallets** - MetaMask/Phantom integration
8. 🔵 **Notion API** - Note processing
9. 🔵 **Google Maps API** - Logistics
10. 🔵 **Travel APIs** - If using travel features

### Phase 4: Optional Integrations
11. 🔵 **Ride-sharing APIs** - Uber/Lyft
12. 🔵 **Project Management** - Asana/Trello
13. 🔵 **LinkedIn API** - Career features

---

## 🚀 Quick Start Configuration

### Minimum Viable Setup (.env.local)
\`\`\`bash
# Core AI
OPENAI_API_KEY="sk-..."
NEXT_PUBLIC_CREWAI_API_URL="http://localhost:8000"
CREWAI_BACKEND_URL="http://localhost:8000"

# Google Integration
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

# Demo Mode (disable when APIs are ready)
NEXT_PUBLIC_DEMO_MODE="false"
\`\`\`

### Full Production Setup
Copy `.env.example` to `.env.local` and fill in all values from this guide.

---

## 🔧 Backend Configuration (crewai-backend/.env)

\`\`\`bash
# Core AI
OPENAI_API_KEY="sk-..."

# Search
SERPER_API_KEY="your-serper-key"

# Integrations (same as frontend)
NOTION_API_KEY="secret_..."
GOOGLE_MAPS_API_KEY="your-google-maps-key"
UBER_API_KEY="your-uber-key"
LYFT_API_KEY="your-lyft-key"
SKYSCANNER_API_KEY="your-rapidapi-key"
BOOKING_API_KEY="your-rapidapi-key"
VIATOR_API_KEY="your-rapidapi-key"
LINKEDIN_API_KEY="your-linkedin-key"
ASANA_API_KEY="your-asana-token"
TRELLO_API_KEY="your-trello-key"
TRELLO_API_TOKEN="your-trello-token"
BINANCE_API_KEY="your-binance-api-key"
BINANCE_API_SECRET="your-binance-secret-key"
CRYPTO_COM_API_KEY="your-crypto-com-api-key"
CRYPTO_COM_API_SECRET="your-crypto-com-secret"
KRAKEN_API_KEY="your-kraken-api-key"
KRAKEN_API_SECRET="your-kraken-private-key"
COINBASE_API_KEY="your-coinbase-api-key"
COINBASE_API_SECRET="your-coinbase-api-secret"
ALCHEMY_API_KEY="your-alchemy-key"  # For Ethereum/Polygon data
HELIUS_API_KEY="your-helius-key"    # For Solana data
\`\`\`

---

## 💰 Estimated Monthly Costs

### Minimum Setup (Core Features Only)
- OpenAI API: $20-50/month
- Render/Railway (Backend): $0 (free tier) or $7/month
- **Total: $20-57/month**

### Full Production Setup (Including Crypto)
- OpenAI API: $50-150/month
- Backend Hosting: $7-25/month
- Google Maps: $0-50/month (free $200 credit)
- Plaid Production: $50-200/month (depends on users)
- Alchemy/Helius (Blockchain data): $0-50/month (free tier usually sufficient)
- Other APIs: Mostly free tiers
- **Total: $107-475/month**

---

## 🔒 Security Best Practices

1. **Never commit API keys to Git**
   - Use `.env.local` (already in `.gitignore`)
   - Use environment variables in production

2. **Rotate keys regularly**
   - Especially OpenAI and OAuth secrets

3. **Use environment-specific keys**
   - Sandbox for development
   - Production keys only in production

4. **Restrict API key permissions**
   - Use read-only where possible
   - Set up IP restrictions

5. **Monitor usage**
   - Set up billing alerts
   - Track API usage dashboards

---

## 🐛 Troubleshooting

### "OPENAI_API_KEY not found"
- Check `.env.local` exists in root directory
- Restart Next.js dev server after adding keys
- Verify key starts with `sk-`

### "CrewAI backend unavailable"
- Check backend is running: `cd crewai-backend && python -m uvicorn main:app`
- Verify `NEXT_PUBLIC_CREWAI_API_URL` matches backend URL
- Check backend logs for errors

### "Google OAuth redirect mismatch"
- Ensure redirect URI in Google Console matches exactly
- Include both `http://localhost:3000` and production URL
- Check for trailing slashes

### "Plaid link token error"
- Verify `PLAID_CLIENT_ID` and `PLAID_SECRET` are correct
- Check `PLAID_ENV` is set to "sandbox"
- Ensure Plaid account is activated

---

## 📚 Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Plaid Quickstart](https://plaid.com/docs/quickstart/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [CrewAI Documentation](https://docs.crewai.com/)
- [Whoop Developer Docs](https://developer.whoop.com/docs)
- [Binance API Documentation](https://binance-docs.github.io/apidocs/)
- [Crypto.com API Documentation](https://crypto.com/exchange/developers)
- [Kraken API Documentation](https://www.kraken.com/en-us/help/api)
- [Coinbase API Documentation](https://developers.coinbase.com/api/v2)
- [Alchemy API Documentation](https://docs.alchemy.com/)
- [Helius API Documentation](https://docs.helius.dev/)

---

## ✅ Verification Checklist

Before going to production, verify:

- [ ] OpenAI API key is working (test in playground)
- [ ] CrewAI backend is deployed and accessible
- [ ] Google OAuth flow completes successfully
- [ ] Plaid Sandbox connection works
- [ ] All environment variables are set in production
- [ ] Demo mode is disabled (`NEXT_PUBLIC_DEMO_MODE="false"`)
- [ ] API usage monitoring is set up
- [ ] Billing alerts are configured
- [ ] Error logging is working (Sentry/LogRocket)
- [ ] Rate limiting is implemented

---

**Last Updated:** January 2025
**Version:** 1.0.0
