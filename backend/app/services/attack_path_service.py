from sqlalchemy.orm import Session as PgSession
from app.db.neo4j_session import Neo4jSession
from app.models.attack_path import AttackPath
from app.models.project import Project
from app.services.traversal_rules import TraversalRules
from app.core.logging import logger
import json

class AttackPathService:
    @staticmethod
    def run_simulation(db: PgSession, project_id: str):
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return 0

        # Idempotency: Clear previous paths
        db.query(AttackPath).filter(AttackPath.project_id == project_id).delete()
        db.commit()

        driver = Neo4jSession.get_driver()
        all_paths = []

        with driver.session() as session:
            # Query for entry points - more robust label check
            entry_query = """
            MATCH (n)
            WHERE n.project_id = $project_id AND ANY(lbl IN labels(n) WHERE lbl IN $entry_labels)
            RETURN n, labels(n)[0] as label
            """
            entries = list(session.run(entry_query, project_id=project_id, entry_labels=TraversalRules.ENTRY_LABELS))
            logger.info(f"Found {len(entries)} potential entry points for project {project_id}")
            
            for record in entries:
                start_node = record["n"]
                start_label = record["label"]
                
                # Recursive DFS for path discovery
                AttackPathService._dfs(
                    session, 
                    project_id, 
                    start_node, 
                    start_label, 
                    [f"{start_label}:{start_node.get('path') or start_node.get('name') or start_node.get('type')}"], 
                    {start_node.element_id}, 
                    all_paths
                )
                
                if len(all_paths) >= TraversalRules.MAX_PATHS:
                    break

        logger.info(f"Discovered {len(all_paths)} total attack paths")
        # Store discovered paths
        for path in all_paths[:TraversalRules.MAX_PATHS]:
            ap = AttackPath(
                project_id=project_id,
                path_nodes=path,
                path_length=len(path)
            )
            db.add(ap)
        
        db.commit()
        return len(all_paths)

    @staticmethod
    def _dfs(session, project_id, current_node, current_label, current_path, visited, all_paths):
        if len(current_path) >= TraversalRules.MAX_DEPTH:
            if len(current_path) >= 2:
                all_paths.append(list(current_path))
            return

        if len(all_paths) >= TraversalRules.MAX_PATHS:
            return

        # Fetch outgoing relationships - allow global MitreTechnique nodes
        query = """
        MATCH (n)-[r]->(m)
        WHERE elementId(n) = $node_id 
        AND (m.project_id = $project_id OR "MitreTechnique" IN labels(m))
        RETURN m, labels(m)[0] as label
        """
        results = session.run(query, node_id=current_node.element_id, project_id=project_id)
        
        found_next = False
        for record in results:
            next_node = record["m"]
            next_label = record["label"]
            
            if next_node.element_id in visited:
                continue
                
            if TraversalRules.is_valid_step(current_label, next_label):
                found_next = True
                node_repr = f"{next_label}:{next_node.get('path') or next_node.get('name') or next_node.get('type') or next_node.get('id')}"
                
                visited.add(next_node.element_id)
                current_path.append(node_repr)
                
                AttackPathService._dfs(session, project_id, next_node, next_label, current_path, visited, all_paths)
                
                # Backtrack
                current_path.pop()
                visited.remove(next_node.element_id)

        # If it's a sink or no valid next step, store the path if long enough
        if not found_next and len(current_path) >= 2:
            all_paths.append(list(current_path))

    @staticmethod
    def list_paths(db: PgSession, project_id: str):
        return db.query(AttackPath).filter(AttackPath.project_id == project_id).all()
