# 🚀 Paytm VoiceVyapar — Deployment Guide

This guide covers 4 deployment pathways for the **FastAPI Backend** (`/backend`) and **Vite React Frontend** (`/frontend`).

---

## 📋 Required Environment Variables

When deploying to any cloud provider, configure these environment variables in your project settings:

```env
# Server Config
PORT=8000
MERCHANT_NAME=Sharma Kirana Store
MERCHANT_UPI_ID=sharmakirana@paytm

# Multi-Key Rotation Pool (Single or Comma-Separated Keys)
SARVAM_API_KEY=your_sarvam_api_key
GROQ_API_KEY=your_groq_api_key

# Telegram Integration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
DEFAULT_DEMO_CHAT_ID=your_chat_id_optional
```

---

## ⚡ Option 1: Deploy to Railway (Recommended — 2 Minutes)

Railway natively supports persistent WebSockets, background tasks (Telegram Bot polling), and SQLite.

### Steps:
1. Go to [railway.app](https://railway.app) and click **"New Project"**.
2. Select **"Deploy from GitHub repo"** and choose `Paytm_Ai_Hackathon`.
3. Railway will detect `railway.json` and `backend/Dockerfile` automatically.
4. Go to **Settings** ➔ **Variables** and paste your API keys:
   - `GROQ_API_KEY`
   - `SARVAM_API_KEY`
   - `TELEGRAM_BOT_TOKEN`
5. Click **"Generate Domain"** under Networking (e.g. `https://voicevyapar-production.up.railway.app`).
6. Your API is live! Test it at `https://your-domain.up.railway.app/docs`.

---

## 🌐 Option 2: Deploy to Render (Blueprint Setup)

A `render.yaml` blueprint is already included at the repository root.

### Steps:
1. Go to [render.com](https://render.com) and click **"New +" ➔ "Blueprint"**.
2. Connect your GitHub repository `Paytm_Ai_Hackathon`.
3. Render reads `render.yaml` and sets up both:
   - **`voicevyapar-backend`** (Python Web Service with WebSockets)
   - **`voicevyapar-frontend`** (Static Site with SPA rewrite rules)
4. Under **Environment**, input your secrets (`GROQ_API_KEY`, `SARVAM_API_KEY`, `TELEGRAM_BOT_TOKEN`).
5. Click **Apply** to deploy!

---

## 🐳 Option 3: Deploy with Docker Compose (Any VPS / Server)

Deploy both the backend API and frontend reverse-proxied with Nginx on any Linux VM (AWS EC2, DigitalOcean Droplet, GCP Compute Engine).

### 1-Command Startup:
```bash
# Clone the repository
git clone https://github.com/smarpitm/Paytm_Ai_Hackathon.git
cd Paytm_Ai_Hackathon

# Copy and edit environment variables
cp .env.example .env
nano .env

# Build and start all services in the background
docker compose up --build -d
```

- **Frontend**: `http://your-server-ip`
- **Backend API Docs**: `http://your-server-ip:8000/docs`
- **WebSocket Channel**: `ws://your-server-ip:8000/ws/events`

---

## ⚡ Option 4: Instant Public Tunnel for Live Hackathon Demos (Ngrok)

If you are presenting live and want judges to open the app on their own smartphones immediately:

```bash
# 1. Start your local backend and frontend
npm --prefix frontend run dev
cd backend && .\venv\Scripts\python.exe -m uvicorn main:app --port 8000

# 2. Expose the API to the public internet
ngrok http 8000
```
Copy the generated `https://xxxx.ngrok-free.app` URL and set `VITE_API_BASE_URL` in `frontend/.env`:
```env
VITE_API_BASE_URL=https://xxxx.ngrok-free.app
```
Rebuild frontend:
```bash
cd frontend && npm run build
```

---

## 🔍 Verification Checklist

After deployment, check:
- [ ] Root health check: `GET /` returns `{"status": "online", "app": "Paytm VoiceVyapar API"}`
- [ ] Swagger API Docs: `GET /docs` opens interactive OpenAPI specification.
- [ ] Telegram Bot webhook/polling: Sending `/link Ramesh` to your bot links your mobile phone.
- [ ] ERP Dashboard: `GET /api/v1/erp/dashboard` returns seeded kirana dataset.
