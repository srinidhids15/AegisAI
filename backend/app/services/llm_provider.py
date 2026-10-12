import os
from abc import ABC, abstractmethod
from openai import OpenAI
from app.core.logging import logger

class LLMProvider(ABC):
    @abstractmethod
    def generate(self, prompt: str) -> str:
        """Generate a response for the given prompt."""
        pass

class OpenAIProvider(LLMProvider):
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            logger.error("OPENAI_API_KEY not found in environment")
            # We don't raise here yet to allow the system to start, 
            # but generate() will fail properly.
        
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None

    def generate(self, prompt: str) -> str:
        if not self.client:
            raise ValueError("LLM Provider not configured: Missing API Key")
        
        try:
            # Phase 10: Strict bounds and timeouts
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000,
                temperature=0,
                timeout=30.0 # 30s hard limit
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"LLM Generation failed or timed out: {str(e)}")
            return "Analysis temporarily unavailable due to safety timeout."

class DummyProvider(LLMProvider):
    """Fallback provider for testing when no API key is available."""
    def generate(self, prompt: str) -> str:
        return (
            "This is a simulated AI explanation. To see real analysis, ensure OPENAI_API_KEY is set. "
            "Based on the attack path nodes, an attacker could potentially chain these vulnerabilities "
            " to escalate privileges or access sensitive assets. Remediation should focus on fixing "
            "the root vulnerabilities and enforcing stricter access controls."
        )

def get_llm_provider() -> LLMProvider:
    provider_type = os.getenv("LLM_PROVIDER", "dummy").lower()
    if provider_type == "openai":
        return OpenAIProvider()
    return DummyProvider()
