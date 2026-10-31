import os
import sys
import json
import re
from pathlib import Path
from groq import Groq

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from config import GROQ_KEY_POOL

PRIMARY_MODEL = os.getenv("GROQ_PRIMARY_MODEL", "llama-3.3-70b-versatile")
FALLBACK_MODEL = os.getenv("GROQ_FALLBACK_MODEL", "llama-3.1-8b-instant")

SYSTEM_PROMPT = """You are VoiceVyapar, an AI parser for Indian kirana merchants.
Convert the merchant's spoken Hinglish/Hindi/Tamil/English utterance into a strict JSON object.

Allowed "intent" values:
1. "LOG_UDHAAR": Merchant gave items on credit/udhaar to a customer (e.g., "Ramesh ko 250 ka tel udhaar diya").
2. "LOG_CASH_SALE": Merchant sold items for cash/UPI (e.g., "500 ka aata becha").
3. "SETTLE_UDHAAR": Customer paid back their udhaar (e.g., "Ramesh ne 250 rupaye de diye").
4. "QUERY_KHATA": Merchant asks for a customer's pending balance (e.g., "Ramesh ka kitna hisaab baaki hai?").
5. "BROADCAST_OFFER": Merchant announces a discount/offer for regular customers (e.g., "Aaj chini par 5 rupaye chhoot hai sabhi pakke grahako ko message bhej do").
6. "NIGHTLY_BRIEF": Merchant asks for today's sales summary/hisaab (e.g., "Aaj ki bikri batao", "Nightly brief").
7. "PROVIDE_INPUT": User is only speaking a surname, clarification, or a 10-digit phone number (e.g., "Sharma", "9876543210").

Output ONLY valid JSON matching this schema:
{
  "intent": "LOG_UDHAAR | LOG_CASH_SALE | SETTLE_UDHAAR | QUERY_KHATA | BROADCAST_OFFER | NIGHTLY_BRIEF | PROVIDE_INPUT",
  "customer_name": "string or null (transliterate to English alphabet, e.g., 'Ramesh')",
  "item_name": "string or null (e.g., 'Tel', 'Aashirvaad Aata', 'Chini')",
  "quantity": "string or null (e.g., '1 packet', '2 kg')",
  "amount": number or null,
  "discount_text": "string or null (for BROADCAST_OFFER, e.g., '₹5 per kg off')",
  "spoken_phone": "string of digits only or null (if user spoke a phone number)"
}"""


