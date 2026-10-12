import os
import re
from sqlalchemy.orm import Session as PgSession
from neo4j import Session as NeoSession
from app.models.project import Project
from app.models.vulnerability import Vulnerability
from app.services.graph_service import GraphService
from app.db.neo4j_session import Neo4jSession
from app.core.logging import logger

class GraphBuilderService:
    # Regex patterns for Python
    PY_FUNC_RE = re.compile(r"def\s+(\w+)\s*\(")
    PY_EP_RE = re.compile(r"@(?:app|router)\.(get|post|put|delete|patch)\s*\(\s*['\"](.*?)['\"]")
    PY_DEP_RE = re.compile(r"^(?:import|from)\s+(\w+)", re.MULTILINE)

    # Regex patterns for JS/TS
    JS_FUNC_RE = re.compile(r"function\s+(\w+)\s*\(|const\s+(\w+)\s*=\s*\(.*?\)\s*=>")
    JS_EP_RE = re.compile(r"(?:app|router)\.(get|post|put|delete|patch)\s*\(\s*['\"](.*?)['\"]")
    JS_DEP_RE = re.compile(r"require\s*\(\s*['\"](.*?)['\"]\s*\)|import\s+.*?\s+from\s+['\"](.*?)['\"]")

    @staticmethod
    def build_graph(db: PgSession, project_id: str):
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return False

        vulnerabilities = db.query(Vulnerability).filter(Vulnerability.project_id == project_id).all()
        
        driver = Neo4jSession.get_driver()
        with driver.session() as neo_session:
            # Idempotency: Clear previous graph data for this project
            GraphService.clear_project_graph(neo_session, project_id)
            
            # Create Project Node
            GraphService.create_project_node(neo_session, project_id, project.name)

            storage_path = project.storage_path
            if not os.path.exists(storage_path):
                logger.error(f"Storage path {storage_path} for project {project_id} not found")
                return False

            # Walk and Parse Files
            for root, _, files in os.walk(storage_path):
                if ".git" in root: continue
                
                for file in files:
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, storage_path)
                    
                    # Create File Node
                    GraphService.create_file_node(neo_session, project_id, rel_path)
                    
                    ext = os.path.splitext(file)[1]
                    if ext in [".py", ".js", ".ts"]:
                        GraphBuilderService._parse_file(neo_session, project_id, file_path, rel_path, ext)

            # Link Vulnerabilities
            for vuln in vulnerabilities:
                vuln_path = vuln.file_path
                # If absolute, make it relative to storage_path
                if vuln_path.startswith(storage_path):
                    vuln_path = os.path.relpath(vuln_path, storage_path)
                
                vuln_data = {
                    "type": vuln.vulnerability_type,
                    "severity": vuln.severity,
                    "rule_id": vuln.raw_identifier
                }
                GraphService.create_vulnerability_node(neo_session, project_id, vuln_path, vuln_data)

        return True

    @staticmethod
    def _parse_file(session: NeoSession, project_id: str, abs_path: str, rel_path: str, ext: str):
        try:
            with open(abs_path, 'r', errors='ignore') as f:
                content = f.read()

            if ext == ".py":
                # Functions
                for match in GraphBuilderService.PY_FUNC_RE.finditer(content):
                    GraphService.create_function_node(session, project_id, rel_path, match.group(1))
                
                # Endpoints
                for match in GraphBuilderService.PY_EP_RE.finditer(content):
                    GraphService.create_endpoint_node(session, project_id, rel_path, match.group(1).upper(), match.group(2))
                
                # Dependencies
                for match in GraphBuilderService.PY_DEP_RE.finditer(content):
                    GraphService.create_dependency_node(session, project_id, rel_path, match.group(1))

            elif ext in [".js", ".ts"]:
                # Functions
                for match in GraphBuilderService.JS_FUNC_RE.finditer(content):
                    name = match.group(1) or match.group(2)
                    if name:
                        GraphService.create_function_node(session, project_id, rel_path, name)
                
                # Endpoints
                for match in GraphBuilderService.JS_EP_RE.finditer(content):
                    GraphService.create_endpoint_node(session, project_id, rel_path, match.group(1).upper(), match.group(2))
                
                # Dependencies
                for match in GraphBuilderService.JS_DEP_RE.finditer(content):
                    dep = match.group(1) or match.group(2)
                    if dep:
                        GraphService.create_dependency_node(session, project_id, rel_path, dep)
        except Exception as e:
            logger.error(f"Error parsing file {rel_path}: {str(e)}")
