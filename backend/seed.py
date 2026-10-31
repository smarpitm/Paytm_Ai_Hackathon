import sys
from pathlib import Path
from datetime import datetime, timezone

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy.orm import Session
from database import Base, engine, SessionLocal
from models import Customer, Transaction, DiscountBroadcast, MerchantStats
from config import DEFAULT_DEMO_CHAT_ID, MERCHANT_NAME, MERCHANT_UPI_ID


def seed_database(db: Session) -> dict:
    """
    Seeds baseline kirana store data exactly per PRD Section 4.3:
    - 5 regular customers (including Ramesh Sharma and Ramesh Verma for voice disambiguation)
    - 6 daily transactions totaling ₹4,000 (₹3,450 UPI + ₹550 Udhaar)
    - Top-selling item: Aashirvaad Aata (₹2,170)
    - 1 DiscountBroadcast
    - 1 MerchantStats row
    """
    # 1. Create tables if not existing
    Base.metadata.create_all(bind=engine)

    # 2. Clear existing rows
    db.query(Transaction).delete()
    db.query(DiscountBroadcast).delete()
    db.query(Customer).delete()
    db.query(MerchantStats).delete()
    db.commit()

    # 3. Insert 5 Pre-Seeded Regular Customers
    demo_chat_id = None
    if DEFAULT_DEMO_CHAT_ID:
        cleaned_chat_id = DEFAULT_DEMO_CHAT_ID.strip()
        if cleaned_chat_id and not cleaned_chat_id.startswith("your_"):
            demo_chat_id = cleaned_chat_id

    c1 = Customer(
        name="Ramesh Sharma",
        phone="9876543210",
        upi_vpa="9876543210@paytm",
        telegram_chat_id=demo_chat_id,
        is_regular=True,
        total_udhaar_balance=150.0,
        total_lifetime_spend=4250.0,
        visit_count=24
    )
    c2 = Customer(
        name="Ramesh Verma",
        phone="9876543211",
        upi_vpa="9876543211@paytm",
        telegram_chat_id=None,
        is_regular=True,
        total_udhaar_balance=0.0,
        total_lifetime_spend=1800.0,
        visit_count=15
    )
    c3 = Customer(
        name="Sunita Devi",
        phone="9811122233",
        upi_vpa="sunitadevi@paytm",
        telegram_chat_id=None,
        is_regular=True,
        total_udhaar_balance=320.0,
        total_lifetime_spend=6100.0,
        visit_count=31
    )
    c4 = Customer(
        name="Abdul Chacha",
        phone="9822233344",
        upi_vpa="9822233344@paytm",
        telegram_chat_id=None,
        is_regular=True,
        total_udhaar_balance=80.0,
        total_lifetime_spend=2900.0,
        visit_count=19
    )
    c5 = Customer(
        name="Priya Gupta",
        phone="9833344455",
        upi_vpa="priyag@paytm",
        telegram_chat_id=None,
        is_regular=True,
        total_udhaar_balance=0.0,
        total_lifetime_spend=1500.0,
        visit_count=12
    )

    db.add_all([c1, c2, c3, c4, c5])
    db.commit()

    # 4. Insert Today's Pre-Seeded Transactions
    t1 = Transaction(
        customer_id=None,
        tx_type="UPI_SALE",
        item_name="Aashirvaad Aata",
        quantity_text="5 packs",
        amount=1850.0,
        is_settled=True,
        raw_voice_transcript="Aashirvaad Aata 1850 rupaye UPI bikri",
        source_channel="SOUNDBOX"
    )
    t2 = Transaction(
        customer_id=None,
        tx_type="UPI_SALE",
        item_name="Fortune Tel",
        quantity_text="4 bottles",
        amount=1100.0,
        is_settled=True,
        raw_voice_transcript="Fortune Tel 1100 rupaye UPI bikri",
        source_channel="SOUNDBOX"
    )
    t3 = Transaction(
        customer_id=None,
        tx_type="UPI_SALE",
        item_name="Tata Salt & Maggi",
        quantity_text="Combo",
        amount=500.0,
        is_settled=True,
        raw_voice_transcript="500 rupaye ka Tata Salt aur Maggi becha",
        source_channel="SOUNDBOX"
    )
    t4 = Transaction(
        customer_id=c1.id,
        tx_type="UDHAAR_GIVEN",
        item_name="Chini (Sugar)",
        quantity_text="3 kg",
        amount=150.0,
        is_settled=False,
        raw_voice_transcript="Ramesh Sharma ko 150 ka chini udhaar diya",
        source_channel="SOUNDBOX"
    )
    t5 = Transaction(
        customer_id=c3.id,
        tx_type="UDHAAR_GIVEN",
        item_name="Aashirvaad Aata",
        quantity_text="1 pack (5kg)",
        amount=320.0,
        is_settled=False,
        raw_voice_transcript="Sunita Devi ko 320 ka Aashirvaad Aata udhaar diya",
        source_channel="SOUNDBOX"
    )
    t6 = Transaction(
        customer_id=c4.id,
        tx_type="UDHAAR_GIVEN",
        item_name="Chai Patti",
        quantity_text="250g",
        amount=80.0,
        is_settled=False,
        raw_voice_transcript="Abdul Chacha ko 80 ki chai patti udhaar diya",
        source_channel="SOUNDBOX"
    )

    db.add_all([t1, t2, t3, t4, t5, t6])

    # 5. Insert Initial DiscountBroadcast & MerchantStats
    broadcast = DiscountBroadcast(
        item_name="Fortune Tel",
        discount_offer="₹15 off per litre",
        message_text="🎉 Sharma Kirana Store: Aaj Fortune Tel par ₹15 ki chhoot hai!",
        recipients_count=5
    )
    db.add(broadcast)

    stats = MerchantStats(
        merchant_name=MERCHANT_NAME,
        merchant_upi_id=MERCHANT_UPI_ID,
        credit_score=764,
        pre_approved_loan_amount=35000,
        updated_at=datetime.now(timezone.utc).replace(tzinfo=None)
    )
    db.add(stats)
    db.commit()

    return {
        "status": "success",
        "customers_seeded": 5,
        "transactions_seeded": 6,
        "broadcasts_seeded": 1
    }


# Alias as requested
reset_and_seed_db = seed_database


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    with SessionLocal() as session:
        result = seed_database(session)
        print("Database seeded successfully:", result)

        print("\n--- 5 Pre-Seeded Regular Customers ---")
        customers = session.query(Customer).all()
        for c in customers:
            print(f"- {c.name} | Phone: {c.phone} | VPA: {c.upi_vpa} | Udhaar: ₹{c.total_udhaar_balance:.2f} | Spend: ₹{c.total_lifetime_spend:.2f} | Visits: {c.visit_count}")

        txs = session.query(Transaction).all()
        total_sales = sum(t.amount for t in txs)
        upi_sales = sum(t.amount for t in txs if t.is_settled)
        udhaar_sales = sum(t.amount for t in txs if not t.is_settled)
        print(f"\n--- Daily Transactions Summary (Total: ₹{total_sales:,.2f}) ---")
        print(f"UPI Sales: ₹{upi_sales:,.2f} | Udhaar Sales: ₹{udhaar_sales:,.2f} | Count: {len(txs)}")
        for t in txs:
            print(f"  • [{t.tx_type}] {t.item_name} ({t.quantity_text}) - ₹{t.amount:.2f} (Settled: {t.is_settled})")