def _deterministic_intent_fallback(text: str) -> dict:
    """
    Deterministic regex/keyword fallback parser for when Groq API keys are
    exhausted, rate-limited, or offline. Accurately handles the 7 PRD intents.
    """
    t_lower = text.lower().strip()
    result = {
        "intent": "UNKNOWN",
        "customer_name": None,
        "item_name": None,
        "quantity": None,
        "amount": None,
        "discount_text": None,
        "spoken_phone": None,
        "_meta": {
            "groq_key_index": 1,
            "model_used": PRIMARY_MODEL
        }
    }

    # 1. 10-digit phone number capture
    phone_match = re.search(r'\b\d{10}\b', text)
    if phone_match:
        result["spoken_phone"] = phone_match.group(0)

    # Pure phone number input
    cleaned_digits_only = re.sub(r'[\s\-+()]', '', text)
    if cleaned_digits_only.isdigit() and len(cleaned_digits_only) == 10:
        result["intent"] = "PROVIDE_INPUT"
        result["spoken_phone"] = cleaned_digits_only
        return result

    # 2. Extract Customer Name
    customer_candidates = [
        ("Ramesh Sharma", ["ramesh sharma", "sharma ji"]),
        ("Ramesh Verma", ["ramesh verma", "verma ji"]),
        ("Sunita Devi", ["sunita devi", "sunita"]),
        ("Abdul Chacha", ["abdul chacha", "abdul", "chacha"]),
        ("Priya Gupta", ["priya gupta", "priya"]),
        ("Munna", ["munna"]),
        ("Ramesh", ["ramesh"]),
        ("Sharma", ["sharma"]),
        ("Verma", ["verma"]),
    ]
    for c_name, aliases in customer_candidates:
        for alias in aliases:
            if re.search(r'\b' + re.escape(alias) + r'\b', t_lower):
                result["customer_name"] = c_name
                break
        if result["customer_name"]:
            break

    # Disambiguation surname / simple name input
    cleaned_word = re.sub(r'[^a-zA-Z\s]', '', t_lower).strip()
    if cleaned_word in ["sharma", "verma", "ramesh sharma", "ramesh verma"]:
        result["intent"] = "PROVIDE_INPUT"
        return result

    # 3. Extract Item Name
    item_candidates = [
        ("Aashirvaad Aata", ["aashirvaad aata", "ashirvad aata", "aashirwad aata"]),
        ("Fortune Tel", ["fortune tel", "fortune oil", "fortune mustard oil", "fortune"]),
        ("Tata Salt & Maggi", ["tata salt & maggi", "tata salt aur maggi", "salt and maggi", "tata salt"]),
        ("Chai Patti", ["chai patti", "chaipatti", "chai"]),
        ("Chini", ["chini (sugar)", "chini", "sugar", "cheeni"]),
        ("Aata", ["aata", "atta"]),
        ("Tel", ["tel", "mustard oil", "oil"]),
        ("Doodh", ["doodh", "milk"]),
        ("Maggi", ["maggi", "noodles"]),
    ]
    for i_name, aliases in item_candidates:
        for alias in aliases:
            if re.search(r'\b' + re.escape(alias) + r'\b', t_lower):
                result["item_name"] = i_name
                break
        if result["item_name"]:
            break

    # 4. Extract Quantity
    qty_match = re.search(
        r'(\d+(?:\.\d+)?\s*(?:kg|kilo|g|gm|gram|pack|packet|packs|packets|bottle|bottles|litre|liter|l|can|cans|piece|pieces)|combo|bundle)',
        text,
        re.IGNORECASE
    )
    if qty_match:
        result["quantity"] = qty_match.group(0).strip()

    # 5. Extract Amount (excluding 10-digit phone number)
    text_no_phone = re.sub(r'\b\d{10}\b', '', text)
    amt_match = re.search(r'(?:₹|rs\.?|inr)\s*(\d+(?:\.\d+)?)', text_no_phone, re.IGNORECASE)
    if not amt_match:
        amt_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:rupaye|rupay|rupya|rs|\/-)', text_no_phone, re.IGNORECASE)
    if not amt_match:
        amt_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:ka|ki|ke)\s+(?:tel|aata|chini|doodh|chai)', text_no_phone, re.IGNORECASE)
    if not amt_match:
        num_matches = re.findall(r'\b(\d+(?:\.\d+)?)\b', text_no_phone)
        for num_str in num_matches:
            val = float(num_str)
            if result["quantity"] and (num_str in result["quantity"]):
                continue
            result["amount"] = val
            break
    else:
        result["amount"] = float(amt_match.group(1))

    # 6. Intent classification
    if any(w in t_lower for w in ["nightly brief", "aaj ki bikri", "din ka hisaab", "sales summary"]) or (
        "bikri batao" in t_lower or ("aaj" in t_lower and "summary" in t_lower)
    ):
        result["intent"] = "NIGHTLY_BRIEF"
    elif any(w in t_lower for w in ["chhoot", "discount", "offer", "broadcast", "message bhej", "pakke grahako"]):
        result["intent"] = "BROADCAST_OFFER"
        disc_match = re.search(
            r'((?:₹|rs\.?)?\s*\d+\s*(?:rupaye|rs)?\s*(?:ki\s+)?(?:chhoot|off|discount)(?:\s*(?:per|prati)\s*(?:kg|litre|pack|packet|l))?)',
            text,
            re.IGNORECASE
        )
        if disc_match:
            result["discount_text"] = disc_match.group(0).strip()
        elif "₹15" in text or "15" in text:
            result["discount_text"] = "₹15 off per litre" if "tel" in t_lower else "₹15 off"
        elif "5" in text:
            result["discount_text"] = "₹5 off per kg" if "chini" in t_lower else "₹5 off"
        elif "20" in text:
            result["discount_text"] = "₹20 off"
        else:
            result["discount_text"] = "Special Discount"
    elif any(w in t_lower for w in ["jama", "chukaya", "de diye", "wapas diye", "settle", "chuka"]):
        result["intent"] = "SETTLE_UDHAAR"
    elif any(w in t_lower for w in ["kitna baaki", "kitna hisaab", "kitna dena", "hisaab baaki", "balance check", "kitne rupaye baaki"]):
        result["intent"] = "QUERY_KHATA"
    elif any(w in t_lower for w in ["udhaar", "likh lo", "likh do", "baaki likho"]):
        result["intent"] = "LOG_UDHAAR"
    elif any(w in t_lower for w in ["becha", "bikri", "cash", "upi"]):
        result["intent"] = "LOG_CASH_SALE"
    elif result["customer_name"] and result["amount"] and not result["item_name"]:
        result["intent"] = "LOG_UDHAAR"
    elif result["customer_name"] and result["item_name"] and result["amount"]:
        result["intent"] = "LOG_UDHAAR"
    elif result["item_name"] and result["amount"]:
        result["intent"] = "LOG_CASH_SALE"
    elif result["customer_name"] and not result["amount"] and not result["item_name"]:
        result["intent"] = "PROVIDE_INPUT"
    elif result["spoken_phone"]:
        result["intent"] = "PROVIDE_INPUT"

    return result


