"""
Multi-Key + Multi-Model Groq JSON Intent Extractor Stub.
Will be implemented with full multi-model fallback (70b -> 8b) in Prompt K2 by Kush.
"""

def parse_merchant_intent(text: str) -> dict:
    """
    Parses merchant vernacular utterance into structured JSON intent.
    Returns:
    {
        "intent": str,
        "customer_name": str | None,
        "item_name": str | None,
        "quantity": str | None,
        "amount": float | None,
        "discount_text": str | None,
        "spoken_phone": str | None,
        "_meta": {"groq_key_index": int, "model_used": str}
    }
    """
    return {
        "intent": "LOG_UDHAAR",
        "customer_name": "Ramesh",
        "item_name": "Tel",
        "quantity": "1 bottle",
        "amount": 250.0,
        "discount_text": None,
        "spoken_phone": None,
        "_meta": {
            "groq_key_index": 1,
            "model_used": "llama-3.3-70b-versatile"
        }
    }

