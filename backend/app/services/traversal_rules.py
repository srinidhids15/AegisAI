class TraversalRules:
    # Allowed transitions between node labels
    VALID_TRANSITIONS = {
        "Endpoint": ["File"],
        "File": ["Vulnerability", "Function", "Endpoint", "Dependency"],
        "Vulnerability": ["MitreTechnique", "File"],
        "Function": ["Vulnerability", "File"], # Added for depth
        "Dependency": ["Vulnerability"],
        "MitreTechnique": [] # Sink
    }

    # Node labels that can serve as entry points
    ENTRY_LABELS = ["Endpoint", "Vulnerability"]

    MAX_DEPTH = 5
    MAX_PATHS = 50

    @staticmethod
    def is_valid_step(from_label: str, to_label: str) -> bool:
        return to_label in TraversalRules.VALID_TRANSITIONS.get(from_label, [])
