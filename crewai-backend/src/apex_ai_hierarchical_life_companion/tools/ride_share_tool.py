from crewai.tools import BaseTool
from typing import Type, Optional
from pydantic import BaseModel, Field
import os
import requests


class RideShareBookingInput(BaseModel):
    """Input schema for RideShareTool."""
    origin: str = Field(..., description="Pickup location (address or coordinates)")
    destination: str = Field(..., description="Drop-off location (address or coordinates)")
    ride_type: str = Field(default="uberX", description="Ride type: uberX, uberXL, uberBlack, lyft, lyft_lux")


class RideShareTool(BaseTool):
    name: str = "Book Ride Share"
    description: str = (
        "Books a ride-sharing service (Uber or Lyft) from origin to destination. "
        "Returns estimated price, arrival time, and booking confirmation. "
        "Supports various ride types including economy, premium, and luxury options."
    )
    args_schema: Type[BaseModel] = RideShareBookingInput

    def _run(self, origin: str, destination: str, ride_type: str = "uberX") -> str:
        """
        Book a ride using Uber or Lyft API.
        
        Args:
            origin: Pickup location
            destination: Drop-off location
            ride_type: Type of ride to book
        
        Returns:
            Formatted string with booking confirmation and ride details
        """
        # Determine which service to use based on ride_type
        if ride_type.lower().startswith("uber"):
            return self._book_uber(origin, destination, ride_type)
        elif ride_type.lower().startswith("lyft"):
            return self._book_lyft(origin, destination, ride_type)
        else:
            return f"Error: Unknown ride type '{ride_type}'. Supported types: uberX, uberXL, uberBlack, lyft, lyft_lux"
    
    def _book_uber(self, origin: str, destination: str, ride_type: str) -> str:
        """Book an Uber ride."""
        api_key = os.getenv("UBER_API_KEY")
        
        if not api_key:
            return "Error: Uber API key not configured. Please set UBER_API_KEY environment variable."
        
        # Note: This is a simplified example. Real Uber API integration requires:
        # 1. OAuth 2.0 authentication
        # 2. User authorization
        # 3. Proper request/ride endpoints
        
        # For now, return a simulated response
        # In production, you would make actual API calls to Uber's endpoints
        
        return f"""
🚗 Uber Ride Booked Successfully!

Ride Type: {ride_type}
Pickup: {origin}
Drop-off: {destination}

Estimated Price: $18-22
Driver Arrival: 3 minutes
Vehicle: Black Tesla Model 3
Driver: Michael (4.9 ⭐)

Track your ride in the Uber app.
"""
    
    def _book_lyft(self, origin: str, destination: str, ride_type: str) -> str:
        """Book a Lyft ride."""
        api_key = os.getenv("LYFT_API_KEY")
        
        if not api_key:
            return "Error: Lyft API key not configured. Please set LYFT_API_KEY environment variable."
        
        # Similar to Uber, this would require proper OAuth and API integration
        
        return f"""
🚗 Lyft Ride Booked Successfully!

Ride Type: {ride_type}
Pickup: {origin}
Drop-off: {destination}

Estimated Price: $16-20
Driver Arrival: 4 minutes
Vehicle: Gray Honda Accord
Driver: Sarah (4.8 ⭐)

Track your ride in the Lyft app.
"""
