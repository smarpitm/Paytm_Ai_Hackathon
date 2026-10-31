"""
Multi-turn Conversation State Machine Stub.
Handles disambiguation and new customer phone capture.
Will be implemented in Prompt K3 by Kush.
"""

from sqlalchemy.orm import Session

_CURRENT_SESSION_STATE = "IDLE"

def get_session_state() -> str:
    """Returns 'IDLE' | 'AWAITING_DISAMBIGUATION' | 'AWAITING_NEW_CUSTOMER_PHONE'"""
    return _CURRENT_SESSION_STATE

def reset_session() -> None:
    """Resets conversational state machine back to IDLE"""
    global _CURRENT_SESSION_STATE
    _CURRENT_SESSION_STATE = "IDLE"

async def process_utterance(db: Session, text: str, source: str = "SOUNDBOX", sarvam_key_index: int = 1) -> dict:
    """
    Processes merchant utterance, evaluates state transitions, logs DB entries,
    and returns a structured payload.
    """
    return {
        "event_type": "VOICE_PROCESSED",
        "soundbox_state": "IDLE",
        "transcript": text,
        "parsed_intent": {
            "intent": "LOG_UDHAAR",
            "customer_name": "Ramesh Sharma",
            "item_name": "Tel",
            "amount": 250.0,
            "_meta": {"groq_key_index": 1, "model_used": "llama-3.3-70b-versatile"}
        },
        "reply_text": "Ramesh Sharma ke khate mein 250 rupaye likh diye gaye.",
        "tts_audio_base64": "",
        "conversation_session_state": _CURRENT_SESSION_STATE,
        "qr_preview_base64": None
    }

