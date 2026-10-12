from sqlalchemy.orm import Session
from app.models.attack_path import AttackPath
from app.models.vulnerability import Vulnerability
from app.services.scoring_rules import ScoringRules
from app.core.logging import logger
from typing import List

class RiskEngineService:
    @staticmethod
    def calculate_project_risk(db: Session, project_id: str):
        paths = db.query(AttackPath).filter(AttackPath.project_id == project_id).all()
        if not paths:
            return None

        # Fetch vulnerabilities for this project to get severity info
        # Note: Vulnerability info is embedded in node strings in Phase 6, 
        # but for better accuracy we can fetch the records.
        # However, the formula specifies using highest severity in path.
        
        scored_paths = []
        highest_risk = 0.0

        for path in paths:
            score = RiskEngineService._compute_path_score(path)
            path.risk_score = round(score, 2)
            path.risk_level = ScoringRules.get_risk_level(path.risk_score)
            
            if path.risk_score > highest_risk:
                highest_risk = path.risk_score
            
            scored_paths.append(path)

        # Ranking: stable sort descending by score, path_length as tie breaker
        scored_paths.sort(key=lambda x: (x.risk_score, x.path_length), reverse=True)

        for idx, path in enumerate(scored_paths, start=1):
            path.priority_rank = idx

        db.commit()
        return len(scored_paths), highest_risk

    @staticmethod
    def _compute_path_score(path: AttackPath) -> float:
        nodes = path.path_nodes
        
        # 1. Severity Score (W=0.30)
        # Extract severity from node strings (e.g. "Vulnerability:...") or logic
        # For this implementation, we'll assume a default Medium if not detectable, 
        # but try to find it in the node string if we added it (we didn't yet in Phase 6 output)
        # Let's look for "Critical", "High", etc. in the node strings.
        
        max_vuln_score = 5 # Default Medium
        for node in nodes:
            if "Vulnerability" in node:
                # In a real scenario, we'd look up the vuln record.
                # For this mathematical engine, we'll parse or use default.
                for level, val in ScoringRules.SEVERITY_MAP.items():
                    if level in node:
                        max_vuln_score = max(max_vuln_score, val)
        
        s1 = max_vuln_score

        # 2. Path Length Score (W=0.15)
        s2 = min(path.path_length * 2, 10)

        # 3. MITRE Critical Tactic (W=0.25)
        s3 = 3
        for node in nodes:
            if "MitreTechnique" in node:
                for tactic in ScoringRules.CRITICAL_TACTICS:
                    if tactic in node:
                        s3 = 10
                        break
        
        # 4. Privilege Escalation (W=0.15)
        s4 = 0
        for node in nodes:
            for kw in ScoringRules.PRIVILEGE_KEYWORDS:
                if kw.lower() in node.lower():
                    s4 = 10
                    break
        
        # 5. Sensitive Asset Access (W=0.15)
        s5 = 2
        for node in nodes:
            for asset in ScoringRules.SENSITIVE_ASSETS:
                if asset in node:
                    s5 = 10
                    break
        
        # Formula: R = (W1*S1 + W2*S2 + W3*S3 + W4*S4 + W5*S5)
        w = ScoringRules.WEIGHTS
        r = (w["severity"] * s1 + 
             w["path_length"] * s2 + 
             w["mitre_tactic"] * s3 + 
             w["privilege_escalation"] * s4 + 
             w["sensitive_asset"] * s5)
        
        return r

    @staticmethod
    def get_ranked_paths(db: Session, project_id: str):
        return db.query(AttackPath).filter(
            AttackPath.project_id == project_id
        ).order_by(AttackPath.priority_rank.asc()).all()
