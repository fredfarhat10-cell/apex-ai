from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uvicorn
from ..crew import ApexAiHierarchicalLifeCompanionCrew

app = FastAPI(title="Apex AI CrewAI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, you can restrict this to your Vercel URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class AlphaBriefRequest(BaseModel):
    userId: str
    ticker: str

class DailyPathRequest(BaseModel):
    userId: str

class MentorshipRequest(BaseModel):
    userId: str
    questId: str

class TravelRequest(BaseModel):
    userId: str
    destination: str
    budget: float
    dates: Dict[str, str]
    preferences: list[str]

class CareerReviewRequest(BaseModel):
    userId: str

class WeeklySyncRequest(BaseModel):
    userId: str

class VoiceCommandRequest(BaseModel):
    userId: str
    command: str
    intent: str
    entities: Dict[str, Any]

class LogisticsRequest(BaseModel):
    userId: str
    eventId: str

class MemoryProcessRequest(BaseModel):
    userId: str
    interactionType: str
    feedback: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

# Initialize crew
crew = ApexAiHierarchicalLifeCompanionCrew()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "apex-ai-crewai-backend"}

@app.post("/api/generate-brief")
async def generate_alpha_brief(request: AlphaBriefRequest):
    """Generate an Alpha Brief for a stock ticker"""
    try:
        inputs = {
            "user_id": request.userId,
            "ticker": request.ticker
        }
        result = crew.crew().kickoff(inputs=inputs)
        return {"success": True, "brief": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/daily-path")
async def generate_daily_path(request: DailyPathRequest):
    """Generate the Daily Optimal Path briefing"""
    try:
        inputs = {"user_id": request.userId}
        result = crew.crew().kickoff(inputs=inputs)
        return {"success": True, "briefing": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/mentorship")
async def facilitate_mentorship(request: MentorshipRequest):
    """Facilitate mentorship connection"""
    try:
        inputs = {
            "user_id": request.userId,
            "quest_id": request.questId
        }
        result = crew.crew().kickoff(inputs=inputs)
        return {"success": True, "connection": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/travel/plan")
async def plan_travel(request: TravelRequest):
    """Plan a personalized getaway"""
    try:
        inputs = {
            "user_id": request.userId,
            "destination": request.destination,
            "budget": request.budget,
            "dates": request.dates,
            "preferences": request.preferences
        }
        result = crew.crew().kickoff(inputs=inputs)
        return {"success": True, "itinerary": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/career/review")
async def conduct_career_review(request: CareerReviewRequest):
    """Conduct quarterly career review"""
    try:
        inputs = {"user_id": request.userId}
        result = crew.crew().kickoff(inputs=inputs)
        return {"success": True, "review": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/weekly-sync")
async def conduct_weekly_sync(request: WeeklySyncRequest):
    """Conduct weekly sync and strategy session"""
    try:
        inputs = {"user_id": request.userId}
        result = crew.crew().kickoff(inputs=inputs)
        return {"success": True, "session": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/voice-command")
async def execute_voice_command(request: VoiceCommandRequest):
    """Execute a voice command"""
    try:
        inputs = {
            "user_id": request.userId,
            "command": request.command,
            "intent": request.intent,
            "entities": request.entities
        }
        result = crew.crew().kickoff(inputs=inputs)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/logistics/check")
async def check_logistics(request: LogisticsRequest):
    """Check travel logistics and suggest solutions"""
    try:
        inputs = {
            "user_id": request.userId,
            "event_id": request.eventId
        }
        result = crew.crew().kickoff(inputs=inputs)
        return {"success": True, "recommendation": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/memory/process")
async def process_memory(request: MemoryProcessRequest):
    """Process user feedback and update adaptive memory"""
    try:
        inputs = {
            "user_id": request.userId,
            "interaction_type": request.interactionType,
            "feedback": request.feedback,
            "context": request.context or {}
        }
        
        # Trigger memory processing crew to extract learnings
        result = crew.crew().kickoff(inputs=inputs)
        
        return {
            "success": True,
            "message": "Memory processed successfully",
            "learnings_extracted": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
