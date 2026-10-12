import os

class FileDetectionService:
    LANGUAGE_MAP = {
        ".py": "Python",
        ".js": "JavaScript",
        ".ts": "TypeScript",
        ".java": "Java",
        ".go": "Go",
        ".tf": "HCL (Terraform)",
        ".cpp": "C++",
        ".c": "C",
        ".rb": "Ruby",
        ".php": "PHP"
    }

    FRAMEWORK_PATTERNS = {
        "FastAPI": ["fastapi", "uvicorn"],
        "Django": ["django"],
        "Flask": ["flask"],
        "React": ["react"],
        "Vue": ["vue"],
        "Spring": ["spring", "springboot"],
        "Express": ["express"]
    }

    DEPENDENCY_FILES = [
        "requirements.txt",
        "package.json",
        "pom.xml",
        "go.mod",
        "Dockerfile",
        "docker-compose.yml",
        "main.tf"
    ]

    @staticmethod
    def detect(storage_path: str):
        detected_languages = set()
        detected_frameworks = set()
        found_dependency_files = []

        for root, _, files in os.walk(storage_path):
            # Limit depth or skip hidden dirs like .git
            if ".git" in root:
                continue

            for file in files:
                # Language detection via extension
                ext = os.path.splitext(file)[1]
                if ext in FileDetectionService.LANGUAGE_MAP:
                    detected_languages.add(FileDetectionService.LANGUAGE_MAP[ext])

                # Dependency file detection
                if file in FileDetectionService.DEPENDENCY_FILES:
                    rel_path = os.path.relpath(os.path.join(root, file), storage_path)
                    found_dependency_files.append(rel_path)

                # Simple framework detection via file content (first few lines)
                # requirements.txt mapping
                if file == "requirements.txt" or file == "package.json":
                    try:
                        with open(os.path.join(root, file), 'r', errors='ignore') as f:
                            content = f.read().lower()
                            for framework, patterns in FileDetectionService.FRAMEWORK_PATTERNS.items():
                                if any(pattern in content for pattern in patterns):
                                    detected_frameworks.add(framework)
                    except Exception:
                        pass

        return (
            list(detected_languages),
            list(detected_frameworks),
            found_dependency_files
        )
