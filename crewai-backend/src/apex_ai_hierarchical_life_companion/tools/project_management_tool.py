from crewai.tools import BaseTool
from typing import Type, Optional, Dict, Any, List
from pydantic import BaseModel, Field
import os
import requests


class ProjectManagementToolInput(BaseModel):
    """Input schema for ProjectManagementTool."""
    platform: str = Field(..., description="Platform to use: 'asana', 'trello', or 'jira'")
    action: str = Field(..., description="Action to perform: 'list_projects', 'list_tasks', 'create_task', 'get_productivity_stats'")
    project_id: Optional[str] = Field(None, description="Project/Board ID for task operations")
    task_name: Optional[str] = Field(None, description="Name of task to create")
    task_description: Optional[str] = Field(None, description="Description of task to create")


class ProjectManagementTool(BaseTool):
    name: str = "Project Management Tool"
    description: str = (
        "Connects to project management services like Asana, Trello, or Jira to read "
        "and create tasks and projects. Can analyze productivity patterns, task completion "
        "rates, and identify areas for improvement."
    )
    args_schema: Type[BaseModel] = ProjectManagementToolInput

    def _run(
        self,
        platform: str,
        action: str,
        project_id: Optional[str] = None,
        task_name: Optional[str] = None,
        task_description: Optional[str] = None
    ) -> str:
        """
        Execute project management operations.
        
        Args:
            platform: The platform to use (asana, trello, jira)
            action: The action to perform
            project_id: Project or board ID
            task_name: Name for new tasks
            task_description: Description for new tasks
            
        Returns:
            JSON string with the results
        """
        if platform == "asana":
            return self._handle_asana(action, project_id, task_name, task_description)
        elif platform == "trello":
            return self._handle_trello(action, project_id, task_name, task_description)
        elif platform == "jira":
            return self._handle_jira(action, project_id, task_name, task_description)
        else:
            return f"Error: Unsupported platform '{platform}'. Supported: asana, trello, jira"
    
    def _handle_asana(self, action: str, project_id: Optional[str], task_name: Optional[str], task_description: Optional[str]) -> str:
        """Handle Asana API operations."""
        api_key = os.getenv("ASANA_API_KEY")
        if not api_key:
            return "Error: Asana API key not configured. Please set ASANA_API_KEY environment variable."
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        base_url = "https://app.asana.com/api/1.0"
        
        try:
            if action == "list_projects":
                response = requests.get(f"{base_url}/workspaces", headers=headers)
                response.raise_for_status()
                workspaces = response.json().get('data', [])
                
                if not workspaces:
                    return "No workspaces found."
                
                workspace_id = workspaces[0]['gid']
                projects_response = requests.get(
                    f"{base_url}/projects",
                    headers=headers,
                    params={"workspace": workspace_id}
                )
                projects_response.raise_for_status()
                projects = projects_response.json().get('data', [])
                
                project_list = [f"- {p['name']} (ID: {p['gid']})" for p in projects[:10]]
                return "Your Asana Projects:\n" + "\n".join(project_list)
            
            elif action == "list_tasks":
                if not project_id:
                    return "Error: project_id required for list_tasks action"
                
                response = requests.get(
                    f"{base_url}/tasks",
                    headers=headers,
                    params={"project": project_id, "opt_fields": "name,completed,due_on"}
                )
                response.raise_for_status()
                tasks = response.json().get('data', [])
                
                completed = sum(1 for t in tasks if t.get('completed'))
                total = len(tasks)
                
                task_list = [f"- {'✓' if t.get('completed') else '○'} {t['name']}" for t in tasks[:10]]
                
                return f"""
Project Tasks (Completion: {completed}/{total}):
{chr(10).join(task_list)}
"""
            
            elif action == "create_task":
                if not project_id or not task_name:
                    return "Error: project_id and task_name required for create_task action"
                
                data = {
                    "data": {
                        "name": task_name,
                        "notes": task_description or "",
                        "projects": [project_id]
                    }
                }
                
                response = requests.post(f"{base_url}/tasks", headers=headers, json=data)
                response.raise_for_status()
                task = response.json().get('data', {})
                
                return f"Task created successfully: {task.get('name')} (ID: {task.get('gid')})"
            
            elif action == "get_productivity_stats":
                # Get all tasks across projects
                response = requests.get(f"{base_url}/workspaces", headers=headers)
                response.raise_for_status()
                workspaces = response.json().get('data', [])
                
                if not workspaces:
                    return "No workspaces found."
                
                workspace_id = workspaces[0]['gid']
                tasks_response = requests.get(
                    f"{base_url}/tasks",
                    headers=headers,
                    params={"workspace": workspace_id, "assignee": "me", "opt_fields": "completed,completed_at"}
                )
                tasks_response.raise_for_status()
                tasks = tasks_response.json().get('data', [])
                
                total_tasks = len(tasks)
                completed_tasks = sum(1 for t in tasks if t.get('completed'))
                completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
                
                return f"""
Productivity Statistics:
- Total Tasks: {total_tasks}
- Completed: {completed_tasks}
- Completion Rate: {completion_rate:.1f}%
- Status: {'On Track' if completion_rate >= 70 else 'Needs Improvement'}
"""
            
            else:
                return f"Error: Unknown action '{action}'"
        
        except requests.exceptions.RequestException as e:
            return f"Error calling Asana API: {str(e)}"
        except Exception as e:
            return f"Error: {str(e)}"
    
    def _handle_trello(self, action: str, project_id: Optional[str], task_name: Optional[str], task_description: Optional[str]) -> str:
        """Handle Trello API operations."""
        api_key = os.getenv("TRELLO_API_KEY")
        api_token = os.getenv("TRELLO_API_TOKEN")
        
        if not api_key or not api_token:
            return "Error: Trello credentials not configured. Please set TRELLO_API_KEY and TRELLO_API_TOKEN."
        
        base_url = "https://api.trello.com/1"
        auth_params = {"key": api_key, "token": api_token}
        
        try:
            if action == "list_projects":
                response = requests.get(f"{base_url}/members/me/boards", params=auth_params)
                response.raise_for_status()
                boards = response.json()
                
                board_list = [f"- {b['name']} (ID: {b['id']})" for b in boards[:10]]
                return "Your Trello Boards:\n" + "\n".join(board_list)
            
            elif action == "list_tasks":
                if not project_id:
                    return "Error: project_id (board_id) required for list_tasks action"
                
                response = requests.get(f"{base_url}/boards/{project_id}/cards", params=auth_params)
                response.raise_for_status()
                cards = response.json()
                
                card_list = [f"- {c['name']}" for c in cards[:10]]
                return f"Board Tasks ({len(cards)} total):\n" + "\n".join(card_list)
            
            elif action == "create_task":
                if not project_id or not task_name:
                    return "Error: project_id (board_id) and task_name required"
                
                # Get first list on the board
                lists_response = requests.get(f"{base_url}/boards/{project_id}/lists", params=auth_params)
                lists_response.raise_for_status()
                lists = lists_response.json()
                
                if not lists:
                    return "Error: No lists found on board"
                
                list_id = lists[0]['id']
                
                card_data = {
                    **auth_params,
                    "name": task_name,
                    "desc": task_description or "",
                    "idList": list_id
                }
                
                response = requests.post(f"{base_url}/cards", params=card_data)
                response.raise_for_status()
                card = response.json()
                
                return f"Card created successfully: {card['name']} (ID: {card['id']})"
            
            else:
                return f"Error: Action '{action}' not fully implemented for Trello"
        
        except requests.exceptions.RequestException as e:
            return f"Error calling Trello API: {str(e)}"
        except Exception as e:
            return f"Error: {str(e)}"
    
    def _handle_jira(self, action: str, project_id: Optional[str], task_name: Optional[str], task_description: Optional[str]) -> str:
        """Handle Jira API operations."""
        jira_url = os.getenv("JIRA_URL")  # e.g., https://yourcompany.atlassian.net
        jira_email = os.getenv("JIRA_EMAIL")
        jira_api_token = os.getenv("JIRA_API_TOKEN")
        
        if not all([jira_url, jira_email, jira_api_token]):
            return "Error: Jira credentials not configured. Please set JIRA_URL, JIRA_EMAIL, and JIRA_API_TOKEN."
        
        auth = (jira_email, jira_api_token)
        headers = {"Content-Type": "application/json"}
        
        try:
            if action == "list_projects":
                response = requests.get(f"{jira_url}/rest/api/3/project", auth=auth, headers=headers)
                response.raise_for_status()
                projects = response.json()
                
                project_list = [f"- {p['name']} (Key: {p['key']})" for p in projects[:10]]
                return "Your Jira Projects:\n" + "\n".join(project_list)
            
            elif action == "list_tasks":
                if not project_id:
                    return "Error: project_id (project key) required"
                
                jql = f"project = {project_id} ORDER BY created DESC"
                response = requests.get(
                    f"{jira_url}/rest/api/3/search",
                    auth=auth,
                    headers=headers,
                    params={"jql": jql, "maxResults": 20}
                )
                response.raise_for_status()
                issues = response.json().get('issues', [])
                
                issue_list = [f"- [{i['key']}] {i['fields']['summary']}" for i in issues[:10]]
                return f"Project Issues ({len(issues)} total):\n" + "\n".join(issue_list)
            
            elif action == "create_task":
                if not project_id or not task_name:
                    return "Error: project_id (project key) and task_name required"
                
                issue_data = {
                    "fields": {
                        "project": {"key": project_id},
                        "summary": task_name,
                        "description": {
                            "type": "doc",
                            "version": 1,
                            "content": [
                                {
                                    "type": "paragraph",
                                    "content": [{"type": "text", "text": task_description or ""}]
                                }
                            ]
                        },
                        "issuetype": {"name": "Task"}
                    }
                }
                
                response = requests.post(
                    f"{jira_url}/rest/api/3/issue",
                    auth=auth,
                    headers=headers,
                    json=issue_data
                )
                response.raise_for_status()
                issue = response.json()
                
                return f"Issue created successfully: {issue['key']}"
            
            else:
                return f"Error: Action '{action}' not fully implemented for Jira"
        
        except requests.exceptions.RequestException as e:
            return f"Error calling Jira API: {str(e)}"
        except Exception as e:
            return f"Error: {str(e)}"
