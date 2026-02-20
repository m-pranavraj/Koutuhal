import json
import redis
import uuid
import logging
from typing import Optional, Dict
from app.core.config import settings

logger = logging.getLogger(__name__)

class AIJobQueueService:
    def __init__(self):
        self.redis_client = None
        if settings.REDIS_URL:
            if settings.REDIS_URL.startswith("memory://"):
                logger.warning("Using memory:// for Redis. JOB QUEUE WILL NOT WORK ACROSS PROCESSES.")

            try:
                self.redis_client = redis.from_url(settings.REDIS_URL)
                # Test connection
                self.redis_client.ping()
                logger.info("Redis: Connected successfully.")
            except Exception as e:
                logger.error("Redis Connection Failed: %s", e)
        else:
            logger.warning("REDIS_URL not set. Async jobs will use mock (no queue).")

    def enqueue_job(self, job_data: Dict):
        """
        Push job to Redis list 'ai_jobs_queue'.
        job_data must include 'job_id'.
        """
        if self.redis_client:
            try:
                self.redis_client.lpush("ai_jobs_queue", json.dumps(job_data))
            except Exception as e:
                logger.error("Redis Enqueue Error: %s", e)
                raise e
        else:
            logger.debug("Mock Enqueue: %s", str(job_data))

    def dequeue_job(self) -> Optional[Dict]:
        """
        Blocking pop from Redis list.
        Returns job_data dict.
        """
        if self.redis_client:
            try:
                result = self.redis_client.brpop("ai_jobs_queue", timeout=5)
                if result:
                    return json.loads(result[1])
            except Exception as e:
                pass
        return None

queue_service = AIJobQueueService()
