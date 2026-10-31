import sys
from pathlib import Path
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from rapidfuzz import fuzz

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from models import Customer, Transaction, DiscountBroadcast, MerchantStats
from services.llm_service import parse_merchant_intent
from services.sarvam_service import synthesize_speech_sarvam
from services.qr_service import generate_upi_qr_bytes

# Module/Singleton Conversational State
_CURRENT_SESSION_STATE: str = "IDLE"
_PENDING_TX: dict | None = None


def get_session_state() -> str:
    """Returns 'IDLE' | 'AWAITING_DISAMBIGUATION' | 'AWAITING_NEW_CUSTOMER_PHONE'"""
    return _CURRENT_SESSION_STATE


def reset_session() -> None:
    """Resets conversational state machine back to IDLE and clears pending transactions."""
    global _CURRENT_SESSION_STATE, _PENDING_TX
    _CURRENT_SESSION_STATE = "IDLE"
    _PENDING_TX = None


def find_matching_customers(db: Session, spoken_name: str | None) -> list[Customer]:
    """
    Matches spoken customer name against SQLite Customer graph:
    1. Exact full-name match (case-insensitive) -> [Customer]
    2. Token match on first name or surname -> [Ramesh Sharma, Ramesh Verma]
    3. RapidFuzz partial_ratio >= 80 fuzzy match
    """
    if not spoken_name or not spoken_name.strip():
        return []

    spoken = spoken_name.strip().lower()
    customers = db.query(Customer).all()

    # 1. Exact full-name match
    exact_matches = [c for c in customers if c.name.strip().lower() == spoken]
    if exact_matches:
        return exact_matches

    # 2. Token match on parts (e.g. "Ramesh" -> [Ramesh Sharma, Ramesh Verma])
    token_matches = []
    for c in customers:
        parts = [p.lower() for p in c.name.strip().split()]
        if spoken in parts or any(p == spoken for p in parts):
            token_matches.append(c)
    if token_matches:
        return token_matches

    # 3. Fuzzy matching with rapidfuzz (partial_ratio >= 80)
    fuzzy_matches = []
    for c in customers:
        score = fuzz.partial_ratio(spoken, c.name.strip().lower())
        if score >= 80:
            fuzzy_matches.append((score, c))
    if fuzzy_matches:
        fuzzy_matches.sort(key=lambda x: x[0], reverse=True)
        return [c for _, c in fuzzy_matches]

    return []


