"""
Async Telegram Bot Service Stub.
Handles voice notes, QR reminders, and UPI payment settlement callbacks.
Will be implemented in Prompt S2 by Smarpit.
"""

from typing import Optional, Callable, Any
from sqlalchemy.orm import Session

_TELEGRAM_BOT_ACTIVE = False

def is_telegram_bot_active() -> bool:
    """Returns whether the Telegram bot polling task is running"""
    return _TELEGRAM_BOT_ACTIVE

async def start_telegram_bot(ws_broadcast_callback: Optional[Callable[[dict], Any]] = None) -> None:
    """Starts the async Telegram bot"""
    global _TELEGRAM_BOT_ACTIVE
    _TELEGRAM_BOT_ACTIVE = True

async def stop_telegram_bot() -> None:
    """Stops the async Telegram bot"""
    global _TELEGRAM_BOT_ACTIVE
    _TELEGRAM_BOT_ACTIVE = False

async def send_telegram_qr_reminder(
    db: Session,
    customer_id: int,
    amount: Optional[float] = None,
    item_name: str = "Khata Balance",
    tx_id: int = 0
) -> dict:
    """
    Sends interactive UPI QR reminder with payment simulation callback to customer.
    """
    return {
        "status": "sent",
        "customer_id": customer_id,
        "amount": amount or 0.0,
        "item_name": item_name,
        "tx_id": tx_id
    }

async def send_telegram_discount_broadcast(
    db: Session,
    item_name: str,
    discount_offer: str,
    message_text: str
) -> int:
    """
    Sends promotional discount message to all regular customers via Telegram.
    Returns the count of recipients reached.
    """
    return 5

