# Set Point Protocol (home-screen web app)

The Set Point Protocol daily loop as an installable web app: onboarding with an AI reframe, Today, Set Point, and Library. Data is stored on the phone (localStorage). The AI reframe runs on the server so the API key never ships to the device.

## Put it on your phone

1. **Deploy on Vercel.** On vercel.com, choose **Add New → Project** and import this repo. Vercel detects Vite automatically.
2. **Add the key.** In **Project → Settings → Environment Variables**, add `ANTHROPIC_API_KEY` for Production (and Preview if you use preview links), then redeploy.
3. **Cap the spend.** In the Anthropic Console, set a monthly spend limit. The `/api/reframe` endpoint is public; it only accepts short answers and makes one call per onboarding, but a limit is the real safeguard.
4. **Install.** Open the production URL in **Safari** on your iPhone → **Share → Add to Home Screen**.

Notes:
- Vercel deploys the repo's production branch (usually `main`). If this work is on another branch, merge it or change **Settings → Git → Production Branch**. Preview links can sit behind Vercel's login, which a home-screen app can't pass.
- Without `ANTHROPIC_API_KEY`, onboarding still works: the pattern summary is assembled offline from the user's own answers.
- Data lives only on the device. **Library → Times and data → Export backup** saves a JSON file; **Import backup** restores it.

## Develop

```bash
npm install
npm run dev        # app at http://localhost:5173 (/api isn't served here, so the reframe falls back offline)
npm test           # scoring rules + reframe endpoint (against a local mock of the API)
npm run build      # typecheck + production build
```

To try the AI reframe locally, use `vercel dev` with `ANTHROPIC_API_KEY` set.

## Where things are

| Path | What |
| --- | --- |
| `src/lib/scoring.ts` | The core mechanic: outcomes, derived scores, live progress, never-miss-twice, weekly average/floor, level-up and bad-week rules |
| `src/lib/store-core.ts` | State shape helpers and all mutations (evening log save, checks, protocols, shrink, level-up) |
| `src/lib/templates.ts` | Bundled generic template library (shown in onboarding) |
| `src/lib/reframe.ts` | Calls `/api/reframe`, with the offline fallback |
| `api/reframe.ts` | Vercel Function: Claude call with structured output, input limits, error mapping |
| `src/screens/` | Onboarding, Today, EveningLog, SlipSheet, SetPoint, SundayReview, Library |
| `public/` | Manifest, icons and the service worker (offline app shell) |

## Not in this version

- **Notifications.** iOS home-screen web apps need a push server for reminders. The morning and evening times are stored and used to bring the evening log forward on Today.
- **Paywall.** Planned for the iOS app: monthly $19.99, annual $143.99 (40% off). StoreKit doesn't apply to a web app.
- **Personal seed pack** (`seed_personal.json`). Not added; the brief didn't include its contents.
- The earlier Apex AI web app is still in the repo as the original zip upload and is not part of this build.
