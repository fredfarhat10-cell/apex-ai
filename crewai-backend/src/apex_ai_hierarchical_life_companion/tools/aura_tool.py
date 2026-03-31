from crewai_tools import BaseTool
from typing import Optional, Dict, Any
import os
from datetime import datetime, timedelta

class AuraTool(BaseTool):
    name: str = "Aura Inference Tool"
    description: str = """
    Analyzes multiple data sources to infer the user's current emotional and mental state (their "Aura").
    
    This tool examines:
    - Sleep quality and recovery scores
    - Calendar density and meeting load
    - Email sentiment and volume
    - Spending patterns and financial stress
    - Productivity metrics and task completion
    - Recent wellness data and energy levels
    
    Returns a comprehensive Aura profile with:
    - Primary mood state (Energized, Balanced, Stressed, Overwhelmed, Recovering)
    - Confidence level (0-100%)
    - Contributing factors
    - Recommended tone adjustments for AI interactions
    - Suggested priority modifications
    """
    
    def _run(
        self,
        sleep_score: Optional[float] = None,
        calendar_density: Optional[int] = None,
        email_sentiment: Optional[str] = None,
        spending_variance: Optional[float] = None,
        productivity_score: Optional[float] = None,
        energy_level: Optional[float] = None,
        **kwargs
    ) -> str:
        """
        Infer user's current aura/mood state from multiple data sources.
        
        Args:
            sleep_score: Sleep quality score (0-100)
            calendar_density: Number of meetings/events today
            email_sentiment: Overall email sentiment (positive/neutral/negative)
            spending_variance: Deviation from normal spending (percentage)
            productivity_score: Task completion rate (0-100)
            energy_level: Self-reported or inferred energy (0-100)
        
        Returns:
            JSON string with aura analysis and recommendations
        """
        
        # Initialize scoring system
        stress_indicators = []
        positive_indicators = []
        total_score = 0
        max_score = 0
        
        # Analyze sleep quality
        if sleep_score is not None:
            max_score += 20
            if sleep_score >= 80:
                total_score += 20
                positive_indicators.append(f"Excellent sleep quality ({sleep_score}%)")
            elif sleep_score >= 60:
                total_score += 12
                positive_indicators.append(f"Good sleep quality ({sleep_score}%)")
            elif sleep_score >= 40:
                total_score += 6
                stress_indicators.append(f"Below-average sleep ({sleep_score}%)")
            else:
                total_score += 0
                stress_indicators.append(f"Poor sleep quality ({sleep_score}%) - likely fatigued")
        
        # Analyze calendar density
        if calendar_density is not None:
            max_score += 20
            if calendar_density <= 3:
                total_score += 20
                positive_indicators.append(f"Light schedule ({calendar_density} meetings)")
            elif calendar_density <= 5:
                total_score += 12
            elif calendar_density <= 7:
                total_score += 6
                stress_indicators.append(f"Busy schedule ({calendar_density} meetings)")
            else:
                total_score += 0
                stress_indicators.append(f"Overwhelming schedule ({calendar_density} meetings) - likely stressed")
        
        # Analyze email sentiment
        if email_sentiment is not None:
            max_score += 20
            if email_sentiment.lower() == "positive":
                total_score += 20
                positive_indicators.append("Positive email interactions")
            elif email_sentiment.lower() == "neutral":
                total_score += 12
            else:
                total_score += 0
                stress_indicators.append("Negative email sentiment - possible conflicts or pressure")
        
        # Analyze spending patterns
        if spending_variance is not None:
            max_score += 15
            if abs(spending_variance) <= 10:
                total_score += 15
                positive_indicators.append("Spending within normal range")
            elif abs(spending_variance) <= 25:
                total_score += 8
            else:
                total_score += 0
                if spending_variance > 0:
                    stress_indicators.append(f"Elevated spending (+{spending_variance}%) - possible stress spending")
                else:
                    stress_indicators.append(f"Reduced spending ({spending_variance}%) - possible financial anxiety")
        
        # Analyze productivity
        if productivity_score is not None:
            max_score += 15
            if productivity_score >= 80:
                total_score += 15
                positive_indicators.append(f"High productivity ({productivity_score}%)")
            elif productivity_score >= 60:
                total_score += 10
            elif productivity_score >= 40:
                total_score += 5
                stress_indicators.append(f"Below-average productivity ({productivity_score}%)")
            else:
                total_score += 0
                stress_indicators.append(f"Low productivity ({productivity_score}%) - possible burnout or overwhelm")
        
        # Analyze energy level
        if energy_level is not None:
            max_score += 10
            if energy_level >= 75:
                total_score += 10
                positive_indicators.append(f"High energy levels ({energy_level}%)")
            elif energy_level >= 50:
                total_score += 6
            elif energy_level >= 30:
                total_score += 3
                stress_indicators.append(f"Low energy ({energy_level}%)")
            else:
                total_score += 0
                stress_indicators.append(f"Very low energy ({energy_level}%) - needs recovery")
        
        # Calculate overall aura score
        if max_score > 0:
            aura_score = (total_score / max_score) * 100
        else:
            aura_score = 50  # Default neutral if no data
        
        # Determine primary mood state
        if aura_score >= 80:
            mood_state = "Energized"
            tone_recommendation = "Challenging and ambitious - user can handle complex tasks"
            priority_adjustment = "Maintain current priorities, user is in peak state"
        elif aura_score >= 60:
            mood_state = "Balanced"
            tone_recommendation = "Supportive and strategic - standard approach"
            priority_adjustment = "No adjustment needed, user is functioning well"
        elif aura_score >= 40:
            mood_state = "Stressed"
            tone_recommendation = "Gentle and encouraging - avoid overwhelming language"
            priority_adjustment = "Reduce non-essential tasks, focus on top 3 priorities only"
        elif aura_score >= 20:
            mood_state = "Overwhelmed"
            tone_recommendation = "Very supportive and compassionate - offer to help"
            priority_adjustment = "Significantly reduce load, suggest delegation or postponement"
        else:
            mood_state = "Recovering"
            tone_recommendation = "Nurturing and recovery-focused - prioritize self-care"
            priority_adjustment = "Minimize all non-critical tasks, focus on recovery activities"
        
        # Calculate confidence level
        data_points_provided = sum([
            sleep_score is not None,
            calendar_density is not None,
            email_sentiment is not None,
            spending_variance is not None,
            productivity_score is not None,
            energy_level is not None
        ])
        confidence = min(100, (data_points_provided / 6) * 100)
        
        # Build result
        result = {
            "mood_state": mood_state,
            "aura_score": round(aura_score, 1),
            "confidence": round(confidence, 1),
            "stress_indicators": stress_indicators,
            "positive_indicators": positive_indicators,
            "tone_recommendation": tone_recommendation,
            "priority_adjustment": priority_adjustment,
            "timestamp": datetime.now().isoformat()
        }
        
        return f"""
AURA ANALYSIS COMPLETE

Primary Mood State: {mood_state}
Aura Score: {aura_score:.1f}/100
Confidence Level: {confidence:.1f}%

Stress Indicators:
{chr(10).join(f"- {indicator}" for indicator in stress_indicators) if stress_indicators else "- None detected"}

Positive Indicators:
{chr(10).join(f"- {indicator}" for indicator in positive_indicators) if positive_indicators else "- None detected"}

AI Behavior Adjustments:
- Tone: {tone_recommendation}
- Priorities: {priority_adjustment}

This aura profile should be used to adapt all AI interactions with the user.
When the user is stressed or overwhelmed, be more supportive and reduce demands.
When the user is energized, challenge them with ambitious goals and complex tasks.
"""
