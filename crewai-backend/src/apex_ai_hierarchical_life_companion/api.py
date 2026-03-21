"""
FastAPI server for Apex AI Hierarchical Life Companion
Provides REST API endpoints for the CrewAI backend
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
from datetime import datetime
import json

from apex_ai_hierarchical_life_companion.crew import ApexAiHierarchicalLifeCompanion

app = FastAPI(
    title="Apex AI Hierarchical Life Companion API",
    description="Backend API for Apex AI system with NLU and task orchestration",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class ProcessNoteRequest(BaseModel):
    note: str
    user_id: str

class ActionPayload(BaseModel):
    pass  # Base class, specific payloads will vary

class Action(BaseModel):
    action_type: str
    payload: Dict[str, Any]

class ProcessNoteResponse(BaseModel):
    success: bool
    actions: List[Action]
    message: Optional[str] = None
    error: Optional[str] = None

class AlphaBriefRequest(BaseModel):
    ticker: str

class AlphaBriefResponse(BaseModel):
    success: bool
    ticker: str
    brief: Optional[str] = None
    error: Optional[str] = None

# Initialize the crew
crew_instance = None

def get_crew():
    """Lazy initialization of the crew"""
    global crew_instance
    if crew_instance is None:
        crew_instance = ApexAiHierarchicalLifeCompanion()
    return crew_instance

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "Apex AI Hierarchical Life Companion",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/process-note", response_model=ProcessNoteResponse)
async def process_note(request: ProcessNoteRequest):
    """
    Process an unstructured note using NLU to extract actionable items.
    
    This endpoint receives free-form text from the user and uses the
    process_unstructured_note task to parse it into structured actions.
    """
    try:
        if not request.note or not request.note.strip():
            raise HTTPException(status_code=400, detail="Note content is required")
        
        # Get the crew instance
        crew = get_crew()
        
        # Prepare inputs for the process_unstructured_note task
        inputs = {
            'note': request.note.strip(),
            'user_id': request.user_id
        }
        
        # Execute the task
        # Note: In a real implementation, you would create a specific crew
        # with just the process_unstructured_note task and the unified brain agent
        result = crew.crew().kickoff(inputs=inputs, task='process_unstructured_note')
        
        # Parse the result (should be JSON array of actions)
        try:
            actions_data = json.loads(str(result))
            actions = [Action(**action) for action in actions_data]
        except json.JSONDecodeError:
            # If the result is not valid JSON, return an error
            return ProcessNoteResponse(
                success=False,
                actions=[],
                error="Failed to parse NLU output as JSON"
            )
        
        return ProcessNoteResponse(
            success=True,
            actions=actions,
            message=f"Successfully processed {len(actions)} action(s)"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        return ProcessNoteResponse(
            success=False,
            actions=[],
            error=f"Error processing note: {str(e)}"
        )

@app.post("/api/alpha-brief", response_model=AlphaBriefResponse)
async def generate_alpha_brief(request: AlphaBriefRequest):
    """
    Generate an Alpha Brief for a given stock ticker.
    
    This endpoint uses the financial intelligence crew to analyze
    a stock and generate a comprehensive investment brief.
    """
    try:
        if not request.ticker:
            raise HTTPException(status_code=400, detail="Ticker is required")
        
        # Get the crew instance
        crew = get_crew()
        
        # Prepare inputs
        inputs = {
            'ticker': request.ticker.upper()
        }
        
        # Execute the crew
        result = crew.crew().kickoff(inputs=inputs)
        
        return AlphaBriefResponse(
            success=True,
            ticker=request.ticker.upper(),
            brief=str(result)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        return AlphaBriefResponse(
            success=False,
            ticker=request.ticker,
            error=f"Error generating Alpha Brief: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """Detailed health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "crew_initialized": crew_instance is not None
    }

def start_server(host: str = "0.0.0.0", port: int = 8000):
    """Start the FastAPI server"""
    uvicorn.run(app, host=host, port=port)

if __name__ == "__main__":
    start_server()
