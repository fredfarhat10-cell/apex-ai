# Pre-Launch Checklist - Apex AI

## ⚠️ CRITICAL: Before Making Apex AI Public

This checklist ensures you transition from development (using your personal accounts) to production (proper multi-user OAuth).

---

## 1. Authentication Architecture

### Current State (Development)
- [ ] You're using YOUR personal accounts connected to CrewAI
- [ ] AI agents access YOUR Gmail, Calendar, Drive, etc.
- [ ] This is ONLY for testing

### Required Changes (Production)
- [ ] Disconnect your personal accounts from CrewAI
- [ ] Implement user-specific OAuth flows
- [ ] Each user connects THEIR OWN accounts
- [ ] User data is isolated per account

---

## 2. CrewAI Agent Apps - Remove Personal Connections

**Before Launch, Disconnect:**
- [ ] Your personal Gmail connection
- [ ] Your personal Google Calendar connection
- [ ] Your personal Google Drive connection
- [ ] Your personal Microsoft Outlook connection
- [ ] Your personal OneDrive connection
- [ ] Your personal Asana/Linear connection
- [ ] Your personal HubSpot/Salesforce connection
- [ ] Any other personal integrations

**Replace With:**
- [ ] User-initiated OAuth flows in the Apex AI app
- [ ] Each user authenticates with their own credentials
- [ ] Tokens stored per-user in IndexedDB (already implemented)

---

## 3. Environment Variables - Verify Production Keys

### Keep These (Developer Credentials)
- [x] `OPENAI_API_KEY` - Your OpenAI account (you pay for usage)
- [x] `CREWAI_BACKEND_URL` - Your CrewAI backend deployment
- [x] `GOOGLE_CLIENT_ID` - Your Google Cloud Project
- [x] `PLAID_CLIENT_ID` - Your Plaid developer account
- [x] `BINANCE_API_KEY` - For market data (not user accounts)

### Remove These (Personal Access Tokens)
- [ ] Any personal OAuth tokens in .env.local
- [ ] Any hardcoded user credentials
- [ ] Any test account passwords

---

## 4. Database & Storage - User Isolation

### Verify User Data Separation
- [ ] Each user's data stored in separate IndexedDB instances
- [ ] Vault encryption uses user-specific keys (already implemented)
- [ ] No cross-user data leakage possible
- [ ] Test with multiple user accounts

### Test Multi-User Scenarios
- [ ] Create 2-3 test accounts
- [ ] Connect different services to each account
- [ ] Verify User A cannot see User B's data
- [ ] Verify AI agents only access the logged-in user's data

---

## 5. CrewAI Backend Configuration

### Update Backend for Multi-User
- [ ] Backend accepts user-specific OAuth tokens
- [ ] Backend doesn't use hardcoded credentials
- [ ] Backend routes requests to correct user accounts
- [ ] Backend implements rate limiting per user

### Example Backend Change Needed:
\`\`\`python
# BEFORE (Development)
gmail_service = build('gmail', 'v1', credentials=MY_CREDENTIALS)

# AFTER (Production)
def get_gmail_service(user_token):
    credentials = Credentials(token=user_token)
    return build('gmail', 'v1', credentials=credentials)
\`\`\`

---

## 6. OAuth Callback URLs

### Update OAuth Redirect URIs
- [ ] Google Cloud Console - Add production domain
- [ ] Plaid Dashboard - Add production redirect URI
- [ ] Binance API - Update callback URL
- [ ] All other OAuth providers - Update redirect URIs

**Development:**
\`\`\`
http://localhost:3000/api/auth/google/callback
\`\`\`

**Production:**
\`\`\`
https://yourdomain.com/api/auth/google/callback
\`\`\`

---

## 7. Security Audit

### Before Launch
- [ ] Remove all console.log statements with sensitive data
- [ ] Verify .env.local is in .gitignore
- [ ] No API keys committed to Git
- [ ] All user data encrypted with Argon2id (already implemented)
- [ ] HTTPS enabled on production domain
- [ ] Rate limiting implemented on API routes

---

## 8. Testing with Dummy Accounts

### Create Test Accounts
- [ ] Create 3 dummy Gmail accounts for testing
- [ ] Create dummy Notion/Asana/Linear accounts
- [ ] Create dummy crypto exchange accounts (testnet)
- [ ] Test full user journey with each dummy account

### Test Scenarios
- [ ] New user signs up and connects accounts
- [ ] AI agents access correct user's data
- [ ] User disconnects and reconnects accounts
- [ ] User deletes account - all data removed

---

## 9. User Onboarding Flow

### Update Onboarding
- [ ] Add "Connect Your Accounts" step
- [ ] Explain what data AI agents will access
- [ ] Show OAuth permission screens
- [ ] Allow users to skip optional integrations

### Privacy & Transparency
- [ ] Update privacy policy with data access details
- [ ] Show users which accounts are connected
- [ ] Allow users to disconnect accounts anytime
- [ ] Display what data AI agents are accessing

---

## 10. Deployment Checklist

### Vercel Environment Variables
- [ ] Add all production API keys to Vercel dashboard
- [ ] Remove development/test keys
- [ ] Set `NODE_ENV=production`
- [ ] Configure custom domain

### CrewAI Backend Deployment
- [ ] Deploy backend to production (Railway/Render)
- [ ] Update `CREWAI_BACKEND_URL` in Vercel
- [ ] Test backend connectivity from production frontend
- [ ] Monitor backend logs for errors

---

## 11. Post-Launch Monitoring

### Week 1 After Launch
- [ ] Monitor API usage and costs
- [ ] Check for OAuth errors in logs
- [ ] Verify users can connect accounts successfully
- [ ] Monitor AI agent performance
- [ ] Check for data isolation issues

---

## Quick Pre-Launch Command

Run this before going public:

\`\`\`bash
# 1. Disconnect all personal CrewAI integrations
# (Do this manually in CrewAI dashboard)

# 2. Verify no personal tokens in code
grep -r "access_token" . --exclude-dir=node_modules

# 3. Check for hardcoded credentials
grep -r "password\|secret\|token" .env.local

# 4. Test with dummy account
# (Create test user and verify full flow)

# 5. Deploy to production
vercel --prod
\`\`\`

---

## Emergency Rollback Plan

If issues arise after launch:

1. **Disable new signups** - Add maintenance mode
2. **Disconnect CrewAI integrations** - Prevent data access
3. **Roll back to previous version** - `vercel rollback`
4. **Notify users** - Send email about temporary issues

---

## Contact Before Launch

**I (v0) will remind you to:**
- Review this checklist
- Test with dummy accounts
- Verify user data isolation
- Update OAuth callback URLs

**You should NOT launch until:**
- All checkboxes are complete
- You've tested with 3+ dummy accounts
- You've disconnected your personal accounts from CrewAI
- You've verified no cross-user data leakage

---

## Estimated Time to Production-Ready

- **OAuth Implementation:** 2-4 hours
- **Multi-user testing:** 2-3 hours
- **Security audit:** 1-2 hours
- **Deployment & monitoring:** 1-2 hours

**Total:** 6-11 hours of work before launch

---

**Status: DEVELOPMENT MODE**
- Current: Using personal accounts for testing ✅
- Next: Complete this checklist before public launch ⏳
