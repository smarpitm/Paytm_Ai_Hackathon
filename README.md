# 🎙️ VoiceVyapar — AI-Powered Voice CFO & Merchant Growth Copilot

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Paytm Build for India AI Hackathon – Delhi (Team BINARYBRAINS)**  
*Track 1: Merchant Growth AI*

[🚀 Quick Start](#-quick-start) · [📖 Documentation](#-documentation) · [🎯 Features](#-features) · [🏗️ Architecture](#-architecture) · [🔮 Future Scope](#-future-scope)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Key Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Future Scope](#-future-scope)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**VoiceVyapar** is a hyper-localized, voice-first AI CFO and business copilot specifically designed for Indian micro-merchants—kirana stores, street vendors, and small retailers operating through the **Paytm Soundbox ecosystem** and messaging platforms like **Telegram/WhatsApp**.

### Why VoiceVyapar?

India has over **60 million micro-merchants**, many of whom:
- 📱 Have limited smartphone literacy or typing skills
- 🗣️ Prefer speaking in their native languages (Hindi, Hinglish, Tamil, Bhojpuri)
- 📒 Still maintain manual paper ledgers (khata books)
- 💸 Face challenges in tracking credit (udhaar) and collecting payments
- 🏦 Lack formal credit history for business loans

VoiceVyapar bridges this gap by transforming **5-second vernacular voice commands** into:
- ✅ Structured digital ledger entries
- 📲 Automated UPI payment reminders with QR codes
- 📢 Discount broadcast campaigns to regular customers
- 📊 Nightly sales briefings
- 💳 Real-time creditworthiness scoring for working capital loans

---

## 🎯 Problem Statement

### Current Pain Points for Indian Micro-Merchants

1. **Manual Khata Management**: Paper-based credit tracking is error-prone and difficult to manage
2. **Language & Digital Literacy Barriers**: English-only apps alienate 90% of merchants
3. **Payment Collection Challenges**: No automated reminders lead to 30-40% udhaar defaults
4. **No Business Intelligence**: Merchants lack insights into sales patterns, top products, and growth opportunities
5. **Credit Invisibility**: Informal businesses have no credit history, blocking access to MSME loans

### Market Opportunity

- **Total Addressable Market**: 60M+ merchants
- **Current Paytm Soundbox Deployment**: 8M+ devices (as of 2024)
- **Average Daily Transactions**: 15-20 per merchant
- **Estimated Revenue Impact**: ₹2,000-5,000 monthly business growth per merchant

---

## 💡 Solution

VoiceVyapar provides a **zero-friction voice interface** that requires no typing or smartphone expertise:

### Core Capabilities

#### 1️⃣ **Voice Khata Management**
- 🎤 "Ramesh ko 250 ka tel udhaar diya" → Logged as ₹250 credit entry
- 🎤 "Sunita se 500 ka aata becha" → Logged as ₹500 cash sale
- 🎤 "Abdul ne 150 rupaye de diye" → Settles ₹150 outstanding udhaar
- 🎤 "Ramesh ka kitna baaki hai?" → Queries customer's pending balance

#### 2️⃣ **Intelligent Payment Recovery**
- 📲 Auto-generates Paytm UPI QR codes for each udhaar transaction
- 📱 Sends instant Telegram reminders with QR to customer's phone
- 💳 One-tap "Simulate Payment" button for live demos
- ✅ Auto-settles khata and broadcasts success to Soundbox

#### 3️⃣ **Automated Customer Engagement**
- 🎤 "Aaj chini par 5 rupaye chhoot hai, sabhi pakke grahako ko message bhej do"
- 📢 Broadcasts discount offers to all regular customers via Telegram
- 🎯 Filters by customer loyalty tier (regular vs. one-time buyers)

#### 4️⃣ **Nightly 9 PM Business Briefing**
- 📊 Total Daily Sales (UPI + Udhaar breakdown)
- 🏆 Top-Selling Items of the Day
- 💰 Pending Udhaar Summary
- 📈 Updated Paytm Credit Score

#### 5️⃣ **Working Capital Credit Scoring**
- 🏅 **300-900 Point Paytm Credit Score** calculated from:
  - Daily UPI inflow velocity
  - Udhaar recovery ratio
  - Voice ledger consistency
  - Repeat customer base
- 💼 Pre-approved micro-loan offers (₹35K-₹45K)
- 📋 Explainable AI factors for transparency

---

## ✨ Features

### 🎙️ Voice-First Interface
- **Multi-Language Support**: Hindi, Hinglish, Tamil, Bhojpuri, English
- **Multi-Turn Conversations**: Handles disambiguations ("Which Ramesh—Sharma or Verma?")
- **New Customer Onboarding**: Voice-only phone number capture ("Munna ka mobile number boliye")
- **Sarvam AI STT/TTS**: Industry-leading Indian voice recognition and synthesis

### 🤖 Intelligent Intent Parsing
- **7 Core Intents**: LOG_UDHAAR, LOG_CASH_SALE, SETTLE_UDHAAR, QUERY_KHATA, BROADCAST_OFFER, NIGHTLY_BRIEF, PROVIDE_INPUT
- **Groq LLM**: Sub-250ms response time with strict JSON schema output
- **Multi-Key API Failover**: Automatic rotation across team API keys when quotas are exhausted
- **Fuzzy Customer Matching**: RapidFuzz-powered name disambiguation

### 📱 Real-Time Messaging Integration
- **Telegram Bot API**: Live QR reminders and discount broadcasts
- **WhatsApp Business API** (Future Scope): Production-grade messaging
- **Interactive Callbacks**: One-tap payment simulation buttons

### 📊 Merchant Growth Dashboard
- **Live Khata Table**: Customer balances, phone numbers, Telegram link status
- **Transaction History**: 30 most recent voice-logged entries
- **Discount Campaign Manager**: Create and track broadcast campaigns
- **Credit Score Card**: Animated 300-900 gauge with explainable factors

### 🔄 Real-Time WebSocket Sync
- **Soundbox ↔ Dashboard Sync**: WebSocket broadcasts keep both interfaces in sync
- **Live Telemetry Logs**: Real-time STT transcripts, LLM JSON outputs, API key health

### 🎨 Production-Grade UI/UX
- **3D Paytm Soundbox Simulator**: Animated LED ring, push-to-talk button
- **Tailwind CSS + Lucide Icons**: Clean, responsive design
- **Dark Mode Merchant Theme**: Reduced eye strain for low-light stores

---

## 🛠️ Technology Stack

### Backend
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | FastAPI | 0.115.0 | High-performance async API with automatic OpenAPI docs |
| **AI - STT** | Sarvam AI (saaras:v3, saarika:v2.5) | v3 | Indian-language speech-to-text with multi-key failover |
| **AI - TTS** | Sarvam AI (bulbul:v3) | v3 | Natural Hindi/Tamil/English voice synthesis |
| **AI - LLM** | Groq (Llama 3.3 70B → 3.1 8B) | Latest | Sub-250ms intent parsing with JSON schema |
| **Database** | SQLite + SQLAlchemy | 2.0.35 | Zero-latency local DB with ORM |
| **Messaging** | python-telegram-bot | 21.6 | Async Telegram Bot API integration |
| **QR Generation** | qrcode + Pillow | 8.0 | Dynamic Paytm UPI QR code generation |
| **Fuzzy Matching** | rapidfuzz | 3.10.0 | Customer name disambiguation |
| **WebSockets** | uvicorn[standard] | 0.30.6 | Real-time bidirectional communication |

### Frontend
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | React | 18.3.1 | Component-based UI library |
| **Build Tool** | Vite | 5.4.8 | Fast HMR and optimized production builds |
| **Routing** | React Router | 6.26.2 | Client-side routing (/soundbox, /erp) |
| **Styling** | Tailwind CSS | 3.4.13 | Utility-first CSS framework |
| **Icons** | Lucide React | 0.446.0 | Beautiful, consistent icon library |
| **HTTP Client** | Fetch API | Native | RESTful API communication |
| **WebSocket** | Native WebSocket | Native | Real-time event streaming |

### DevOps & Deployment
- **Containerization**: Docker + Docker Compose
- **Cloud Platforms**: Railway, Render, AWS, GCP, Azure
- **Local Development**: Ngrok for instant public tunnels
- **CI/CD**: GitHub Actions (Future Scope)

---

## 🏗️ Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React + Vite)                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐              ┌──────────────────┐          │
│  │  Soundbox Page  │              │ ERP Dashboard    │          │
│  │  - 3D Device    │              │ - Khata Table    │          │
│  │  - Push-to-Talk │              │ - Transactions   │          │
│  │  - LED Ring     │              │ - Credit Score   │          │
│  │  - Telemetry    │              │ - Broadcasts     │          │
│  └────────┬────────┘              └────────┬─────────┘          │
│           │                                │                     │
│           └────────────────┬───────────────┘                     │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   WebSocket     │ (Real-time Events)
                    │   /ws/events    │
                    └────────┬────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                    FASTAPI BACKEND                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐         ┌─────────────────────┐       │
│  │   REST API Layer    │         │  WebSocket Manager  │       │
│  │  - /voice/process   │◄────────┤  - Broadcast Events │       │
│  │  - /erp/dashboard   │         │  - Connection Pool  │       │
│  │  - /khata/remind    │         └──────────┬──────────┘       │
│  │  - /broadcast       │                    │                  │
│  └─────────┬───────────┘                    │                  │
│            │                                 │                  │
│  ┌─────────▼─────────────────────────────────▼────────────┐   │
│  │              SESSION MANAGER                             │   │
│  │  - Multi-turn conversation state machine                │   │
│  │  - Customer disambiguation logic                        │   │
│  │  - New customer phone capture                           │   │
│  └─────────┬─────────────────────────────────┬────────────┘   │
│            │                                  │                │
│  ┌─────────▼──────────┐            ┌─────────▼───────────┐   │
│  │   SARVAM SERVICE   │            │    GROQ SERVICE     │   │
│  │  - STT (saaras:v3) │            │  - Llama 3.3 70B    │   │
│  │  - TTS (bulbul:v3) │            │  - Intent Parsing   │   │
│  │  - Multi-Key Pool  │            │  - Multi-Key Pool   │   │
│  └────────────────────┘            └─────────────────────┘   │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                 CORE SERVICES                            │ │
│  │  - QR Generator (Paytm UPI QR codes)                    │ │
│  │  - Credit Engine (300-900 scoring)                      │ │
│  │  - Telegram Bot (Reminders & Broadcasts)                │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │            SQLite Database (SQLAlchemy ORM)              │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐  │ │
│  │  │  Customers  │  │Transactions │  │DiscountBroadcast│ │ │
│  │  │  - name     │  │ - tx_type   │  │  - item_name   │  │ │
│  │  │  - phone    │  │ - amount    │  │  - recipients  │  │ │
│  │  │  - udhaar   │  │ - is_settled│  │  - message     │  │ │
│  │  └─────────────┘  └─────────────┘  └────────────────┘  │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Telegram Bot   │
                    │  - QR Reminders │
                    │  - Broadcasts   │
                    │  - Voice Notes  │
                    └─────────────────┘
```

### Multi-Key API Failover Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   API KEY POOL ROTATOR                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SARVAM_API_KEYS: [Key1, Key2, Key3]                       │
│  GROQ_API_KEYS: [Key1, Key2, Key3]                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Try Key1 (Current Index)                          │    │
│  │    ↓                                                │    │
│  │  HTTP 402 (Quota Exhausted) / 429 (Rate Limited)?  │    │
│  │    ↓ YES → Rotate to Key2                          │    │
│  │    ↓                                                │    │
│  │  Try Key2                                           │    │
│  │    ↓                                                │    │
│  │  HTTP 401/5xx (Server Error)?                      │    │
│  │    ↓ YES → Rotate to Key3                          │    │
│  │    ↓                                                │    │
│  │  Try Key3                                           │    │
│  │    ↓                                                │    │
│  │  Success (HTTP 200) → Remember Key3 as current     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Next request starts from Key3 (last successful key)        │
└─────────────────────────────────────────────────────────────┘
```

### Multi-Turn Conversation Flow

```
┌─────────────────────────────────────────────────────────────┐
│              FLOW A: Customer Disambiguation                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Merchant: "Ramesh ko 250 ka tel udhaar diya"              │
│      ↓                                                      │
│  [Session Manager] SQLite Query: Find "Ramesh"             │
│      ↓                                                      │
│  Found 2 matches: Ramesh Sharma, Ramesh Verma              │
│      ↓                                                      │
│  State = AWAITING_DISAMBIGUATION                           │
│  pending_tx = {amount: 250, item: "Tel", candidates: [...]}│
│      ↓                                                      │
│  Soundbox TTS: "Khata mein do Ramesh hain—Sharma ya Verma?"│
│      ↓                                                      │
│  Merchant: "Sharma"                                         │
│      ↓                                                      │
│  [Session Manager] Match "Sharma" → Ramesh Sharma          │
│      ↓                                                      │
│  Log Udhaar: ₹250 for Ramesh Sharma                        │
│  Generate QR + Send Telegram Reminder                       │
│  State = IDLE                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│        FLOW B: New Customer Phone Number Capture            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Merchant: "Munna ko 120 ka doodh udhaar diya"             │
│      ↓                                                      │
│  [Session Manager] SQLite Query: Find "Munna"              │
│      ↓                                                      │
│  Found 0 matches                                            │
│      ↓                                                      │
│  State = AWAITING_NEW_CUSTOMER_PHONE                       │
│  pending_tx = {customer: "Munna", amount: 120, item: "Doodh"}│
│      ↓                                                      │
│  Soundbox TTS: "Munna khata mein nahi hai. Mobile number?"  │
│      ↓                                                      │
│  Merchant: "9810012345"                                     │
│      ↓                                                      │
│  [Session Manager] Extract 10 digits                       │
│      ↓                                                      │
│  Create Customer(name="Munna", phone="9810012345")         │
│  Log Udhaar: ₹120 for Munna                                │
│  Generate QR + Send Telegram Reminder                       │
│  State = IDLE                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Python**: 3.10 or higher
- **Node.js**: 16 or higher
- **npm**: 8 or higher
- **Git**: For cloning the repository

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/paytm_ai_hackathon.git
cd paytm_ai_hackathon
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template and configure
cp .env.example .env
# Edit .env with your API keys (see Configuration section)

# Start the backend server
uvicorn main:app --reload --port 8000
```

The backend API will be available at:
- **API Root**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at:
- **Soundbox Simulator**: http://localhost:5173/soundbox
- **ERP Dashboard**: http://localhost:5173/erp

### Telegram Bot Setup (Optional for Full Demo)

1. Create a Telegram bot via [@BotFather](https://t.me/botfather)
2. Copy the bot token to your `.env` file: `TELEGRAM_BOT_TOKEN=your_token_here`
3. Start a chat with your bot and send `/link Ramesh` to link your phone
4. Your Telegram chat ID will be captured automatically for demo reminders

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000
```

### Core Endpoints

#### 1. Process Voice Audio
**POST** `/api/v1/voice/process-audio`

Upload audio file and receive structured intent response.

```bash
curl -X POST "http://localhost:8000/api/v1/voice/process-audio" \
  -H "Content-Type: multipart/form-data" \
  -F "audio=@voice_recording.wav"
```

**Response:**
```json
{
  "event_type": "VOICE_PROCESSED",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "soundbox_state": "SPEAKING",
  "transcript": "Ramesh ko 250 ka tel udhaar diya",
  "parsed_intent": {
    "intent": "LOG_UDHAAR",
    "customer_name": "Ramesh Sharma",
    "item_name": "Fortune Tel",
    "amount": 250.0,
    "_meta": {
      "groq_key_index": 1,
      "model_used": "llama-3.3-70b-versatile"
    }
  },
  "reply_text": "Ramesh Sharma ke khata mein 250 rupaye ka Fortune Tel udhaar likh liya gaya.",
  "tts_audio_base64": "UklGRiQAAABXQVZFZm10...",
  "conversation_session_state": "IDLE",
  "qr_preview_base64": "data:image/png;base64,iVBORw0KGgoAAAAN..."
}
```

#### 2. Process Voice Text
**POST** `/api/v1/voice/process-text`

Process text input (for preset buttons or typed fallback).

```bash
curl -X POST "http://localhost:8000/api/v1/voice/process-text" \
  -H "Content-Type: application/json" \
  -d '{"text": "Ramesh ko 250 ka tel udhaar diya", "source": "SOUNDBOX"}'
```

#### 3. Get ERP Dashboard
**GET** `/api/v1/erp/dashboard`

Retrieve complete merchant dashboard state.

```bash
curl "http://localhost:8000/api/v1/erp/dashboard"
```

**Response:**
```json
{
  "summary_metrics": {
    "today_total_sales": 4000.0,
    "today_upi_sales": 3450.0,
    "today_udhaar_sales": 550.0,
    "top_selling_item": "Aashirvaad Aata",
    "total_active_udhaar": 550.0,
    "active_udhaar_customer_count": 3
  },
  "customers": [...],
  "transactions": [...],
  "broadcasts": [...],
  "credit_score": {
    "score": 764,
    "max_score": 900,
    "rating_tier": "EXCELLENT (Gold Merchant)",
    "pre_approved_loan_amount": 35000
  },
  "api_pool_status": {
    "sarvam_active_index": 1,
    "groq_active_index": 2,
    "telegram_bot_active": true
  }
}
```

#### 4. Send Khata Reminder
**POST** `/api/v1/khata/remind/{customer_id}`

Send Telegram payment reminder with UPI QR code.

```bash
curl -X POST "http://localhost:8000/api/v1/khata/remind/1"
```

#### 5. Simulate UPI Settlement
**POST** `/api/v1/webhooks/upi-settlement`

Simulate UPI payment callback (for demos).

```bash
curl -X POST "http://localhost:8000/api/v1/webhooks/upi-settlement" \
  -H "Content-Type: application/json" \
  -d '{"customer_id": 1, "amount": 250.0, "tx_id": 7}'
```

#### 6. Broadcast Discount Offer
**POST** `/api/v1/broadcast/discount`

Send discount offer to all regular customers.

```bash
curl -X POST "http://localhost:8000/api/v1/broadcast/discount" \
  -H "Content-Type: application/json" \
  -d '{
    "item_name": "Chini (Sugar)",
    "discount_text": "₹5 off per kg",
    "custom_message": "🎉 Aaj chini par ₹5 chhoot hai!"
  }'
```

#### 7. Nightly 9 PM Brief
**POST** `/api/soundbox/nightly-brief`

Trigger end-of-day business summary.

```bash
curl -X POST "http://localhost:8000/api/soundbox/nightly-brief"
```

#### 8. Reset Demo Data
**POST** `/api/v1/demo/reset`

Reset database to initial seed state.

```bash
curl -X POST "http://localhost:8000/api/v1/demo/reset"
```

### WebSocket Connection

**URL**: `ws://localhost:8000/ws/events`

**Event Envelope Structure:**
```json
{
  "event_type": "VOICE_PROCESSED | UPI_PAYMENT_RECEIVED | NIGHTLY_BRIEF | BROADCAST_SENT | DEMO_RESET",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "soundbox_state": "IDLE | LISTENING | PROCESSING | SPEAKING | ALERT_SUCCESS",
  "transcript": "Merchant's spoken text",
  "parsed_intent": {...},
  "reply_text": "Soundbox response",
  "tts_audio_base64": "base64_audio_string",
  "conversation_session_state": "IDLE | AWAITING_DISAMBIGUATION | AWAITING_NEW_CUSTOMER_PHONE",
  "qr_preview_base64": "data:image/png;base64,..."
}
```

**JavaScript Client Example:**
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/events');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Event:', data.event_type);
  console.log('Reply:', data.reply_text);
};
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────────────────────────────┐
│           CUSTOMERS                  │
├─────────────────────────────────────┤
│ id                    INTEGER PK     │
│ name                  VARCHAR        │
│ phone                 VARCHAR UNIQUE │
│ upi_vpa               VARCHAR        │
│ telegram_chat_id      VARCHAR        │
│ is_regular            BOOLEAN        │
│ total_udhaar_balance  FLOAT          │
│ total_lifetime_spend  FLOAT          │
│ visit_count           INTEGER        │
│ created_at            DATETIME       │
└─────────────┬───────────────────────┘
              │
              │ 1:N
              │
