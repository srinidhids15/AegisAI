import json
from app.core.logging import logger

class NormalizationService:
    @staticmethod
    def normalize_severity(severity: str, scanner: str) -> str:
        s = severity.upper()
        if scanner == "bandit":
            # Bandit uses LOW, MEDIUM, HIGH
            if s == "HIGH": return "High"
            if s == "MEDIUM": return "Medium"
            if s == "LOW": return "Low"
        elif scanner == "semgrep":
            # Semgrep uses ERROR, WARNING, INFO
            if s == "ERROR": return "High"
            if s == "WARNING": return "Medium"
            if s == "INFO": return "Low"
        elif scanner == "trivy":
            # Trivy uses CRITICAL, HIGH, MEDIUM, LOW
            if s == "CRITICAL": return "Critical"
            if s == "HIGH": return "High"
            if s == "MEDIUM": return "Medium"
            if s == "LOW": return "Low"
        elif scanner == "gitleaks":
            # Gitleaks findings are usually high impact secrets
            return "High"
        
        return "Info"

class ParserService:
    @staticmethod
    def parse_bandit(raw_data: str) -> list:
        try:
            data = json.loads(raw_data)
            findings = []
            for issue in data.get("results", []):
                findings.append({
                    "scanner": "bandit",
                    "type": issue.get("issue_text"),
                    "file": issue.get("filename"),
                    "line": issue.get("line_number"),
                    "severity": NormalizationService.normalize_severity(issue.get("issue_severity"), "bandit"),
                    "description": issue.get("issue_text"),
                    "rule_id": issue.get("test_id")
                })
            return findings
        except Exception as e:
            logger.error(f"Parser error for Bandit: {str(e)}")
            return []

    @staticmethod
    def parse_semgrep(raw_data: str) -> list:
        try:
            data = json.loads(raw_data)
            findings = []
            for result in data.get("results", []):
                extra = result.get("extra", {})
                findings.append({
                    "scanner": "semgrep",
                    "type": extra.get("message"),
                    "file": result.get("path"),
                    "line": result.get("start", {}).get("line"),
                    "severity": NormalizationService.normalize_severity(extra.get("severity"), "semgrep"),
                    "description": extra.get("message"),
                    "rule_id": result.get("check_id")
                })
            return findings
        except Exception as e:
            logger.error(f"Parser error for Semgrep: {str(e)}")
            return []

    @staticmethod
    def parse_gitleaks(raw_data: str) -> list:
        try:
            data = json.loads(raw_data)
            findings = []
            for issue in data:
                findings.append({
                    "scanner": "gitleaks",
                    "type": "Hardcoded Secret",
                    "file": issue.get("File"),
                    "line": issue.get("StartLine"),
                    "severity": "High",
                    "description": issue.get("Description"),
                    "rule_id": issue.get("RuleID")
                })
            return findings
        except Exception as e:
            logger.error(f"Parser error for Gitleaks: {str(e)}")
            return []

    @staticmethod
    def parse_trivy(raw_data: str) -> list:
        try:
            data = json.loads(raw_data)
            findings = []
            for result in data.get("Results", []):
                target = result.get("Target")
                for vuln in result.get("Vulnerabilities", []):
                    findings.append({
                        "scanner": "trivy",
                        "type": vuln.get("Title") or vuln.get("VulnerabilityID"),
                        "file": target,
                        "line": None,
                        "severity": NormalizationService.normalize_severity(vuln.get("Severity"), "trivy"),
                        "description": vuln.get("Description"),
                        "rule_id": vuln.get("VulnerabilityID")
                    })
            return findings
        except Exception as e:
            logger.error(f"Parser error for Trivy: {str(e)}")
            return []
