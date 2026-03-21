from crewai_tools import BaseTool
from typing import Optional, Dict, Any, List
import os
import requests
from datetime import datetime


class NotionTool(BaseTool):
    name: str = "NotionTool"
    description: str = """
    A comprehensive tool for interacting with the user's Notion workspace.
    Enables reading from and writing to Notion databases and pages.
    
    Available operations:
    - query_database: Search for pages in a Notion database with filters
    - read_page_content: Read the full content of a specific Notion page
    - create_page: Create a new page in a Notion database
    - update_page_properties: Update metadata/properties of an existing page
    """

    def __init__(self):
        super().__init__()
        self.api_key = os.getenv("NOTION_API_KEY")
        self.base_url = "https://api.notion.com/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        }

    def _run(
        self,
        operation: str,
        database_id: Optional[str] = None,
        page_id: Optional[str] = None,
        filter_query: Optional[str] = None,
        title: Optional[str] = None,
        content: Optional[str] = None,
        properties: Optional[Dict[str, Any]] = None,
    ) -> str:
        """
        Execute a Notion API operation.
        
        Args:
            operation: The operation to perform (query_database, read_page_content, create_page, update_page_properties)
            database_id: The ID of the Notion database (for query_database, create_page)
            page_id: The ID of the Notion page (for read_page_content, update_page_properties)
            filter_query: Search query for filtering database results
            title: Title for new pages
            content: Content for new pages (markdown format)
            properties: Dictionary of properties to set/update
        """
        try:
            if operation == "query_database":
                return self._query_database(database_id, filter_query)
            elif operation == "read_page_content":
                return self._read_page_content(page_id)
            elif operation == "create_page":
                return self._create_page(database_id, title, content, properties)
            elif operation == "update_page_properties":
                return self._update_page_properties(page_id, properties)
            else:
                return f"Error: Unknown operation '{operation}'"
        except Exception as e:
            return f"Error executing Notion operation: {str(e)}"

    def _query_database(self, database_id: str, filter_query: Optional[str] = None) -> str:
        """Query a Notion database with optional filters."""
        url = f"{self.base_url}/databases/{database_id}/query"
        
        payload = {}
        if filter_query:
            # Simple text search in title
            payload = {
                "filter": {
                    "property": "Name",
                    "title": {
                        "contains": filter_query
                    }
                }
            }
        
        response = requests.post(url, headers=self.headers, json=payload)
        response.raise_for_status()
        
        data = response.json()
        results = data.get("results", [])
        
        if not results:
            return f"No pages found in database {database_id}" + (f" matching '{filter_query}'" if filter_query else "")
        
        # Format results
        formatted_results = []
        for page in results:
            page_id = page["id"]
            title = self._extract_title(page)
            created = page.get("created_time", "Unknown")
            formatted_results.append(f"- {title} (ID: {page_id}, Created: {created})")
        
        return f"Found {len(results)} page(s):\n" + "\n".join(formatted_results)

    def _read_page_content(self, page_id: str) -> str:
        """Read the full content of a Notion page."""
        # Get page properties
        page_url = f"{self.base_url}/pages/{page_id}"
        page_response = requests.get(page_url, headers=self.headers)
        page_response.raise_for_status()
        page_data = page_response.json()
        
        # Get page blocks (content)
        blocks_url = f"{self.base_url}/blocks/{page_id}/children"
        blocks_response = requests.get(blocks_url, headers=self.headers)
        blocks_response.raise_for_status()
        blocks_data = blocks_response.json()
        
        # Extract title
        title = self._extract_title(page_data)
        
        # Extract content from blocks
        content_parts = [f"# {title}\n"]
        for block in blocks_data.get("results", []):
            block_type = block.get("type")
            if block_type == "paragraph":
                text = self._extract_text_from_block(block["paragraph"])
                if text:
                    content_parts.append(text)
            elif block_type == "heading_1":
                text = self._extract_text_from_block(block["heading_1"])
                content_parts.append(f"\n## {text}")
            elif block_type == "heading_2":
                text = self._extract_text_from_block(block["heading_2"])
                content_parts.append(f"\n### {text}")
            elif block_type == "bulleted_list_item":
                text = self._extract_text_from_block(block["bulleted_list_item"])
                content_parts.append(f"- {text}")
            elif block_type == "to_do":
                text = self._extract_text_from_block(block["to_do"])
                checked = block["to_do"].get("checked", False)
                checkbox = "[x]" if checked else "[ ]"
                content_parts.append(f"{checkbox} {text}")
        
        return "\n".join(content_parts)

    def _create_page(
        self,
        database_id: str,
        title: str,
        content: Optional[str] = None,
        properties: Optional[Dict[str, Any]] = None
    ) -> str:
        """Create a new page in a Notion database."""
        url = f"{self.base_url}/pages"
        
        # Build properties
        page_properties = {
            "Name": {
                "title": [
                    {
                        "text": {
                            "content": title
                        }
                    }
                ]
            }
        }
        
        # Add custom properties if provided
        if properties:
            for key, value in properties.items():
                if key == "Status":
                    page_properties[key] = {"select": {"name": value}}
                elif key == "Tags":
                    page_properties[key] = {"multi_select": [{"name": tag} for tag in value]}
                elif key == "Date":
                    page_properties[key] = {"date": {"start": value}}
        
        payload = {
            "parent": {"database_id": database_id},
            "properties": page_properties
        }
        
        # Add content blocks if provided
        if content:
            children = self._markdown_to_blocks(content)
            payload["children"] = children
        
        response = requests.post(url, headers=self.headers, json=payload)
        response.raise_for_status()
        
        data = response.json()
        page_id = data["id"]
        page_url = data["url"]
        
        return f"Successfully created page '{title}' (ID: {page_id})\nURL: {page_url}"

    def _update_page_properties(self, page_id: str, properties: Dict[str, Any]) -> str:
        """Update properties of an existing Notion page."""
        url = f"{self.base_url}/pages/{page_id}"
        
        # Format properties for Notion API
        formatted_properties = {}
        for key, value in properties.items():
            if key == "Status":
                formatted_properties[key] = {"select": {"name": value}}
            elif key == "Tags":
                formatted_properties[key] = {"multi_select": [{"name": tag} for tag in value]}
            elif key == "Date":
                formatted_properties[key] = {"date": {"start": value}}
            elif key == "Checkbox":
                formatted_properties[key] = {"checkbox": value}
        
        payload = {"properties": formatted_properties}
        
        response = requests.patch(url, headers=self.headers, json=payload)
        response.raise_for_status()
        
        return f"Successfully updated page {page_id} with properties: {list(properties.keys())}"

    def _extract_title(self, page_data: Dict[str, Any]) -> str:
        """Extract title from page properties."""
        properties = page_data.get("properties", {})
        
        # Try common title property names
        for title_key in ["Name", "Title", "title", "name"]:
            if title_key in properties:
                title_prop = properties[title_key]
                if title_prop.get("type") == "title":
                    title_array = title_prop.get("title", [])
                    if title_array:
                        return title_array[0].get("plain_text", "Untitled")
        
        return "Untitled"

    def _extract_text_from_block(self, block_content: Dict[str, Any]) -> str:
        """Extract plain text from a block's rich text array."""
        rich_text = block_content.get("rich_text", [])
        return "".join([text.get("plain_text", "") for text in rich_text])

    def _markdown_to_blocks(self, markdown: str) -> List[Dict[str, Any]]:
        """Convert markdown content to Notion blocks."""
        blocks = []
        lines = markdown.split("\n")
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Heading 1
            if line.startswith("# "):
                blocks.append({
                    "object": "block",
                    "type": "heading_1",
                    "heading_1": {
                        "rich_text": [{"type": "text", "text": {"content": line[2:]}}]
                    }
                })
            # Heading 2
            elif line.startswith("## "):
                blocks.append({
                    "object": "block",
                    "type": "heading_2",
                    "heading_2": {
                        "rich_text": [{"type": "text", "text": {"content": line[3:]}}]
                    }
                })
            # Bullet point
            elif line.startswith("- "):
                blocks.append({
                    "object": "block",
                    "type": "bulleted_list_item",
                    "bulleted_list_item": {
                        "rich_text": [{"type": "text", "text": {"content": line[2:]}}]
                    }
                })
            # Regular paragraph
            else:
                blocks.append({
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [{"type": "text", "text": {"content": line}}]
                    }
                })
        
        return blocks
