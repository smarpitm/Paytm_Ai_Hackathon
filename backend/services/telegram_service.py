import os
from datetime import datetime
from typing import Optional, Callable, Any
from sqlalchemy.orm import Session
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, CallbackQueryHandler, ContextTypes, filters

from database import SessionLocal
from models import Customer, Transaction
from services.qr_service import generate_upi_qr_bytes
from services.sarvam_service import transcribe_audio_sarvam, synthesize_speech_sarvam
from services.session_manager import process_utterance
from services.credit_engine import calculate_credit_score

# ponytail: simple global state for bot app and demo routing
_bot_app: Optional[Application] = None
_ws_broadcast_cb: Optional[Callable[[dict], Any]] = None
_demo_env = os.getenv("DEFAULT_DEMO_CHAT_ID", "").strip()
_active_demo_chat_id: str = "" if _demo_env.startswith("your_") else _demo_env


def is_telegram_bot_active() -> bool:
    token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
    return bool(token and not token.startswith("your_"))


async def handle_link_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    global _active_demo_chat_id
    if not update.effective_chat:
        return
    chat_id = str(update.effective_chat.id)
    _active_demo_chat_id = chat_id
    query = " ".join(context.args).strip() if context.args else "Ramesh"

    with SessionLocal() as db:
        customer = (
            db.query(Customer)
            .filter((Customer.phone == query) | (Customer.name.ilike(f"%{query}%")))
            .first()
        ) or db.query(Customer).first()

        if customer:
            customer.telegram_chat_id = chat_id
            db.commit()
            reply = f"✅ Your phone is now linked as {customer.name} ({customer.phone}) for Sharma Kirana Store!"
        else:
            reply = "✅ Your phone is now linked for Sharma Kirana Store demo alerts!"

    if update.message:
        await update.message.reply_text(reply)


