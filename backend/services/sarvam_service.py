"""
Multi-Key Sarvam AI STT (saarika/saaras) & TTS (bulbul:v3) Service Stub.
Will be implemented with full key-rotation in Prompt K2 by Kush.
"""

async def transcribe_audio_sarvam(audio_bytes: bytes, filename: str = "voice.wav") -> dict:
    """
    Calls Sarvam AI STT across the multi-key pool.
    Returns: {"transcript": str, "language_code": "hi-IN", "sarvam_key_index": int}
    """
    return {
        "transcript": "Ramesh ko 250 ka tel udhaar diya",
        "language_code": "hi-IN",
        "sarvam_key_index": 1
    }

async def synthesize_speech_sarvam(text: str, target_language: str = "hi-IN") -> str:
    """
    Calls Sarvam AI Bulbul TTS across the multi-key pool.
    Returns base64-encoded WAV audio string.
    """
    return ""

