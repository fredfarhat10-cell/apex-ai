from crewai.tools import BaseTool
from typing import Type, Optional
from pydantic import BaseModel, Field
import os
import requests


class MapsTravelInput(BaseModel):
    """Input schema for MapsTool."""
    origin: str = Field(..., description="Starting location (address or coordinates)")
    destination: str = Field(..., description="Destination location (address or coordinates)")
    mode: str = Field(default="driving", description="Travel mode: driving, transit, walking, bicycling")


class MapsTool(BaseTool):
    name: str = "Calculate Travel Time"
    description: str = (
        "Calculates travel time between two locations using various transportation modes. "
        "Returns estimated duration, distance, and real-time traffic conditions. "
        "Supports driving, transit (public transport), walking, and bicycling."
    )
    args_schema: Type[BaseModel] = MapsTravelInput

    def _run(self, origin: str, destination: str, mode: str = "driving") -> str:
        """
        Calculate travel time using Google Maps Directions API.
        
        Args:
            origin: Starting location
            destination: Destination location
            mode: Travel mode (driving, transit, walking, bicycling)
        
        Returns:
            Formatted string with travel time, distance, and route details
        """
        api_key = os.getenv("GOOGLE_MAPS_API_KEY")
        
        if not api_key:
            return "Error: Google Maps API key not configured. Please set GOOGLE_MAPS_API_KEY environment variable."
        
        # Google Maps Directions API endpoint
        url = "https://maps.googleapis.com/maps/api/directions/json"
        
        params = {
            "origin": origin,
            "destination": destination,
            "mode": mode,
            "departure_time": "now",  # For real-time traffic
            "key": api_key
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data["status"] != "OK":
                return f"Error calculating route: {data.get('error_message', data['status'])}"
            
            # Extract route information
            route = data["routes"][0]
            leg = route["legs"][0]
            
            duration = leg["duration"]["text"]
            duration_value = leg["duration"]["value"]  # in seconds
            distance = leg["distance"]["text"]
            
            # Check for traffic delays (if available)
            traffic_info = ""
            if "duration_in_traffic" in leg:
                traffic_duration = leg["duration_in_traffic"]["text"]
                traffic_value = leg["duration_in_traffic"]["value"]
                delay = (traffic_value - duration_value) / 60  # delay in minutes
                
                if delay > 5:
                    traffic_info = f"\n⚠️ Traffic Alert: Current traffic adds {int(delay)} minutes. Estimated time with traffic: {traffic_duration}"
            
            # Format the response
            result = f"""
Travel Time Analysis:
📍 From: {leg['start_address']}
📍 To: {leg['end_address']}
🚗 Mode: {mode.capitalize()}
⏱️ Duration: {duration} ({duration_value // 60} minutes)
📏 Distance: {distance}
{traffic_info}

Route Summary: {route['summary']}
"""
            
            return result.strip()
            
        except requests.RequestException as e:
            return f"Error connecting to Google Maps API: {str(e)}"
        except (KeyError, IndexError) as e:
            return f"Error parsing route data: {str(e)}"
