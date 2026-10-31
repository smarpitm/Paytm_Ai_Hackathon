# VoiceVyapar — AI-Ready Product Requirements Document (PRD) & Architecture Blueprint

**Event:** Paytm Build for India AI Hackathon – Delhi

**Track:** Track 1 — Merchant Growth AI ("Build the AI business partner for every Paytm merchant")

**Team:** BINARYBRAINS

**Deliverable Type:** Full-Stack Implementation Specification (Designed for zero-ambiguity execution by AI coding assistants and developers)

## 1. Executive Summary & Architectural Decisions Log

### 1.1 Product Vision

**VoiceVyapar** is a hyper-localized, voice-first AI CFO and business copilot built for Indian micro-merchants (kirana stores, street vendors, and small retailers) operating through the **Paytm Soundbox** and **Telegram/WhatsApp**. It eliminates manual app typing by turning 5-second vernacular voice commands (Hindi, Hinglish, Bhojpuri, Tamil) into structured ledger entries, automated UPI payment reminders with dynamic QR codes, regular customer discount broadcasts, nightly sales briefings, and real-time working capital credit scores.

### 1.2 Core Architectural Decisions (Locked for Hackathon)

| Decision Area | Locked Choice | Rationale | 
| ----- | ----- | ----- | 
| **Frontend Architecture** | **React 18 (Vite) + Tailwind CSS + Lucide Icons + React Router v6** | Fast build times, zero SSR hydration issues, and clean separation into two dedicated routes: `/soundbox` (Live IoT Hardware Simulator) and `/erp` (Paytm Merchant Growth Dashboard). | 
| **Backend Framework** | **FastAPI (Python 3.10+) + WebSockets (`uvicorn`)** | Matches pitch deck architecture, provides automatic Swagger UI (`/docs`) for judges, handles async Telegram webhooks, and broadcasts real-time events to both `/soundbox` and `/erp`. | 
| **Database** | **SQLite + SQLAlchemy ORM** | Zero cloud network latency, 100% offline/venue-Wi-Fi reliability, instant reset/re-seeding between judge demos via a single API call. | 
| **Multi-Key API Failover Pool** | **Automatic Key Rotation for both Sarvam AI & Groq APIs (`config.py`)** | Supports multiple teammate API keys (`SARVAM_API_KEYS` and `GROQ_API_KEYS`). Automatically rotates to the next key on HTTP `402` (credits exhausted), `429` (rate limit), `401`, or `5xx` errors so the live demo never stops. | 
| **Speech-to-Text (ASR)** | **Sarvam AI (`saarika:v2.5` & `saaras:v3`)** + Multi-Key Pool + Browser Web Speech fallback | Handles noisy Indian storefronts and code-mixed Hinglish/Bhojpuri/Tamil at ₹0.49/min (\~0.05 credits per 6-sec voice note). | 
| **Intent Parser (LLM)** | **Groq API (`llama-3.3-70b-versatile` -> `llama-3.1-8b-instant`)** + Multi-Key Pool | Sub-250ms LPU inference with strict JSON schema output. Keeping customer fuzzy-matching in Python (`rapidfuzz` / SQLite) keeps prompt tokens under 350 tokens per call. | 
| **Text-to-Speech (TTS)** | **Sarvam AI (`bulbul:v3`)** + Multi-Key Pool + Browser `speechSynthesis` fallback | Authentic Indian conversational voice returned as base64 WAV audio so the simulated Soundbox speaks naturally. | 
| **Messaging & QR Loop** | **Live Telegram Bot API (`python-telegram-bot`) + `qrcode` UPI Generator** | Delivers real, interactive payment reminders with dynamic Paytm UPI QR images and a one-tap **`[ Simulate Paytm UPI Payment ]`** inline button straight to a real mobile phone during the live demo. | 
| **Customer Phone Capture** | **Pre-Synced Paytm UPI Customer Graph + Voice-First New Customer Onboarding** | Regular customers' phone numbers are auto-populated from past Paytm QR UPI scans. If a new customer name is spoken, the Soundbox asks for their 10-digit mobile number by voice and registers them hands-free. | 

### 1.3 Scope Boundaries (In-Scope vs. Future Scope)

| Feature Category | In-Scope for Hackathon MVP (Build Now) | Out-of-Scope / Future Scope (Pitch Slide Only) | 
| ----- | ----- | ----- | 
| **Voice Khata & Udhaar** | Log credit (`LOG_UDHAAR`), log cash sales (`LOG_CASH_SALE`), voice disambiguation (*"Ramesh Sharma ya Verma?"*), voice phone capture for new customers. | Multi-branch store ledgers, OCR scanning of paper bill books. | 
| **Payment Recovery** | Automated Telegram message with generated Paytm UPI QR image + interactive **`[ Pay ₹X via Paytm UPI ]`** callback button that auto-settles Khata and triggers a live Soundbox voice announcement. | Meta WhatsApp Business Cloud API production templates (requires Meta business verification). | 
| **Nightly 9 PM Brief** | One-click or voice-triggered EOD summary announcing **Total Daily Sales (UPI + Udhaar)**, **Top-Selling Items of the Day** (aggregated from daily transactions), and **Pending Udhaar Summary**. | Automated SKU-level inventory stock counting and B2B distributor restocking orders (moved to Future Scope to avoid manual stock-upload friction). | 
| **Merchant Growth** | Voice-triggered **Regular Customer Discount Broadcast** (*"Aaj chinni par ₹5 chhoot hai, sabhi pakke grahako ko message bhej do"*) sent live to all regular customers on Telegram. | Dynamic supplier discount scraping or wholesale marketplace bidding. | 
| **Working Capital Credit** | Live **Paytm Creditworthiness Score (300–900)** computed from UPI velocity + Khata recovery rate + ledger consistency, unlocking a pre-qualified micro-loan offer card. | Live NBFC loan disbursement and e-NACH mandate signing. | 

