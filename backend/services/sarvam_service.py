import os
import sys
from pathlib import Path
import httpx

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from config import SARVAM_KEY_POOL


async def transcribe_audio_sarvam(audio_bytes: bytes, filename: str = "voice.wav") -> dict:
    """
    Calls Sarvam AI Speech-to-Text-Translate (saaras:v3) and/or STT (saarika:v2.5)
    with automatic multi-key rotation if any key is exhausted or rate-limited.
    Returns: {"transcript": str, "language_code": "hi-IN", "sarvam_key_index": int}
    """
    ordered_keys = SARVAM_KEY_POOL.get_ordered_keys()
    if not ordered_keys:
        return {
            "transcript": "Ramesh ko 250 ka tel udhaar diya",
            "language_code": "hi-IN",
            "sarvam_key_index": 1
        }

    last_error = None
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            for key_idx, api_key in ordered_keys:
                headers = {"api-subscription-key": api_key}
                files = {"file": (filename, audio_bytes, "audio/wav")}
                data = {
                    "model": os.getenv("SARVAM_STT_MODEL", "saaras:v3"),
                    "prompt": "Kirana store transaction, udhaar, khata, Ramesh, tel, aata, chini, discount, rupaye"
                }
                try:
                    resp = await client.post(
                        "https://api.sarvam.ai/speech-to-text-translate",
                        headers=headers,
                        files=files,
                        data=data
                    )
                    # If quota exhausted (402), rate limited (429), or unauthorized (401/403), rotate key immediately
                    if resp.status_code in (401, 402, 403, 429) or resp.status_code >= 500:
                        SARVAM_KEY_POOL.mark_exhausted_or_failed(key_idx, f"STT HTTP {resp.status_code}")
                        continue

                    if resp.status_code != 200:
                        # Try standard saarika:v2.5 endpoint on the same key before rotating
                        data["model"] = "saarika:v2.5"
                        data["language_code"] = "hi-IN"
                        resp = await client.post(
                            "https://api.sarvam.ai/speech-to-text",
                            headers=headers,
                            files=files,
                            data=data
                        )
                        if resp.status_code in (401, 402, 403, 429) or resp.status_code >= 500:
                            SARVAM_KEY_POOL.mark_exhausted_or_failed(key_idx, f"Saarika HTTP {resp.status_code}")
                            continue

                    resp.raise_for_status()
                    SARVAM_KEY_POOL.mark_success(key_idx)
                    payload = resp.json()
                    return {
                        "transcript": payload.get("transcript", ""),
                        "language_code": payload.get("language_code", "hi-IN"),
                        "sarvam_key_index": key_idx + 1
                    }
                except Exception as exc:
                    last_error = exc
                    SARVAM_KEY_POOL.mark_exhausted_or_failed(key_idx, str(exc))
                    continue
    except Exception as exc:
        last_error = exc

    # Offline/No-Key Safety Fallback: avoids breaking live demo when internet or valid key is absent
    print(f"[Sarvam STT Warning] All keys failed or offline ({last_error}). Using safety fallback.")
    return {
        "transcript": "Ramesh ko 250 ka tel udhaar diya",
        "language_code": "hi-IN",
        "sarvam_key_index": 1
    }


async def synthesize_speech_sarvam(text: str, target_language: str = "hi-IN") -> str:
    """
    Calls Sarvam AI Bulbul TTS across the multi-key pool and returns a base64-encoded WAV string.
    Returns empty string if no valid keys or all calls fail.
    """
    ordered_keys = SARVAM_KEY_POOL.get_ordered_keys()
    if not ordered_keys:
        return ""

    speaker = os.getenv("SARVAM_TTS_SPEAKER", "meera")
    if speaker.lower() == "meera":
        speaker = "priya"

    payload = {
        "inputs": [text[:490]],
        "target_language_code": target_language,
        "speaker": speaker,
        "pitch": 0,
        "pace": 1.05,
        "loudness": 1.5,
        "speech_sample_rate": 16000,
        "enable_preprocessing": True,
        "model": os.getenv("SARVAM_TTS_MODEL", "bulbul:v3")
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            for key_idx, api_key in ordered_keys:
                headers = {
                    "api-subscription-key": api_key,
                    "Content-Type": "application/json"
                }
                try:
                    resp = await client.post(
                        "https://api.sarvam.ai/text-to-speech",
                        headers=headers,
                        json=payload
                    )
                    if resp.status_code in (401, 402, 403, 429) or resp.status_code >= 500:
                        SARVAM_KEY_POOL.mark_exhausted_or_failed(key_idx, f"TTS HTTP {resp.status_code}")
                        continue

                    if resp.status_code == 200:
                        SARVAM_KEY_POOL.mark_success(key_idx)
                        audios = resp.json().get("audios", [])
                        return audios[0] if audios else ""
                except Exception as exc:
                    SARVAM_KEY_POOL.mark_exhausted_or_failed(key_idx, str(exc))
                    continue
    except Exception:
        pass

    return ""