┌─────────────▼───────────────────────┐
│         TRANSACTIONS                 │
├─────────────────────────────────────┤
│ id                    INTEGER PK     │
│ customer_id           INTEGER FK     │
│ tx_type               VARCHAR        │
│ item_name             VARCHAR        │
│ quantity_text         VARCHAR        │
│ amount                FLOAT          │
│ is_settled            BOOLEAN        │
│ raw_voice_transcript  TEXT           │
│ source_channel        VARCHAR        │
│ created_at            DATETIME       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│      DISCOUNT_BROADCASTS             │
├─────────────────────────────────────┤
│ id                    INTEGER PK     │
│ item_name             VARCHAR        │
│ discount_offer        VARCHAR        │
│ message_text          TEXT           │
│ recipients_count      INTEGER        │
│ created_at            DATETIME       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│        MERCHANT_STATS                │
├─────────────────────────────────────┤
│ id                    INTEGER PK     │
│ merchant_name         VARCHAR        │
│ merchant_upi_id       VARCHAR        │
│ credit_score          INTEGER        │
│ pre_approved_loan_amt INTEGER        │
│ updated_at            DATETIME       │
└─────────────────────────────────────┘
```

### Pre-Seeded Demo Data

#### Customers Table
| ID | Name | Phone | UPI VPA | Is Regular | Current Udhaar | Visits |
|----|------|-------|---------|------------|----------------|--------|
| 1 | Ramesh Sharma | 9876543210 | 9876543210@paytm | True | ₹150 | 24 |
| 2 | Ramesh Verma | 9876543211 | 9876543211@paytm | True | ₹0 | 15 |
| 3 | Sunita Devi | 9811122233 | sunitadevi@paytm | True | ₹320 | 31 |
| 4 | Abdul Chacha | 9822233344 | 9822233344@paytm | True | ₹80 | 19 |
| 5 | Priya Gupta | 9833344455 | priyag@paytm | True | ₹0 | 12 |

#### Transactions Table (Today's Sales)
| ID | Customer | Type | Item | Amount | Settled |
|----|----------|------|------|--------|---------|
| 1 | NULL | UPI_SALE | Aashirvaad Aata | ₹1,850 | True |
| 2 | NULL | UPI_SALE | Fortune Tel | ₹1,100 | True |
| 3 | NULL | UPI_SALE | Tata Salt & Maggi | ₹500 | True |
| 4 | Ramesh Sharma | UDHAAR_GIVEN | Chini | ₹150 | False |
| 5 | Sunita Devi | UDHAAR_GIVEN | Aashirvaad Aata | ₹320 | False |
| 6 | Abdul Chacha | UDHAAR_GIVEN | Chai Patti | ₹80 | False |

**Daily Sales Summary**: ₹4,000 (₹3,450 UPI + ₹550 Udhaar)  
**Top-Selling Item**: Aashirvaad Aata (₹2,170 total)

---

## 📁 Project Structure

```
voicevyapar/
├── README.md                        # This file
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── docker-compose.yml               # Multi-container orchestration
├── render.yaml                      # Render.com deployment blueprint
├── railway.json                     # Railway.app deployment config
├── DEPLOYMENT.md                    # Detailed deployment guide
├── prd_final.md                     # Complete PRD specification
├── context.txt                      # AI assistant build log
│
├── backend/
│   ├── requirements.txt             # Python dependencies
│   ├── .env                         # Local environment (git-ignored)
│   ├── Dockerfile                   # Backend container image
│   ├── Procfile                     # Heroku/Railway process file
│   ├── main.py                      # FastAPI app entry point
│   ├── config.py                    # Multi-key API pool loader
│   ├── database.py                  # SQLite connection & session
│   ├── models.py                    # SQLAlchemy ORM models
│   ├── schemas.py                   # Pydantic request/response schemas
│   ├── seed.py                      # Database seeding script
│   ├── voicevyapar.db               # SQLite database (auto-created)
│   │
│   └── services/
│       ├── __init__.py              # Service package init
│       ├── sarvam_service.py        # Sarvam AI STT/TTS multi-key wrapper
│       ├── llm_service.py           # Groq LLM intent parser multi-key wrapper
│       ├── session_manager.py       # Multi-turn conversation state machine
│       ├── qr_service.py            # Paytm UPI QR code generator
│       ├── credit_engine.py         # 300-900 credit score calculator
│       └── telegram_service.py      # Telegram Bot API integration
│
└── frontend/
    ├── package.json                 # Node.js dependencies
    ├── package-lock.json            # Dependency lock file
    ├── vite.config.js               # Vite build configuration
    ├── tailwind.config.js           # Tailwind CSS configuration
    ├── postcss.config.js            # PostCSS configuration
    ├── Dockerfile                   # Frontend container image (Nginx)
    ├── nginx.conf                   # Nginx reverse proxy config
    ├── index.html                   # HTML entry point
    │
    └── src/
        ├── main.jsx                 # React app entry point
        ├── App.jsx                  # Root component with routing
        ├── index.css                # Global styles + Tailwind imports
        │
        ├── lib/
        │   ├── api.js               # REST API client wrapper
        │   └── socket.js            # WebSocket client hook
        │
        ├── pages/
        │   ├── SoundboxPage.jsx     # Route: /soundbox (IoT Simulator)
        │   └── ErpDashboardPage.jsx # Route: /erp (Merchant Dashboard)
        │
        └── components/
            ├── Navbar.jsx           # App navigation bar
            ├── SoundboxDevice.jsx   # 3D Soundbox hardware UI
            ├── TelemetryLog.jsx     # Real-time event log
            ├── KhataTable.jsx       # Customer ledger table
            ├── BroadcastPanel.jsx   # Discount campaign manager
            └── CreditScoreCard.jsx  # 300-900 credit score gauge
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# ========================================
# Server Configuration
# ========================================
PORT=8000
FRONTEND_URL=http://localhost:5173