## 2. Complete Repository File Structure

An AI coding assistant must create this exact directory tree:

```
voicevyapar/
├── README.md
├── .env.example
├── backend/
│   ├── requirements.txt
│   ├── .env
│   ├── main.py                      # FastAPI entry point, CORS, REST routes, WebSocket manager
│   ├── config.py                    # Multi-Key rotation & pool loader for Sarvam, Groq, and Telegram
│   ├── database.py                  # SQLite engine, SessionLocal, Base
│   ├── models.py                    # SQLAlchemy ORM models (Customer, Transaction, Broadcast, MerchantStats)
│   ├── schemas.py                   # Pydantic request/response schemas
│   ├── seed.py                      # Realistic kirana store seed data & demo reset logic
│   └── services/
│       ├── __init__.py
│       ├── sarvam_service.py        # Multi-key Sarvam AI STT (saarika/saaras) & TTS (bulbul:v3) wrapper
│       ├── llm_service.py           # Multi-key + multi-model Groq JSON intent extractor (70b -> 8b)
│       ├── session_manager.py       # Multi-turn conversation state (disambiguation & new customer phone capture)
│       ├── qr_service.py            # Generates Paytm-branded UPI QR PNG in memory (base64 & bytes)
│       ├── telegram_service.py      # Async Telegram Bot: voice note listener, QR sender, payment callback handler
│       └── credit_engine.py         # Deterministic + explainable Paytm Creditworthiness Score calculator
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx                  # React Router setup (/soundbox and /erp) + top navigation bar
        ├── index.css                # Tailwind directives & custom LED glow animations
        ├── lib/
        │   ├── api.js               # Axios/Fetch wrappers for FastAPI endpoints
        │   └── socket.js            # WebSocket client hook for real-time Soundbox <-> ERP sync
        ├── pages/
        │   ├── SoundboxPage.jsx     # Page 1: Live IoT Paytm Soundbox Hardware Simulator & Telemetry Console
        │   └── ErpDashboardPage.jsx # Page 2: Merchant ERP (Khata, Regular Customers, Discount Broadcasts, Credit Score)
        └── components/
            ├── Navbar.jsx           # Switcher between /soundbox and /erp + API Key Pool health + Reset Demo button
            ├── SoundboxDevice.jsx   # Interactive 3D-styled Paytm Soundbox with animated LED ring & Push-to-Talk
            ├── TelemetryLog.jsx     # Real-time edge event log (STT transcript, active API key index, LLM JSON, WS events)
            ├── KhataTable.jsx       # Customer Udhaar ledger, phone numbers, Telegram link badge, Remind button
            ├── BroadcastPanel.jsx   # Voice/UI Discount Broadcast creator & sent campaign history
            └── CreditScoreCard.jsx  # 300-900 gauge, explainable score factors, Pre-Approved Paytm Loan modal

```

## 3. Environment Variables, Multi-Key Pool Config & Dependencies

### 3.1 `backend/.env.example`

Supports both comma-separated key lists (`SARVAM_API_KEYS`, `GROQ_API_KEYS`) and numbered environment variables (`SARVAM_API_KEY_1`, `SARVAM_API_KEY_2`, etc.) so all teammates can pool their keys together:

```
# Server Configuration
PORT=8000
FRONTEND_URL=http://localhost:5173

# Sarvam AI Multi-Key Pool (Comma-separated OR numbered keys; automatically rotates when credits/rate limits run out)
SARVAM_API_KEYS=sarvam_key_teammate_1,sarvam_key_teammate_2,sarvam_key_teammate_3
SARVAM_API_KEY_1=sarvam_key_teammate_1
SARVAM_API_KEY_2=sarvam_key_teammate_2
SARVAM_API_KEY_3=sarvam_key_teammate_3
SARVAM_STT_MODEL=saaras:v3
SARVAM_TTS_MODEL=bulbul:v3
SARVAM_TTS_FEMALE_SPEAKER=priya
SARVAM_TTS_MALE_FALLBACK_SPEAKER=arvind

# Groq API Multi-Key Pool (Comma-separated OR numbered keys; rotates across keys AND falls back from 70b to 8b)
GROQ_API_KEYS=gsk_key_teammate_1,gsk_key_teammate_2,gsk_key_teammate_3
GROQ_API_KEY_1=gsk_key_teammate_1
GROQ_API_KEY_2=gsk_key_teammate_2
GROQ_API_KEY_3=gsk_key_teammate_3
GROQ_PRIMARY_MODEL=llama-3.3-70b-versatile
GROQ_FALLBACK_MODEL=llama-3.1-8b-instant

# Telegram Bot Credentials (Live Phone Demo)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
DEFAULT_DEMO_CHAT_ID=your_personal_telegram_chat_id_optional

# Merchant UPI Details for Dynamic QR Generation
MERCHANT_UPI_ID=sharmakirana@paytm
MERCHANT_NAME=Sharma Kirana Store

```

