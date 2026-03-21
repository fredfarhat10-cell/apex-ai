# Apex AI Assistant - Resources & Tools

## Development Tools

### Required Tools

#### 1. Code Editor: Visual Studio Code
- **Download:** https://code.visualstudio.com/
- **Why:** Best React/TypeScript support, extensive extensions

**Essential Extensions:**
\`\`\`
- Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
- Prettier - Code formatter (esbenp.prettier-vscode)
- ESLint (dbaeumer.vscode-eslint)
- Auto Rename Tag (formulahendry.auto-rename-tag)
- Path Intellisense (christian-kohler.path-intellisense)
- GitLens (eamodio.gitlens)
- Error Lens (usernamehw.errorlens)
\`\`\`

**VS Code Settings (settings.json):**
\`\`\`json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\$$([^)]*)\$$", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\$$([^)]*)\$$", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
\`\`\`

#### 2. Browser: Google Chrome
- **Download:** https://www.google.com/chrome/
- **Why:** Best DevTools, Lighthouse, React DevTools

**Essential Chrome Extensions:**
\`\`\`
- React Developer Tools
- Redux DevTools (if using Redux)
- Lighthouse
- Web Vitals
- ColorZilla (color picker)
- WhatFont (font identifier)
\`\`\`

#### 3. Node.js & npm
- **Download:** https://nodejs.org/ (LTS version)
- **Version Required:** Node 18+ 
- **Check Installation:**
\`\`\`bash
node --version  # Should be v18.x.x or higher
npm --version   # Should be 9.x.x or higher
\`\`\`

---

## API Services & Accounts

### 1. Gemini API (Google AI)
- **Sign Up:** https://makersuite.google.com/app/apikey
- **Free Tier:** 60 requests per minute
- **Cost:** Free for development
- **Setup:**
  1. Go to Google AI Studio
  2. Click "Get API Key"
  3. Create new API key
  4. Copy key to `.env.local` as `GEMINI_API_KEY`

**Documentation:**
- API Reference: https://ai.google.dev/docs
- Pricing: https://ai.google.dev/pricing

### 2. Supabase (Optional - For Future DB)
- **Sign Up:** https://supabase.com/
- **Free Tier:** 500MB database, 2GB bandwidth
- **Cost:** Free for hobby projects
- **Use Case:** If you want to add cloud sync later

**Setup:**
1. Create new project
2. Get project URL and anon key
3. Add to `.env.local`:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
\`\`\`

### 3. Vercel (Deployment)
- **Sign Up:** https://vercel.com/
- **Free Tier:** Unlimited personal projects
- **Cost:** Free for hobby projects
- **Use Case:** Deploy your app to production

**Setup:**
1. Connect GitHub repository
2. Import project
3. Add environment variables
4. Deploy automatically on push

---

## Design Tools

### 1. Figma (UI Design & Prototyping)
- **Sign Up:** https://www.figma.com/
- **Free Tier:** 3 Figma files, unlimited drafts
- **Cost:** Free for individuals
- **Use Case:** Design mockups, create prototypes

**Useful Figma Plugins:**
\`\`\`
- Iconify (icon library)
- Unsplash (stock photos)
- Color Palettes (color schemes)
- Stark (accessibility checker)
\`\`\`

### 2. Excalidraw (Quick Sketches)
- **URL:** https://excalidraw.com/
- **Cost:** Free
- **Use Case:** Quick wireframes, flow diagrams

### 3. Color Tools
- **Coolors:** https://coolors.co/ (color palette generator)
- **Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **Color Hunt:** https://colorhunt.co/ (curated palettes)

### 4. Font Tools
- **Google Fonts:** https://fonts.google.com/
- **Font Pair:** https://www.fontpair.co/ (font combinations)
- **Type Scale:** https://typescale.com/ (typography calculator)

---

## Learning Resources

### Jarvis UI Inspirations

#### YouTube Tutorials
1. **Fireship - "I built a Jarvis AI"**
   - URL: https://www.youtube.com/c/Fireship
   - Topics: Holographic effects, futuristic UI

2. **DesignCourse - "Futuristic UI Design"**
   - URL: https://www.youtube.com/c/DesignCourse
   - Topics: Sci-fi interfaces, glassmorphism

3. **Online Tutorials - "Iron Man Jarvis Interface"**
   - Search: "Jarvis UI tutorial React"
   - Topics: Particle effects, 3D elements

#### CodePen Examples
- Search: "Jarvis UI", "Holographic interface", "Futuristic dashboard"
- URL: https://codepen.io/search/pens?q=jarvis+ui

### React & Next.js

#### Official Documentation
- **React Docs:** https://react.dev/
- **Next.js Docs:** https://nextjs.org/docs
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/

#### Video Courses
1. **Next.js 14 Full Course** (YouTube - freeCodeCamp)
2. **React Three Fiber Tutorial** (YouTube - Wawa Sensei)
3. **Framer Motion Crash Course** (YouTube - Traversy Media)

### Tailwind CSS

#### Documentation
- **Tailwind Docs:** https://tailwindcss.com/docs
- **Tailwind UI:** https://tailwindui.com/ (paid components)
- **Headless UI:** https://headlessui.com/ (free components)

#### Video Tutorials
- **Tailwind Labs YouTube:** https://www.youtube.com/c/TailwindLabs
- **Tailwind CSS Crash Course** (Traversy Media)

### 3D Graphics (React Three Fiber)

#### Documentation
- **Three.js Docs:** https://threejs.org/docs/
- **React Three Fiber:** https://docs.pmnd.rs/react-three-fiber/
- **Drei (helpers):** https://github.com/pmndrs/drei

#### Tutorials
- **Three.js Journey:** https://threejs-journey.com/ (paid course)
- **React Three Fiber Basics** (YouTube - Wawa Sensei)

### Animation (Framer Motion)

#### Documentation
- **Framer Motion Docs:** https://www.framer.com/motion/

#### Examples
- **Framer Motion Examples:** https://www.framer.com/motion/examples/

---

## Testing & Debugging Tools

### Performance Testing
1. **Google Lighthouse**
   - Built into Chrome DevTools
   - Run: DevTools → Lighthouse tab → Generate report

2. **WebPageTest**
   - URL: https://www.webpagetest.org/
   - Detailed performance analysis

3. **Bundle Analyzer**
   \`\`\`bash
   npm install --save-dev @next/bundle-analyzer
   \`\`\`

### Accessibility Testing
1. **axe DevTools**
   - Chrome Extension
   - Automated accessibility testing

2. **WAVE**
   - URL: https://wave.webaim.org/
   - Web accessibility evaluation

3. **Screen Reader Testing**
   - macOS: VoiceOver (Cmd+F5)
   - Windows: NVDA (free)

### Browser Testing
1. **BrowserStack**
   - URL: https://www.browserstack.com/
   - Free for open source

2. **Chrome DevTools Device Mode**
   - Test responsive design
   - Simulate mobile devices

---

## Inspiration & References

### UI/UX Inspiration
- **Dribbble:** https://dribbble.com/ (search "futuristic dashboard")
- **Behance:** https://www.behance.net/ (search "AI interface")
- **Awwwards:** https://www.awwwards.com/ (award-winning sites)
- **Mobbin:** https://mobbin.com/ (mobile app designs)

### Sci-Fi UI References
- **Iron Man Jarvis Interface** (movie screenshots)
- **Cyberpunk 2077 UI** (game interface)
- **Blade Runner 2049** (holographic interfaces)
- **Minority Report** (gesture interfaces)

### Code Examples
- **GitHub:** Search "jarvis ui react"
- **CodeSandbox:** https://codesandbox.io/ (search "futuristic dashboard")
- **StackBlitz:** https://stackblitz.com/ (search "next.js dashboard")

---

## Community & Support

### Forums & Communities
- **Stack Overflow:** https://stackoverflow.com/
- **Reddit r/reactjs:** https://www.reddit.com/r/reactjs/
- **Reddit r/nextjs:** https://www.reddit.com/r/nextjs/
- **Discord - Reactiflux:** https://www.reactiflux.com/

### AI Development
- **Reddit r/LocalLLaMA:** https://www.reddit.com/r/LocalLLaMA/
- **Hugging Face Forums:** https://discuss.huggingface.co/

---

## Recommended Setup Workflow

### Day 1: Environment Setup
1. ✅ Install VS Code + extensions
2. ✅ Install Node.js (v18+)
3. ✅ Install Chrome + DevTools extensions
4. ✅ Sign up for Gemini API
5. ✅ Clone/download project
6. ✅ Run `npm install`
7. ✅ Create `.env.local` with API key
8. ✅ Run `npm run dev`

### Day 2: Familiarization
1. ✅ Watch Fireship Jarvis tutorial
2. ✅ Browse Dribbble for inspiration
3. ✅ Read React Three Fiber docs
4. ✅ Experiment with Framer Motion examples
5. ✅ Review Tailwind CSS documentation

### Day 3: Development
1. ✅ Start building features
2. ✅ Test in Chrome DevTools
3. ✅ Run Lighthouse audits
4. ✅ Check accessibility with axe
5. ✅ Iterate based on feedback

---

## Quick Reference Links

### Documentation
- [React](https://react.dev/) | [Next.js](https://nextjs.org/docs) | [TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs) | [Framer Motion](https://www.framer.com/motion/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)

### APIs
- [Gemini API](https://ai.google.dev/docs) | [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

### Tools
- [VS Code](https://code.visualstudio.com/) | [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) | [Figma](https://www.figma.com/)

### Inspiration
- [Dribbble](https://dribbble.com/) | [Awwwards](https://www.awwwards.com/) | [CodePen](https://codepen.io/)

---

*Bookmark this page for quick access to all resources during development!*
