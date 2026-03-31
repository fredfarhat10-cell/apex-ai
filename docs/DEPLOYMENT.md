# Apex AI Deployment Guide

## Production Deployment Checklist

### 1. Environment Variables

Ensure all required environment variables are set in your production environment:

\`\`\`bash
# Core AI
OPENAI_API_KEY=sk-proj-...
CREWAI_BACKEND_URL=https://your-backend.railway.app

# Authentication
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://apex-ai.app

# Integrations
PLAID_CLIENT_ID=...
PLAID_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Optional
SERPER_API_KEY=...
\`\`\`

### 2. Custom Domain Setup

#### Vercel Deployment

1. Push code to GitHub repository
2. Connect repository to Vercel
3. Add custom domain in Vercel dashboard
4. Update DNS records:
   - Add A record pointing to Vercel's IP
   - Add CNAME record for www subdomain
5. Enable automatic HTTPS

#### DNS Configuration

\`\`\`
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
\`\`\`

### 3. Performance Optimization

- Enable Edge Functions for API routes
- Configure ISR (Incremental Static Regeneration) for static pages
- Enable image optimization
- Set up CDN caching headers

### 4. Security Hardening

- Enable CORS restrictions
- Set up rate limiting
- Configure CSP (Content Security Policy)
- Enable HTTPS-only mode
- Set secure cookie flags

### 5. Monitoring & Analytics

- Set up error tracking (Sentry)
- Configure performance monitoring
- Enable Vercel Analytics
- Set up uptime monitoring

### 6. Post-Deployment

- Test all API integrations
- Verify authentication flows
- Check mobile responsiveness
- Run accessibility audit
- Test error handling
- Verify analytics tracking

## Rollback Procedure

If issues arise:

1. Revert to previous deployment in Vercel dashboard
2. Check error logs in QA Dashboard (/qa)
3. Review environment variables
4. Test in staging environment first

## Support

For deployment issues, check:
- QA Dashboard: /qa
- Analytics Dashboard: /analytics
- API Status: /api-status