TTS tries `SARVAM_TTS_FEMALE_SPEAKER` across the available Sarvam keys first. It uses `SARVAM_TTS_MALE_FALLBACK_SPEAKER` only if the female voice fails for every key.

### 3.2 `backend/config.py` (Central Multi-Key Pool & Stateful Rotator)

This module loads all provided Sarvam and Groq keys, deduplicates them, and provides a thread-safe rotator that remembers which key is currently healthy so subsequent requests don't waste time hitting an exhausted key first:

```
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
        print(f"[{self.name} KeyPool] Key #{failed_index + 1} failed/exhausted ({reason}). Rotating to Key #{next_index + 1}/{len(self.keys)}")
        self.current_index = next_index

    def mark_success(self, working_index: int):
        self.current_index = working_index


SARVAM_KEY_POOL = KeyPoolRotator("SarvamAI", _load_key_pool("SARVAM"))
GROQ_KEY_POOL = KeyPoolRotator("Groq", _load_key_pool("GROQ"))

```

### 3.3 `backend/requirements.txt`

```
fastapi==0.115.0
uvicorn[standard]==0.30.6
sqlalchemy==2.0.35
pydantic==2.9.2
python-dotenv==1.0.1
python-multipart==0.0.12
httpx==0.27.2
groq==0.11.0
python-telegram-bot==21.6
qrcode[pil]==8.0
Pillow==10.4.0
rapidfuzz==3.10.0
websockets==13.1

```

### 3.4 `frontend/package.json`

```
{
  "name": "voicevyapar-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 5173",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.446.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.13",
    "vite": "^5.4.8"
  }
}

```

## 4. Database Schema & Pre-Seeded Kirana Dataset

### 4.1 `backend/database.py`

```
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = "sqlite:///./voicevyapar.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

```

### 4.2 `backend/models.py`

```
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    upi_vpa = Column(String, nullable=True)               # Auto-captured from past Paytm QR scans
    telegram_chat_id = Column(String, nullable=True)      # Bound via /link on Telegram for live phone demo
    is_regular = Column(Boolean, default=True)            # Eligible for regular customer discount alerts
    total_udhaar_balance = Column(Float, default=0.0)
    total_lifetime_spend = Column(Float, default=0.0)
    visit_count = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    transactions = relationship("Transaction", back_populates="customer")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    tx_type = Column(String, nullable=False)              # "UDHAAR_GIVEN", "UDHAAR_SETTLED", "UPI_SALE"
    item_name = Column(String, nullable=False)            # e.g., "Fortune Mustard Oil", "Aashirvaad Aata"
    quantity_text = Column(String, default="1 unit")
    amount = Column(Float, nullable=False)
    is_settled = Column(Boolean, default=False)           # True for UPI_SALE or settled UDHAAR_GIVEN
    raw_voice_transcript = Column(String, nullable=True)
    source_channel = Column(String, default="SOUNDBOX")   # "SOUNDBOX" or "TELEGRAM"
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="transactions")

class DiscountBroadcast(Base):
    __tablename__ = "discount_broadcasts"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, nullable=False)
    discount_offer = Column(String, nullable=False)       # e.g., "₹20 off per 5kg pack"
    message_text = Column(String, nullable=False)
    recipients_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

```

### 4.3 Pre-Seeded Data (`backend/seed.py`)

The seed script must populate the database on startup (and when `POST /api/v1/demo/reset` is called) with the following exact records so every demo scenario works immediately:

1. **Pre-Seeded Regular Customers (Captured via Past Paytm QR Scans):**

   * `Ramesh Sharma` | Phone: `9876543210` | VPA: `9876543210@paytm` | Regular: `True` | Current Udhaar: `₹150.0` | Visits: `24`

   * `Ramesh Verma` | Phone: `9876543211` | VPA: `9876543211@paytm` | Regular: `True` | Current Udhaar: `₹0.0` | Visits: `15` *(deliberately included to trigger the "Which Ramesh—Sharma or Verma?" voice disambiguation flow!)*

   * `Sunita Devi` | Phone: `9811122233` | VPA: `sunitadevi@paytm` | Regular: `True` | Current Udhaar: `₹320.0` | Visits: `31`

   * `Abdul Chacha` | Phone: `9822233344` | VPA: `9822233344@paytm` | Regular: `True` | Current Udhaar: `₹80.0` | Visits: `19`

   * `Priya Gupta` | Phone: `9833344455` | VPA: `priyag@paytm` | Regular: `True` | Current Udhaar: `₹0.0` | Visits: `12`

