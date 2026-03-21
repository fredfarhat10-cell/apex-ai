from crewai.tools import BaseTool
from typing import Type, Optional, Dict, Any, List
from pydantic import BaseModel, Field
import os
import requests


class LinkedInToolInput(BaseModel):
    """Input schema for LinkedInTool."""
    action: str = Field(..., description="Action to perform: 'get_profile', 'search_jobs', 'get_connections', 'analyze_skills'")
    query: Optional[str] = Field(None, description="Search query for job searches or skill analysis")
    user_id: Optional[str] = Field(None, description="LinkedIn user ID for profile operations")


class LinkedInTool(BaseTool):
    name: str = "LinkedIn API Tool"
    description: str = (
        "Interacts with the LinkedIn API to analyze a user's profile, connections, "
        "and search for job descriptions or professionals with specific skills. "
        "Can retrieve profile data, analyze skill gaps, search for jobs, and identify networking opportunities."
    )
    args_schema: Type[BaseModel] = LinkedInToolInput

    def _run(self, action: str, query: Optional[str] = None, user_id: Optional[str] = None) -> str:
        """
        Execute LinkedIn API operations.
        
        Args:
            action: The action to perform (get_profile, search_jobs, get_connections, analyze_skills)
            query: Search query for jobs or skills
            user_id: LinkedIn user ID
            
        Returns:
            JSON string with the results
        """
        api_key = os.getenv("LINKEDIN_API_KEY")
        if not api_key:
            return "Error: LinkedIn API key not configured. Please set LINKEDIN_API_KEY environment variable."
        
        base_url = "https://api.linkedin.com/v2"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        try:
            if action == "get_profile":
                # Get user profile information
                response = requests.get(
                    f"{base_url}/me",
                    headers=headers,
                    params={"projection": "(id,firstName,lastName,headline,positions,skills)"}
                )
                response.raise_for_status()
                profile = response.json()
                
                return f"""
LinkedIn Profile Analysis:
- Name: {profile.get('firstName', '')} {profile.get('lastName', '')}
- Headline: {profile.get('headline', 'N/A')}
- Current Position: {profile.get('positions', {}).get('values', [{}])[0].get('title', 'N/A') if profile.get('positions') else 'N/A'}
- Skills: {', '.join([s.get('name', '') for s in profile.get('skills', {}).get('values', [])][:10])}
- Total Connections: {profile.get('numConnections', 0)}
"""
            
            elif action == "search_jobs":
                # Search for job postings
                response = requests.get(
                    f"{base_url}/jobSearch",
                    headers=headers,
                    params={
                        "keywords": query,
                        "count": 10
                    }
                )
                response.raise_for_status()
                jobs = response.json().get('elements', [])
                
                job_list = []
                for job in jobs[:5]:
                    job_list.append(f"- {job.get('title', 'N/A')} at {job.get('companyName', 'N/A')}")
                
                return f"Top Job Opportunities for '{query}':\n" + "\n".join(job_list)
            
            elif action == "get_connections":
                # Get user's connections
                response = requests.get(
                    f"{base_url}/connections",
                    headers=headers,
                    params={"count": 50}
                )
                response.raise_for_status()
                connections = response.json().get('elements', [])
                
                # Analyze connection industries and roles
                industries = {}
                roles = {}
                for conn in connections:
                    industry = conn.get('industry', 'Unknown')
                    role = conn.get('headline', 'Unknown')
                    industries[industry] = industries.get(industry, 0) + 1
                    roles[role] = roles.get(role, 0) + 1
                
                top_industries = sorted(industries.items(), key=lambda x: x[1], reverse=True)[:5]
                top_roles = sorted(roles.items(), key=lambda x: x[1], reverse=True)[:5]
                
                return f"""
Network Analysis:
- Total Connections: {len(connections)}
- Top Industries: {', '.join([f'{ind} ({count})' for ind, count in top_industries])}
- Common Roles: {', '.join([f'{role} ({count})' for role, count in top_roles])}
"""
            
            elif action == "analyze_skills":
                # Analyze skill gaps for a target role
                response = requests.get(
                    f"{base_url}/jobSearch",
                    headers=headers,
                    params={"keywords": query, "count": 5}
                )
                response.raise_for_status()
                jobs = response.json().get('elements', [])
                
                # Extract required skills from job postings
                required_skills = set()
                for job in jobs:
                    skills = job.get('skills', [])
                    required_skills.update([s.get('name', '') for s in skills])
                
                # Get user's current skills
                profile_response = requests.get(
                    f"{base_url}/me",
                    headers=headers,
                    params={"projection": "(skills)"}
                )
                profile_response.raise_for_status()
                user_skills = set([s.get('name', '') for s in profile_response.json().get('skills', {}).get('values', [])])
                
                # Identify gaps
                skill_gaps = required_skills - user_skills
                
                return f"""
Skill Gap Analysis for '{query}':
- Required Skills: {', '.join(list(required_skills)[:10])}
- Your Current Skills: {', '.join(list(user_skills)[:10])}
- Skill Gaps to Address: {', '.join(list(skill_gaps)[:5])}
"""
            
            else:
                return f"Error: Unknown action '{action}'. Supported actions: get_profile, search_jobs, get_connections, analyze_skills"
        
        except requests.exceptions.RequestException as e:
            return f"Error calling LinkedIn API: {str(e)}"
        except Exception as e:
            return f"Error: {str(e)}"
