from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api import health, auth, ingestion, analysis, graph, mitre, attack, risk, explanation, projects
from app.core.config import settings
from app.core.security import SecurityHeadersMiddleware
from app.core.middleware import RateLimitMiddleware, InputValidationMiddleware, RequestIdMiddleware
from app.core import logging # Initialize logging
from app.db.session import engine, Base
from app.models import user, project, vulnerability, attack_path # Import models to register them with Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables
    from app.db.session import engine, Base
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: Close connections
    from app.db.neo4j_session import Neo4jSession
    from app.core.middleware import redis_client
    Neo4jSession.close()
    if redis_client:
        redis_client.close()
    engine.dispose()

def get_application() -> FastAPI:
    _app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

    _app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"], # Minimal method list
        allow_headers=["Content-Type", "Authorization"],
    )

    _app.add_middleware(RequestIdMiddleware)
    _app.add_middleware(SecurityHeadersMiddleware)
    _app.add_middleware(RateLimitMiddleware)
    _app.add_middleware(InputValidationMiddleware)

    # 1. Global Exception Handler (Phase 10 Hardening)
    @_app.middleware("http")
    async def global_exception_handler(request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as e:
            from app.core.logging import logger
            import uuid
            
            error_id = str(uuid.uuid4())
            logger.error(f"Unhandled Exception [{error_id}]: {str(e)}", exc_info=True)
            
            from fastapi.responses import JSONResponse
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Internal Server Error",
                    "request_id": error_id if settings.ENVIRONMENT == "development" else None
                }
            )

    _app.include_router(health.router)
    _app.include_router(auth.router)
    _app.include_router(ingestion.router)
    _app.include_router(analysis.router)
    _app.include_router(graph.router)
    _app.include_router(mitre.router)
    _app.include_router(attack.router)
    _app.include_router(risk.router)
    _app.include_router(explanation.router)
    _app.include_router(projects.router)

    return _app

app = get_application()
