import hashlib
import hmac
import uuid
from app.core.config import settings

# Since we don't have real Razorpay credentials in this environment, 
# we'll mock the interactions but keep the structure real.

class PaymentService:
    def __init__(self):
        self.key_id = settings.RAZORPAY_KEY_ID
        self.key_secret = settings.RAZORPAY_KEY_SECRET
    
    async def create_order(self, amount: int, currency: str = "INR") -> dict:
        """
        Simulates creating an order with Razorpay.
        """
        # In a real app: client.order.create(data=...)
        mock_order_id = f"order_{uuid.uuid4().hex[:14]}"
        return {
            "id": mock_order_id,
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
        """
        Simulates verifying the payment signature.
        For simulation: we accept ANY signature if it equals "mock_signature" 
        OR if we just return True for dev purposes.
        """
        msg = f"{order_id}|{payment_id}"
        generated_signature = hmac.new(
           bytes(self.key_secret, 'latin-1'), 
           bytes(msg, 'latin-1'), 
           hashlib.sha256
        ).hexdigest()
        
        if generated_signature == signature:
            return True
        return False

payment_service = PaymentService()
