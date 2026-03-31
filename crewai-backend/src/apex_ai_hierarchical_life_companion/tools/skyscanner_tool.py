from crewai.tools import BaseTool
from typing import Type, Optional, Dict, Any, List
from pydantic import BaseModel, Field
import requests
import os
from datetime import datetime


class SkyscannerSearchInput(BaseModel):
    """Input schema for Skyscanner flight search."""
    origin: str = Field(..., description="Origin airport code (e.g., 'LAX', 'JFK')")
    destination: str = Field(..., description="Destination airport code (e.g., 'LHR', 'CDG')")
    start_date: str = Field(..., description="Departure date in YYYY-MM-DD format")
    end_date: Optional[str] = Field(None, description="Return date in YYYY-MM-DD format (for round trips)")
    adults: int = Field(1, description="Number of adult passengers")
    cabin_class: str = Field("economy", description="Cabin class: economy, premium_economy, business, first")


class SkyscannerTool(BaseTool):
    name: str = "Skyscanner Flight Search"
    description: str = (
        "Finds the best flight options between two destinations for given dates. "
        "Returns flight details including price, duration, layovers, airlines, and departure/arrival times. "
        "Use this to help users find affordable and convenient flights for their travel plans."
    )
    args_schema: Type[BaseModel] = SkyscannerSearchInput

    def _run(
        self,
        origin: str,
        destination: str,
        start_date: str,
        end_date: Optional[str] = None,
        adults: int = 1,
        cabin_class: str = "economy"
    ) -> str:
        """
        Search for flights using Skyscanner API.
        
        Args:
            origin: Origin airport code
            destination: Destination airport code
            start_date: Departure date (YYYY-MM-DD)
            end_date: Return date (YYYY-MM-DD) for round trips
            adults: Number of adult passengers
            cabin_class: Cabin class preference
            
        Returns:
            Formatted string with flight options
        """
        try:
            api_key = os.getenv("SKYSCANNER_API_KEY")
            if not api_key:
                return "Error: SKYSCANNER_API_KEY not configured. Please add it to environment variables."

            # Skyscanner RapidAPI endpoint
            url = "https://skyscanner-api.p.rapidapi.com/v3/flights/live/search/create"
            
            headers = {
                "X-RapidAPI-Key": api_key,
                "X-RapidAPI-Host": "skyscanner-api.p.rapidapi.com",
                "Content-Type": "application/json"
            }
            
            # Build query
            query = {
                "query": {
                    "market": "US",
                    "locale": "en-US",
                    "currency": "USD",
                    "adults": adults,
                    "cabinClass": cabin_class.upper(),
                    "queryLegs": [
                        {
                            "originPlaceId": {"iata": origin.upper()},
                            "destinationPlaceId": {"iata": destination.upper()},
                            "date": {"year": int(start_date[:4]), "month": int(start_date[5:7]), "day": int(start_date[8:10])}
                        }
                    ]
                }
            }
            
            # Add return leg if round trip
            if end_date:
                query["query"]["queryLegs"].append({
                    "originPlaceId": {"iata": destination.upper()},
                    "destinationPlaceId": {"iata": origin.upper()},
                    "date": {"year": int(end_date[:4]), "month": int(end_date[5:7]), "day": int(end_date[8:10])}
                })
            
            response = requests.post(url, json=query, headers=headers, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            # Parse and format results
            return self._format_flight_results(data, origin, destination)
            
        except requests.exceptions.RequestException as e:
            return f"Error searching flights: {str(e)}"
        except Exception as e:
            return f"Unexpected error: {str(e)}"

    def _format_flight_results(self, data: Dict[str, Any], origin: str, destination: str) -> str:
        """Format flight search results into readable text."""
        try:
            if not data.get("content", {}).get("results", {}).get("itineraries"):
                return f"No flights found from {origin} to {destination} for the specified dates."
            
            itineraries = data["content"]["results"]["itineraries"]
            formatted = f"Found {len(itineraries)} flight options from {origin} to {destination}:\n\n"
            
            # Show top 5 options
            for i, itinerary in enumerate(itineraries[:5], 1):
                price = itinerary.get("pricingOptions", [{}])[0].get("price", {}).get("amount", "N/A")
                legs = itinerary.get("legs", [])
                
                formatted += f"Option {i}: ${price}\n"
                
                for leg_idx, leg in enumerate(legs, 1):
                    duration_mins = leg.get("durationInMinutes", 0)
                    hours = duration_mins // 60
                    mins = duration_mins % 60
                    stops = leg.get("stopCount", 0)
                    carriers = ", ".join([c.get("name", "Unknown") for c in leg.get("carriers", {}).get("marketing", [])])
                    
                    departure = leg.get("departure", "")
                    arrival = leg.get("arrival", "")
                    
                    formatted += f"  Leg {leg_idx}: {hours}h {mins}m, {stops} stop(s), {carriers}\n"
                    formatted += f"  Departs: {departure} | Arrives: {arrival}\n"
                
                formatted += "\n"
            
            return formatted
            
        except Exception as e:
            return f"Error formatting results: {str(e)}"
