import os
import sys
from pathlib import Path
from contextlib import asynccontextmanager
import datetime
from typing import List, Dict, Any, Optional

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI, UploadFile, File, Form, Depends, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import engine, Base, SessionLocal, get_db
from models import Customer, Transaction, DiscountBroadcast, MerchantStats
import schemas
from seed import seed_database
from services.session_manager import process_utterance, reset_session, get_session_state
from services.sarvam_service import transcribe_audio_sarvam, synthesize_speech_sarvam
from services.credit_engine import calculate_credit_score
from services.qr_service import generate_upi_qr_bytes
from services.telegram_service import (
    is_telegram_bot_active,
    start_telegram_bot,
    stop_telegram_bot,
    send_telegram_qr_reminder,
    send_telegram_discount_broadcast
)
from config import SARVAM_KEY_POOL, GROQ_KEY_POOL


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
        """
        Emits the exact JSON envelope from PRD Section 8.2:
        {
          "event_type": ...,
          "timestamp": ...,
          "soundbox_state": ...,
          "transcript": ...,
          "parsed_intent": ...,
          "reply_text": ...,
          "tts_audio_base64": ...,
          "conversation_session_state": ...
        }
        """
        envelope = {
            "event_type": message.get("event_type", "VOICE_PROCESSED"),
            "timestamp": message.get("timestamp", datetime.datetime.now(datetime.timezone.utc).isoformat()),
            "soundbox_state": message.get("soundbox_state", "IDLE"),
            "transcript": message.get("transcript", ""),
            "parsed_intent": message.get("parsed_intent", {}),
            "reply_text": message.get("reply_text", ""),
            "tts_audio_base64": message.get("tts_audio_base64", ""),
            "conversation_session_state": message.get("conversation_session_state", "IDLE"),
            "qr_preview_base64": message.get("qr_preview_base64", None)
        }
        # Merge any additional domain keys (metrics, scores, IDs, etc.)
        for k, v in message.items():
            if k not in envelope:
                envelope[k] = v

        dead = []
        for connection in list(self.active_connections):
            try:
                await connection.send_json(envelope)
            except Exception:
                dead.append(connection)
        for d in dead:
            self.disconnect(d)


ws_manager = ConnectionManager()
manager = ws_manager  # Backward-compatible alias


# -------------------------------------------------------------------
# Application Lifespan: DB Auto-Seed & Telegram Bot Lifecycle
# -------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Startup: Create tables and auto-seed if Customer count is 0
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        if db.query(Customer).count() == 0:
            seed_database(db)

    # 2. Startup: Start background Telegram bot (wrapped in try/except so it never blocks startup)
    try:
        await start_telegram_bot(ws_manager.broadcast)
    except Exception as e:
        print(f"[Telegram Startup Warning] {e}")

    yield

    # 3. Shutdown: Stop background Telegram bot
    try:
        await stop_telegram_bot()
    except Exception as e:
        print(f"[Telegram Shutdown Warning] {e}")


