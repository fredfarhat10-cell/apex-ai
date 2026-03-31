"""
CalendarTool - Google Calendar integration for Apex AI
Provides calendar event management and scheduling capabilities
"""

from crewai_tools import BaseTool
from typing import Optional
import os
from datetime import datetime, timedelta
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials

class CalendarTool(BaseTool):
    name: str = "CalendarTool"
    description: str = """
    Interact with Google Calendar to manage events and schedules.
    
    Available operations:
    - list_events: Get upcoming events
    - get_event: Get details of a specific event
    - create_event: Create a new calendar event
    - update_event: Update an existing event
    - delete_event: Delete an event
    
    Example usage:
    list_events(max_results=10, time_min='2025-01-01T00:00:00Z')
    get_event(event_id='abc123')
    create_event(summary='Team Meeting', start_time='2025-01-20T14:00:00', end_time='2025-01-20T15:00:00')
    """
    
    def _run(self, operation: str, **kwargs) -> str:
        """
        Execute calendar operations
        
        Args:
            operation: The operation to perform (list_events, get_event, create_event, etc.)
            **kwargs: Operation-specific parameters
        """
        try:
            # Get OAuth credentials from environment
            access_token = os.getenv('GOOGLE_ACCESS_TOKEN')
            refresh_token = os.getenv('GOOGLE_REFRESH_TOKEN')
            
            if not access_token:
                return "Error: Google Calendar not connected. Please connect your Google account first."
            
            # Create credentials object
            creds = Credentials(
                token=access_token,
                refresh_token=refresh_token,
                token_uri='https://oauth2.googleapis.com/token',
                client_id=os.getenv('GOOGLE_CLIENT_ID'),
                client_secret=os.getenv('GOOGLE_CLIENT_SECRET')
            )
            
            # Build the Calendar API service
            service = build('calendar', 'v3', credentials=creds)
            
            if operation == 'list_events':
                return self._list_events(service, **kwargs)
            elif operation == 'get_event':
                return self._get_event(service, **kwargs)
            elif operation == 'create_event':
                return self._create_event(service, **kwargs)
            elif operation == 'update_event':
                return self._update_event(service, **kwargs)
            elif operation == 'delete_event':
                return self._delete_event(service, **kwargs)
            else:
                return f"Error: Unknown operation '{operation}'"
                
        except Exception as e:
            return f"Error accessing Google Calendar: {str(e)}"
    
    def _list_events(self, service, max_results: int = 10, time_min: Optional[str] = None, time_max: Optional[str] = None) -> str:
        """List upcoming calendar events"""
        try:
            # Default to now if no time_min specified
            if not time_min:
                time_min = datetime.utcnow().isoformat() + 'Z'
            
            events_result = service.events().list(
                calendarId='primary',
                timeMin=time_min,
                timeMax=time_max,
                maxResults=max_results,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            
            if not events:
                return "No upcoming events found."
            
            result = f"Found {len(events)} upcoming events:\n\n"
            for event in events:
                start = event['start'].get('dateTime', event['start'].get('date'))
                summary = event.get('summary', 'No title')
                event_id = event['id']
                attendees = event.get('attendees', [])
                attendee_emails = [a['email'] for a in attendees] if attendees else []
                
                result += f"• {summary}\n"
                result += f"  Time: {start}\n"
                result += f"  ID: {event_id}\n"
                if attendee_emails:
                    result += f"  Attendees: {', '.join(attendee_emails)}\n"
                result += "\n"
            
            return result
            
        except Exception as e:
            return f"Error listing events: {str(e)}"
    
    def _get_event(self, service, event_id: str) -> str:
        """Get details of a specific event"""
        try:
            event = service.events().get(calendarId='primary', eventId=event_id).execute()
            
            summary = event.get('summary', 'No title')
            start = event['start'].get('dateTime', event['start'].get('date'))
            end = event['end'].get('dateTime', event['end'].get('date'))
            description = event.get('description', 'No description')
            location = event.get('location', 'No location')
            attendees = event.get('attendees', [])
            
            result = f"Event: {summary}\n"
            result += f"Start: {start}\n"
            result += f"End: {end}\n"
            result += f"Location: {location}\n"
            result += f"Description: {description}\n"
            
            if attendees:
                result += "\nAttendees:\n"
                for attendee in attendees:
                    email = attendee.get('email', 'Unknown')
                    status = attendee.get('responseStatus', 'unknown')
                    result += f"  • {email} ({status})\n"
            
            return result
            
        except Exception as e:
            return f"Error getting event: {str(e)}"
    
    def _create_event(self, service, summary: str, start_time: str, end_time: str, 
                     description: str = '', location: str = '', attendees: list = None) -> str:
        """Create a new calendar event"""
        try:
            event = {
                'summary': summary,
                'location': location,
                'description': description,
                'start': {
                    'dateTime': start_time,
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': end_time,
                    'timeZone': 'UTC',
                },
            }
            
            if attendees:
                event['attendees'] = [{'email': email} for email in attendees]
            
            created_event = service.events().insert(calendarId='primary', body=event).execute()
            
            return f"Event created successfully!\nEvent ID: {created_event['id']}\nLink: {created_event.get('htmlLink', 'N/A')}"
            
        except Exception as e:
            return f"Error creating event: {str(e)}"
    
    def _update_event(self, service, event_id: str, **updates) -> str:
        """Update an existing event"""
        try:
            event = service.events().get(calendarId='primary', eventId=event_id).execute()
            
            # Update fields
            if 'summary' in updates:
                event['summary'] = updates['summary']
            if 'start_time' in updates:
                event['start']['dateTime'] = updates['start_time']
            if 'end_time' in updates:
                event['end']['dateTime'] = updates['end_time']
            if 'description' in updates:
                event['description'] = updates['description']
            if 'location' in updates:
                event['location'] = updates['location']
            
            updated_event = service.events().update(calendarId='primary', eventId=event_id, body=event).execute()
            
            return f"Event updated successfully!\nEvent ID: {updated_event['id']}"
            
        except Exception as e:
            return f"Error updating event: {str(e)}"
    
    def _delete_event(self, service, event_id: str) -> str:
        """Delete an event"""
        try:
            service.events().delete(calendarId='primary', eventId=event_id).execute()
            return f"Event {event_id} deleted successfully."
            
        except Exception as e:
            return f"Error deleting event: {str(e)}"
