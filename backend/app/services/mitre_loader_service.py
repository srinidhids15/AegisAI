import json
import os
from neo4j import Session
from app.db.neo4j_session import Neo4jSession
from app.core.logging import logger

class MitreLoaderService:
    @staticmethod
    def load_dataset():
        data_path = "app/data/mitre_attack.json"
        # Handle absolute path for consistency in container
        if not os.path.exists(data_path):
            data_path = os.path.join(os.path.dirname(__file__), "..", "data", "mitre_attack.json")

        try:
            with open(data_path, "r") as f:
                techniques = json.load(f)
            
            inserted_count = 0
            driver = Neo4jSession.get_driver()
            with driver.session() as session:
                for tech in techniques:
                    query = """
                    MERGE (t:MitreTechnique {id: $id})
                    SET t.name = $name,
                        t.tactic = $tactic,
                        t.description = $description
                    RETURN t
                    """
                    session.run(query, 
                        id=tech["id"], 
                        name=tech["name"], 
                        tactic=tech["tactic"], 
                        description=tech["description"]
                    )
                    inserted_count += 1
            
            logger.info(f"Successfully loaded {inserted_count} MITRE techniques")
            return inserted_count
        except Exception as e:
            logger.error(f"Failed to load MITRE dataset: {str(e)}")
            raise e
