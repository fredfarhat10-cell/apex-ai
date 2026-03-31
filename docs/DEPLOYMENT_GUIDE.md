# Apex AI - Deployment Guide

## Prerequisites

### Required Accounts
- Vercel account (for hosting)
- OpenAI API key
- Google Cloud Platform (for Calendar, Maps)
- Plaid account (for financial data)
- Skyscanner API key
- Booking.com API key
- Viator API key
- Uber API credentials

### Required Tools
- Node.js 18+ and npm/yarn
- Python 3.9+ and pip
- Git
- Vercel CLI (optional)

---

## Environment Variables

### Frontend (.env.local)
\`\`\`bash
# API Endpoints
NEXT_PUBLIC_API_URL=https://your-api-domain.com
CREWAI_BACKEND_URL=https://your-crewai-backend.com

# OpenAI
OPENAI_API_KEY=sk-...

# Google Services
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_MAPS_API_KEY=...

# Plaid
PLAID_CLIENT_ID=...
PLAID_SECRET=...
PLAID_ENV=sandbox # or production

# Travel APIs
SKYSCANNER_API_KEY=...
BOOKING_API_KEY=...
VIATOR_API_KEY=...

# Ride Sharing
UBER_CLIENT_ID=...
UBER_CLIENT_SECRET=...

# Supabase (if using for dev redirect)
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# Analytics
NEXT_PUBLIC_GA_ID=G-...
\`\`\`

### Backend (crewai-backend/.env)
\`\`\`bash
# OpenAI
OPENAI_API_KEY=sk-...

# Database
DATABASE_URL=postgresql://...

# Redis (for caching)
REDIS_URL=redis://...

# API Keys
SERPLY_API_KEY=...
FINANCIAL_DATA_API_KEY=...

# Security
JWT_SECRET=...
ENCRYPTION_KEY=...
\`\`\`

---

## Deployment Steps

### 1. Frontend Deployment (Vercel)

#### Option A: Vercel CLI
\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
\`\`\`

#### Option B: GitHub Integration
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push to main

### 2. Backend Deployment (Python/CrewAI)

#### Option A: Vercel Serverless Functions
\`\`\`bash
# Backend is already configured for Vercel
# Just deploy with frontend
vercel --prod
\`\`\`

#### Option B: Separate Backend Server
\`\`\`bash
# Deploy to Railway, Render, or AWS
# Configure CREWAI_BACKEND_URL to point to deployed backend
\`\`\`

### 3. Database Setup

#### Supabase (Recommended)
1. Create Supabase project
2. Run SQL scripts from `/scripts` folder
3. Configure environment variables
4. Enable Row Level Security

#### PostgreSQL (Self-hosted)
1. Set up PostgreSQL instance
2. Run migrations
3. Configure connection string
4. Set up backups

### 4. Configure Integrations

#### Google Calendar
1. Create OAuth 2.0 credentials in Google Cloud Console
2. Add authorized redirect URIs
3. Enable Google Calendar API
4. Configure consent screen

#### Plaid
1. Sign up for Plaid account
2. Get API keys (sandbox/production)
3. Configure webhook URL
4. Test connection

#### Travel APIs
1. Sign up for each service
2. Get API keys
3. Configure rate limits
4. Test endpoints

---

## Post-Deployment

### 1. Verify Deployment
\`\`\`bash
# Check frontend
curl https://your-domain.com

# Check API health
curl https://your-domain.com/api/health

# Check backend
curl https://your-crewai-backend.com/health
\`\`\`

### 2. Configure Monitoring
- Set up Sentry for error tracking
- Configure Vercel Analytics
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Configure log aggregation

### 3. Set Up Alerts
- Error rate alerts
- Performance degradation alerts
- API quota alerts
- Uptime alerts

### 4. Enable Analytics
- Google Analytics
- Mixpanel/Amplitude
- Custom event tracking
- User behavior analysis

---

## Rollback Procedure

### Vercel Rollback
\`\`\`bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
\`\`\`

### Database Rollback
\`\`\`bash
# Restore from backup
pg_restore -d apex_ai backup.sql
\`\`\`

---

## Maintenance

### Regular Tasks
- Monitor error logs daily
- Review performance metrics weekly
- Update dependencies monthly
- Security audit quarterly
- Backup verification monthly

### Scaling Considerations
- Monitor API rate limits
- Scale database as needed
- Optimize expensive queries
- Implement caching strategy
- Use CDN for static assets

---

## Troubleshooting

### Common Issues

#### 1. API Timeouts
- Check backend logs
- Verify API keys
- Check rate limits
- Increase timeout values

#### 2. Database Connection Issues
- Verify connection string
- Check firewall rules
- Verify SSL settings
- Check connection pool

#### 3. Integration Failures
- Verify API keys
- Check webhook URLs
- Review error logs
- Test with API playground

#### 4. Performance Issues
- Check bundle size
- Optimize images
- Enable caching
- Use code splitting

---

## Support

### Resources
- Documentation: `/docs`
- API Reference: `/docs/API.md`
- Troubleshooting: `/docs/TROUBLESHOOTING.md`
- Community: [Discord/Slack link]

### Contact
- Technical Support: support@apex-ai.com
- Security Issues: security@apex-ai.com
- General Inquiries: hello@apex-ai.com
\`\`\`
