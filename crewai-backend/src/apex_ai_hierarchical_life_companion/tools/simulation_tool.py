"""
SimulationTool - The Predictive Engine for Life Simulations

This tool uses advanced LLM capabilities to simulate probable future outcomes
based on comprehensive user context. It doesn't call external APIs but leverages
the core LLM to generate structured predictions about life decisions.
"""

from crewai_tools import BaseTool
from typing import Optional, Dict, Any
import json
import os
from openai import OpenAI


class SimulationTool(BaseTool):
    name: str = "Life Simulation Tool"
    description: str = (
        "Simulates probable future outcomes of major life decisions by analyzing "
        "comprehensive user context (finances, goals, time, energy, habits, etc.). "
        "Returns 3-5 structured 'Echo Paths' with probabilities, narratives, and key impacts. "
        "Use this when the user asks 'what if' questions about major life decisions."
    )

    def _run(
        self,
        decision_query: str,
        user_context: str,
        num_paths: int = 3
    ) -> str:
        """
        Run a life simulation based on a decision query and comprehensive user context.
        
        Args:
            decision_query: The decision or question to simulate (e.g., "What if I quit my job to start a business?")
            user_context: Comprehensive context about the user's current life state (finances, goals, time, energy, etc.)
            num_paths: Number of probable future paths to generate (default: 3, max: 5)
        
        Returns:
            A JSON string containing structured simulation results with multiple Echo Paths
        """
        try:
            # Initialize OpenAI client
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                return json.dumps({
                    "error": "OpenAI API key not configured",
                    "message": "Please set OPENAI_API_KEY in your environment variables"
                })
            
            client = OpenAI(api_key=api_key)
            
            # Construct the simulation prompt
            simulation_prompt = f"""You are the Apex Predictive Intelligence Core, an advanced AI system capable of simulating probable future outcomes based on comprehensive life data.

DECISION TO SIMULATE:
{decision_query}

COMPREHENSIVE USER CONTEXT:
{user_context}

YOUR MISSION:
Analyze this decision in the context of the user's complete life situation. Generate {num_paths} distinct, probable future paths ("Echo Paths") that could result from this decision. Each path should be realistic, grounded in the user's actual context, and account for both intended and unintended consequences.

For each Echo Path, provide:
1. **title**: A compelling 3-5 word name for this path
2. **probability**: A realistic probability percentage (0-100) based on the user's context
3. **narrative**: A 2-3 paragraph story describing how this path unfolds over the next 6-12 months
4. **key_impacts**: A list of 4-6 specific impacts across different life domains (financial, career, relationships, health, personal growth, time)

CRITICAL REQUIREMENTS:
- Be realistic and grounded in the user's actual situation
- Consider both positive and negative outcomes
- Account for second-order effects and unintended consequences
- Ensure probabilities add up to approximately 100%
- Make narratives specific and actionable, not generic
- Include concrete numbers and timelines where relevant

Return your response as a valid JSON object with this exact structure:
{{
    "decision": "The decision being simulated",
    "echo_paths": [
        {{
            "title": "Path name",
            "probability": 45,
            "narrative": "Detailed narrative...",
            "key_impacts": [
                {{"domain": "Financial", "impact": "Specific impact description"}},
                {{"domain": "Career", "impact": "Specific impact description"}},
                ...
            ]
        }},
        ...
    ],
    "recommendation": "A brief strategic recommendation based on the simulation",
    "confidence_level": "High/Medium/Low - your confidence in these predictions"
}}"""

            # Call GPT-4o for simulation
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": "You are the Apex Predictive Intelligence Core. You generate structured, realistic life simulations based on comprehensive user data."
                    },
                    {
                        "role": "user",
                        "content": simulation_prompt
                    }
                ],
                temperature=0.7,
                max_tokens=3000,
                response_format={"type": "json_object"}
            )
            
            # Extract and return the simulation results
            simulation_result = response.choices[0].message.content
            
            # Validate JSON structure
            parsed_result = json.loads(simulation_result)
            
            return json.dumps(parsed_result, indent=2)
            
        except json.JSONDecodeError as e:
            return json.dumps({
                "error": "Failed to parse simulation results",
                "message": f"JSON parsing error: {str(e)}"
            })
        except Exception as e:
            return json.dumps({
                "error": "Simulation failed",
                "message": f"Error: {str(e)}"
            })


# Export the tool for use in CrewAI
if __name__ == "__main__":
    # Test the tool
    tool = SimulationTool()
    test_result = tool._run(
        decision_query="Should I quit my job to start a business?",
        user_context="Age: 32, Savings: $50k, Current salary: $120k/year, Skills: Software engineering, Family: Married with 1 child, Goals: Financial independence by 45",
        num_paths=3
    )
    print(test_result)
