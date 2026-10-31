from sqlalchemy.orm import Session
from database import Base, engine
from models import Customer, Transaction, DiscountBroadcast, MerchantStats

def seed_database(db: Session) -> dict:
    """
    Seeds baseline kirana store data:
    5 regular customers (including Ramesh Sharma and Ramesh Verma for disambiguation)
    6 daily transactions totaling ₹4,000 (₹3,450 UPI + ₹550 Udhaar)
    Top-selling item: Aashirvaad Aata (₹2,170)
    """
    Base.metadata.create_all(bind=engine)
    db.query(Transaction).delete()
    db.query(Customer).delete()
    db.query(DiscountBroadcast).delete()
    db.query(MerchantStats).delete()
    db.commit()

    c1 = Customer(
        name="Ramesh Sharma",
        phone="9876543210",
        upi_vpa="9876543210@paytm",
        is_regular=True,
        total_udhaar_balance=150.0,
        total_lifetime_spend=2400.0,
        visit_count=24
    )
    c2 = Customer(
        name="Ramesh Verma",
        phone="9876543211",
        upi_vpa="9876543211@paytm",
        is_regular=True,
        total_udhaar_balance=0.0,
        total_lifetime_spend=1500.0,
        visit_count=15
    )
    c3 = Customer(
        name="Sunita Devi",
        phone="9811122233",
        upi_vpa="sunitadevi@paytm",
        is_regular=True,
        total_udhaar_balance=320.0,
        total_lifetime_spend=3100.0,
        visit_count=31
    )
    c4 = Customer(
        name="Abdul Chacha",
        phone="9822233344",
        upi_vpa="9822233344@paytm",
        is_regular=True,
        total_udhaar_balance=80.0,
        total_lifetime_spend=1900.0,
        visit_count=19
    )
    c5 = Customer(
        name="Priya Gupta",
        phone="9833344455",
        upi_vpa="priyag@paytm",
        is_regular=True,
        total_udhaar_balance=0.0,
        total_lifetime_spend=1200.0,
        visit_count=12
    )

    db.add_all([c1, c2, c3, c4, c5])
    db.commit()

    t1 = Transaction(
        customer_id=None,
        tx_type="UPI_SALE",
        item_name="Aashirvaad Aata",
        quantity_text="5 packets",
        amount=1850.0,
        is_settled=True,
        raw_voice_transcript="Aashirvaad Aata 1850 rupaye UPI",
        source_channel="SOUNDBOX"
    )
    t2 = Transaction(
        customer_id=None,
        tx_type="UPI_SALE",
        item_name="Fortune Tel",
        quantity_text="4 bottles",
        amount=1100.0,
        is_settled=True,
        raw_voice_transcript="Fortune Tel 1100 rupaye UPI",
        source_channel="SOUNDBOX"
    )
    t3 = Transaction(
        customer_id=None,
        tx_type="UPI_SALE",
        item_name="Tata Salt & Maggi",
        quantity_text="Bundle",
        amount=500.0,
        is_settled=True,
        raw_voice_transcript="Tata Salt and Maggi 500",
        source_channel="SOUNDBOX"
    )
    t4 = Transaction(
        customer_id=c1.id,
        tx_type="UDHAAR_GIVEN",
        item_name="Chini (Sugar)",
        quantity_text="3 kg",
        amount=150.0,
        is_settled=False,
        raw_voice_transcript="Ramesh Sharma ko Chini 150 udhaar diya",
        source_channel="SOUNDBOX"
    )
    t5 = Transaction(
        customer_id=c3.id,
        tx_type="UDHAAR_GIVEN",
        item_name="Aashirvaad Aata",
        quantity_text="1 pack (5kg)",
        amount=320.0,
        is_settled=False,
        raw_voice_transcript="Sunita Devi ko Aata 320 udhaar",
        source_channel="SOUNDBOX"
    )
    t6 = Transaction(
        customer_id=c4.id,
        tx_type="UDHAAR_GIVEN",
        item_name="Chai Patti",
        quantity_text="2 packets",
        amount=80.0,
        is_settled=False,
        raw_voice_transcript="Abdul Chacha Chai Patti 80 udhaar",
        source_channel="SOUNDBOX"
    )

    db.add_all([t1, t2, t3, t4, t5, t6])

    stats = MerchantStats(
        merchant_name="Sharma Kirana Store",
        merchant_upi_id="sharmakirana@paytm",
        credit_score=764,
        pre_approved_loan_amount=35000
    )
    db.add(stats)
    db.commit()

    return {"status": "success", "customers_seeded": 5, "transactions_seeded": 6}

