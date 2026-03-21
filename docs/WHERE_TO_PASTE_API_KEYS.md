# 🔑 WHERE TO PASTE API KEYS - VISUAL GUIDE

This guide shows you **exactly** where each API key is used in the codebase and how to configure them.

---

## 📁 STEP 1: Create Your Environment File

\`\`\`bash
# In the root directory of the project:
cp .env.example .env.local
\`\`\`

**Important:** Never commit `.env.local` to git! It's already in `.gitignore`.

---

## 🎯 STEP 2: Fill In Your API Keys

Open `.env.local` in your code editor and replace the placeholder values with your actual API keys.

---

## 📍 WHERE EACH KEY IS USED IN THE CODE

### 🔴 CRITICAL KEYS

#### 1. **OPENAI_API_KEY**
**Where to get it:** https://platform.openai.com/api-keys

**Used in these files:**
- `app/api/embeddings/route.ts` (line 12) - Text embeddings
- `app/api/nlu/route.ts` (line 13) - Natural language understanding
- `app/api/speech-to-text/route.ts` (line 12) - Voice transcription
- `app/api/image-analysis/route.ts` (line 12) - Image analysis
- `app/api/nlu/style-analysis/route.ts` (line 15) - Style analysis

**Example usage:**
\`\`\`typescript
const apiKey = process.env.OPENAI_API_KEY
\`\`\`

---

#### 2. **NEXT_PUBLIC_CREWAI_API_URL**
**Where to get it:** Your deployed Python backend URL (Render/Railway/Heroku)

**Used in these files:**
- `lib/crewai-client.ts` (line 6) - Main CrewAI client
- `app/api/daily-synapse/route.ts` (line 141) - Daily insights
- `app/api/weekly-sync/generate/route.ts` (line 73) - Weekly sync
- `app/api/action-inbox/route.ts` (line 32) - Action items
- `app/api/simulate-decision/route.ts` (line 19) - Decision simulation
- `app/api/triage/route.ts` (line 24) - Email triage
- `lib/notion-client.ts` (line 4) - Notion integration

**Example usage:**
\`\`\`typescript
const CREWAI_BASE_URL = process.env.CREWAI_API_URL || "http://localhost:8000"
\`\`\`

---

### 🟠 IMPORTANT KEYS

#### 3. **GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET**
**Where to get it:** https://console.cloud.google.com/apis/credentials

**Used in these files:**
- `lib/google-oauth.ts` (lines 25-27) - OAuth flow
- `lib/calendar-oauth.ts` (line 21) - Calendar integration
- `app/api/auth/google/route.ts` - Google authentication

**Example usage:**
\`\`\`typescript
this.clientId = process.env.GOOGLE_CLIENT_ID || ""
this.clientSecret = process.env.GOOGLE_CLIENT_SECRET || ""
this.redirectUri = process.env.GOOGLE_REDIRECT_URI || ""
\`\`\`

**Setup steps:**
1. Go to Google Cloud Console
2. Create a new project or select existing
3. Enable Google Calendar API and Gmail API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
6. Copy Client ID and Client Secret to `.env.local`

---

#### 4. **PLAID_CLIENT_ID & PLAID_SECRET**
**Where to get it:** https://dashboard.plaid.com/team/keys

**Used in these files:**
- `lib/plaid-client.ts` (lines 14-15) - Plaid configuration
- `app/api/plaid/create-link-token/route.ts` - Link token creation
- `app/api/plaid/exchange-token/route.ts` - Token exchange
- `app/api/plaid/accounts/route.ts` - Account fetching
- `app/api/plaid/transactions/route.ts` - Transaction fetching

**Example usage:**
\`\`\`typescript
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID
const PLAID_SECRET = process.env.PLAID_SECRET
const PLAID_ENV = process.env.NEXT_PUBLIC_PLAID_ENV || "sandbox"
\`\`\`

---

### 💰 CRYPTO EXCHANGE KEYS

#### 5. **BINANCE_CLIENT_ID & BINANCE_CLIENT_SECRET**
**Where to get it:** https://www.binance.com/en/my/settings/api-management

**Used in these files:**
- `app/api/auth/binance/route.ts` (lines 5-6) - OAuth initiation
- `app/api/auth/binance/callback/route.ts` (lines 18-20) - OAuth callback
- `lib/crypto-aggregation.ts` - Portfolio syncing

**Example usage:**
\`\`\`typescript
const clientId = process.env.BINANCE_CLIENT_ID
const clientSecret = process.env.BINANCE_CLIENT_SECRET
\`\`\`

**Setup steps:**
1. Log in to Binance
2. Go to API Management
3. Create new API key
4. Enable "Read" permissions only (for security)
5. Copy API Key and Secret Key to `.env.local`

---

#### 6. **COINBASE_CLIENT_ID & COINBASE_CLIENT_SECRET**
**Where to get it:** https://www.coinbase.com/settings/api

**Used in these files:**
- `app/api/auth/coinbase/route.ts` (lines 5-6) - OAuth initiation
- `app/api/auth/coinbase/callback/route.ts` (lines 18-20) - OAuth callback
- `lib/crypto-aggregation.ts` - Portfolio syncing

---

#### 7. **KRAKEN_API_KEY & KRAKEN_API_SECRET**
**Where to get it:** https://www.kraken.com/u/security/api

**Used in these files:**
- `lib/crypto-aggregation.ts` - Portfolio syncing
- `app/api/crypto/sync/route.ts` - Data synchronization

---

### 🔗 BLOCKCHAIN DATA PROVIDERS

#### 8. **ALCHEMY_API_KEY**
**Where to get it:** https://dashboard.alchemy.com/

**Used in these files:**
- `lib/crypto-aggregation.ts` - EVM wallet balance fetching (MetaMask, Trust Wallet)
- Frontend wallet connection components

**Example usage:**
\`\`\`typescript
const alchemyUrl = `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
\`\`\`

**What it does:** Fetches real-time balances for Ethereum, Polygon, Arbitrum, and Optimism wallets.

---

#### 9. **HELIUS_API_KEY**
**Where to get it:** https://dev.helius.xyz/

**Used in these files:**
- `lib/crypto-aggregation.ts` - Solana wallet balance fetching (Phantom)

**Example usage:**
\`\`\`typescript
const heliusUrl = `https://api.helius.xyz/v0/addresses/${address}/balances?api-key=${process.env.HELIUS_API_KEY}`
\`\`\`

**What it does:** Fetches real-time balances for Solana wallets (Phantom).

---

### 🏥 WELLNESS INTEGRATIONS

#### 10. **WHOOP_CLIENT_ID & WHOOP_CLIENT_SECRET**
**Where to get it:** https://developer.whoop.com/

**Used in these files:**
- `app/api/integrations/sync/route.ts` - Wellness data syncing
- `lib/wellness-oracle.ts` - Biometric data aggregation

---

#### 11. **GARMIN_CONSUMER_KEY & GARMIN_CONSUMER_SECRET**
**Where to get it:** https://developer.garmin.com/

**Used in these files:**
- `app/api/integrations/sync/route.ts` - Wellness data syncing
- `lib/wellness-oracle.ts` - Biometric data aggregation

---

#### 12. **STRAVA_CLIENT_ID & STRAVA_CLIENT_SECRET**
**Where to get it:** https://www.strava.com/settings/api

**Used in these files:**
- `app/api/integrations/sync/route.ts` - Wellness data syncing
- `lib/wellness-oracle.ts` - Biometric data aggregation

---

## 🔄 QUICK REFERENCE: API KEY → FILE MAPPING

| API Key | Primary File | Purpose |
|---------|-------------|---------|
| `OPENAI_API_KEY` | `app/api/embeddings/route.ts` | AI embeddings & NLU |
| `NEXT_PUBLIC_CREWAI_API_URL` | `lib/crewai-client.ts` | CrewAI backend connection |
| `GOOGLE_CLIENT_ID` | `lib/google-oauth.ts` | Google OAuth |
| `PLAID_CLIENT_ID` | `lib/plaid-client.ts` | Bank connections |
| `BINANCE_API_KEY` | `app/api/auth/binance/route.ts` | Binance portfolio |
| `COINBASE_CLIENT_ID` | `app/api/auth/coinbase/route.ts` | Coinbase portfolio |
| `KRAKEN_API_KEY` | `lib/crypto-aggregation.ts` | Kraken portfolio |
| `ALCHEMY_API_KEY` | `lib/crypto-aggregation.ts` | EVM wallet balances |
| `HELIUS_API_KEY` | `lib/crypto-aggregation.ts` | Solana wallet balances |
| `WHOOP_CLIENT_ID` | `app/api/integrations/sync/route.ts` | Whoop biometrics |
| `GARMIN_CONSUMER_KEY` | `app/api/integrations/sync/route.ts` | Garmin biometrics |
| `STRAVA_CLIENT_ID` | `app/api/integrations/sync/route.ts` | Strava activities |

---

## ✅ VERIFICATION CHECKLIST

After pasting your API keys, verify they work:

1. **OpenAI API:**
   \`\`\`bash
   # Test in browser console on any page:
   fetch('/api/embeddings', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ text: 'test' })
   }).then(r => r.json()).then(console.log)
   \`\`\`

2. **CrewAI Backend:**
   \`\`\`bash
   # Check if backend is running:
   curl http://localhost:8000/health
   \`\`\`

3. **Google OAuth:**
   - Go to `/auth-demo` page
   - Click "Continue with Google"
   - Should redirect to Google login

4. **Plaid:**
   - Go to Financial Command Center
   - Click "Connect Bank Account"
   - Should open Plaid Link modal

5. **Crypto Exchanges:**
   - Go to Integration Hub → Crypto Exchanges tab
   - Click "Connect" on any exchange
   - Should initiate OAuth flow

---

## 🚨 TROUBLESHOOTING

### "API key not found" error
- Make sure you created `.env.local` (not `.env`)
- Restart your Next.js dev server after adding keys
- Check for typos in variable names

### "Unauthorized" or "403 Forbidden"
- Verify the API key is correct (copy-paste from provider)
- Check if the API key has the right permissions enabled
- Some APIs require IP whitelisting

### OAuth redirect errors
- Make sure `NEXT_PUBLIC_APP_URL` matches your actual URL
- Add the exact callback URL to your OAuth provider settings
- For local dev, use `http://localhost:3000` (not `127.0.0.1`)

---

## 📚 NEXT STEPS

1. See `docs/API_SETUP_GUIDE.md` for detailed setup instructions for each API
2. See `docs/SECURITY_ARCHITECTURE.md` for security best practices
3. Join our Discord for help: [link]

---

**Remember:** Never commit `.env.local` to version control! All API keys should remain secret.
