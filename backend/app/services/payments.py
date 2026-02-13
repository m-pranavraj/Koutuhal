import hashlib
import hmac
import uuid
from typing import Optional
from app.core.config import settings

try:
    import razorpay
    RAZORPAY_AVAILABLE = True
except ImportError:
    RAZORPAY_AVAILABLE = False

class PaymentService:
    def __init__(self):
        self.key_id = settings.RAZORPAY_KEY_ID
        self.key_secret = settings.RAZORPAY_KEY_SECRET
        self.client: Optional[razorpay.Client] = None

        if RAZORPAY_AVAILABLE and self.key_id and self.key_secret:
            try:
                self.client = razorpay.Client(auth=(self.key_id, self.key_secret))
            except Exception:
                pass

    async def create_order(self, amount: int, currency: str = "INR") -> dict:
        if self.client:
            try:
                data = {
                    "amount": amount,
                    "currency": currency,
                    "receipt": f"rcpt_{uuid.uuid4().hex[:8]}",
                }
                order = self.client.order.create(data=data)
                return order
            except Exception:
                pass

        return {
            "id": f"order_{uuid.uuid4().hex[:14]}",
            "entity": "order",
            "amount": amount,
            "amount_paid": 0,
            "amount_due": amount,
            "currency": currency,
            "receipt": f"rcpt_{uuid.uuid4().hex[:8]}",
            "status": "created",
            "attempts": 0,
            "created_at": 1691000000,
        }

    async def verify_payment(self, order_id: str, payment_id: str, signature: str) -> bool:
        msg = f"{order_id}|{payment_id}"
        generated_signature = hmac.new(
           bytes(self.key_secret, 'latin-1'),
           bytes(msg, 'latin-1'),
           hashlib.sha256
        ).hexdigest()

        return generated_signature == signature

payment_service = PaymentService()
