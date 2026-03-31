from crewai_tools import BaseTool
from typing import Optional, Dict, Any, List
import os
import base64
from email.mime.text import MIMEText
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


class EmailTool(BaseTool):
    name: str = "EmailTool"
    description: str = """
    A comprehensive tool for interacting with Gmail via the Google API.
    Enables reading, searching, summarizing, drafting, and sending emails.
    
    Available operations:
    - read_emails: Search inbox with Gmail query syntax (e.g., 'from:john.smith in:inbox after:2025/01/01')
    - summarize_thread: Get a concise summary of all messages in an email thread
    - draft_reply: Create a draft reply to the latest email in a thread
    - send_email: Send a new email to specified recipients
    """

    def __init__(self, user_id: Optional[str] = None):
        super().__init__()
        self.user_id = user_id or "me"
        self.service = None
        self._initialize_service()

    def _initialize_service(self):
        """Initialize the Gmail API service with OAuth credentials."""
        try:
            # Get OAuth credentials from environment or token storage
            # In production, retrieve these from your secure token storage
            access_token = os.getenv("GOOGLE_ACCESS_TOKEN")
            refresh_token = os.getenv("GOOGLE_REFRESH_TOKEN")
            client_id = os.getenv("GOOGLE_CLIENT_ID")
            client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
            
            if not all([access_token, refresh_token, client_id, client_secret]):
                raise ValueError("Missing required Google OAuth credentials")
            
            # Create credentials object
            creds = Credentials(
                token=access_token,
                refresh_token=refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=client_id,
                client_secret=client_secret,
                scopes=['https://www.googleapis.com/auth/gmail.readonly', 
                       'https://www.googleapis.com/auth/gmail.modify']
            )
            
            # Build the Gmail service
            self.service = build('gmail', 'v1', credentials=creds)
            
        except Exception as e:
            print(f"Error initializing Gmail service: {str(e)}")
            self.service = None

    def _run(
        self,
        operation: str,
        query: Optional[str] = None,
        max_results: int = 10,
        thread_id: Optional[str] = None,
        body: Optional[str] = None,
        to: Optional[str] = None,
        subject: Optional[str] = None,
    ) -> str:
        """
        Execute a Gmail operation.
        
        Args:
            operation: The operation to perform (read_emails, summarize_thread, draft_reply, send_email)
            query: Gmail search query (for read_emails)
            max_results: Maximum number of results to return (for read_emails)
            thread_id: Email thread ID (for summarize_thread, draft_reply)
            body: Email body content (for draft_reply, send_email)
            to: Recipient email address (for send_email)
            subject: Email subject (for send_email)
        """
        if not self.service:
            return "Error: Gmail service not initialized. Please check OAuth credentials."
        
        try:
            if operation == "read_emails":
                return self._read_emails(query, max_results)
            elif operation == "summarize_thread":
                return self._summarize_thread(thread_id)
            elif operation == "draft_reply":
                return self._draft_reply(thread_id, body)
            elif operation == "send_email":
                return self._send_email(to, subject, body)
            else:
                return f"Error: Unknown operation '{operation}'"
        except Exception as e:
            return f"Error executing email operation: {str(e)}"

    def _read_emails(self, query: str, max_results: int = 10) -> str:
        """
        Search the user's inbox using Gmail query syntax.
        
        Args:
            query: Gmail search query (e.g., 'from:john.smith in:inbox after:2025/01/01')
            max_results: Maximum number of emails to return
            
        Returns:
            Formatted string with email results
        """
        try:
            # Search for messages
            results = self.service.users().messages().list(
                userId=self.user_id,
                q=query,
                maxResults=max_results
            ).execute()
            
            messages = results.get('messages', [])
            
            if not messages:
                return f"No emails found matching query: '{query}'"
            
            # Fetch details for each message
            email_list = []
            for msg in messages:
                msg_data = self.service.users().messages().get(
                    userId=self.user_id,
                    id=msg['id'],
                    format='metadata',
                    metadataHeaders=['From', 'Subject', 'Date']
                ).execute()
                
                headers = msg_data.get('payload', {}).get('headers', [])
                from_header = next((h['value'] for h in headers if h['name'] == 'From'), 'Unknown')
                subject_header = next((h['value'] for h in headers if h['name'] == 'Subject'), 'No Subject')
                date_header = next((h['value'] for h in headers if h['name'] == 'Date'), 'Unknown Date')
                
                snippet = msg_data.get('snippet', '')
                thread_id = msg_data.get('threadId', '')
                
                email_list.append(
                    f"From: {from_header}\n"
                    f"Subject: {subject_header}\n"
                    f"Date: {date_header}\n"
                    f"Thread ID: {thread_id}\n"
                    f"Preview: {snippet}\n"
                )
            
            return f"Found {len(messages)} email(s) matching '{query}':\n\n" + "\n---\n".join(email_list)
            
        except HttpError as error:
            return f"Gmail API error: {error}"

    def _summarize_thread(self, thread_id: str) -> str:
        """
        Fetch all messages in a thread and return a concise summary.
        
        Args:
            thread_id: The Gmail thread ID
            
        Returns:
            Formatted summary of the email thread
        """
        try:
            # Get the thread
            thread = self.service.users().threads().get(
                userId=self.user_id,
                id=thread_id,
                format='full'
            ).execute()
            
            messages = thread.get('messages', [])
            
            if not messages:
                return f"No messages found in thread {thread_id}"
            
            # Extract thread information
            first_msg = messages[0]
            headers = first_msg.get('payload', {}).get('headers', [])
            subject = next((h['value'] for h in headers if h['name'] == 'Subject'), 'No Subject')
            
            # Build summary
            summary_parts = [
                f"Thread Summary: {subject}",
                f"Total Messages: {len(messages)}",
                "\nConversation Flow:"
            ]
            
            for i, msg in enumerate(messages, 1):
                msg_headers = msg.get('payload', {}).get('headers', [])
                from_header = next((h['value'] for h in msg_headers if h['name'] == 'From'), 'Unknown')
                date_header = next((h['value'] for h in msg_headers if h['name'] == 'Date'), 'Unknown')
                snippet = msg.get('snippet', '')
                
                summary_parts.append(
                    f"\n{i}. From: {from_header}\n"
                    f"   Date: {date_header}\n"
                    f"   Preview: {snippet}"
                )
            
            return "\n".join(summary_parts)
            
        except HttpError as error:
            return f"Gmail API error: {error}"

    def _draft_reply(self, thread_id: str, body: str) -> str:
        """
        Create a draft reply to the latest email in a thread.
        
        Args:
            thread_id: The Gmail thread ID
            body: The reply message body
            
        Returns:
            Confirmation message with draft ID
        """
        try:
            # Get the thread to find the latest message
            thread = self.service.users().threads().get(
                userId=self.user_id,
                id=thread_id,
                format='metadata',
                metadataHeaders=['From', 'Subject', 'Message-ID']
            ).execute()
            
            messages = thread.get('messages', [])
            if not messages:
                return f"No messages found in thread {thread_id}"
            
            # Get the latest message
            latest_msg = messages[-1]
            headers = latest_msg.get('payload', {}).get('headers', [])
            
            to_header = next((h['value'] for h in headers if h['name'] == 'From'), None)
            subject_header = next((h['value'] for h in headers if h['name'] == 'Subject'), 'No Subject')
            message_id = next((h['value'] for h in headers if h['name'] == 'Message-ID'), None)
            
            if not to_header:
                return "Error: Could not determine reply recipient"
            
            # Ensure subject has "Re:" prefix
            if not subject_header.startswith('Re:'):
                subject_header = f"Re: {subject_header}"
            
            # Create the reply message
            message = MIMEText(body)
            message['to'] = to_header
            message['subject'] = subject_header
            message['threadId'] = thread_id
            
            if message_id:
                message['In-Reply-To'] = message_id
                message['References'] = message_id
            
            # Encode the message
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
            
            # Create the draft
            draft = self.service.users().drafts().create(
                userId=self.user_id,
                body={
                    'message': {
                        'raw': raw_message,
                        'threadId': thread_id
                    }
                }
            ).execute()
            
            draft_id = draft.get('id')
            return f"Successfully created draft reply in thread {thread_id}\nDraft ID: {draft_id}"
            
        except HttpError as error:
            return f"Gmail API error: {error}"

    def _send_email(self, to: str, subject: str, body: str) -> str:
        """
        Send a new email to specified recipients.
        
        Args:
            to: Recipient email address
            subject: Email subject line
            body: Email body content
            
        Returns:
            Confirmation message with sent message ID
        """
        try:
            # Create the message
            message = MIMEText(body)
            message['to'] = to
            message['subject'] = subject
            
            # Encode the message
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
            
            # Send the message
            sent_message = self.service.users().messages().send(
                userId=self.user_id,
                body={'raw': raw_message}
            ).execute()
            
            message_id = sent_message.get('id')
            return f"Successfully sent email to {to}\nSubject: {subject}\nMessage ID: {message_id}"
            
        except HttpError as error:
            return f"Gmail API error: {error}"
