import time
import uuid
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

logger = logging.getLogger(__name__)

class ObservabilityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 1. Request Correlation ID
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id
        
        # Start Timer
        start_time = time.time()
        
        # Log Request Start
        # We use strict JSON logging, ensuring context is passed via 'extra' if using structlog
        # But with standard logging + JSONFormatter, we can pass extra dict.
        # However, our JSONFormatter looks for attributes on the record.
        # The easiest way with standard logging is to use the `extra` kwarg.
        
        logger.info(
            f"Request Started: {request.method} {request.url.path}",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "user_agent": request.headers.get("user-agent"),
            }
        )
        
        try:
            response = await call_next(request)
            
            # Calculate Duration
            duration_ms = (time.time() - start_time) * 1000
            
            # Log Request End
            logger.info(
                f"Request Completed: {response.status_code}",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": response.status_code,
                    "duration_ms": round(duration_ms, 2)
                }
            )
            
            # Attach Header
            response.headers["X-Request-ID"] = request_id
            return response
            
        except Exception as e:
            # Calculate Duration
            duration_ms = (time.time() - start_time) * 1000
            
            logger.error(
                f"Request Failed: {str(e)}",
                exc_info=True,
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": 500,
                    "duration_ms": round(duration_ms, 2)
                }
            )
            raise e