# ========================================
# Sarvam AI Multi-Key Pool (STT/TTS)
# ========================================
# Option 1: Comma-separated list
SARVAM_API_KEYS=key1,key2,key3

# Option 2: Numbered keys (OR use both for redundancy)
SARVAM_API_KEY_1=your_first_sarvam_key
SARVAM_API_KEY_2=your_second_sarvam_key
SARVAM_API_KEY_3=your_third_sarvam_key

# Model configuration
SARVAM_STT_MODEL=saaras:v3
SARVAM_TTS_MODEL=bulbul:v3
SARVAM_TTS_SPEAKER=meera

# ========================================
# Groq API Multi-Key Pool (LLM)
# ========================================
# Option 1: Comma-separated list
GROQ_API_KEYS=gsk_key1,gsk_key2,gsk_key3

# Option 2: Numbered keys
GROQ_API_KEY_1=your_first_groq_key
GROQ_API_KEY_2=your_second_groq_key
GROQ_API_KEY_3=your_third_groq_key

# Model configuration
GROQ_PRIMARY_MODEL=llama-3.3-70b-versatile
GROQ_FALLBACK_MODEL=llama-3.1-8b-instant

# ========================================
# Telegram Bot (Optional for Full Demo)
# ========================================
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
DEFAULT_DEMO_CHAT_ID=your_chat_id_optional