async def handle_voice_note(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.message or not update.message.voice:
        return
    try:
        tg_file = await context.bot.get_file(update.message.voice.file_id)
        voice_bytes = await tg_file.download_as_bytearray()
        stt = await transcribe_audio_sarvam(bytes(voice_bytes), "telegram_voice.ogg")
        transcript = stt.get("transcript", "")

        with SessionLocal() as db:
            res = await process_utterance(db, transcript, source="TELEGRAM")

        await update.message.reply_text(res.get("reply_text", "Voice processed."))
        if _ws_broadcast_cb:
            await _ws_broadcast_cb(res)
    except Exception as exc:
        print(f"[Telegram Voice Error] {exc}")
        if update.message:
            await update.message.reply_text("Kshama karein, voice note process nahi ho paya.")


async def handle_settle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    if not query:
        return
    await query.answer("Payment Successful!")

    parts = (query.data or "").split(":")
    customer_id = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 1
    paid_amt = float(parts[2]) if len(parts) > 2 else None

    with SessionLocal() as db:
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        c_name = customer.name if customer else "Customer"
        amount = paid_amt if paid_amt is not None else (customer.total_udhaar_balance if customer else 250.0)

        if customer:
            for t in db.query(Transaction).filter(Transaction.customer_id == customer.id, Transaction.is_settled == False).all():
                t.is_settled = True
            customer.total_udhaar_balance = max(0.0, customer.total_udhaar_balance - amount)
            db.add(Transaction(
                customer_id=customer.id,
                tx_type="UDHAAR_SETTLED",
                item_name="Telegram UPI Payment",
                quantity_text="Settled",
                amount=amount,
                is_settled=True,
                source_channel="TELEGRAM"
            ))
            db.commit()
            calculate_credit_score(db)

    receipt = f"✅ PAID ₹{amount:.2f} via Paytm UPI! Receipt #PYTM98234. Khata Settled."
    try:
        await query.edit_message_caption(caption=receipt)
    except Exception:
        pass

    speech = f"Paytm par {c_name} se {amount:.0f} rupaye udhaar vasool huye!"
    tts_b64 = await synthesize_speech_sarvam(speech) if speech else ""

    if _ws_broadcast_cb:
        await _ws_broadcast_cb({
            "event_type": "UPI_PAYMENT_RECEIVED",
            "timestamp": datetime.utcnow().isoformat(),
            "soundbox_state": "ALERT_SUCCESS",
            "reply_text": speech,
            "tts_audio_base64": tts_b64,
            "customer_id": customer_id,
            "amount": amount
        })


async def send_telegram_qr_reminder(
    db: Session,
    customer_id: int,
    amount: Optional[float] = None,
    item_name: str = "Kirana Udhaar",
    tx_id: int = 0
) -> dict:
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    c_name = customer.name if customer else "Customer"
    c_bal = customer.total_udhaar_balance if customer else 0.0
    amt = amount if amount is not None else (c_bal if c_bal > 0 else 250.0)

    png_bytes, qr_b64 = generate_upi_qr_bytes(c_name, amt, tx_id or customer_id)
    caption = (
        f"🙏 Namaste {c_name} ji!\n"
        f"Sharma Kirana Store par aapka naya udhaar darj hua hai:\n"
        f"🛒 Item: {item_name}\n"
        f"💰 Amount: ₹{amt:.2f}\n"
        f"📊 Kul Baaki Udhaar: ₹{c_bal:.2f}\n\n"
        f"Scan the Paytm QR above or tap the button below to pay instantly:"
    )

    dest_chat = (customer.telegram_chat_id if customer else None) or _active_demo_chat_id
    delivered = False

    if _bot_app and is_telegram_bot_active() and dest_chat:
        try:
            keyboard = InlineKeyboardMarkup([
                [InlineKeyboardButton(f"💳 Pay ₹{amt:.0f} via Paytm UPI (Simulate)", callback_data=f"settle_tx:{customer_id}:{amt:.0f}")]
            ])
            await _bot_app.bot.send_photo(chat_id=dest_chat, photo=png_bytes, caption=caption, reply_markup=keyboard)
            delivered = True
        except Exception as e:
            print(f"[Telegram Send Photo Error] {e}")

    return {"delivered": delivered, "caption": caption, "qr_base64": qr_b64, "amount": amt, "customer_id": customer_id}


async def send_telegram_discount_broadcast(
    db: Session,
    item_name: str,
    discount_offer: str,
    message_text: str
) -> int:
    regular_customers = db.query(Customer).filter(Customer.is_regular == True).all()
    count = len(regular_customers) or 5

    dest_chats = {c.telegram_chat_id for c in regular_customers if c.telegram_chat_id}
    if _active_demo_chat_id:
        dest_chats.add(_active_demo_chat_id)

    if _bot_app and is_telegram_bot_active() and dest_chats:
        text = f"📢 Sharma Kirana Store Offer!\n\n🛒 {item_name}: {discount_offer}\n\n{message_text}"
        for chat_id in dest_chats:
            try:
                await _bot_app.bot.send_message(chat_id=chat_id, text=text)
            except Exception as e:
                print(f"[Telegram Broadcast Error] {e}")

    return count


async def start_telegram_bot(ws_broadcast_callback: Optional[Callable[[dict], Any]] = None) -> None:
    global _bot_app, _ws_broadcast_cb
    _ws_broadcast_cb = ws_broadcast_callback
    if not is_telegram_bot_active():
        return

    try:
        token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
        _bot_app = Application.builder().token(token).build()
        _bot_app.add_handler(CommandHandler(["start", "link"], handle_link_command))
        _bot_app.add_handler(MessageHandler(filters.VOICE, handle_voice_note))
        _bot_app.add_handler(CallbackQueryHandler(handle_settle_callback, pattern="^settle_tx:"))
        await _bot_app.initialize()
        await _bot_app.start()
        await _bot_app.updater.start_polling()
    except Exception as e:
        print(f"[Telegram Bot Start Error] {e}")


async def stop_telegram_bot() -> None:
    global _bot_app
    if _bot_app:
        try:
            if _bot_app.updater and _bot_app.updater.running:
                await _bot_app.updater.stop()
            if _bot_app.running:
                await _bot_app.stop()
            await _bot_app.shutdown()
        except Exception:
            pass
        finally:
            _bot_app = None
