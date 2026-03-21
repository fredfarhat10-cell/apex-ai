#!/usr/bin/env python3
"""
Start the Apex AI CrewAI Backend Server
"""
import os
import uvicorn
from src.apex_ai_hierarchical_life_companion.api.server import app

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    
    print("🚀 Starting Apex AI CrewAI Backend Server...")
    print(f"📍 Server running at: http://0.0.0.0:{port}")
    print(f"📚 API docs available at: http://0.0.0.0:{port}/docs")
    
    uvicorn.run(app, host="0.0.0.0", port=port)