# ========================================
# Merchant Configuration
# ========================================
MERCHANT_UPI_ID=sharmakirana@paytm
MERCHANT_NAME=Sharma Kirana Store
```

### Getting API Keys

#### Sarvam AI (STT/TTS)
1. Sign up at [sarvam.ai](https://www.sarvam.ai/)
2. Navigate to API Console
3. Generate new API key
4. Copy to `SARVAM_API_KEY` in `.env`

#### Groq API (LLM)
1. Sign up at [console.groq.com](https://console.groq.com/)
2. Generate API key
3. Copy to `GROQ_API_KEY` in `.env`
4. Free tier: 100K tokens/day on 70B model

#### Telegram Bot
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot` command
3. Follow prompts to create bot
4. Copy bot token to `TELEGRAM_BOT_TOKEN` in `.env`
5. Start chat with your bot and send `/link Ramesh`

---

## 🚀 Deployment

### Option 1: Railway (Recommended - 2 Minutes)

Railway natively supports persistent WebSockets, background tasks, and SQLite.

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

Or use one-click deploy:

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

### Option 2: Render (Blueprint Setup)

```bash
# Push to GitHub
git push origin main

# Go to render.com
# New → Blueprint
# Connect your repository
# Render reads render.yaml automatically
# Click "Apply"
```

