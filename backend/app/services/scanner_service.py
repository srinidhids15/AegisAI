import subprocess
import os
from fastapi import HTTPException, status
from app.core.logging import logger

class ScannerService:
    @staticmethod
    def validate_project_path(project_path: str):
        if not os.path.exists(project_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project path {project_path} not found"
            )
        if not project_path.startswith("/tmp/aegisai_projects/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid project path"
            )

    @staticmethod
    def run_bandit(project_path: str) -> str:
        ScannerService.validate_project_path(project_path)
        cmd = ["bandit", "-r", project_path, "-f", "json", "-q"]
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
            return result.stdout
        except subprocess.TimeoutExpired:
            logger.error(f"Bandit timed out for {project_path}")
            return "{}"
        except Exception as e:
            logger.error(f"Bandit execution error: {str(e)}")
            return "{}"

    @staticmethod
    def run_semgrep(project_path: str) -> str:
        ScannerService.validate_project_path(project_path)
        # Using a basic p/security-audit policy for testing
        cmd = ["semgrep", "--config=p/security-audit", project_path, "--json", "-q"]
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
            return result.stdout
        except subprocess.TimeoutExpired:
            logger.error(f"Semgrep timed out for {project_path}")
            return "{}"
        except Exception as e:
            logger.error(f"Semgrep execution error: {str(e)}")
            return "{}"

    @staticmethod
    def run_gitleaks(project_path: str) -> str:
        ScannerService.validate_project_path(project_path)
        cmd = ["gitleaks", "detect", "--source", project_path, "--format", "json", "--report-path", "/tmp/gitleaks_report.json"]
        try:
            # Gitleaks writes to a file, so we read it afterwards
            subprocess.run(cmd, capture_output=True, timeout=120)
            # Check if report exists
            if os.path.exists("/tmp/gitleaks_report.json"):
                with open("/tmp/gitleaks_report.json", "r") as f:
                    report = f.read()
                os.remove("/tmp/gitleaks_report.json")
                return report
            return "[]"
        except Exception as e:
            logger.error(f"Gitleaks execution error: {str(e)}")
            return "[]"

    @staticmethod
    def run_trivy(project_path: str) -> str:
        ScannerService.validate_project_path(project_path)
        cmd = ["trivy", "fs", "--format", "json", project_path]
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
            return result.stdout
        except Exception as e:
            logger.error(f"Trivy execution error: {str(e)}")
            return "{}"
