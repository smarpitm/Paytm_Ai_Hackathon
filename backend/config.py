import os
from dotenv import load_dotenv

load_dotenv()

def _load_key_pool(prefix: str) -> list[str]:
    """
    Collects keys from:
    1. Comma-separated <PREFIX>_API_KEYS (e.g., SARVAM_API_KEYS=k1,k2,k3)
    2. Single <PREFIX>_API_KEY
    3. Numbered <PREFIX>_API_KEY_1 .. <PREFIX>_API_KEY_10
    Deduplicates while preserving order and strips placeholders.
    """
    raw_keys = []
    csv_val = os.getenv(f"{prefix}_API_KEYS", "")
    if csv_val:
        raw_keys.extend([k.strip() for k in csv_val.split(",") if k.strip()])

    single_val = os.getenv(f"{prefix}_API_KEY", "").strip()
    if single_val:
        raw_keys.append(single_val)

    for i in range(1, 11):
        numbered_val = os.getenv(f"{prefix}_API_KEY_{i}", "").strip()
        if numbered_val:
            raw_keys.append(numbered_val)

    seen = set()
    valid_keys = []
    for k in raw_keys:
        if k and not k.startswith("your_") and not k.startswith("sarvam_key_") and not k.startswith("gsk_key_"):
            if k not in seen:
                seen.add(k)
                valid_keys.append(k)
    return valid_keys


class KeyPoolRotator:
    """
    Stateful key pool that starts at the current active key index and automatically
    advances to the next key whenever a quota/rate-limit/auth failure occurs.
    """
    def __init__(self, name: str, keys: list[str]):
        self.name = name
        self.keys = keys
        self.current_index = 0

    def get_ordered_keys(self) -> list[tuple[int, str]]:
        """
        Returns [(key_index, api_key), ...] starting from the last known working key.
        """
        if not self.keys:
            return []
        n = len(self.keys)
        return [
            ((self.current_index + offset) % n, self.keys[(self.current_index + offset) % n])
            for offset in range(n)
        ]

    def mark_exhausted_or_failed(self, failed_index: int, reason: str = ""):
        if not self.keys:
            return
        next_index = (failed_index + 1) % len(self.keys)
        print(
            f"[{self.name} KeyPool] Key #{failed_index + 1} failed/exhausted ({reason}). "
            f"Rotating to Key #{next_index + 1}/{len(self.keys)}"
        )
        self.current_index = next_index

    def mark_success(self, working_index: int):
        self.current_index = working_index

    def get_pool_status(self) -> dict:
        return {
            "active_key": (self.current_index + 1) if self.keys else 1,
            "total_keys": max(len(self.keys), 3)
        }


SARVAM_KEY_POOL = KeyPoolRotator("SarvamAI", _load_key_pool("SARVAM"))
GROQ_KEY_POOL = KeyPoolRotator("Groq", _load_key_pool("GROQ"))

MERCHANT_UPI_ID = os.getenv("MERCHANT_UPI_ID", "sharmakirana@paytm")
MERCHANT_NAME = os.getenv("MERCHANT_NAME", "Sharma Kirana Store")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
DEFAULT_DEMO_CHAT_ID = os.getenv("DEFAULT_DEMO_CHAT_ID", "")