### Option 3: Docker Compose (Any VPS)

```bash
# Clone repository
git clone <repo-url>
cd paytm_ai_hackathon

# Configure environment
cp .env.example backend/.env
nano backend/.env

# Build and start services
docker compose up --build -d

# View logs
docker compose logs -f
```

**Services:**
- Backend API: http://your-server-ip:8000
- Frontend: http://your-server-ip
- WebSocket: ws://your-server-ip:8000/ws/events

### Option 4: Ngrok (Live Demo Tunnel)

For instant public access during presentations:

```bash
# Start backend locally
cd backend
uvicorn main:app --port 8000

# In new terminal, expose to internet
ngrok http 8000

# Copy the https URL (e.g., https://abc123.ngrok-free.app)
# Update frontend/.env:
echo "VITE_API_BASE_URL=https://abc123.ngrok-free.app" > frontend/.env

# Rebuild frontend
cd frontend
npm run build
```

### Post-Deployment Verification

Check these endpoints after deployment:

- [ ] `GET /` → Returns `{"status": "online"}`
- [ ] `GET /docs` → Opens interactive Swagger UI
- [ ] `GET /api/v1/erp/dashboard` → Returns seeded data
- [ ] `WS /ws/events` → Accepts WebSocket connections
- [ ] Telegram Bot responds to `/link` command