2. **Pre-Seeded Today's Transactions (So the 9 PM Nightly Brief has rich sales & top-selling item data immediately):**

   * `UPI_SALE` | Item: `Aashirvaad Aata` | Amount: `₹1,850` (across 5 sales today)

   * `UPI_SALE` | Item: `Fortune Tel` | Amount: `₹1,100` (across 4 sales today)

   * `UPI_SALE` | Item: `Tata Salt & Maggi` | Amount: `₹500`

   * `UDHAAR_GIVEN` | Customer: `Ramesh Sharma` | Item: `Chini (Sugar)` | Amount: `₹150` | Settled: `False`

   * `UDHAAR_GIVEN` | Customer: `Sunita Devi` | Item: `Aashirvaad Aata` | Amount: `₹320` | Settled: `False`

   * `UDHAAR_GIVEN` | Customer: `Abdul Chacha` | Item: `Chai Patti` | Amount: `₹80` | Settled: `False`
     *(Total Pre-Seeded Daily Sales = ₹4,000 \[₹3,450 UPI + ₹550 Udhaar\]; Top-Selling Item Today = `Aashirvaad Aata` at ₹2,170 total!)*

## 5. Multi-Turn Voice Pipeline & Multi-Key AI Services (`backend/services/`)

### 5.1 Multi-Key Sarvam AI Wrapper (`backend/services/sarvam_service.py`)

Iterates through `SARVAM_KEY_POOL`. If Key #1 runs out of credits (`HTTP 402`), hits a rate limit (`HTTP 429`), or fails (`HTTP 401/5xx`), it automatically rotates to Key #2 (and Key #3) without dropping the merchant's voice request:

```
import os
import httpx
from config import SARVAM_KEY_POOL

async def transcribe_audio_sarvam(audio_bytes: bytes, filename: str = "voice.wav") -> dict:
    """
    Calls Sarvam AI Speech-to-Text-Translate (saaras:v3) and/or STT (saarika:v2.5)
    with automatic multi-key rotation if any key is exhausted or rate-limited.
    Returns {"transcript": "...", "language_code": "hi-IN", "key_used": 1}
    """
    ordered_keys = SARVAM_KEY_POOL.get_ordered_keys()
    if not ordered_keys:
        raise ValueError("No valid Sarvam API keys configured in .env")

    last_error = None
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

    raise RuntimeError(f"All Sarvam API keys exhausted or failed. Last error: {last_error}")


async def synthesize_speech_sarvam(text: str, target_language: str = "hi-IN") -> str:
    """
    Tries the female voice across the multi-key pool before the male fallback voice.
    """
    ordered_keys = SARVAM_KEY_POOL.get_ordered_keys()
    if not ordered_keys:
        return ""

    female_speaker = os.getenv("SARVAM_TTS_FEMALE_SPEAKER", "priya")
    payload = {
        "inputs": [text[:490]],
        "target_language_code": target_language,
        "speaker": female_speaker,
        "pitch": 0,
        "pace": 1.05,
        "loudness": 1.5,
        "speech_sample_rate": 16000,
        "enable_preprocessing": True,
        "model": os.getenv("SARVAM_TTS_MODEL", "bulbul:v3")
    }

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

    return ""

```

### 5.2 Multi-Key + Multi-Model Groq LLM Intent Parser (`backend/services/llm_service.py`)

Combines **Multi-Key Rotation** (`GROQ_KEY_POOL`) with **Multi-Model Fallback** (`llama-3.3-70b-versatile` -> `llama-3.1-8b-instant`).

* First, it tries `llama-3.3-70b-versatile` across all available Groq API keys in your pool.

* If a key hits its daily `100,000 TPD` limit on `70b`, it rotates to the next teammate's key on `70b`, or falls back to `llama-3.1-8b-instant` (`500,000 TPD` limit per key) so parsing never fails:

```
import os
import json
from groq import Groq
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

def parse_merchant_intent(text: str) -> dict:
    ordered_keys = GROQ_KEY_POOL.get_ordered_keys()
    if not ordered_keys:
        print("[Groq Error] No valid Groq API keys found in .env")
        return {"intent": "UNKNOWN", "customer_name": None, "item_name": None, "amount": None}

    # Try each key in the pool; on each key try PRIMARY_MODEL first, then FALLBACK_MODEL
    for key_idx, api_key in ordered_keys:
        client = Groq(api_key=api_key)
        for model_name in [PRIMARY_MODEL, FALLBACK_MODEL]:
            try:
                completion = client.chat.completions.create(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": text}
                    ],
                    temperature=0.0,
                    max_tokens=200,
                    response_format={"type": "json_object"}
                )
                GROQ_KEY_POOL.mark_success(key_idx)
                parsed = json.loads(completion.choices[0].message.content)
                parsed["_meta"] = {"groq_key_index": key_idx + 1, "model_used": model_name}
                return parsed
            except Exception as exc:
                err_str = str(exc)
                print(f"[Groq Warning] Key #{key_idx + 1} with model {model_name} failed: {err_str}")
                # If invalid key or org-wide rate limit, break inner loop and rotate to next key
                if "401" in err_str or "invalid_api_key" in err_str.lower():
                    break
                continue
        GROQ_KEY_POOL.mark_exhausted_or_failed(key_idx, "Both primary & fallback models failed/rate-limited")

    return {"intent": "UNKNOWN", "customer_name": None, "item_name": None, "amount": None}

```

### 5.3 Multi-Turn Conversation State Machine (`backend/services/session_manager.py`)

Handles the two multi-turn conversational loops required by the hackathon demo:

