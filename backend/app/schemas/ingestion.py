from pydantic import BaseModel, HttpUrl, validator, Field
from uuid import UUID
from typing import List, Optional

class GitIngestRequest(BaseModel):
    repo_url: str
    project_name: str

    @validator("repo_url")
    def validate_git_url(cls, v):
        if not v.startswith("https://"):
            raise ValueError("Only https:// Git URLs are allowed")
        # Basic protection against SSRF - more handled in service
        blocklist = ["localhost", "127.0.0.1", "::1", "0.0.0.0"]
        for forbidden in blocklist:
            if forbidden in v:
                raise ValueError(f"URL contains forbidden host: {forbidden}")
        return v

class IngestResponse(BaseModel):
    project_id: UUID = Field(validation_alias="id")
    project_name: str = Field(validation_alias="name")
    source_type: str
    detected_languages: List[str]
    detected_frameworks: List[str]
    dependency_files: List[str]

    model_config = {
        "from_attributes": True,
        "populate_by_name": True
    }
