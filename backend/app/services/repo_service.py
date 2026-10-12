import subprocess
import os
import shutil
import re
from fastapi import HTTPException, status
from app.core.logging import logger

class RepoService:
    BASE_SANDBOX = "/tmp/aegisai_projects"

    @staticmethod
    def is_safe_url(url: str) -> bool:
        # Strict HTTPS only
        if not url.startswith("https://"):
            return False
        
        # Prevent SSRF: block localhost and common private IP ranges
        # This is a basic implementation as per requirements
        forbidden_patterns = [
            r"localhost",
            r"127\.0\.0\.1",
            r"^10\.",
            r"^172\.(1[6-9]|2[0-9]|3[0-1])\.",
            r"^192\.168\.",
            r"0\.0\.0\.0"
        ]
        
        for pattern in forbidden_patterns:
            if re.search(pattern, url):
                return False
        
        return True

    @staticmethod
    def clone_repo(repo_url: str, project_id: str) -> str:
        if not RepoService.is_safe_url(repo_url):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or forbidden repository URL"
            )

        target_path = os.path.join(RepoService.BASE_SANDBOX, project_id)
        
        # Ensure base directory exists
        os.makedirs(RepoService.BASE_SANDBOX, exist_ok=True)
        
        # Secure Git Clone Command
        # --depth=1 for minimal ingestion
        # --recursive submodules disabled by not including flag
        cmd = [
            "git", "clone", 
            "--depth", "1", 
            repo_url, 
            target_path
        ]

        try:
            logger.info(f"Cloning repo {repo_url} to {target_path}")
            # Timeout set to 60 seconds
            subprocess.run(cmd, check=True, timeout=60, capture_output=True, text=True)
            return target_path
        except subprocess.TimeoutExpired:
            logger.error(f"Clone timed out for {repo_url}")
            if os.path.exists(target_path):
                shutil.rmtree(target_path)
            raise HTTPException(
                status_code=status.HTTP_408_REQUEST_TIMEOUT,
                detail="Repository cloning timed out"
            )
        except subprocess.CalledProcessError as e:
            logger.error(f"Clone failed for {repo_url}: {e.stderr}")
            if os.path.exists(target_path):
                shutil.rmtree(target_path)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to clone repository"
            )