1. **Flow A — Customer Disambiguation Loop (`AWAITING_DISAMBIGUATION`)**:

   * Merchant says: *"Ramesh ko 250 ka tel udhaar diya."*

   * SQLite query finds **two** matching customers (`Ramesh Sharma` and `Ramesh Verma`).

   * Session state stores `pending_tx = {"amount": 250, "item_name": "Tel", "candidates": ["Ramesh Sharma", "Ramesh Verma"]}` and `state = "AWAITING_DISAMBIGUATION"`.

   * Soundbox speaks: *"Khata mein do Ramesh hain—Ramesh Sharma ya Ramesh Verma?"*

   * Merchant replies: *"Sharma"* (or *"Ramesh Sharma"*).

   * State machine matches `"Sharma"` against the candidate list, logs ₹250 Udhaar for `Ramesh Sharma`, triggers the Telegram QR reminder, and clears the state!

2. **Flow B — Voice-Only New Customer Phone Number Loop (`AWAITING_NEW_CUSTOMER_PHONE`)**:

   * Merchant says: *"Munna ko 120 ka doodh udhaar diya."*

   * SQLite query finds **zero** customers matching `"Munna"`.

   * Session state stores `pending_tx = {"customer_name": "Munna", "amount": 120, "item_name": "Doodh"}` and `state = "AWAITING_NEW_CUSTOMER_PHONE"`.

   * Soundbox speaks: *"Munna khata mein darj nahi hai. Unka dus digit mobile number boliye."*

   * Merchant speaks: *"9810012345"*.

   * State machine extracts the 10 digits, creates a new `Customer(name="Munna", phone="9810012345", is_regular=True)`, logs the ₹120 Udhaar transaction, and speaks: *"Munna ka naya khata ban gaya aur 120 rupaye udhaar likh liya gaya."*

## 6. Dynamic Paytm QR Generator & Live Telegram Bot (`backend/services/`)

### 6.1 Paytm UPI QR Generator (`backend/services/qr_service.py`)

Generates a real, scannable UPI QR code (`upi://pay?pa=...`) in memory so it can be sent via Telegram and displayed on the dashboard without writing temporary files to disk:

```
import io
import base64
import qrcode
import os

def generate_upi_qr_bytes(customer_name: str, amount: float, tx_id: int) -> tuple[bytes, str]:
    merchant_vpa = os.getenv("MERCHANT_UPI_ID", "sharmakirana@paytm")
    merchant_name = os.getenv("MERCHANT_NAME", "Sharma Kirana Store")
    upi_uri = (
        f"upi://pay?pa={merchant_vpa}"
        f"&pn={merchant_name.replace(' ', '%20')}"
        f"&am={amount:.2f}"
        f"&cu=INR"
        f"&tn=Udhaar_Tx_{tx_id}"
    )

    qr = qrcode.QRCode(version=1, box_size=8, border=2)
    qr.add_data(upi_uri)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#002970", back_color="white") # Paytm Navy Blue

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    png_bytes = buf.getvalue()
    b64_str = base64.b64encode(png_bytes).decode("utf-8")
    return png_bytes, f"data:image/png;base64,{b64_str}"

```

### 6.2 Live Telegram Bot Integration (`backend/services/telegram_service.py`)

Uses `python-telegram-bot` v21+ in async mode alongside FastAPI's lifespan context manager so the bot runs inside the same process as `uvicorn`:

* **Command `/start` or `/link <name_or_phone>`**:

  * When you or a judge message `/link Ramesh` to your Telegram bot on your phone, the bot updates `Ramesh Sharma`'s `telegram_chat_id` in SQLite (and sets it as the active demo phone fallback so any unlinked customer's alert also routes to your phone during the demo!).

  * Bot replies: `"✅ Your phone is now linked as Ramesh Sharma (9876543210) for Sharma Kirana Store!"`

* **Voice Note Input from Merchant on Telegram**:

  * If you send a voice note directly in the Telegram bot chat, the handler downloads the `.ogg` voice buffer, sends it to `transcribe_audio_sarvam()`, runs the exact same Khata/Broadcast pipeline, replies in Telegram with text + voice, and broadcasts the update via WebSocket to `/soundbox` and `/erp`.

* **Automated Udhaar Reminder with Dynamic QR & One-Tap UPI Settlement**:

  * Whenever an udhaar is logged (or when the merchant clicks **"Send Reminder"** on `/erp`), the bot sends a photo message to the customer's `telegram_chat_id`:

    * **Image**: The generated Paytm UPI QR code PNG.

    * **Caption**:

      ```
      🙏 Namaste Ramesh Sharma ji!
      Sharma Kirana Store par aapka naya udhaar darj hua hai:
      🛒 Item: Tel
      💰 Amount: ₹250.00
      📊 Kul Baaki Udhaar: ₹400.00
      
      Scan the Paytm QR above or tap the button below to pay instantly:
      
      ```

    * **Inline Keyboard Button**:
      `InlineKeyboardButton("💳 Pay ₹250 via Paytm UPI (Simulate)", callback_data=f"settle_tx:{tx.id}")`

