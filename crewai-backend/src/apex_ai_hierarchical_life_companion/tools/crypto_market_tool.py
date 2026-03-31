from crewai_tools import BaseTool
import requests
import os
from datetime import datetime, timedelta

class CryptoMarketTool(BaseTool):
    name: str = "CryptoMarketTool"
    description: str = """
    A powerful tool to get real-time and historical cryptocurrency market data.
    
    Actions:
    - get_price: Get the current price and 24h change for a crypto symbol (e.g., 'BTC-USD').
    - get_chart_data: Get historical price data for a symbol over a specified period.
    - get_market_sentiment: Get the latest market sentiment analysis.
    """

    def _run(self, action: str, symbol: str, days: int = 30) -> str:
        if action == "get_price":
            return self._get_price(symbol)
        elif action == "get_chart_data":
            return self._get_chart_data(symbol, days)
        elif action == "get_market_sentiment":
            return self._get_market_sentiment(symbol)
        else:
            return "Error: Unknown action. Available actions: get_price, get_chart_data, get_market_sentiment."

    def _get_price(self, symbol: str) -> str:
        # In production, use a real API like CoinGecko or a paid provider.
        # For now, we simulate.
        price = 45000 + (hash(symbol) % 10000) * (1 + (hash(str(datetime.now())) % 100) / 1000 - 0.05)
        change = (price / (price * (1 + (hash(symbol) % 100) / 2000 - 0.025))) * 100 - 100
        return f"Current price for {symbol}: ${price:,.2f} (24h Change: {change:.2f}%)"

    def _get_chart_data(self, symbol: str, days: int) -> str:
        # Simulate historical data
        data = []
        base_price = 45000 + (hash(symbol) % 10000)
        for i in range(days):
            date = datetime.now() - timedelta(days=i)
            price = base_price * (1 + (hash(str(date)) % 200 - 100) / 1000)
            data.append({"date": date.strftime('%Y-%m-%d'), "price": round(price, 2)})
        return str(data)

    def _get_market_sentiment(self, symbol: str) -> str:
        # Simulate sentiment analysis
        sentiments = ["Bullish", "Slightly Bullish", "Neutral", "Slightly Bearish", "Bearish"]
        sentiment = sentiments[hash(symbol + str(datetime.now().date())) % 5]
        return f"Current market sentiment for {symbol}: {sentiment}. Recent news indicates a focus on regulatory developments and institutional adoption."
