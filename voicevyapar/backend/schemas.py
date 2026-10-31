from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field

# ---------------------------------------------------------
# Request Schemas
# ---------------------------------------------------------

class ProcessTextRequest(BaseModel):
    text: str
    source: Optional[str] = "SOUNDBOX"


class UpiSettlementRequest(BaseModel):
    customer_id: int
    amount: float
    tx_id: Optional[int] = None


class DiscountBroadcastRequest(BaseModel):
    item_name: str
    discount_text: str
    custom_message: Optional[str] = None


# ---------------------------------------------------------
# Entity Schemas (ORM-backed)
# ---------------------------------------------------------

class CustomerSchema(BaseModel):
    id: int
    name: str
    phone: str
    upi_vpa: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    is_regular: bool = True
    total_udhaar_balance: float = 0.0
    total_lifetime_spend: float = 0.0
    visit_count: int = 1
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class TransactionSchema(BaseModel):
    id: int
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    tx_type: str
    item_name: str
    quantity_text: Optional[str] = "1 unit"
    amount: float
    is_settled: bool = False
    raw_voice_transcript: Optional[str] = None
    source_channel: Optional[str] = "SOUNDBOX"
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class BroadcastSchema(BaseModel):
    id: int
    item_name: str
    discount_offer: str
    message_text: str
    recipients_count: int = 0
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------
# Credit Score & Dashboard Schemas
# ---------------------------------------------------------

class CreditScoreFactor(BaseModel):
    label: str
    impact: str
    detail: str


class CreditScoreSchema(BaseModel):
    score: int = 764
    max_score: int = 900
    rating_tier: str = "EXCELLENT (Gold Merchant)"
    pre_approved_loan_amount: int = 35000
    interest_rate_monthly: str = "1.25%"
    origination_fee_pct: str = "1.0%"
    factors: List[CreditScoreFactor] = Field(default_factory=list)


class ApiPoolStatusSchema(BaseModel):
    sarvam_active_index: int = 1
    sarvam_total_keys: int = 0
    groq_active_index: int = 1
    groq_total_keys: int = 0
    telegram_bot_active: bool = False


class DashboardSummaryMetrics(BaseModel):
    today_total_sales: float = 0.0
    today_upi_sales: float = 0.0
    today_udhaar_sales: float = 0.0
    top_selling_item: str = "Aashirvaad Aata"
    total_active_udhaar: float = 0.0
    active_udhaar_customer_count: int = 0


class DashboardResponseSchema(BaseModel):
    summary_metrics: DashboardSummaryMetrics
    customers: List[CustomerSchema] = Field(default_factory=list)
    transactions: List[TransactionSchema] = Field(default_factory=list)
    broadcasts: List[BroadcastSchema] = Field(default_factory=list)
    credit_score: CreditScoreSchema
    api_pool_status: ApiPoolStatusSchema


# ---------------------------------------------------------
# Event & Voice Payloads
# ---------------------------------------------------------

class VoiceEventPayload(BaseModel):
    event_type: str = "VOICE_PROCESSED"
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    soundbox_state: str = "IDLE"
    transcript: str = ""
    parsed_intent: Optional[Dict[str, Any]] = None
    reply_text: str = ""
    tts_audio_base64: str = ""
    conversation_session_state: str = "IDLE"
    qr_preview_base64: Optional[str] = None


class NightlyBriefPayload(BaseModel):
    total_daily_sales: float = 0.0
    total_upi_sales: float = 0.0
    total_unsettled_udhaar: float = 0.0
    top_item: str = ""
    brief_text: str = ""
    tts_audio_base64: str = ""

