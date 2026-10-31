# Paytm Build for India AI Hackathon — Team BINARYBRAINS

## VoiceVyapar — AI Merchant CFO & Soundbox Copilot
**Track 1:** Merchant Growth AI  
**Team Members:** Kush & Smarpit (BINARYBRAINS)

VoiceVyapar is a hyper-localized, voice-first AI CFO and business copilot built for Indian micro-merchants (kirana stores, street vendors, and small retailers) operating through the **Paytm Soundbox** and **Telegram/WhatsApp**.

---

### 📂 Repository Structure
- **[`voicevyapar/`](./voicevyapar/)**: Full scaffold for the VoiceVyapar application.
  - **[`backend/`](./voicevyapar/backend/)**: FastAPI, SQLite ORM models, multi-key Sarvam AI (STT/TTS), Groq LLM intent parser, session state machine, Paytm UPI QR generator, and Telegram bot.
  - **[`frontend/`](./voicevyapar/frontend/)**: React 18 + Vite + Tailwind CSS with `/soundbox` (Paytm Soundbox Hardware Simulator) and `/erp` (Merchant Growth ERP Dashboard).
  - **[`context.txt`](./voicevyapar/context.txt)**: Shared compact AI context, frozen contracts, and live build status log.
  - **[`prd_final.md`](./voicevyapar/prd_final.md)**: Complete AI-Ready Product Requirements Document (PRD) & Architecture Blueprint.

---

### 🚀 Quick Start

#### 1. Backend
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
Interactive API docs at `http://localhost:8000/docs`.

#### 2. Frontend
```bash
cd voicevyapar/frontend
npm install
npm run dev
```
Open `http://localhost:5173`.