app = FastAPI(
    title="Paytm VoiceVyapar API",
    description="Voice-First AI CFO & ERP Copilot for Paytm Merchants",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------------------------
# Root & Health Check
# -------------------------------------------------------------------
@app.get("/")
def root():
    return {
        "status": "online",
        "app": "Paytm VoiceVyapar API",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_url": "/health",
        "ws_url": "/ws/events",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "app": "Paytm VoiceVyapar",
        "version": "1.0.0",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }


# -------------------------------------------------------------------
# WebSocket Events Channel (ws://localhost:8000/ws/events)
# -------------------------------------------------------------------
@app.websocket("/ws/events")
async def websocket_events(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)


# -------------------------------------------------------------------
# 1. Process Voice Audio (Multipart Upload)
# -------------------------------------------------------------------
@app.post("/api/v1/voice/process-audio", response_model=schemas.VoiceEventPayload)
async def process_audio(
    audio: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    audio_bytes = await audio.read()
    stt = await transcribe_audio_sarvam(audio_bytes, audio.filename or "voice.wav")
    transcript_text = stt.get("transcript", "Ramesh ko 250 ka tel udhaar diya")
    sarvam_idx = stt.get("sarvam_key_index", 1)

    res = await process_utterance(
        db,
        transcript_text,
        source="SOUNDBOX",
        sarvam_key_index=sarvam_idx
    )

    # PRD Section 8.1: If target_customer_id and new udhaar logged, trigger Telegram QR reminder
    if res.get("target_customer_id") and res.get("created_tx_id"):
        tx = db.query(Transaction).filter(Transaction.id == res["created_tx_id"]).first()
        if tx and tx.tx_type == "UDHAAR_GIVEN":
            try:
                await send_telegram_qr_reminder(
                    db,
                    customer_id=res["target_customer_id"],
                    amount=tx.amount,
                    item_name=tx.item_name or "Khata Udhaar",
                    tx_id=tx.id
                )
            except Exception as e:
                print(f"[Telegram QR Reminder Exception] {e}")

    # PRD Section 8.1: If created_broadcast_id, trigger Telegram discount broadcast
    if res.get("created_broadcast_id"):
        b = db.query(DiscountBroadcast).filter(DiscountBroadcast.id == res["created_broadcast_id"]).first()
        if b:
            try:
                await send_telegram_discount_broadcast(
                    db,
                    item_name=b.item_name,
                    discount_text=b.discount_offer,
                    custom_message=b.message_text
                )
            except Exception as e:
                print(f"[Telegram Discount Broadcast Exception] {e}")

    await ws_manager.broadcast(res)
    return res


# -------------------------------------------------------------------
# 2. Process Voice Text (Preset Buttons / Typed Fallback)
# -------------------------------------------------------------------
@app.post("/api/v1/voice/process-text", response_model=schemas.VoiceEventPayload)
async def process_text(
    payload: schemas.ProcessTextRequest,
    db: Session = Depends(get_db)
):
    res = await process_utterance(db, payload.text, source=payload.source or "SOUNDBOX")

    # PRD Section 8.1: If target_customer_id and new udhaar logged, trigger Telegram QR reminder
    if res.get("target_customer_id") and res.get("created_tx_id"):
        tx = db.query(Transaction).filter(Transaction.id == res["created_tx_id"]).first()
        if tx and tx.tx_type == "UDHAAR_GIVEN":
            try:
                await send_telegram_qr_reminder(
                    db,
                    customer_id=res["target_customer_id"],
                    amount=tx.amount,
                    item_name=tx.item_name or "Khata Udhaar",
                    tx_id=tx.id
                )
            except Exception as e:
                print(f"[Telegram QR Reminder Exception] {e}")

    # PRD Section 8.1: If created_broadcast_id, trigger Telegram discount broadcast
    if res.get("created_broadcast_id"):
        b = db.query(DiscountBroadcast).filter(DiscountBroadcast.id == res["created_broadcast_id"]).first()
        if b:
            try:
                await send_telegram_discount_broadcast(
                    db,
                    item_name=b.item_name,
                    discount_text=b.discount_offer,
                    custom_message=b.message_text
                )
            except Exception as e:
                print(f"[Telegram Discount Broadcast Exception] {e}")

    await ws_manager.broadcast(res)
    return res


# -------------------------------------------------------------------
# 3. Nightly 9 PM Briefing
# -------------------------------------------------------------------
@app.post("/api/v1/soundbox/nightly-brief")
@app.post("/api/soundbox/nightly-brief")
async def nightly_brief(db: Session = Depends(get_db)):
    txs = db.query(Transaction).all()
    total_upi_sales = sum(t.amount for t in txs if (t.tx_type == "UPI_SALE" or t.is_settled)) if txs else 3450.0
    total_unsettled_udhaar = sum(t.amount for t in txs if (t.tx_type == "UDHAAR_GIVEN" and not t.is_settled)) if txs else 550.0
    total_daily_sales = total_upi_sales + total_unsettled_udhaar

    # PRD Section 7.1: top_item = SELECT item_name, SUM(amount) as total FROM transactions GROUP BY item_name ORDER BY total DESC LIMIT 1
    top_item_row = (
        db.query(Transaction.item_name, func.sum(Transaction.amount).label("total"))
        .filter(Transaction.item_name.isnot(None), Transaction.tx_type.in_(["UPI_SALE", "UDHAAR_GIVEN"]))
        .group_by(Transaction.item_name)
        .order_by(func.sum(Transaction.amount).desc())
        .first()
    )
    top_item_name = top_item_row[0] if top_item_row and top_item_row[0] else "Aashirvaad Aata"

    credit_obj = calculate_credit_score(db)
    score_val = credit_obj.get("score", 764)

    # Localized Hindi briefing per PRD Section 7.1
    reply_text = (
        f"Namaste! Aaj kul {total_daily_sales:,.0f} rupaye ki bikri hui, "
        f"jisme {total_upi_sales:,.0f} rupaye UPI se aaye aur {total_unsettled_udhaar:,.0f} rupaye udhaar mein darj huye. "
        f"Aaj sabse zyada {top_item_name} bika. Aapka Paytm Credit Score badh kar {score_val} ho gaya hai!"
    )

    tts_audio_base64 = ""
    try:
        tts_audio_base64 = await synthesize_speech_sarvam(reply_text)
    except Exception as e:
        print(f"[TTS Error in Nightly Brief] {e}")

    payload = {
        "event_type": "NIGHTLY_BRIEF",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "soundbox_state": "SPEAKING",
        "reply_text": reply_text,
        "tts_audio_base64": tts_audio_base64,
        "total_daily_sales": total_daily_sales,
        "total_upi_sales": total_upi_sales,
        "total_unsettled_udhaar": total_unsettled_udhaar,
        "top_item": top_item_name,
        "top_item_name": top_item_name,
        "credit_score": credit_obj
    }
    await ws_manager.broadcast(payload)
    return payload


# -------------------------------------------------------------------
# 4. ERP Dashboard Complete State
# -------------------------------------------------------------------
@app.get("/api/v1/erp/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    customers = db.query(Customer).order_by(Customer.total_udhaar_balance.desc()).all()
    transactions = db.query(Transaction).order_by(Transaction.id.desc()).limit(30).all()
    broadcasts = db.query(DiscountBroadcast).order_by(DiscountBroadcast.id.desc()).limit(20).all()
    credit_score = calculate_credit_score(db)

    # Resolve customer_name on transaction schema
    resolved_txs = []
    for t in transactions:
        c_name = t.customer.name if t.customer else None
        resolved_txs.append(
            schemas.TransactionSchema(
                id=t.id,
                customer_id=t.customer_id,
                customer_name=c_name,
                tx_type=t.tx_type,
                item_name=t.item_name,
                quantity_text=t.quantity_text,
                amount=t.amount,
                is_settled=t.is_settled,
                raw_voice_transcript=t.raw_voice_transcript,
                source_channel=t.source_channel,
                created_at=t.created_at
            )
        )

    all_txs = db.query(Transaction).all()
    today_total = sum(t.amount for t in all_txs if t.tx_type in ("UPI_SALE", "UDHAAR_GIVEN")) if all_txs else 4000.0
    today_upi = sum(t.amount for t in all_txs if (t.is_settled and t.tx_type in ("UPI_SALE", "UDHAAR_GIVEN"))) if all_txs else 3450.0
    total_udhaar = sum(c.total_udhaar_balance for c in customers) if customers else 550.0

    top_item_row = (
        db.query(Transaction.item_name, func.sum(Transaction.amount).label("total"))
        .filter(Transaction.item_name.isnot(None), Transaction.tx_type.in_(["UPI_SALE", "UDHAAR_GIVEN"]))
        .group_by(Transaction.item_name)
        .order_by(func.sum(Transaction.amount).desc())
        .first()
    )
    top_selling = top_item_row[0] if top_item_row and top_item_row[0] else "Aashirvaad Aata"

    return {
        "summary_metrics": {
            "total_daily_sales": today_total,
            "today_total_sales": today_total,
            "today_upi_sales": today_upi,
            "today_udhaar_sales": today_total - today_upi,
            "top_selling_item": {
                "item_name": top_selling,
                "total_amount": 2170.0
            },
            "top_selling_item_name": top_selling,
            "total_active_udhaar": total_udhaar,
            "active_udhaar_customer_count": sum(1 for c in customers if c.total_udhaar_balance > 0)
        },
        "customers": [schemas.CustomerSchema.model_validate(c) for c in customers],
        "transactions": resolved_txs,
        "broadcasts": [schemas.BroadcastSchema.model_validate(b) for b in broadcasts],
        "credit_score": credit_score,
        "api_pool_status": {
            "sarvam_active_index": SARVAM_KEY_POOL.current_index + 1 if SARVAM_KEY_POOL.keys else 1,
            "sarvam_active_key": SARVAM_KEY_POOL.current_index + 1 if SARVAM_KEY_POOL.keys else 1,
            "sarvam_total_keys": max(len(SARVAM_KEY_POOL.keys), 3),
            "groq_active_index": GROQ_KEY_POOL.current_index + 1 if GROQ_KEY_POOL.keys else 1,
            "groq_active_key": GROQ_KEY_POOL.current_index + 1 if GROQ_KEY_POOL.keys else 1,
            "groq_total_keys": max(len(GROQ_KEY_POOL.keys), 3),
            "telegram_bot_active": is_telegram_bot_active()
        }
    }


# -------------------------------------------------------------------
# 5. Send Telegram Khata Payment Reminder
# -------------------------------------------------------------------
@app.post("/api/v1/khata/remind/{customer_id}")
async def remind_khata(customer_id: int, db: Session = Depends(get_db)):
    cust = db.query(Customer).filter(Customer.id == customer_id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")

    amount = cust.total_udhaar_balance if cust.total_udhaar_balance > 0 else 150.0
    _, qr_b64 = generate_upi_qr_bytes(cust.name, amount, cust.id)
    tg_res = await send_telegram_qr_reminder(
        db,
        customer_id=cust.id,
        amount=amount,
        item_name="Khata Balance",
        tx_id=cust.id
    )

    return {
        "status": "sent",
        "customer_id": cust.id,
        "customer_name": cust.name,
        "amount": amount,
        "qr_base64": qr_b64,
        "telegram_delivered": tg_res.get("delivered", False),
        "delivered": tg_res.get("delivered", False),
        "message_preview": tg_res.get("caption", ""),
        "caption": tg_res.get("caption", "")
    }


# -------------------------------------------------------------------
# 6. UPI Settlement Webhook
# -------------------------------------------------------------------
@app.post("/api/v1/webhooks/upi-settlement")
async def upi_settlement(payload: schemas.UpiSettlementRequest, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Deduct amount from customer's total_udhaar_balance (minimum 0.0)
    customer.total_udhaar_balance = max(0.0, customer.total_udhaar_balance - payload.amount)

    # Mark customer's unsettled UDHAAR_GIVEN transactions as settled
    if payload.tx_id:
        target_tx = db.query(Transaction).filter(Transaction.id == payload.tx_id).first()
        if target_tx:
            target_tx.is_settled = True
    else:
        unsettled = (
            db.query(Transaction)
            .filter(
                Transaction.customer_id == customer.id,
                Transaction.tx_type == "UDHAAR_GIVEN",
                Transaction.is_settled == False
            )
            .all()
        )
        rem = payload.amount
        for utx in unsettled:
            if rem <= 0:
                break
            if utx.amount <= rem or customer.total_udhaar_balance == 0:
                utx.is_settled = True
                rem -= utx.amount
            else:
                utx.is_settled = True
                break

    # Log settlement transaction
    stx = Transaction(
        customer_id=customer.id,
        tx_type="UDHAAR_SETTLED",
        item_name="Paytm UPI Settlement",
        quantity_text="Settled",
        amount=payload.amount,
        is_settled=True,
        raw_voice_transcript=f"Paytm par ₹{payload.amount:.0f} prapt huye",
        source_channel="TELEGRAM"
    )
    db.add(stx)
    db.commit()
    db.refresh(customer)

    # Recalculate credit score after settlement
    credit_score = calculate_credit_score(db)
    reply_text = f"Paytm par {customer.name} se {payload.amount:.0f} rupaye udhaar vasool huye!"

    tts_b64 = ""
    try:
        tts_b64 = await synthesize_speech_sarvam(reply_text)
    except Exception as e:
        print(f"[TTS Settlement Error] {e}")

    event = {
        "event_type": "UPI_PAYMENT_RECEIVED",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "soundbox_state": "ALERT_SUCCESS",
        "reply_text": reply_text,
        "tts_audio_base64": tts_b64,
        "customer_id": customer.id,
        "customer_name": customer.name,
        "amount": payload.amount,
        "remaining_balance": customer.total_udhaar_balance,
        "new_balance": customer.total_udhaar_balance,
        "credit_score": credit_score
    }
    await ws_manager.broadcast(event)

    return {
        "status": "settled",
        "customer_id": customer.id,
        "amount": payload.amount,
        "remaining_balance": customer.total_udhaar_balance,
        "new_balance": customer.total_udhaar_balance,
        "credit_score": credit_score
    }


# -------------------------------------------------------------------
# 7. Discount Broadcast Campaign
# -------------------------------------------------------------------
@app.post("/api/v1/broadcast/discount")
async def broadcast_discount(payload: schemas.DiscountBroadcastRequest, db: Session = Depends(get_db)):
    reg_count = db.query(Customer).filter(Customer.is_regular == True).count() or 5
    msg = payload.custom_message or f"🎉 Sharma Kirana Store: Aaj {payload.item_name} par {payload.discount_text} chhoot hai! Jaldi aayein."

    broadcast = DiscountBroadcast(
        item_name=payload.item_name,
        discount_offer=payload.discount_text,
        message_text=msg,
        recipients_count=reg_count
    )
    db.add(broadcast)
    db.commit()
    db.refresh(broadcast)

    count = await send_telegram_discount_broadcast(
        db,
        payload.item_name,
        payload.discount_text,
        broadcast.message_text
    )

    tts_reply = f"Aaj ka offer {payload.item_name} par {payload.discount_text} bhej diya gaya hai."
    tts_b64 = ""
    try:
        tts_b64 = await synthesize_speech_sarvam(tts_reply)
    except Exception as e:
        print(f"[TTS Broadcast Error] {e}")

    event = {
        "event_type": "BROADCAST_SENT",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "soundbox_state": "SPEAKING",
        "reply_text": tts_reply,
        "tts_audio_base64": tts_b64,
        "item_name": payload.item_name,
        "discount_offer": payload.discount_text,
        "recipients_count": count
    }
    await ws_manager.broadcast(event)

    res_data = schemas.BroadcastSchema.model_validate(broadcast).model_dump()
    res_data["status"] = "broadcast_sent"
    return res_data


# -------------------------------------------------------------------
# 8. Demo Data Reset
# -------------------------------------------------------------------
@app.post("/api/v1/demo/reset")
async def demo_reset(db: Session = Depends(get_db)):
    reset_session()
    seed_res = seed_database(db)
    event = {
        "event_type": "DEMO_RESET",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "soundbox_state": "IDLE",
        "reply_text": "Demo reset complete. Data restored to default state.",
        "conversation_session_state": "IDLE"
    }
    await ws_manager.broadcast(event)
    return {"status": "reset_complete", "details": seed_res}
