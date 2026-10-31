from fastapi import FastAPI, UploadFile, File, Form, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import datetime
import json

from database import engine, Base, get_db
from models import Customer, Transaction, DiscountBroadcast, MerchantStats
import schemas
from seed import seed_database
from services.session_manager import process_utterance, reset_session, get_session_state
from services.credit_engine import calculate_credit_score
from services.telegram_service import is_telegram_bot_active, send_telegram_qr_reminder, send_telegram_discount_broadcast
from config import SARVAM_KEY_POOL, GROQ_KEY_POOL

# Create database tables if not existing
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Paytm VoiceVyapar API",
    description="Voice-First AI CFO & ERP Copilot for Paytm Merchants",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------
# WebSocket Connection Manager
# -------------------------------------------------------------------
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        dead = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead.append(connection)
        for d in dead:
            self.disconnect(d)

manager = ConnectionManager()


# -------------------------------------------------------------------
# Health Check
# -------------------------------------------------------------------
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "app": "Paytm VoiceVyapar",
        "version": "1.0.0",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }


# -------------------------------------------------------------------
# WebSocket Endpoint
# -------------------------------------------------------------------
@app.websocket("/ws/events")
async def websocket_events(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo or handle incoming client ping if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


# -------------------------------------------------------------------
# Voice Processing Endpoints
# -------------------------------------------------------------------
@app.post("/api/v1/voice/process-audio", response_model=schemas.VoiceEventPayload)
async def process_audio(
    audio: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    audio_bytes = await audio.read()
    # Stub processing
    result = await process_utterance(db, "Audio received", source="SOUNDBOX")
    await manager.broadcast(result)
    return result


@app.post("/api/v1/voice/process-text", response_model=schemas.VoiceEventPayload)
async def process_text(
    payload: schemas.ProcessTextRequest,
    db: Session = Depends(get_db)
):
    result = await process_utterance(db, payload.text, source=payload.source or "SOUNDBOX")
    await manager.broadcast(result)
    return result


# -------------------------------------------------------------------
# Nightly Brief
# -------------------------------------------------------------------
@app.post("/api/v1/soundbox/nightly-brief")
@app.post("/api/soundbox/nightly-brief")
async def nightly_brief(db: Session = Depends(get_db)):
    payload = {
        "event_type": "NIGHTLY_BRIEF",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "soundbox_state": "SPEAKING",
        "reply_text": "Namaste! Aaj kul 4,000 rupaye ki bikri hui, jisme 3,450 rupaye UPI se aaye aur 550 rupaye udhaar mein darj huye.",
        "tts_audio_base64": "",
        "total_daily_sales": 4000.0,
        "total_upi_sales": 3450.0,
        "total_unsettled_udhaar": 550.0,
        "top_item": "Aashirvaad Aata"
    }
    await manager.broadcast(payload)
    return payload


# -------------------------------------------------------------------
# ERP Dashboard
# -------------------------------------------------------------------
@app.get("/api/v1/erp/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    customers = db.query(Customer).all()
    transactions = db.query(Transaction).order_by(Transaction.id.desc()).limit(20).all()
    broadcasts = db.query(DiscountBroadcast).order_by(DiscountBroadcast.id.desc()).limit(10).all()
    credit_score = calculate_credit_score(db)

    # Calculate summary metrics
    today_total = sum(t.amount for t in transactions) if transactions else 4000.0
    today_upi = sum(t.amount for t in transactions if t.is_settled) if transactions else 3450.0
    total_udhaar = sum(c.total_udhaar_balance for c in customers) if customers else 550.0

    return {
        "summary_metrics": {
            "today_total_sales": today_total,
            "today_upi_sales": today_upi,
            "today_udhaar_sales": today_total - today_upi,
            "top_selling_item": "Aashirvaad Aata",
            "total_active_udhaar": total_udhaar,
            "active_udhaar_customer_count": sum(1 for c in customers if c.total_udhaar_balance > 0)
        },
        "customers": [schemas.CustomerSchema.model_validate(c) for c in customers],
        "transactions": [schemas.TransactionSchema.model_validate(t) for t in transactions],
        "broadcasts": [schemas.BroadcastSchema.model_validate(b) for b in broadcasts],
        "credit_score": credit_score,
        "api_pool_status": {
            "sarvam_active_index": SARVAM_KEY_POOL.current_index + 1,
            "sarvam_total_keys": len(SARVAM_KEY_POOL.keys),
            "groq_active_index": GROQ_KEY_POOL.current_index + 1,
            "groq_total_keys": len(GROQ_KEY_POOL.keys),
            "telegram_bot_active": is_telegram_bot_active()
        }
    }


# -------------------------------------------------------------------
# Khata Actions & Webhooks
# -------------------------------------------------------------------
@app.post("/api/v1/khata/remind/{customer_id}")
async def remind_khata(customer_id: int, db: Session = Depends(get_db)):
    res = await send_telegram_qr_reminder(db, customer_id=customer_id)
    return res


@app.post("/api/v1/webhooks/upi-settlement")
async def upi_settlement(payload: schemas.UpiSettlementRequest, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if customer:
        customer.total_udhaar_balance = max(0.0, customer.total_udhaar_balance - payload.amount)
        db.commit()

    event = {
        "event_type": "UPI_PAYMENT_RECEIVED",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "soundbox_state": "ALERT_SUCCESS",
        "reply_text": f"Paytm par ₹{payload.amount:.0f} prapt huye!",
        "customer_id": payload.customer_id,
        "amount": payload.amount
    }
    await manager.broadcast(event)
    return {"status": "settled", "customer_id": payload.customer_id, "amount": payload.amount}


@app.post("/api/v1/broadcast/discount")
async def broadcast_discount(payload: schemas.DiscountBroadcastRequest, db: Session = Depends(get_db)):
    broadcast = DiscountBroadcast(
        item_name=payload.item_name,
        discount_offer=payload.discount_text,
        message_text=payload.custom_message or f"Aaj {payload.item_name} par {payload.discount_text} chhoot!",
        recipients_count=5
    )
    db.add(broadcast)
    db.commit()

    count = await send_telegram_discount_broadcast(
        db,
        payload.item_name,
        payload.discount_text,
        broadcast.message_text
    )

    event = {
        "event_type": "BROADCAST_SENT",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "item_name": payload.item_name,
        "discount_offer": payload.discount_text,
        "recipients_count": count
    }
    await manager.broadcast(event)
    return {"status": "broadcast_sent", "recipients_count": count}


@app.post("/api/v1/demo/reset")
async def demo_reset(db: Session = Depends(get_db)):
    reset_session()
    seed_res = seed_database(db)
    event = {
        "event_type": "DEMO_RESET",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
    await manager.broadcast(event)
    return {"status": "reset_complete", "details": seed_res}