* **Callback Handler (`settle_tx:<tx_id>`) — The Judge-Winning Loop**:

  * When you tap **`[ 💳 Pay ₹250 via Paytm UPI (Simulate) ]`** on your phone:

    1. FastAPI marks Transaction `tx.id` as `is_settled = True` and deducts `₹250` from `Ramesh Sharma`'s `total_udhaar_balance`.

    2. Recalculates the merchant's **Paytm Creditworthiness Score** (which jumps up because of faster recovery velocity).

    3. Edits the Telegram message caption to: `"✅ PAID ₹250.00 via Paytm UPI! Receipt #PYTM98234. Khata Settled."`

    4. Synthesizes Sarvam Bulbul TTS audio: *"Paytm par Ramesh Sharma se 250 rupaye udhaar vasool huye!"*

    5. Pushes a WebSocket event `UPI_PAYMENT_RECEIVED` containing the TTS audio to `/soundbox` (so your laptop Soundbox immediately lights up green and speaks out loud!) and refreshes `/erp`.

## 7. Nightly 9 PM Brief & Explainable Credit Score Engine

### 7.1 Simplified Nightly Brief Logic (No Inventory Dependency)

When the merchant clicks **"Trigger 9 PM Nightly Brief"** on `/soundbox` (or says *"Aaj ka hisaab batao"*):

1. Query all `Transaction` rows created today:

   * `total_upi_sales` = sum of `amount` where `tx_type == "UPI_SALE"` or `is_settled == True`

   * `total_unsettled_udhaar` = sum of `amount` where `tx_type == "UDHAAR_GIVEN"` and `is_settled == False`

   * `total_daily_sales` = `total_upi_sales + total_unsettled_udhaar`

   * `top_item` = `SELECT item_name, SUM(amount) as total FROM transactions GROUP BY item_name ORDER BY total DESC LIMIT 1`

2. Construct the localized Hindi/Hinglish briefing text:

   > *"Namaste! Aaj kul 4,250 rupaye ki bikri hui, jisme 3,700 rupaye UPI se aaye aur 550 rupaye udhaar mein darj huye. Aaj sabse zyada Aashirvaad Aata bika. Aapka Paytm Credit Score badh kar 764 ho gaya hai!"*

3. Generate Sarvam Bulbul TTS audio and return both the structured stats and the audio buffer to the Soundbox simulator.

### 7.2 Explainable Paytm Creditworthiness Score (`backend/services/credit_engine.py`)

Replaces black-box ML training with a deterministic, transparent scoring formula (scale **300 to 900**) that recalculates dynamically on every UPI sale or Udhaar settlement:

```
def calculate_credit_score(db) -> dict:
    """
    Computes a 300-900 Paytm Creditworthiness Score from 4 real database metrics:
    1. Base Score: 550
    2. Daily UPI Inflow Velocity (up to +140 pts): Total settled UPI + recovered cash flow
    3. Khata Recovery Rate (up to +120 pts): Settled Udhaar / Total Udhaar issued
    4. Digital Ledger Consistency (up to +50 pts): Number of voice-logged transactions
    5. Loyal Regular Customer Base (up to +40 pts): Count of regular customers
    """
    # Returns:
    # {
    #   "score": 764,
    #   "max_score": 900,
    #   "rating_tier": "EXCELLENT (Gold Merchant)",
    #   "pre_approved_loan_amount": 35000,
    #   "interest_rate_monthly": "1.25%",
    #   "origination_fee_pct": "1.0%",
    #   "factors": [
    #     {"label": "Daily UPI Inflow Velocity", "impact": "+115 pts", "detail": "₹3,700 verified digital inflow today"},
    #     {"label": "Udhaar Recovery Ratio", "impact": "+84 pts", "detail": "78% of voice khata dues recovered within 7 days"},
    #     {"label": "Active Voice Bookkeeping", "impact": "+35 pts", "detail": "14 structured voice ledger entries logged"},
    #     {"label": "Repeat Customer Graph", "impact": "+30 pts", "detail": "5 verified repeat Paytm QR shoppers"}
    #   ]
    # }

```

## 8. Backend FastAPI Specification & WebSocket Contract (`backend/main.py`)

### 8.1 REST Endpoints

| Method & Path | Request Payload | Response Payload & Action | 
| ----- | ----- | ----- | 
| `POST /api/v1/voice/process-audio` | `multipart/form-data`: `audio` (WAV/WebM/OGG file) | Calls Sarvam STT (with multi-key rotation) -> delegates to `process_utterance()` -> returns transcript, parsed JSON intent, Soundbox reply text, base64 TTS audio, active key indices, and updated conversation state. | 
| `POST /api/v1/voice/process-text` | `{"text": "Ramesh ko 250 ka tel udhaar diya", "source": "SOUNDBOX"}` | Allows instant testing via preset sample buttons or typed fallback without burning mic time. Runs the exact same Multi-Key LLM + State Machine + Sarvam TTS + Telegram pipeline. | 
| `POST /api/v1/soundbox/nightly-brief` | `{}` | Aggregates today's total sales, UPI vs. Udhaar split, and #1 top-selling item; synthesizes Sarvam TTS audio; broadcasts `NIGHTLY_BRIEF` to `/soundbox`. | 
| `GET /api/v1/erp/dashboard` | None | Returns complete ERP state in one call: `summary_metrics`, `customers` list, recent `transactions`, `broadcasts`, `credit_score` object, and `api_pool_status` (active Sarvam/Groq key index & total keys loaded). | 
| `POST /api/v1/khata/remind/{customer_id}` | `{}` | Generates a fresh Paytm UPI QR code for the customer's total pending balance and sends the interactive reminder to Telegram. | 
| `POST /api/v1/webhooks/upi-settlement` | `{"customer_id": 1, "amount": 250.0}` | Simulates or processes a customer UPI payment; updates DB, bumps Credit Score, and broadcasts `UPI_PAYMENT_RECEIVED` with Sarvam TTS audio to `/soundbox`. | 
| `POST /api/v1/broadcast/discount` | `{"item_name": "Aashirvaad Aata", "discount_text": "₹20 off", "custom_message": "..."}` | Sends a localized promotional discount message to all `is_regular=True` customers via Telegram and saves to `discount_broadcasts`. | 
| `POST /api/v1/demo/reset` | `{}` | Drops and re-seeds the SQLite database to the clean baseline state for the next panel of judges. | 