---

## 🧪 Testing

### Manual Testing Scenarios

#### Scenario 1: Log Udhaar Transaction
1. Navigate to `/soundbox`
2. Click "Push to Talk" or type: "Ramesh ko 250 ka tel udhaar diya"
3. Verify:
   - LED ring animates
   - Transcript appears in telemetry log
   - Reply spoken: "Ramesh Sharma ke khata mein 250 rupaye..."
   - QR code generated
   - Dashboard `/erp` updates with new transaction

#### Scenario 2: Customer Disambiguation
1. Type: "Ramesh ko 500 ka aata udhaar diya"
2. Soundbox asks: "Khata mein do Ramesh hain—Sharma ya Verma?"
3. Reply: "Sharma"
4. Verify udhaar logged for correct customer

#### Scenario 3: Nightly Brief
1. Click "9 PM Nightly Brief" button
2. Verify spoken summary includes:
   - Total daily sales (₹4,000)
   - Top item (Aashirvaad Aata)
   - Credit score update

#### Scenario 4: Telegram Payment Flow
1. Ensure Telegram bot is configured
2. Log an udhaar transaction
3. Check your Telegram for QR reminder message
4. Click "Simulate Payment" button
5. Verify:
   - Soundbox announces payment received
   - Customer balance updates in dashboard
   - Credit score recalculated

