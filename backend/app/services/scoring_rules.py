from typing import Dict

class ScoringRules:
    # Weights for risk factors
    WEIGHTS = {
        "severity": 0.30,
        "path_length": 0.15,
        "mitre_tactic": 0.25,
        "privilege_escalation": 0.15,
        "sensitive_asset": 0.15
    }

    # Severity to numeric mapping
    SEVERITY_MAP = {
        "Critical": 10,
        "High": 8,
        "Medium": 5,
        "Low": 2,
        "Info": 1
    }

    # MITRE Critical Tactics
    CRITICAL_TACTICS = ["Initial Access", "Privilege Escalation", "Credential Access"]

    # Privilege Escalation Keywords
    PRIVILEGE_KEYWORDS = ["Privilege", "Admin", "Root"]

    # Sensitive Asset Keywords/Files
    SENSITIVE_ASSETS = ["database.py", "config.py", "secrets"]

    @staticmethod
    def get_risk_level(score: float) -> str:
        if score >= 8.0: return "Critical"
        if score >= 6.0: return "High"
        if score >= 4.0: return "Medium"
        return "Low"