### 8.2 WebSocket Endpoint (`WS /ws/events`)

Both `/soundbox` and `/erp` connect to `ws://localhost:8000/ws/events` on mount. Every state mutation emits a JSON envelope:

```
{
  "event_type": "VOICE_PROCESSED | UPI_PAYMENT_RECEIVED | NIGHTLY_BRIEF | BROADCAST_SENT | DEMO_RESET",
  "timestamp": "2026-10-31T11:55:00Z",
  "soundbox_state": "IDLE | LISTENING | PROCESSING | SPEAKING | ALERT_SUCCESS",
  "transcript": "Ramesh ko 250 ka tel udhaar diya",
  "parsed_intent": {
    "intent": "LOG_UDHAAR",
    "customer_name": "Ramesh",
    "item_name": "Tel",
    "amount": 250,
    "_meta": {
      "groq_key_index": 1,
      "model_used": "llama-3.3-70b-versatile"
    }
  },
  "reply_text": "Khata mein do Ramesh hain—Ramesh Sharma ya Ramesh Verma?",
  "tts_audio_base64": "UklGRiQAAABXQVZFZm10IBAAAAABAAEA...",
  "conversation_session_state": "AWAITING_DISAMBIGUATION"
}

```

## 9. Frontend Specification (2-Page React + Tailwind App)

### 9.1 Shared Top Navigation Bar (`src/components/Navbar.jsx`)

* **Brand Header**: Paytm Blue (`#002970`) & Cyan (`#00BAF2`) header reading **"Paytm VoiceVyapar — AI Merchant Copilot"**.

* **Page Switcher Pills**:

  1. `🔊 Page 1: Live IoT Soundbox (/soundbox)`

  2. `📊 Page 2: Merchant Growth ERP (/erp)`

* **Status Badges**:

  * Live WebSocket connection indicator (`🟢 Edge Connected`).

  * Multi-Key Pool indicator (`🔑 Sarvam Key #1/3 • Groq Key #1/3`).

  * Telegram Bot status (`📱 Telegram Bot Active`).

  * **`[ 🔄 Reset Demo Data ]`** button (resets SQLite DB in 1 click).

### 9.2 Page 1: Live IoT Soundbox Hardware Simulator (`src/pages/SoundboxPage.jsx`)

Designed so judges can clearly see and hear the Paytm Soundbox hardware behavior:

1. **Centerpiece — Interactive Paytm Soundbox Hardware Replica (`SoundboxDevice.jsx`)**:

   * Styled in authentic Paytm matte royal blue (`#002970`) with a Paytm QR sticker preview on the front face, speaker grille mesh, and an animated 360° **LED Status Ring**:

     * `IDLE`: Subtle pulsing Paytm Cyan (`#00BAF2`)

     * `LISTENING`: Vibrant pulsing Emerald Green (`#10B981`)

     * `PROCESSING`: Spinning Amber ring (`#F59E0B`)

     * `SPEAKING`: Audio-reactive glowing Cyan/White waveform

   * **Primary Hardware Controls on the Device**:

     * **`[ 🎙️ Hold or Click to Speak (Mic) ]`**: Uses browser `MediaRecorder` API to record merchant audio and POST to `/api/v1/voice/process-audio` (with automatic Web Speech API transcript backup if mic format varies).

     * **`[ 🌙 Trigger 9 PM Nightly Brief ]`**: Simulates end-of-day store closing; Soundbox speaks total sales and today's #1 top-selling item.

2. **Right Column — Hackathon Failsafe Quick-Voice Presets**:

   * Clickable cards that fire realistic voice commands in 1 click (in case the hackathon hall has loud PA music):

     * **Preset 1 (Disambiguation Flow)**: *"🗣️ 'Ramesh ko 250 ka tel udhaar diya'"* -> Followed by *"🗣️ 'Sharma'"*

     * **Preset 2 (New Customer Voice Phone Onboarding)**: *"🗣️ 'Munna ko 120 ka doodh udhaar diya'"* -> Followed by *"🗣️ '9810012345'"*

     * **Preset 3 (Regular Customer Discount Broadcast)**: *"🗣️ 'Aaj Aashirvaad Aata par 20 rupaye ki chhoot hai, sabhi pakke grahako ko message bhej do'"*

     * **Preset 4 (Cash/UPI Item Sale)**: *"🗣️ '500 rupaye ka Fortune tel becha'"*

3. **Bottom Panel — Live Edge IoT Telemetry Console (`TelemetryLog.jsx`)**:

   * Dark terminal view displaying real-time timestamps, Sarvam STT transcript, active Sarvam/Groq API key number from the rotation pool, Groq LLM extracted JSON (`intent`, `customer_name`, `item_name`, `amount`), Multi-turn Session State (`IDLE` / `AWAITING_DISAMBIGUATION` / `AWAITING_NEW_CUSTOMER_PHONE`), and incoming Telegram UPI settlement callbacks.

