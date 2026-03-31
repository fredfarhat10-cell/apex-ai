from crewai.tools import BaseTool
from typing import Type, Optional, Dict, Any, List
from pydantic import BaseModel, Field
import requests
import os


class ViatorSearchInput(BaseModel):
    """Input schema for Viator activity search."""
    destination: str = Field(..., description="City or location name (e.g., 'Paris', 'Tokyo')")
    interest_keywords: Optional[List[str]] = Field(None, description="Activity interests (e.g., ['food', 'adventure', 'culture'])")
    max_price: Optional[float] = Field(None, description="Maximum price per person in USD")
    min_rating: Optional[float] = Field(None, description="Minimum rating (0-5)")


class ViatorTool(BaseTool):
    name: str = "Viator Activity Search"
    description: str = (
        "Finds local tours, activities, camps, and experiences at a destination. "
        "Returns activity details including name, description, price, duration, rating, and booking links. "
        "Use this to help users discover exciting things to do during their travels."
    )
    args_schema: Type[BaseModel] = ViatorSearchInput

    def _run(
        self,
        destination: str,
        interest_keywords: Optional[List[str]] = None,
        max_price: Optional[float] = None,
        min_rating: Optional[float] = None
    ) -> str:
        """
        Search for activities and experiences using Viator API.
        
        Args:
            destination: City or location name
            interest_keywords: Activity interest keywords
            max_price: Maximum price per person filter
            min_rating: Minimum rating filter
            
        Returns:
            Formatted string with activity options
        """
        try:
            api_key = os.getenv("VIATOR_API_KEY")
            if not api_key:
                return "Error: VIATOR_API_KEY not configured. Please add it to environment variables."

            # Viator RapidAPI endpoint
            url = "https://viator-api.p.rapidapi.com/search"
            
            headers = {
                "X-RapidAPI-Key": api_key,
                "X-RapidAPI-Host": "viator-api.p.rapidapi.com"
            }
            
            params = {
                "destination": destination,
                "currency": "USD",
                "sortOrder": "RATING"
            }
            
            # Add search keywords
            if interest_keywords:
                params["searchTerm"] = " ".join(interest_keywords)
            
            response = requests.get(url, headers=headers, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            # Parse and format results
            return self._format_activity_results(data, destination, max_price, min_rating)
            
        except requests.exceptions.RequestException as e:
            return f"Error searching activities: {str(e)}"
        except Exception as e:
            return f"Unexpected error: {str(e)}"

    def _format_activity_results(
        self, 
        data: Dict[str, Any], 
        destination: str,
        max_price: Optional[float],
        min_rating: Optional[float]
    ) -> str:
        """Format activity search results into readable text."""
        try:
            products = data.get("products", [])
            if not products:
                return f"No activities found in {destination}."
            
            # Filter by price and rating
            filtered_products = []
            for product in products:
                price = product.get("pricing", {}).get("summary", {}).get("fromPrice", 0)
                if max_price and price > max_price:
                    continue
                
                rating = product.get("reviews", {}).get("combinedAverageRating", 0)
                if min_rating and rating < min_rating:
                    continue
                
                filtered_products.append(product)
            
            if not filtered_products:
                return f"No activities found matching your criteria in {destination}."
            
            formatted = f"Found {len(filtered_products)} activities in {destination}:\n\n"
            
            # Show top 5 options
            for i, product in enumerate(filtered_products[:5], 1):
                title = product.get("title", "Unknown Activity")
                price = product.get("pricing", {}).get("summary", {}).get("fromPrice", 0)
                rating = product.get("reviews", {}).get("combinedAverageRating", 0)
                review_count = product.get("reviews", {}).get("totalReviews", 0)
                duration = product.get("duration", {}).get("fixedDurationInMinutes", 0)
                description = product.get("description", "")[:200]
                
                formatted += f"Option {i}: {title}\n"
                formatted += f"  Price: From ${price:.2f} per person\n"
                formatted += f"  Rating: {rating}/5 ({review_count} reviews)\n"
                
                if duration:
                    hours = duration // 60
                    mins = duration % 60
                    formatted += f"  Duration: {hours}h {mins}m\n"
                
                formatted += f"  Description: {description}...\n"
                formatted += "\n"
            
            return formatted
            
        except Exception as e:
            return f"Error formatting results: {str(e)}"
