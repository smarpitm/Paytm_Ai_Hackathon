# VoiceVyapar — AI-Ready Voice CFO & Merchant Copilot
**Paytm Build for India AI Hackathon – Delhi (Team BINARYBRAINS)**  
*Track 1: Merchant Growth AI*

VoiceVyapar is a hyper-localized, voice-first AI CFO and business copilot built for Indian micro-merchants (kirana stores, street vendors, and small retailers) operating through the **Paytm Soundbox** and **Telegram/WhatsApp**.

---

## 🚀 Quick Start Guide

### 1. Backend Setup
```bash
cd voicevyapar/backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Swagger UI documentation is available at `http://localhost:8000/docs`.

### 2. Frontend Setup
```bash
cd voicevyapar/frontend
npm install
npm run dev
```
Open `http://localhost:5173` to access:
- **Soundbox Simulator**: `http://localhost:5173/soundbox`
- **Merchant ERP Dashboard**: `http://localhost:5173/erp`

---

## 📁 Repository Structure
```
voicevyapar/
├── README.md
├── .env.example
├── context.txt
├── backend/
│   ├── requirements.txt
│   ├── .env
│   ├── main.py                      # FastAPI entry point, CORS, REST routes, WebSocket manager
│   ├── config.py                    # Multi-Key rotation & pool loader for Sarvam, Groq, and Telegram
│   ├── database.py                  # SQLite engine, SessionLocal, Base
│   ├── models.py                    # SQLAlchemy ORM models (Customer, Transaction, DiscountBroadcast, MerchantStats)
│   ├── schemas.py                   # Pydantic request/response schemas
│   ├── seed.py                      # Realistic kirana store seed data & demo reset logic
│   └── services/
│       ├── __init__.py
│       ├── sarvam_service.py        # Multi-key Sarvam AI STT & TTS wrapper
│       ├── llm_service.py           # Multi-key + multi-model Groq JSON intent extractor
│       ├── session_manager.py       # Multi-turn conversation state machine
│       ├── qr_service.py            # Generates Paytm-branded UPI QR PNG in memory
│       ├── telegram_service.py      # Async Telegram Bot
│       └── credit_engine.py         # Deterministic Paytm Creditworthiness Score calculator
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx                  # React Router setup & global state
        ├── index.css                # Tailwind directives & LED ring glow animations
        ├── lib/
        │   ├── api.js               # API client
        │   └── socket.js            # WebSocket client hook
        ├── pages/
        │   ├── SoundboxPage.jsx     # Live IoT Paytm Soundbox Simulator
        │   └── ErpDashboardPage.jsx # Merchant Growth ERP Dashboard
        └── components/
            ├── Navbar.jsx           # App navigation & API pool health
            ├── SoundboxDevice.jsx   # 3D-styled Soundbox hardware with LED status ring
            ├── TelemetryLog.jsx     # Real-time event log
            ├── KhataTable.jsx       # Customer Udhaar ledger
            ├── BroadcastPanel.jsx   # Voice/UI Discount Broadcast creator
            └── CreditScoreCard.jsx  # 300-900 Credit score gauge & pre-approved loan
```

