import re
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.attack_path import AttackPath
from app.models.vulnerability import Vulnerability
from app.db.neo4j_session import Neo4jSession

class RAGService:
    @staticmethod
    def build_context(db: Session, attack_path: AttackPath) -> Dict[str, Any]:
        """Retrieve and sanitize context for the LLM."""
        
        # 1. Attack Path Nodes (already structured strings)
        nodes = [RAGService.sanitize(str(node)) for node in attack_path.path_nodes]
        
        # 2. MITRE Techniques Detail
        mitre_details = []
        project_id = str(attack_path.project_id)
        
        driver = Neo4jSession.get_driver()
        with driver.session() as session:
            query = """
            MATCH (n:MitreTechnique)
            WHERE ANY(node IN $path_nodes WHERE node CONTAINS n.id)
            RETURN n.id as id, n.name as name, n.tactic as tactic, n.description as description
            """
            results = session.run(query, path_nodes=attack_path.path_nodes)
            for record in results:
                mitre_details.append({
                    "id": record["id"],
                    "name": RAGService.sanitize(record["name"]),
                    "tactic": RAGService.sanitize(record["tactic"]),
                    "description": RAGService.sanitize(record["description"])
                })

        return {
            "attack_path_nodes": nodes,
            "mitre_list": mitre_details,
            "risk_score": attack_path.risk_score,
            "severity": attack_path.risk_level
        }

    @staticmethod
    def sanitize(text: str) -> str:
        """Strip special characters and escape for safety."""
        if not text:
            return ""
        # Remove control characters and limit length
        clean = re.sub(r'[\x00-\x1F\x7F]', '', text)
        return clean[:500]
    
    @staticmethod
    def get_prompt_template(context: Dict[str, Any]) -> str:
        """Construct the strict prompt using a fixed template."""
        nodes_str = "\n- ".join(context["attack_path_nodes"])
        mitre_str = "\n".join([f"- {m['id']}: {m['name']} ({m['tactic']})" for m in context["mitre_list"]])
        
        return f"""You are a senior application security analyst.

Explain the following attack path in simple but technical terms:

Attack Path:
{nodes_str}

MITRE Techniques:
{mitre_str}

Risk Score: {context['risk_score']}

Provide:
1. What the attacker achieves
2. Why it is dangerous
3. Real-world impact
4. Remediation steps
5. Severity summary

Do not invent vulnerabilities.
Do not assume missing data.
Base explanation only on provided context."""
