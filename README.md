# Apex AI - Hierarchical Life Companion

> Your AI-powered life operating system that orchestrates your time, money, energy, and goals into a cohesive strategy for success.

## Overview

Apex AI is a next-generation personal AI assistant that goes beyond simple task management. It's a hierarchical multi-agent system powered by CrewAI that acts as your:

- **Financial Intelligence Specialist** (Jarvis) - Investment research, budget tracking, financial planning
- **Life OS Orchestrator** - Daily optimal path generation, resource management
- **Travel Planner** - Personalized itineraries, booking assistance
- **Career Strategist** - Professional development, networking, skill gap analysis
- **Health & Wellness Coach** - Energy forecasting, recovery optimization
- **Proactive Intelligence** - Lateness prevention, smart notifications
- **Mentorship Facilitator** - Expert matching, anonymous guidance

## Key Features

### 1. Voice-First Interface
Natural language voice commands for hands-free interaction with your AI companion.

### 2. Financial Intelligence (Jarvis)
- Generate comprehensive Alpha Briefs for stock analysis
- Track budgets and spending patterns
- Verify travel plans against financial goals
- Real-time financial health monitoring

### 3. Life OS (Daily Optimal Path)
- Morning briefings with resource audit (Time, Money, Energy)
- Priority #1 recommendation for maximum impact
- Quest tracking and progress monitoring
- Motivational narratives connecting daily actions to long-term vision

### 4. Proactive Intelligence
- Automatic lateness risk detection
- Smart travel time calculations
- Emergency ride booking
- Calendar-aware notifications

### 5. Travel Planning
- Personalized itinerary generation
- Budget-conscious recommendations
- Flight, hotel, and activity booking
- Day-by-day schedules with cost breakdowns

### 6. Weekly Sync Sessions
- After-action review of past week
- Resource readiness audit
- Optimal week blueprint with theme days
- Automatic calendar and task population

### 7. Adaptive Memory System
- Learns from every interaction
- Stores preferences, patterns, and feedback
- Semantic search for relevant memories
- Continuous personalization

### 8. Career Strategy
- Quarterly career reviews
- Skill gap analysis
- Networking opportunity identification
- Professional capital audit

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context
- **Animations**: Framer Motion

### Backend
- **AI Framework**: CrewAI (Hierarchical Multi-Agent System)
- **Language**: Python 3.9+
- **LLM**: OpenAI GPT-4 / Gemini
- **Vector Store**: Local (e.g., ChromaDB) or cloud-based

### Integrations
- **Calendar**: Google Calendar API
- **Financial**: Plaid API
- **Professional**: LinkedIn API, Notion API
- **And more...**

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.9+ and pip/poetry
- Git
- An OpenAI API Key

### Installation & Setup

1. **Clone the repository:**
    \`\`\`bash
    git clone https://github.com/yourusername/apex-ai.git
    cd apex-ai
    \`\`\`

2. **Configure Environment Variables (Crucial Step):**
    * Duplicate the `.env.example` file in the root directory.
    * Rename the copy to `.env.local`.
    * Follow the detailed instructions in **[SETUP_GUIDE.md](docs/SETUP_GUIDE.md)** to obtain the necessary API keys and fill in the values in your `.env.local` file.

3. **Install Frontend Dependencies:**
    \`\`\`bash
    npm install
    \`\`\`

4. **Install Backend Dependencies:**
    \`\`\`bash
    cd crewai-backend
    pip install -r requirements.txt
    cd ..
    \`\`\`

5. **Run the CrewAI Backend:**
    \`\`\`bash
    cd crewai-backend
    python src/apex_ai_hierarchical_life_companion/main.py
    \`\`\`
    *This will start the backend server, typically on `http://localhost:8000`.*

6. **Run the Next.js Frontend:**
    *In a new terminal window:*
    \`\`\`bash
    npm run dev
    \`\`\`
    *This will start the frontend server on `http://localhost:3000`.*

7. **Open Your Browser:**
    Navigate to `http://localhost:3000`. The application will perform a runtime check to ensure your environment variables are configured correctly.

## Project Structure

\`\`\`
apex-ai/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API routes
│   ├── dashboard/                # Dashboard pages
│   ├── goals/                    # Goal tracking
│   ├── travel/                   # Travel planning
│   └── ...
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── dashboard/                # Dashboard components
│   ├── goals/                    # Goal components
│   └── ...
├── lib/                          # Utility libraries
│   ├── types/                    # TypeScript types
│   ├── adaptive-memory.ts        # Memory system
│   ├── voice-generator.ts        # Voice personality
│   └── ...
├── crewai-backend/               # Python CrewAI backend
│   └── src/
│       └── apex_ai_hierarchical_life_companion/
│           ├── config/           # Agent & task configs
│           ├── tools/            # Custom tools
│           └── crew.py           # Main crew definition
├── docs/                         # Documentation
│   ├── VOICE_PERSONALITY.md      # Voice guidelines
│   ├── DESIGN_SYSTEM.md          # Design system
│   ├── FEATURE_VALIDATION.md     # Validation checklist
│   └── ...
└── scripts/                      # Database scripts
\`\`\`

## Documentation

- [Voice Personality Guide](docs/VOICE_PERSONALITY.md)
- [Design System](docs/DESIGN_SYSTEM.md)
- [Feature Validation](docs/FEATURE_VALIDATION.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Edge Cases & Testing](docs/EDGE_CASES.md)
- [Test Plan](docs/TEST_PLAN.md)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## Support

- **Documentation**: `/docs`
- **Issues**: [GitHub Issues](https://github.com/yourusername/apex-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/apex-ai/discussions)

## Acknowledgments

- Built with [CrewAI](https://www.crewai.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Powered by [OpenAI](https://openai.com/)
- Hosted on [Vercel](https://vercel.com/)

---

**Made with ❤️ by the Apex AI Team**