async def process_utterance(
    db: Session,
    text: str,
    source: str = "SOUNDBOX",
    sarvam_key_index: int = 1
) -> dict:
    """
    Processes merchant utterance across state transitions:
    - Flow A (AWAITING_DISAMBIGUATION) -> selects candidate, logs Udhaar, sends QR
    - Flow B (AWAITING_NEW_CUSTOMER_PHONE) -> registers new customer, logs Udhaar, sends QR
    - IDLE Flow -> handles all 7 PRD intents
    """
    global _CURRENT_SESSION_STATE, _PENDING_TX

    reply_text = ""
    qr_preview_base64 = None
    created_tx_id = None
    target_customer_id = None
    created_broadcast_id = None
    parsed = {}

    # =========================================================================
    # FLOW A: Customer Disambiguation Loop
    # =========================================================================
    if _CURRENT_SESSION_STATE == "AWAITING_DISAMBIGUATION" and _PENDING_TX:
        candidates = _PENDING_TX.get("candidates", [])
        clean_text = text.strip().lower()

        # Try to match the spoken reply to one of the candidates
        matched_customer = None
        spoken_matches = find_matching_customers(db, text)
        for sm in spoken_matches:
            if sm.name in candidates:
                matched_customer = sm
                break

        if not matched_customer:
            for cand_name in candidates:
                cand_lower = cand_name.lower()
                cand_parts = cand_lower.split()
                if cand_lower in clean_text or clean_text in cand_lower or any(p in clean_text for p in cand_parts):
                    matched_customer = db.query(Customer).filter(Customer.name == cand_name).first()
                    if matched_customer:
                        break

        if matched_customer:
            amount_val = float(_PENDING_TX["amount"])
            item_val = _PENDING_TX.get("item_name") or "Kirana Item"
            qty_val = _PENDING_TX.get("quantity") or "1 unit"

            tx = Transaction(
                customer_id=matched_customer.id,
                tx_type="UDHAAR_GIVEN",
                item_name=item_val,
                quantity_text=qty_val,
                amount=amount_val,
                is_settled=False,
                raw_voice_transcript=text,
                source_channel=source
            )
            db.add(tx)
            matched_customer.total_udhaar_balance += amount_val
            matched_customer.total_lifetime_spend += amount_val
            matched_customer.visit_count += 1
            db.commit()
            db.refresh(tx)

            _, qr_b64 = generate_upi_qr_bytes(matched_customer.name, amount_val, tx.id)
            qr_preview_base64 = qr_b64
            created_tx_id = tx.id
            target_customer_id = matched_customer.id

            try:
                from services.telegram_service import send_telegram_qr_reminder
                await send_telegram_qr_reminder(db, matched_customer.id, amount=amount_val, item_name=item_val, tx_id=tx.id)
            except Exception as e:
                print(f"[Telegram Reminder Error] {e}")

            reply_text = (
                f"{matched_customer.name} ke khata mein {tx.amount:.0f} rupaye ka {tx.item_name} "
                f"udhaar likh liya gaya. Kul baaki {matched_customer.total_udhaar_balance:.0f} rupaye."
            )
            _CURRENT_SESSION_STATE = "IDLE"
            _PENDING_TX = None
        else:
            cand_str = " ya ".join(candidates[:2]) if len(candidates) >= 2 else "Sharma ya Verma"
            reply_text = f"Khata mein do {_PENDING_TX.get('customer_name') or 'grahak'} hain—{cand_str}?"

    # =========================================================================
    # FLOW B: New Customer Phone Number Capture Loop
    # =========================================================================
    elif _CURRENT_SESSION_STATE == "AWAITING_NEW_CUSTOMER_PHONE" and _PENDING_TX:
        digits = "".join(ch for ch in text if ch.isdigit())
        if len(digits) < 10:
            parsed_phone = parse_merchant_intent(text).get("spoken_phone")
            if parsed_phone:
                digits = "".join(ch for ch in str(parsed_phone) if ch.isdigit())

        if len(digits) >= 10:
            phone_10 = digits[-10:]
            amount_val = float(_PENDING_TX["amount"])
            item_val = _PENDING_TX.get("item_name") or "Kirana Item"
            qty_val = _PENDING_TX.get("quantity") or "1 unit"
            cust_name = _PENDING_TX.get("customer_name") or "Naya Grahak"

            # Check if customer already exists with this phone
            existing = db.query(Customer).filter(Customer.phone == phone_10).first()
            if existing:
                new_cust = existing
                new_cust.total_udhaar_balance += amount_val
                new_cust.total_lifetime_spend += amount_val
                new_cust.visit_count += 1
            else:
                new_cust = Customer(
                    name=cust_name,
                    phone=phone_10,
                    upi_vpa=f"{phone_10}@paytm",
                    is_regular=True,
                    total_udhaar_balance=amount_val,
                    total_lifetime_spend=amount_val,
                    visit_count=1
                )
                db.add(new_cust)
                db.commit()
                db.refresh(new_cust)

            tx = Transaction(
                customer_id=new_cust.id,
                tx_type="UDHAAR_GIVEN",
                item_name=item_val,
                quantity_text=qty_val,
                amount=amount_val,
                is_settled=False,
                raw_voice_transcript=text,
                source_channel=source
            )
            db.add(tx)
            db.commit()
            db.refresh(tx)

            _, qr_b64 = generate_upi_qr_bytes(new_cust.name, tx.amount, tx.id)
            qr_preview_base64 = qr_b64
            created_tx_id = tx.id
            target_customer_id = new_cust.id

            try:
                from services.telegram_service import send_telegram_qr_reminder
                await send_telegram_qr_reminder(db, new_cust.id, amount=tx.amount, item_name=item_val, tx_id=tx.id)
            except Exception as e:
                print(f"[Telegram Reminder Error] {e}")

            reply_text = f"{new_cust.name} ka naya khata ban gaya aur {tx.amount:.0f} rupaye udhaar likh liya gaya."
            _CURRENT_SESSION_STATE = "IDLE"
            _PENDING_TX = None
        else:
            reply_text = f"{_PENDING_TX['customer_name']} ka dus digit mobile number boliye."

    # =========================================================================
    # IDLE FLOW: Parse Intent and Route
    # =========================================================================
    else:
        parsed = parse_merchant_intent(text)
        intent = parsed.get("intent", "UNKNOWN")

        if intent == "LOG_UDHAAR":
            c_name = parsed.get("customer_name")
            amt = float(parsed.get("amount") or 100.0)
            itm = parsed.get("item_name") or "Kirana Item"
            qty = parsed.get("quantity") or "1 unit"

            matches = find_matching_customers(db, c_name)
            if len(matches) > 1:
                _CURRENT_SESSION_STATE = "AWAITING_DISAMBIGUATION"
                _PENDING_TX = {
                    "customer_name": c_name or "Ramesh",
                    "amount": amt,
                    "item_name": itm,
                    "quantity": qty,
                    "candidates": [m.name for m in matches]
                }
                reply_text = f"Khata mein do {c_name or 'grahak'} hain—{matches[0].name} ya {matches[1].name}?"
            elif len(matches) == 0:
                _CURRENT_SESSION_STATE = "AWAITING_NEW_CUSTOMER_PHONE"
                _PENDING_TX = {
                    "customer_name": c_name or "Naya Grahak",
                    "amount": amt,
                    "item_name": itm,
                    "quantity": qty
                }
                reply_text = f"{_PENDING_TX['customer_name']} khata mein darj nahi hai. Unka dus digit mobile number boliye."
            else:
                cust = matches[0]
                tx = Transaction(
                    customer_id=cust.id,
                    tx_type="UDHAAR_GIVEN",
                    item_name=itm,
                    quantity_text=qty,
                    amount=amt,
                    is_settled=False,
                    raw_voice_transcript=text,
                    source_channel=source
                )
                db.add(tx)
                cust.total_udhaar_balance += amt
                cust.total_lifetime_spend += amt
                cust.visit_count += 1
                db.commit()
                db.refresh(tx)

                _, qr_b64 = generate_upi_qr_bytes(cust.name, amt, tx.id)
                qr_preview_base64 = qr_b64
                created_tx_id = tx.id
                target_customer_id = cust.id

                try:
                    from services.telegram_service import send_telegram_qr_reminder
                    await send_telegram_qr_reminder(db, cust.id, amount=amt, item_name=itm, tx_id=tx.id)
                except Exception as e:
                    print(f"[Telegram Reminder Error] {e}")

                reply_text = f"{cust.name} ke khata mein {amt:.0f} rupaye ka {itm} udhaar likh liya gaya."

        elif intent == "LOG_CASH_SALE":
            amt = float(parsed.get("amount") or 100.0)
            itm = parsed.get("item_name") or "Kirana Item"
            qty = parsed.get("quantity") or "1 unit"

            tx = Transaction(
                customer_id=None,
                tx_type="UPI_SALE",
                item_name=itm,
                quantity_text=qty,
                amount=amt,
                is_settled=True,
                raw_voice_transcript=text,
                source_channel=source
            )
            db.add(tx)
            db.commit()
            db.refresh(tx)
            created_tx_id = tx.id
            reply_text = f"{tx.amount:.0f} rupaye ka {tx.item_name} bikri darj ho gaya."

        elif intent == "SETTLE_UDHAAR":
            c_name = parsed.get("customer_name")
            amt = float(parsed.get("amount") or 0.0)
            matches = find_matching_customers(db, c_name)
            if matches:
                cust = matches[0]
                if amt <= 0.0:
                    amt = cust.total_udhaar_balance
                cust.total_udhaar_balance = max(0.0, cust.total_udhaar_balance - amt)

                # Mark unsettled transactions as settled
                unsettled_txs = (
                    db.query(Transaction)
                    .filter(
                        Transaction.customer_id == cust.id,
                        Transaction.tx_type == "UDHAAR_GIVEN",
                        Transaction.is_settled == False
                    )
                    .all()
                )
                rem = amt
                for utx in unsettled_txs:
                    if rem <= 0:
                        break
                    if utx.amount <= rem:
                        utx.is_settled = True
                        rem -= utx.amount
                    else:
                        break

                stx = Transaction(
                    customer_id=cust.id,
                    tx_type="UDHAAR_SETTLED",
                    item_name="Udhaar Settlement",
                    quantity_text="Settlement",
                    amount=amt,
                    is_settled=True,
                    raw_voice_transcript=text,
                    source_channel=source
                )
                db.add(stx)
                db.commit()
                db.refresh(stx)
                created_tx_id = stx.id
                target_customer_id = cust.id
                reply_text = f"{cust.name} se {amt:.0f} rupaye jama ho gaye. Ab baaki udhaar {cust.total_udhaar_balance:.0f} rupaye hai."
            else:
                reply_text = f"Khata mein {c_name or 'grahak'} ka hisaab nahi mila."

        elif intent == "QUERY_KHATA":
            c_name = parsed.get("customer_name")
            matches = find_matching_customers(db, c_name)
            if matches:
                cust = matches[0]
                target_customer_id = cust.id
                reply_text = f"{cust.name} ka kul baaki udhaar {cust.total_udhaar_balance:.0f} rupaye hai."
            else:
                reply_text = f"{c_name or 'Grahak'} ka khata nahi mila."

        elif intent == "BROADCAST_OFFER":
            itm = parsed.get("item_name") or "Special Offer"
            disc = parsed.get("discount_text") or "Special Chhoot"
            reg_count = db.query(Customer).filter(Customer.is_regular == True).count() or 5
            msg = f"🎉 Sharma Kirana Store: Aaj {itm} par {disc} hai! Jaldi aayein."

            b = DiscountBroadcast(
                item_name=itm,
                discount_offer=disc,
                message_text=msg,
                recipients_count=reg_count
            )
            db.add(b)
            db.commit()
            db.refresh(b)
            created_broadcast_id = b.id

            try:
                from services.telegram_service import send_telegram_discount_broadcast
                await send_telegram_discount_broadcast(db, b.item_name, b.discount_offer, b.message_text)
            except Exception as e:
                print(f"[Telegram Broadcast Error] {e}")

            reply_text = f"Aaj ka discount offer ({b.item_name} par {b.discount_offer}) sabhi {reg_count} pakke grahako ko Telegram par bhej diya gaya hai!"

        elif intent == "NIGHTLY_BRIEF":
            txs = db.query(Transaction).all()
            total_upi_sales = sum(t.amount for t in txs if t.is_settled and t.tx_type == "UPI_SALE")
            customers = db.query(Customer).all()
            total_unsettled_udhaar = sum(c.total_udhaar_balance for c in customers)
            total_daily_sales = sum(t.amount for t in txs if t.tx_type in ("UPI_SALE", "UDHAAR_GIVEN"))

            item_totals = {}
            for t in txs:
                if t.item_name and t.tx_type in ("UPI_SALE", "UDHAAR_GIVEN"):
                    item_totals[t.item_name] = item_totals.get(t.item_name, 0.0) + t.amount
            top_item = max(item_totals.items(), key=lambda x: x[1])[0] if item_totals else "Aashirvaad Aata"

            try:
                from services.credit_engine import calculate_credit_score
                score_data = calculate_credit_score(db)
                score = score_data.get("score", 764)
            except Exception:
                score = 764

            reply_text = (
                f"Namaste! Aaj kul {total_daily_sales:.0f} rupaye ki bikri hui, "
                f"jisme {total_upi_sales:.0f} rupaye UPI se aaye aur {total_unsettled_udhaar:.0f} rupaye udhaar mein darj huye. "
                f"Aaj sabse zyada {top_item} bika. Aapka Paytm Credit Score badh kar {score} ho gaya hai!"
            )

        elif intent == "PROVIDE_INPUT":
            cust_name = parsed.get("customer_name") or text
            reply_text = f"{cust_name} ke liye kya darj karna hai? Udhaar ya bikri boliye."

        else:
            reply_text = "Samajh nahi aaya, kripya dobara bolein."

    # Synthesize audio response via Sarvam Bulbul TTS
    tts_b64 = ""
    try:
        tts_b64 = await synthesize_speech_sarvam(reply_text)
    except Exception as e:
        print(f"[TTS Synthesis Error] {e}")

    return {
        "event_type": "VOICE_PROCESSED",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "soundbox_state": "SPEAKING",
        "transcript": text,
        "parsed_intent": parsed,
        "reply_text": reply_text,
        "tts_audio_base64": tts_b64,
        "conversation_session_state": _CURRENT_SESSION_STATE,
        "qr_preview_base64": qr_preview_base64,
        "created_tx_id": created_tx_id,
        "target_customer_id": target_customer_id,
        "created_broadcast_id": created_broadcast_id
    }
