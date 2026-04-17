from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Any, Protocol, TypeVar

from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)

_DEFAULT_MODEL = "claude-opus-4-7"


class LLMClient(Protocol):
    def structured(
        self,
        system: str,
        user: str,
        schema: type[T],
        *,
        max_tokens: int = 16_000,
    ) -> T:
        """Call the LLM with a system prompt, user message, and expected schema."""
        ...


@dataclass
class AnthropicClient:
    """Real Anthropic client. Uses Claude Opus 4.7 with adaptive thinking
    and effort=high. Caches the system prompt so repeated decisions are cheap.
    """
    model: str = _DEFAULT_MODEL
    effort: str = "high"
    api_key: str | None = None
    _client: Any = field(default=None, init=False, repr=False)

    def _get_client(self):
        if self._client is not None:
            return self._client
        import anthropic  # local import so the package is optional at runtime
        key = self.api_key or os.environ.get("ANTHROPIC_API_KEY")
        if not key:
            raise RuntimeError(
                "ANTHROPIC_API_KEY not set. Set the env var or pass api_key=..."
            )
        self._client = anthropic.Anthropic(api_key=key)
        return self._client

    def structured(
        self,
        system: str,
        user: str,
        schema: type[T],
        *,
        max_tokens: int = 16_000,
    ) -> T:
        client = self._get_client()
        # messages.parse validates against the Pydantic schema and returns the typed object.
        response = client.messages.parse(
            model=self.model,
            max_tokens=max_tokens,
            thinking={"type": "adaptive"},
            output_config={"effort": self.effort},
            cache_control={"type": "ephemeral"},  # cache the system prefix
            system=system,
            messages=[{"role": "user", "content": user}],
            output_format=schema,
        )
        return response.parsed_output  # type: ignore[return-value]


@dataclass
class MockLLM:
    """Deterministic mock for tests. Users register a response-builder keyed by
    schema class; .structured() calls the builder with (system, user) and returns
    a validated Pydantic instance.
    """
    responses: dict[type[BaseModel], Any] = field(default_factory=dict)

    def register(self, schema: type[T], builder: Any) -> None:
        """`builder` is either a `schema` instance, a dict, or a callable
        (system, user) -> dict-or-instance.
        """
        self.responses[schema] = builder

    def structured(
        self,
        system: str,
        user: str,
        schema: type[T],
        *,
        max_tokens: int = 16_000,
    ) -> T:
        if schema not in self.responses:
            raise KeyError(f"MockLLM has no response registered for {schema.__name__}")
        builder = self.responses[schema]
        if callable(builder):
            result = builder(system, user)
        else:
            result = builder
        if isinstance(result, schema):
            return result
        return schema.model_validate(result)
