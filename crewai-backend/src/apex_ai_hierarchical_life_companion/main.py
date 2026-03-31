#!/usr/bin/env python
import sys
import os
from dotenv import load_dotenv

# Construct the path to the .env.local file in the root directory
# This looks "two folders up" from the current file's location
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', '.env.local')
load_dotenv(dotenv_path=dotenv_path)

import json
from apex_ai_hierarchical_life_companion.crew import ApexAiHierarchicalLifeCompanion

def run():
    """
    Run the crew to generate an Alpha Brief for a given ticker.
    Usage: python main.py <ticker>
    """
    # Get ticker from command line args or use default
    ticker = sys.argv[1] if len(sys.argv) > 1 else "AAPL"
    
    print(f"\n{'='*60}")
    print(f"Generating Alpha Brief for {ticker}")
    print(f"{'='*60}\n")
    
    # Initialize and run the crew
    inputs = {
        'ticker': ticker
    }
    
    try:
        crew = ApexAiHierarchicalLifeCompanion().crew()
        result = crew.kickoff(inputs=inputs)
        
        print(f"\n{'='*60}")
        print("Alpha Brief Generated Successfully")
        print(f"{'='*60}\n")
        print(result)
        
        # Return result as JSON for API integration
        return {
            'success': True,
            'ticker': ticker,
            'brief': str(result)
        }
        
    except Exception as e:
        print(f"\n{'='*60}")
        print("Error Generating Alpha Brief")
        print(f"{'='*60}\n")
        print(f"Error: {str(e)}")
        
        return {
            'success': False,
            'ticker': ticker,
            'error': str(e)
        }

def train():
    """
    Train the crew for better performance.
    """
    inputs = {
        'ticker': 'AAPL'
    }
    try:
        ApexAiHierarchicalLifeCompanion().crew().train(
            n_iterations=int(sys.argv[1]) if len(sys.argv) > 1 else 5,
            inputs=inputs
        )
    except Exception as e:
        raise Exception(f"An error occurred while training the crew: {e}")

def replay():
    """
    Replay the crew execution from a specific task.
    """
    try:
        ApexAiHierarchicalLifeCompanion().crew().replay(
            task_id=sys.argv[1] if len(sys.argv) > 1 else None
        )
    except Exception as e:
        raise Exception(f"An error occurred while replaying the crew: {e}")

def test():
    """
    Test the crew execution with a sample ticker.
    """
    inputs = {
        'ticker': 'AAPL'
    }
    try:
        ApexAiHierarchicalLifeCompanion().crew().test(
            n_iterations=int(sys.argv[1]) if len(sys.argv) > 1 else 3,
            openai_model_name=sys.argv[2] if len(sys.argv) > 2 else "gpt-4o",
            inputs=inputs
        )
    except Exception as e:
        raise Exception(f"An error occurred while testing the crew: {e}")

if __name__ == "__main__":
    run()
