from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
import time
import redis
import uuid
from app.core.config import settings
from app.core.logging import logger, request_id_var

# Initialize Redis connection
try:
    redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
except Exception as e:
    logger.error(f"Failed to connect to Redis for Rate Limiting: {e}")
    redis_client = None

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        # Defined as (Limit, Window_Seconds)
        self.limits = {
            "/auth/login": (5, 60),
            "/ingestion": (10, 3600),
            "/analysis": (5, 60),
            "/explanation": (20, 60)
        }

    async def dispatch(self, request: Request, call_next):
        if not redis_client:
            return await call_next(request)

        path = request.url.path
        client_ip = request.client.host
        
        # Check if path is limited
        limit_config = None
        for route, config in self.limits.items():
            if path.startswith(route):
                limit_config = config
                break
        
        if limit_config:
            limit, window = limit_config
            key = f"rl:{path}:{client_ip}"
            
            try:
                current = redis_client.get(key)
                if current and int(current) >= limit:
                    logger.warning(f"Rate limit exceeded for {client_ip} on {path}")
                    return JSONResponse(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        content={"error": "Too many requests. Please try again later."}
                    )
                
                pipe = redis_client.pipeline()
                pipe.incr(key)
                pipe.expire(key, window)
                pipe.execute()
            except Exception as e:
                logger.error(f"Rate limiter error: {e}")

        return await call_next(request)

class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        token = request_id_var.set(request_id)
        try:
            response = await call_next(request)
            response.headers["X-Request-ID"] = request_id
            return response
        finally:
            request_id_var.reset(token)

class InputValidationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Max request body size (50MB as per requirement, but we'll use bytes)
        MAX_SIZE = 50 * 1024 * 1024 # 50MB
        
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > MAX_SIZE:
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content={"error": "Request body too large. Maximum size is 50MB."}
            )
            
        return await call_next(request)
