from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.config import settings
import logging

# Key function: Use remote address (IP) by default
# We can override this in route decorators to use user ID if available

def get_key_func(request):
    # This is a placeholder. 
    # For authenticated routes, we might want to use the user ID.
    # However, getting user ID here might be complex if it depends on dependency injection.
    # Standard practice is to limit by IP for unauth and IP or User for auth. 
    # slowapi uses request.client.host by default with get_remote_address
    return get_remote_address(request)

# Initialize Limiter
# Storage URI: Use Redis if available, else Memory
storage_uri = settings.REDIS_URL if settings.REDIS_URL else "memory://"

if not settings.REDIS_URL:
    logging.warning("REDIS_URL not set. Falling back to in-memory rate limiting. NOT recommended for production (Cloud Run multi-instance).")

limiter = Limiter(key_func=get_remote_address, storage_uri=storage_uri)
