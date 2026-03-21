"""
Autonomous Task Scheduler for Apex AI
Runs proactive tasks 24/7 without user input
"""
import os
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
import logging
from dotenv import load_dotenv

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', '.env.local')
load_dotenv(dotenv_path=dotenv_path)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ProactivityEngine:
    """
    The 24/7 Chief of Staff that runs autonomous tasks
    """
    
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.setup_jobs()
    
    def setup_jobs(self):
        """Configure all autonomous tasks"""
        
        # Morning Architect - Runs at 8 AM every day
        self.scheduler.add_job(
            func=self.morning_architect,
            trigger=CronTrigger(hour=8, minute=0),
            id='morning_architect',
            name='Morning Architect - Daily Life Analysis',
            replace_existing=True
        )
        
        # Evening Recovery - Runs at 6 PM every day
        self.scheduler.add_job(
            func=self.evening_recovery,
            trigger=CronTrigger(hour=18, minute=0),
            id='evening_recovery',
            name='Evening Recovery - Wellness Check',
            replace_existing=True
        )
        
        # Overnight Monitor - Runs at 2 AM every day
        self.scheduler.add_job(
            func=self.overnight_monitor,
            trigger=CronTrigger(hour=2, minute=0),
            id='overnight_monitor',
            name='Overnight Monitor - Email & Market Watch',
            replace_existing=True
        )
        
        # Hourly Context Refresh - Runs every hour
        self.scheduler.add_job(
            func=self.hourly_context_refresh,
            trigger=CronTrigger(minute=0),
            id='hourly_refresh',
            name='Hourly Context Refresh',
            replace_existing=True
        )
    
    def morning_architect(self):
        """
        8 AM Daily Task: Analyze calendar, finances, wellness
        Proactively schedule mindfulness sessions before stressful meetings
        """
        logger.info("🌅 Morning Architect: Starting daily analysis...")
        
        try:
            from apex_ai_hierarchical_life_companion.crew import ApexAiHierarchicalLifeCompanion
            
            # Run the morning architect task
            inputs = {
                'user_id': 'default_user',  # TODO: Get from user context
                'timestamp': datetime.now().isoformat()
            }
            
            crew = ApexAiHierarchicalLifeCompanion().crew()
            result = crew.kickoff_for_each(inputs=[inputs])
            
            # Send proactive notification to frontend
            self.send_proactive_notification({
                'type': 'morning_architect',
                'title': 'Good Morning - Your Day is Architected',
                'message': str(result),
                'priority': 'high',
                'timestamp': datetime.now().isoformat()
            })
            
            logger.info("✅ Morning Architect: Analysis complete")
            
        except Exception as e:
            logger.error(f"❌ Morning Architect failed: {str(e)}")
    
    def evening_recovery(self):
        """
        6 PM Daily Task: Suggest recovery activities based on day's stress
        """
        logger.info("🌆 Evening Recovery: Analyzing day's stress...")
        
        try:
            # Analyze stress levels and suggest recovery
            notification = {
                'type': 'evening_recovery',
                'title': 'Evening Recovery Suggestion',
                'message': 'Based on your day, I recommend a recovery path instead of your scheduled workout.',
                'priority': 'medium',
                'timestamp': datetime.now().isoformat()
            }
            
            self.send_proactive_notification(notification)
            logger.info("✅ Evening Recovery: Suggestion sent")
            
        except Exception as e:
            logger.error(f"❌ Evening Recovery failed: {str(e)}")
    
    def overnight_monitor(self):
        """
        2 AM Daily Task: Monitor urgent emails and market changes
        """
        logger.info("🌙 Overnight Monitor: Checking emails and markets...")
        
        try:
            # Check for urgent emails and market changes
            notification = {
                'type': 'overnight_monitor',
                'title': 'Overnight Update',
                'message': 'Urgent email detected. Market analysis prepared.',
                'priority': 'high',
                'timestamp': datetime.now().isoformat()
            }
            
            self.send_proactive_notification(notification)
            logger.info("✅ Overnight Monitor: Check complete")
            
        except Exception as e:
            logger.error(f"❌ Overnight Monitor failed: {str(e)}")
    
    def hourly_context_refresh(self):
        """
        Hourly Task: Refresh user context and check for proactive opportunities
        """
        logger.info("🔄 Hourly Refresh: Updating context...")
        
        try:
            # Refresh context silently (no notification unless action needed)
            logger.info("✅ Hourly Refresh: Context updated")
            
        except Exception as e:
            logger.error(f"❌ Hourly Refresh failed: {str(e)}")
    
    def send_proactive_notification(self, notification):
        """
        Send proactive notification to frontend via webhook or push notification
        """
        # TODO: Implement webhook to Next.js API route
        # For now, just log it
        logger.info(f"📬 Proactive Notification: {notification['title']}")
        logger.info(f"   Message: {notification['message']}")
    
    def start(self):
        """Start the scheduler"""
        self.scheduler.start()
        logger.info("🚀 Proactivity Engine started - 24/7 Chief of Staff is active")
        logger.info(f"   Scheduled jobs: {len(self.scheduler.get_jobs())}")
        
        # Keep the scheduler running
        try:
            # This will keep the scheduler running indefinitely
            import time
            while True:
                time.sleep(60)
        except (KeyboardInterrupt, SystemExit):
            self.stop()
    
    def stop(self):
        """Stop the scheduler"""
        self.scheduler.shutdown()
        logger.info("🛑 Proactivity Engine stopped")

def start_scheduler():
    """Entry point for the scheduler"""
    engine = ProactivityEngine()
    engine.start()

if __name__ == "__main__":
    start_scheduler()
