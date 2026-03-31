# Apex AI CrewAI Backend

This FastAPI backend powers all AI agent features in the Apex AI application, including financial analysis, travel planning, career guidance, and voice command execution.

## Features

- **Alpha Brief Research Engine**: 60-second investment research reports
- **Daily Optimal Path**: Morning briefings with resource audits and priority recommendations
- **Mentorship Facilitation**: Connect users with expert mentors
- **Travel Planning**: Personalized getaway itineraries
- **Career Strategy**: Quarterly career reviews and 90-day action plans
- **Weekly Sync**: Comprehensive weekly planning sessions
- **Voice Commands**: Natural language command execution
- **Proactive Logistics**: Travel time monitoring and ride booking

## Setup

1. Install dependencies:
\`\`\`bash
cd crewai-backend
poetry install
\`\`\`

2. Set up environment variables:
\`\`\`bash
export OPENAI_API_KEY="your-openai-api-key"
export SERPER_API_KEY="your-serper-api-key"
export GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
export UBER_API_KEY="your-uber-api-key"
export SKYSCANNER_API_KEY="your-skyscanner-api-key"
export BOOKING_API_KEY="your-booking-api-key"
export VIATOR_API_KEY="your-viator-api-key"
export LINKEDIN_API_KEY="your-linkedin-api-key"
\`\`\`

3. Start the server:
\`\`\`bash
python start_server.py
\`\`\`

The server will run at `http://localhost:8000` with API docs at `http://localhost:8000/docs`.

## API Endpoints

- `POST /api/generate-brief` - Generate Alpha Brief for a stock ticker
- `POST /api/daily-path` - Generate Daily Optimal Path briefing
- `POST /api/mentorship` - Facilitate mentorship connection
- `POST /api/travel/plan` - Plan personalized getaway
- `POST /api/career/review` - Conduct quarterly career review
- `POST /api/weekly-sync` - Conduct weekly sync session
- `POST /api/voice-command` - Execute voice command
- `POST /api/logistics/check` - Check travel logistics
- `GET /health` - Health check endpoint

## Integration with Next.js Frontend

The Next.js app uses the `crewAIClient` from `lib/crewai-client.ts` to communicate with this backend. All API routes automatically fall back to mock data if the backend is unavailable.

## Agents

- **Apex Unified Brain Orchestrator**: Central Life OS coordinator
- **Jarvis Financial Intelligence Specialist**: Investment research and analysis
- **Market Data Analyst**: Technical and fundamental data gathering
- **News Sentiment Analyst**: News monitoring and sentiment analysis
- **Health & Wellness Coach**: Energy level analysis and wellness guidance
- **Immersive Experience Architect**: Motivational narrative crafting
- **Emotional Intelligence Engine**: Empathetic communication and connection facilitation
- **Real-Time Intelligence Nerve Center**: Schedule monitoring and route calculation
- **Hyper-Responsive Action Executor**: Instant action execution and booking
- **Jarvis Career Strategist**: Professional growth and career guidance
- **Jarvis Daily Intelligence Coordinator**: Daily planning and travel research

## Development

Run tests:
\`\`\`bash
poetry run pytest
\`\`\`

Run with auto-reload:
\`\`\`bash
uvicorn src.apex_ai_hierarchical_life_companion.api.server:app --reload
\`\`\`

## Production Deployment

For production, use a production-grade ASGI server:
\`\`\`bash
gunicorn src.apex_ai_hierarchical_life_companion.api.server:app -w 4 -k uvicorn.workers.UvicornWorker
