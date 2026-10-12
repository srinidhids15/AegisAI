from neo4j import Session as NeoSession
from sqlalchemy.orm import Session as PgSession
from app.models.project import Project
from app.models.vulnerability import Vulnerability
from app.db.neo4j_session import Neo4jSession
from app.core.logging import logger

class MitreMappingService:
    # Deterministic mapping rules as per Objective Part 3
    MAPPING_RULES = {
        "SQL Injection": "T1190",
        "Command Injection": "T1059",
        "Hardcoded": "T1552",
        "IDOR": "T1213",
        "Remote Code Execution": "T1059",
        "partial executable path": "T1059",
        "subprocess": "T1059"
    }

    @staticmethod
    def map_vulnerabilities(db: PgSession, project_id: str):
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return None

        vulnerabilities = db.query(Vulnerability).filter(Vulnerability.project_id == project_id).all()
        mapped_count = 0
        unmapped_count = 0

        driver = Neo4jSession.get_driver()
        with driver.session() as session:
            for vuln in vulnerabilities:
                # Deterministic match
                technique_id = None
                vuln_type = vuln.vulnerability_type
                
                # Try exact match or keyword match
                for rule_type, tech_id in MitreMappingService.MAPPING_RULES.items():
                    if rule_type.lower() in vuln_type.lower():
                        technique_id = tech_id
                        break
                
                if technique_id:
                    # Link in Neo4j
                    query = """
                    MATCH (v:Vulnerability {rule_id: $rule_id, project_id: $project_id, file_path: $file_path})
                    MATCH (t:MitreTechnique {id: $tech_id})
                    MERGE (v)-[:MAPS_TO]->(t)
                    RETURN count(v)
                    """
                    # Use unique identifiers from the graph build phase
                    # Note: We need to ensure we use the same path normalization as in GraphBuilderService
                    # For simplicity, we assume the graph build was done and paths matched.
                    
                    # Vulnerability node in Neo4j uses file_path which we normalized to relative
                    # Mapping logic needs to be consistent.
                    import os
                    rel_path = vuln.file_path
                    if rel_path.startswith(project.storage_path):
                         rel_path = os.path.relpath(rel_path, project.storage_path)

                    session.run(query, 
                        rule_id=vuln.raw_identifier, 
                        project_id=project_id, 
                        file_path=rel_path,
                        tech_id=technique_id
                    )
                    mapped_count += 1
                else:
                    unmapped_count += 1

        return {
            "project_id": project_id,
            "mapped_vulnerabilities": mapped_count,
            "unmapped_vulnerabilities": unmapped_count
        }

    @staticmethod
    def get_summary(project_id: str):
        driver = Neo4jSession.get_driver()
        with driver.session() as session:
            # Aggregate by tactic
            query = """
            MATCH (v:Vulnerability {project_id: $project_id})-[:MAPS_TO]->(t:MitreTechnique)
            RETURN t.tactic as tactic, count(distinct t) as techniques
            """
            result = session.run(query, project_id=project_id)
            tactics = []
            for record in result:
                tactics.append({
                    "tactic": record["tactic"],
                    "techniques": record["techniques"]
                })
            return {"tactics": tactics}
