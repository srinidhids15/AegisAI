from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.project import Project
from app.models.vulnerability import Vulnerability
from app.models.user import User
from app.services.scanner_service import ScannerService
from app.services.parser_service import ParserService
from app.core.logging import logger

class AnalysisService:
    @staticmethod
    def run_analysis(db: Session, user: User, project_id: str):
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        
        # Access control: Only owner or admin (admin logic TBD, assuming owner for now)
        if project.created_by != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not project owner")

        project_path = project.storage_path
        
        # Clear previous results per requirements (prevent duplicates)
        db.query(Vulnerability).filter(Vulnerability.project_id == project_id).delete()
        db.commit()

        findings = []

        # Sequential Execution
        logger.info(f"Starting analysis for project {project_id}")
        
        # 1. Bandit
        bandit_raw = ScannerService.run_bandit(project_path)
        findings.extend(ParserService.parse_bandit(bandit_raw))
        
        # 2. Semgrep
        semgrep_raw = ScannerService.run_semgrep(project_path)
        findings.extend(ParserService.parse_semgrep(semgrep_raw))
        
        # 3. Gitleaks
        gitleaks_raw = ScannerService.run_gitleaks(project_path)
        findings.extend(ParserService.parse_gitleaks(gitleaks_raw))
        
        # 4. Trivy
        trivy_raw = ScannerService.run_trivy(project_path)
        findings.extend(ParserService.parse_trivy(trivy_raw))

        # Store Findings
        for finding in findings:
            vuln = Vulnerability(
                project_id=project_id,
                scanner_name=finding["scanner"],
                vulnerability_type=finding["type"],
                file_path=finding["file"],
                line_number=finding["line"],
                severity=finding["severity"],
                description=finding["description"],
                raw_identifier=finding["rule_id"]
            )
            db.add(vuln)
        
        db.commit()
        logger.info(f"Analysis complete for project {project_id}. Found {len(findings)} issues.")
        return len(findings)

    @staticmethod
    def get_results(db: Session, user: User, project_id: str):
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        
        if project.created_by != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not project owner")
            
        return db.query(Vulnerability).filter(Vulnerability.project_id == project_id).all()
