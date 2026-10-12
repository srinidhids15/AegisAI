from neo4j import Session
from typing import List, Dict, Any

class GraphService:
    @staticmethod
    def create_project_node(session: Session, project_id: str, name: str):
        query = """
        MERGE (p:Project {id: $project_id})
        SET p.name = $name
        RETURN p
        """
        session.run(query, project_id=project_id, name=name)

    @staticmethod
    def create_file_node(session: Session, project_id: str, file_path: str):
        query = """
        MATCH (p:Project {id: $project_id})
        MERGE (f:File {path: $file_path, project_id: $project_id})
        MERGE (p)-[:CONTAINS]->(f)
        RETURN f
        """
        session.run(query, project_id=project_id, file_path=file_path)

    @staticmethod
    def create_function_node(session: Session, project_id: str, file_path: str, function_name: str):
        query = """
        MATCH (f:File {path: $file_path, project_id: $project_id})
        MERGE (fn:Function {name: $function_name, file_path: $file_path, project_id: $project_id})
        MERGE (f)-[:DECLARES]->(fn)
        RETURN fn
        """
        session.run(query, project_id=project_id, file_path=file_path, function_name=function_name)

    @staticmethod
    def create_endpoint_node(session: Session, project_id: str, file_path: str, method: str, path: str):
        query = """
        MATCH (f:File {path: $file_path, project_id: $project_id})
        MERGE (e:Endpoint {method: $method, path: $path, project_id: $project_id})
        MERGE (f)-[:EXPOSES]->(e)
        RETURN e
        """
        session.run(query, project_id=project_id, file_path=file_path, method=method, path=path)

    @staticmethod
    def create_dependency_node(session: Session, project_id: str, file_path: str, dep_name: str):
        query = """
        MATCH (f:File {path: $file_path, project_id: $project_id})
        MERGE (d:Dependency {name: $dep_name, project_id: $project_id})
        MERGE (f)-[:DEPENDS_ON]->(d)
        RETURN d
        """
        session.run(query, project_id=project_id, file_path=file_path, dep_name=dep_name)

    @staticmethod
    def create_vulnerability_node(session: Session, project_id: str, file_path: str, vuln_data: Dict[str, Any]):
        query = """
        MATCH (f:File {path: $file_path, project_id: $project_id})
        MERGE (v:Vulnerability {
            type: $type, 
            severity: $severity, 
            rule_id: $rule_id,
            project_id: $project_id,
            file_path: $file_path
        })
        MERGE (f)-[:HAS_VULNERABILITY]->(v)
        RETURN v
        """
        session.run(query, 
            project_id=project_id, 
            file_path=file_path,
            type=vuln_data["type"],
            severity=vuln_data["severity"],
            rule_id=vuln_data["rule_id"]
        )

    @staticmethod
    def clear_project_graph(session: Session, project_id: str):
        query = """
        MATCH (n {project_id: $project_id})
        DETACH DELETE n
        """
        session.run(query, project_id=project_id)

    @staticmethod
    def get_summary(session: Session, project_id: str) -> Dict[str, int]:
        counts = {}
        mapping = {
            "File": "files",
            "Function": "functions",
            "Endpoint": "endpoints",
            "Dependency": "dependencies",
            "Vulnerability": "vulnerabilities"
        }
        for label, key in mapping.items():
            query = f"MATCH (n:{label} {{project_id: $project_id}}) RETURN count(n) as count"
            result = session.run(query, project_id=project_id).single()
            counts[key] = result["count"]
        return counts