### 9.3 Page 2: Paytm Merchant Growth ERP (`src/pages/ErpDashboardPage.jsx`)

Automatically updates in real time via WebSocket whenever you speak into the Soundbox or tap a button on Telegram:

1. **Top KPI Strip (4 Metric Cards)**:

   * **Today's Total Sales**: e.g., `₹4,250` (`₹3,450 UPI + ₹800 Udhaar`)

   * **#1 Top-Selling Item Today**: e.g., `Aashirvaad Aata (₹2,170)`

   * **Total Active Udhaar to Recover**: e.g., `₹800` across 3 customers

   * **Paytm Creditworthiness Score**: e.g., `764 / 900 (Gold Tier)`

2. **Tab 1 — Voice Khata & Regular Customer Directory (`KhataTable.jsx`)**:

   * Displays all customers with:

     * **Customer Name & Regular Badge** (`⭐ Regular Customer`)

     * **Phone Number & Source Badge** (`📱 9876543210 • Auto-Synced via Paytm QR` or `🎙️ Added via Voice`)

     * **Telegram Live Link Status** (`🟢 Phone Linked` or instruction `Send /link Ramesh to Bot`)

     * **Pending Udhaar Balance** (Red badge if `> ₹0`, Green `Settled` badge if `₹0`)

     * **Action Buttons**:

       * **`[ 📲 Send Telegram QR Reminder ]`** (fires the QR + payment button to your phone)

       * **`[ ✅ Simulate UPI Settlement ]`** (backup button on UI in case phone has no internet)

   * Below the customer table: **Live Transaction Feed** showing every voice-logged sale and udhaar with the raw Hindi/Hinglish voice transcript attached.

3. **Tab 2 — Regular Customer Discount Broadcasts (`BroadcastPanel.jsx`)**:

   * Shows how the merchant grows repeat footfall:

     * **Voice Command Prompt Guide**: *"Say on Soundbox: 'Aaj chini par 5 rupaye chhoot hai, sabhi pakke grahako ko message bhej do'"*

     * **Campaign History Table**: Lists every broadcast triggered by voice, the item, discount offer, number of regular customers reached on Telegram, and timestamp.

4. **Tab 3 — Working Capital & Creditworthiness Score (`CreditScoreCard.jsx`)**:

   * Visual radial gauge (300 to 900) with color zones (Red <550, Amber 550–700, Emerald Green 700–900).

   * **Explainable Score Breakdown List**: Shows exact point contributions (`Daily UPI Velocity`, `Udhaar Recovery Ratio`, `Voice Bookkeeping Consistency`, `Repeat Customer Graph`).

   * **Unlocked Offer Card**: **"Pre-Qualified Paytm Merchant Cash Advance: ₹35,000"** (Collateral-Free, 1.25% monthly, instant settlement to Paytm Merchant Bank Account) with a **`[ ⚡ 1-Click Instant Disbursal Demo ]`** modal.

## 10. Step-by-Step Build Instructions for Your Coding AI

Copy and feed the sections of this `PRD.md` to your coding AI (Cursor / Windsurf / Claude Code / Copilot) in these 4 sequential steps:

1. **Step 1 (Backend Core, Multi-Key Rotator & Seeded SQLite DB)**:

   > *"Create `backend/requirements.txt`, `backend/config.py` (with `KeyPoolRotator` for multiple Sarvam and Groq API keys), `backend/database.py`, `backend/models.py`, and `backend/seed.py` exactly as specified in Sections 3 and 4 of `PRD.md`. Ensure `seed.py` populates the 5 regular customers (including both Ramesh Sharma and Ramesh Verma) and today's sample transactions."*

2. **Step 2 (Multi-Key AI Services, QR Generator & Multi-Turn State Machine)**:

   > *"Implement `sarvam_service.py`, `llm_service.py`, `session_manager.py`, `qr_service.py`, and `credit_engine.py` inside `backend/services/` following Sections 5, 6, and 7 of `PRD.md`. Ensure `sarvam_service.py` and `llm_service.py` iterate through `SARVAM_KEY_POOL` and `GROQ_KEY_POOL` so if any key hits a quota or rate limit, it automatically switches to the next key and falls back from `llama-3.3-70b-versatile` to `llama-3.1-8b-instant`."*

3. **Step 3 (Telegram Bot & FastAPI + WebSocket Server)**:

   > *"Implement `backend/services/telegram_service.py` and `backend/main.py` following Sections 6.2 and 8 of `PRD.md`. Wire up the `/link` command, voice note ingestion, QR photo reminder with inline callback button `settle_tx:<id>`, and WebSocket broadcast to connected clients."*

4. **Step 4 (2-Page React + Vite + Tailwind Frontend)**:

   > *"Scaffold the React + Vite + Tailwind frontend in `frontend/` and implement `Navbar.jsx`, `SoundboxPage.jsx` (`/soundbox`), and `ErpDashboardPage.jsx` (`/erp`) following Section 9 of `PRD.md`. Ensure WebSocket events automatically play the base64 TTS audio on `/soundbox` and live-refresh the ERP tables on `/erp`."*