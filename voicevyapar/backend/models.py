from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    upi_vpa = Column(String, nullable=True)               # Auto-captured from past Paytm QR scans
    telegram_chat_id = Column(String, nullable=True)      # Bound via /link on Telegram for live phone demo
    is_regular = Column(Boolean, default=True)            # Eligible for regular customer discount alerts
    total_udhaar_balance = Column(Float, default=0.0)
    total_lifetime_spend = Column(Float, default=0.0)
    visit_count = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    transactions = relationship("Transaction", back_populates="customer")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    tx_type = Column(String, nullable=False)              # "UDHAAR_GIVEN", "UDHAAR_SETTLED", "UPI_SALE"
    item_name = Column(String, nullable=False)            # e.g., "Fortune Mustard Oil", "Aashirvaad Aata"
    quantity_text = Column(String, default="1 unit")
    amount = Column(Float, nullable=False)
    is_settled = Column(Boolean, default=False)           # True for UPI_SALE or settled UDHAAR_GIVEN
    raw_voice_transcript = Column(String, nullable=True)
    source_channel = Column(String, default="SOUNDBOX")   # "SOUNDBOX" or "TELEGRAM"
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="transactions")

class DiscountBroadcast(Base):
    __tablename__ = "discount_broadcasts"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, nullable=False)
    discount_offer = Column(String, nullable=False)       # e.g., "₹20 off per 5kg pack"
    message_text = Column(String, nullable=False)
    recipients_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class MerchantStats(Base):
    __tablename__ = "merchant_stats"

    id = Column(Integer, primary_key=True, index=True)
    merchant_name = Column(String, default="Sharma Kirana Store")
    merchant_upi_id = Column(String, default="sharmakirana@paytm")
    credit_score = Column(Integer, default=764)
    pre_approved_loan_amount = Column(Integer, default=35000)
    updated_at = Column(DateTime, default=datetime.utcnow)

