from crewai.tools import BaseTool
from typing import Type, Optional, Dict, Any, List
from pydantic import BaseModel, Field
import requests
import os


class BookingSearchInput(BaseModel):
    """Input schema for Booking.com hotel search."""
    destination: str = Field(..., description="City or location name (e.g., 'Paris', 'New York')")
    start_date: str = Field(..., description="Check-in date in YYYY-MM-DD format")
    end_date: str = Field(..., description="Check-out date in YYYY-MM-DD format")
    adults: int = Field(2, description="Number of adult guests")
    min_rating: Optional[float] = Field(None, description="Minimum guest rating (0-10)")
    max_price: Optional[float] = Field(None, description="Maximum price per night in USD")
    amenities: Optional[List[str]] = Field(None, description="Required amenities (e.g., ['wifi', 'pool', 'pet-friendly'])")


class BookingTool(BaseTool):
    name: str = "Booking.com Hotel Search"
    description: str = (
        "Searches for hotels, resorts, and accommodations based on location, dates, budget, rating, and amenities. "
        "Returns hotel details including name, price, rating, amenities, and booking links. "
        "Use this to find the perfect accommodation for users' travel plans."
    )
    args_schema: Type[BaseModel] = BookingSearchInput

    def _run(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        adults: int = 2,
        min_rating: Optional[float] = None,
        max_price: Optional[float] = None,
        amenities: Optional[List[str]] = None
    ) -> str:
        """
        Search for hotels using Booking.com API.
        
        Args:
            destination: City or location name
            start_date: Check-in date (YYYY-MM-DD)
            end_date: Check-out date (YYYY-MM-DD)
            adults: Number of adult guests
            min_rating: Minimum guest rating filter
            max_price: Maximum price per night filter
            amenities: Required amenities list
            
        Returns:
            Formatted string with hotel options
        """
        try:
            api_key = os.getenv("BOOKING_API_KEY")
            if not api_key:
                return "Error: BOOKING_API_KEY not configured. Please add it to environment variables."

            # Booking.com RapidAPI endpoint
            url = "https://booking-com.p.rapidapi.com/v1/hotels/search"
            
            headers = {
                "X-RapidAPI-Key": api_key,
                "X-RapidAPI-Host": "booking-com.p.rapidapi.com"
            }
            
            params = {
                "dest_type": "city",
                "dest_id": destination,
                "checkin_date": start_date,
                "checkout_date": end_date,
                "adults_number": adults,
                "order_by": "popularity",
                "units": "metric",
                "room_number": 1,
                "locale": "en-us",
                "currency": "USD"
            }
            
            # Add filters
            if min_rating:
                params["filter_by_currency"] = f"review_score={min_rating}"
            
            response = requests.get(url, headers=headers, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            # Parse and format results
            return self._format_hotel_results(data, destination, max_price, amenities)
            
        except requests.exceptions.RequestException as e:
            return f"Error searching hotels: {str(e)}"
        except Exception as e:
            return f"Unexpected error: {str(e)}"

    def _format_hotel_results(
        self, 
        data: Dict[str, Any], 
        destination: str,
        max_price: Optional[float],
        amenities: Optional[List[str]]
    ) -> str:
        """Format hotel search results into readable text."""
        try:
            results = data.get("result", [])
            if not results:
                return f"No hotels found in {destination} for the specified dates."
            
            # Filter by price and amenities
            filtered_results = []
            for hotel in results:
                price = hotel.get("min_total_price", 0)
                if max_price and price > max_price:
                    continue
                
                if amenities:
                    hotel_amenities = [f.lower() for f in hotel.get("hotel_facilities", [])]
                    if not all(a.lower() in hotel_amenities for a in amenities):
                        continue
                
                filtered_results.append(hotel)
            
            if not filtered_results:
                return f"No hotels found matching your criteria in {destination}."
            
            formatted = f"Found {len(filtered_results)} hotels in {destination}:\n\n"
            
            # Show top 5 options
            for i, hotel in enumerate(filtered_results[:5], 1):
                name = hotel.get("hotel_name", "Unknown Hotel")
                price = hotel.get("min_total_price", 0)
                rating = hotel.get("review_score", 0)
                review_count = hotel.get("review_nr", 0)
                address = hotel.get("address", "Address not available")
                
                formatted += f"Option {i}: {name}\n"
                formatted += f"  Price: ${price:.2f} total\n"
                formatted += f"  Rating: {rating}/10 ({review_count} reviews)\n"
                formatted += f"  Address: {address}\n"
                
                facilities = hotel.get("hotel_facilities", [])[:5]
                if facilities:
                    formatted += f"  Amenities: {', '.join(facilities)}\n"
                
                formatted += "\n"
            
            return formatted
            
        except Exception as e:
            return f"Error formatting results: {str(e)}"