### Automated Testing (Future Scope)

```bash
# Backend unit tests
cd backend
pytest tests/

# Frontend component tests
cd frontend
npm run test

# E2E tests
npx playwright test
```

---

## 🔮 Future Scope

### Phase 1: IoT Hardware Integration (Q2 2025)

#### Real Paytm Soundbox Integration
- **Direct API**: Integrate with Paytm IoT SDK for real hardware
- **Voice Activation**: "Hey Paytm" wake word detection
- **Local Speech Processing**: On-device STT to reduce latency
- **Offline Mode**: Local cache + sync when connected

#### Custom Hardware Prototype
- **Bill of Materials**:
  - Raspberry Pi 4 / Jetson Nano
  - USB microphone array (4-mic for beamforming)
  - 5W speaker with bass reflex
  - 24-LED WS2812B ring for status
  - 4G LTE dongle for connectivity
- **Estimated Cost**: ₹6,500 per unit (vs. ₹15,000 Paytm Soundbox)
- **Target**: 100-unit pilot in Delhi/NCR kirana stores

### Phase 2: WhatsApp Business API (Q3 2025)

#### Production Messaging Infrastructure
- **Meta WhatsApp Business Cloud API**: Replace Telegram
- **Template Messages**:
  - Payment reminder with QR
  - Daily sales summary
  - Discount broadcast
  - Credit score update
- **Interactive Buttons**: One-tap payment confirmation
- **Rich Media**: PDF bills, voice notes, product images
- **Compliance**: TRAI DLT registration for commercial messaging

#### Expected Impact
- **95% reachability** (vs. 15% Telegram adoption)
- **3x faster payment collection**
- **60% reduction** in udhaar defaults

### Phase 3: Advanced Analytics & AI (Q4 2025)

#### Inventory Management Intelligence
- **Voice Stock Updates**: "Aata stock kam hai, 20 bags order karo"
- **Auto-Reorder Triggers**: ML predicts stock-outs 3 days in advance
- **Supplier Marketplace**: Automated quotes from 3 wholesalers
- **Expiry Tracking**: Alerts for items nearing expiry date

#### Business Intelligence Dashboard
- **Sales Forecasting**: ARIMA models for next-week demand
- **Customer Segmentation**: RFM analysis (Recency, Frequency, Monetary)
- **Profitability Analysis**: Item-wise margin tracking
- **Competition Insights**: Pricing recommendations vs. nearby stores

#### Multilingual Expansion
- **10 Indian Languages**: Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Odia, Assamese
- **Code-Mixed ASR**: Handle Tamil-English, Bengali-Hindi mixing
- **Cultural Localization**: Region-specific product names and greetings

### Phase 4: Financial Services Integration (2026)

#### NBFC Loan Disbursement
- **Live Credit Score API**: Real-time score on every transaction
- **1-Click Loan Application**: Pre-filled with merchant data
- **Instant Disbursement**: ₹10K-₹1L loans in 15 minutes
- **Automated EMI Deduction**: From daily Paytm UPI inflows
- **Partners**: Small Finance Banks, NBFCs (Lendingkart, Capital Float)

#### Insurance Products
- **Shop Insurance**: Fire, theft, flood coverage
- **Inventory Insurance**: Stock damage protection
- **Life & Health**: Affordable micro-insurance for merchant families

#### Payment Gateway Services
- **UPI AutoPay**: Recurring subscription payments
- **Buy Now Pay Later**: Offer BNPL to customers
- **Paytm Gold**: Convert idle funds to digital gold savings

### Phase 5: Expansion Beyond Kirana (2026+)

#### Vertical-Specific Solutions

**Street Food Vendors**
- Voice menu management
- QR-based table ordering
- FSSAI license tracking
- GST-compliant billing

**Small Restaurants**
- Voice-to-kitchen order routing
- Table management
- Zomato/Swiggy integration sync
- Staff attendance tracking

**Pharmacies**
- Medicine expiry alerts
- Prescription OCR scanning
- Insurance claim automation
- Patient reminder calls

**Automobile Repair Shops**
- Voice job card creation
- Spare parts inventory
- Customer vehicle history
- Service reminder SMS

### Technology Roadmap

