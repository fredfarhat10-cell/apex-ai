from crewai.tools import BaseTool
from typing import Optional, List, Dict, Any
import json
import os
from datetime import datetime
import numpy as np
from openai import OpenAI

class MemoryTool(BaseTool):
    name: str = "MemoryTool"
    description: str = """
    Store and retrieve interaction memories with semantic search.
    Use this to remember user preferences, past conversations, and learned patterns.
    
    Actions:
    - store: Save a new memory with embedding
    - retrieve: Search memories by semantic similarity
    - update: Update an existing memory
    - list_recent: Get recent memories
    """

    def __init__(self):
        super().__init__()
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.memory_file = "data/memories.json"
        self.embeddings_file = "data/embeddings.npy"
        self._ensure_data_dir()
        self.memories = self._load_memories()
        self.embeddings = self._load_embeddings()

    def _ensure_data_dir(self):
        os.makedirs("data", exist_ok=True)
        if not os.path.exists(self.memory_file):
            with open(self.memory_file, "w") as f:
                json.dump([], f)
        if not os.path.exists(self.embeddings_file):
            np.save(self.embeddings_file, np.array([]))

    def _load_memories(self) -> List[Dict[str, Any]]:
        with open(self.memory_file, "r") as f:
            return json.load(f)

    def _save_memories(self):
        with open(self.memory_file, "w") as f:
            json.dump(self.memories, f, indent=2)

    def _load_embeddings(self) -> np.ndarray:
        embeddings = np.load(self.embeddings_file, allow_pickle=True)
        if embeddings.size == 0:
            return np.array([])
        return embeddings

    def _save_embeddings(self):
        np.save(self.embeddings_file, self.embeddings)

    def _get_embedding(self, text: str) -> List[float]:
        """Generate embedding using OpenAI API"""
        response = self.client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding

    def _cosine_similarity(self, a: np.ndarray, b: np.ndarray) -> float:
        """Calculate cosine similarity between two vectors"""
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

    def _run(
        self,
        action: str,
        content: Optional[str] = None,
        memory_id: Optional[str] = None,
        category: Optional[str] = None,
        limit: int = 5
    ) -> str:
        """Execute memory operations"""
        
        if action == "store":
            return self._store_memory(content, category)
        elif action == "retrieve":
            return self._retrieve_memories(content, limit)
        elif action == "update":
            return self._update_memory(memory_id, content)
        elif action == "list_recent":
            return self._list_recent_memories(limit)
        else:
            return f"Unknown action: {action}"

    def _store_memory(self, content: str, category: Optional[str] = None) -> str:
        """Store a new memory with embedding"""
        memory_id = f"mem_{datetime.now().timestamp()}_{len(self.memories)}"
        
        # Generate embedding
        embedding = self._get_embedding(content)
        
        # Create memory object
        memory = {
            "id": memory_id,
            "content": content,
            "category": category or "general",
            "timestamp": datetime.now().isoformat(),
            "access_count": 0,
            "last_accessed": None
        }
        
        # Store memory and embedding
        self.memories.append(memory)
        
        if len(self.embeddings) == 0:
            self.embeddings = np.array([embedding])
        else:
            self.embeddings = np.vstack([self.embeddings, embedding])
        
        self._save_memories()
        self._save_embeddings()
        
        return f"Memory stored successfully with ID: {memory_id}"

    def _retrieve_memories(self, query: str, limit: int = 5) -> str:
        """Retrieve memories by semantic similarity"""
        if len(self.memories) == 0:
            return "No memories found."
        
        # Generate query embedding
        query_embedding = np.array(self._get_embedding(query))
        
        # Calculate similarities
        similarities = []
        for i, memory_embedding in enumerate(self.embeddings):
            similarity = self._cosine_similarity(query_embedding, memory_embedding)
            similarities.append((i, similarity))
        
        # Sort by similarity
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        # Get top results
        results = []
        for i, similarity in similarities[:limit]:
            memory = self.memories[i]
            memory["access_count"] += 1
            memory["last_accessed"] = datetime.now().isoformat()
            results.append({
                "content": memory["content"],
                "category": memory["category"],
                "similarity": float(similarity),
                "timestamp": memory["timestamp"]
            })
        
        self._save_memories()
        
        return json.dumps(results, indent=2)

    def _update_memory(self, memory_id: str, new_content: str) -> str:
        """Update an existing memory"""
        for i, memory in enumerate(self.memories):
            if memory["id"] == memory_id:
                # Update content and regenerate embedding
                memory["content"] = new_content
                memory["timestamp"] = datetime.now().isoformat()
                
                new_embedding = self._get_embedding(new_content)
                self.embeddings[i] = new_embedding
                
                self._save_memories()
                self._save_embeddings()
                
                return f"Memory {memory_id} updated successfully"
        
        return f"Memory {memory_id} not found"

    def _list_recent_memories(self, limit: int = 5) -> str:
        """List most recent memories"""
        if len(self.memories) == 0:
            return "No memories found."
        
        # Sort by timestamp
        sorted_memories = sorted(
            self.memories,
            key=lambda x: x["timestamp"],
            reverse=True
        )[:limit]
        
        results = [{
            "id": m["id"],
            "content": m["content"],
            "category": m["category"],
            "timestamp": m["timestamp"]
        } for m in sorted_memories]
        
        return json.dumps(results, indent=2)