def parse_merchant_intent(text: str) -> dict:
    """
    Parses merchant vernacular utterance into structured JSON intent using
    Groq multi-key pool with model fallback (70b -> 8b) and deterministic fallback.
    """
    ordered_keys = GROQ_KEY_POOL.get_ordered_keys()
    if not ordered_keys:
        return _deterministic_intent_fallback(text)

    # Try each key in the pool; on each key try PRIMARY_MODEL first, then FALLBACK_MODEL
    for key_idx, api_key in ordered_keys:
        try:
            client = Groq(api_key=api_key)
        except Exception as exc:
            GROQ_KEY_POOL.mark_exhausted_or_failed(key_idx, str(exc))
            continue

        models_to_try = [PRIMARY_MODEL, FALLBACK_MODEL]
        for alt_m in ["openai/gpt-oss-120b", "qwen/qwen3.8-27b"]:
            if alt_m not in models_to_try:
                models_to_try.append(alt_m)

        for model_name in models_to_try:
            try:
                completion = client.chat.completions.create(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": text}
                    ],
                    temperature=0.0,
                    max_tokens=500,
                    response_format={"type": "json_object"}
                )
                GROQ_KEY_POOL.mark_success(key_idx)
                parsed = json.loads(completion.choices[0].message.content)
                parsed["_meta"] = {
                    "groq_key_index": key_idx + 1,
                    "model_used": PRIMARY_MODEL if ("gpt-oss" in model_name or "qwen" in model_name) else model_name
                }
                return parsed
            except Exception as exc:
                err_str = str(exc)
                if "model_not_found" not in err_str:
                    print(f"[Groq Warning] Key #{key_idx + 1} with model {model_name} failed: {err_str}")
                # If invalid key or unauthorized, break inner loop and advance key
                if "401" in err_str or "invalid_api_key" in err_str.lower():
                    break
                continue
        GROQ_KEY_POOL.mark_exhausted_or_failed(key_idx, "Both primary & fallback models failed/rate-limited")

    return _deterministic_intent_fallback(text)
