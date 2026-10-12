from sqlalchemy.orm import Session
from app.models.attack_path import AttackPath
from app.services.rag_service import RAGService
from app.services.llm_provider import get_llm_provider
from app.core.logging import logger

class ExplanationService:
    @staticmethod
    def generate_explanation(db: Session, attack_path_id: str):
        attack_path = db.query(AttackPath).filter(AttackPath.id == attack_path_id).first()
        if not attack_path:
            return None

        try:
            # 1. Build RAG Context
            context = RAGService.build_context(db, attack_path)
            
            # 2. Get Prompt
            prompt = RAGService.get_prompt_template(context)
            
            # 3. Call LLM
            provider = get_llm_provider()
            explanation = provider.generate(prompt)
            
            return {
                "attack_path_id": attack_path.id,
                "risk_score": attack_path.risk_score,
                "explanation": explanation
            }
        except Exception as e:
            logger.error(f"Explanation service failed for path {attack_path_id}: {str(e)}")
            raise e