```
2025 Q1-Q2: IoT Hardware Pilot
├── Raspberry Pi prototype (100 units)
├── 4-mic beamforming array
├── Offline STT model (Whisper)
└── 4G connectivity tests

2025 Q3-Q4: WhatsApp Production
├── Meta Business Cloud API setup
├── TRAI DLT registration
├── Template message approval
└── Broadcast campaign automation

2026 Q1-Q2: AI Analytics Suite
├── Inventory forecasting models
├── Customer churn prediction
├── Dynamic pricing engine
└── 10-language multilingual STT

2026 Q3+: Financial Services
├── NBFC integration (3 partners)
├── 1-click loan disbursement
├── Insurance product bundles
└── Payments gateway white-label
```

### Target Metrics (3-Year Vision)

| Metric | 2025 Target | 2027 Target |
|--------|-------------|-------------|
| **Active Merchants** | 10,000 | 1,000,000 |
| **Daily Transactions** | 150,000 | 15,000,000 |
| **Avg. Revenue/Merchant** | ₹2,500/month | ₹5,000/month |
| **Loan Disbursement** | ₹50 Cr | ₹5,000 Cr |
| **Languages Supported** | 3 | 12 |
| **Hardware Units Deployed** | 100 | 50,000 |

---

## 🤝 Contributing

We welcome contributions from the community! Whether it's bug fixes, new features, documentation improvements, or translations.

### How to Contribute

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/paytm_ai_hackathon.git
   cd paytm_ai_hackathon
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Follow existing code style and conventions
   - Add tests for new features
   - Update documentation as needed

3. **Test Thoroughly**
   ```bash
   # Backend tests
   cd backend
   pytest

   # Frontend tests
   cd frontend
   npm run test
   ```

4. **Submit Pull Request**
   - Provide clear description of changes
   - Reference any related issues
   - Ensure CI/CD checks pass

### Development Guidelines

- **Code Style**: Follow PEP 8 (Python) and ESLint (JavaScript)
- **Commit Messages**: Use conventional commits format
  - `feat: Add Tamil language support`
  - `fix: Resolve QR code generation bug`
  - `docs: Update API documentation`
- **Branch Naming**: `feature/`, `bugfix/`, `docs/`, `refactor/`

### Areas for Contribution

- 🌍 **Language Support**: Add new Indian language models
- 🎨 **UI/UX**: Improve dashboard design and animations
- 🧪 **Testing**: Write unit and integration tests
- 📚 **Documentation**: Improve guides and tutorials
- 🐛 **Bug Fixes**: Report and fix issues
- 🚀 **Performance**: Optimize API response times

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Team BINARYBRAINS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👥 Team BINARYBRAINS

**Paytm Build for India AI Hackathon – Delhi**

| Role | Name | GitHub | LinkedIn |
|------|------|--------|----------|
| **Tech Lead** | [Your Name] | [@username](https://github.com/username) | [Profile](https://linkedin.com) |
| **Backend Engineer** | [Team Member] | [@username](https://github.com/username) | [Profile](https://linkedin.com) |
| **Frontend Engineer** | [Team Member] | [@username](https://github.com/username) | [Profile](https://linkedin.com) |
| **AI/ML Engineer** | [Team Member] | [@username](https://github.com/username) | [Profile](https://linkedin.com) |

---

## 📞 Contact & Support

### Project Links
- **GitHub Repository**: [github.com/yourusername/paytm_ai_hackathon](https://github.com/yourusername/paytm_ai_hackathon)
- **Live Demo**: [voicevyapar-demo.railway.app](https://voicevyapar-demo.railway.app)
- **API Documentation**: [voicevyapar-demo.railway.app/docs](https://voicevyapar-demo.railway.app/docs)
- **YouTube Demo**: [Watch Demo Video](https://youtube.com)

### Get in Touch
- **Email**: team@voicevyapar.com
- **Twitter**: [@VoiceVyapar](https://twitter.com/voicevyapar)
- **Discord**: [Join Community](https://discord.gg/voicevyapar)

### Bug Reports & Feature Requests
- **Issues**: [GitHub Issues](https://github.com/yourusername/paytm_ai_hackathon/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/paytm_ai_hackathon/discussions)

---

## 🙏 Acknowledgments

### Technology Partners
- **Sarvam AI**: Indian-language speech recognition and synthesis
- **Groq**: Lightning-fast LLM inference
- **Paytm**: Payment infrastructure and merchant insights
- **Telegram**: Messaging platform for customer engagement

### Open Source Libraries
- FastAPI, SQLAlchemy, Pydantic, Uvicorn
- React, Vite, Tailwind CSS, Lucide Icons
- python-telegram-bot, qrcode, rapidfuzz

### Special Thanks
- Paytm Build for India AI Hackathon organizers
- Indian micro-merchant community for feedback
- Open source contributors and maintainers

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/paytm_ai_hackathon?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/paytm_ai_hackathon?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/paytm_ai_hackathon)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/paytm_ai_hackathon)
![GitHub last commit](https://img.shields.io/github/last-commit/yourusername/paytm_ai_hackathon)

---

<div align="center">

**Built with ❤️ for Indian Micro-Merchants**

*Empowering 60 million merchants through voice-first AI*

[⭐ Star this repo](https://github.com/yourusername/paytm_ai_hackathon) | [🐛 Report Bug](https://github.com/yourusername/paytm_ai_hackathon/issues) | [💡 Request Feature](https://github.com/yourusername/paytm_ai_hackathon/issues)

</div>
