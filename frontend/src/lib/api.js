const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// -------------------------------------------------------------------
// Helper: Dispatch Mock WebSocket Event to Window
// -------------------------------------------------------------------
function dispatchMockWsEvent(payload) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('voicevyapar-mock-ws', { detail: payload }));
  }
}

// -------------------------------------------------------------------
// In-Memory Realistic Mock Store (PRD Seed Dataset)
// Active whenever backend (:8000) is offline or unreachable
// -------------------------------------------------------------------
const INITIAL_MOCK_DATA = () => ({
  customers: [
    {
      id: 1,
      name: "Ramesh Sharma",
      phone: "9876543210",
      upi_vpa: "9876543210@paytm",
      telegram_chat_id: "demo_linked",
      is_regular: true,
      total_udhaar_balance: 150.0,
      total_lifetime_spend: 2400.0,
      visit_count: 24,
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
    {
      id: 2,
      name: "Ramesh Verma",
      phone: "9876543211",
      upi_vpa: "9876543211@paytm",
      telegram_chat_id: null,
      is_regular: true,
      total_udhaar_balance: 0.0,
      total_lifetime_spend: 1500.0,
      visit_count: 15,
      created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    },
    {
      id: 3,
      name: "Sunita Devi",
      phone: "9811122233",
      upi_vpa: "sunitadevi@paytm",
      telegram_chat_id: null,
      is_regular: true,
      total_udhaar_balance: 320.0,
      total_lifetime_spend: 3100.0,
      visit_count: 31,
      created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    },
    {
      id: 4,
      name: "Abdul Chacha",
      phone: "9822233344",
      upi_vpa: "9822233344@paytm",
      telegram_chat_id: null,
      is_regular: true,
      total_udhaar_balance: 80.0,
      total_lifetime_spend: 1900.0,
      visit_count: 19,
      created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    },
    {
      id: 5,
      name: "Priya Gupta",
      phone: "9833344455",
      upi_vpa: "priyag@paytm",
      telegram_chat_id: null,
      is_regular: true,
      total_udhaar_balance: 0.0,
      total_lifetime_spend: 1200.0,
      visit_count: 12,
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
  ],
  transactions: [
    {
      id: 1,
      customer_id: null,
      customer_name: null,
      tx_type: "UPI_SALE",
      item_name: "Aashirvaad Aata",
      quantity_text: "5 packets",
      amount: 1850.0,
      is_settled: true,
      raw_voice_transcript: "Aashirvaad Aata 1850 rupaye UPI",
      source_channel: "SOUNDBOX",
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 2,
      customer_id: null,
      customer_name: null,
      tx_type: "UPI_SALE",
      item_name: "Fortune Tel",
      quantity_text: "4 bottles",
      amount: 1100.0,
      is_settled: true,
      raw_voice_transcript: "Fortune Tel 1100 rupaye UPI",
      source_channel: "SOUNDBOX",
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: 3,
      customer_id: null,
      customer_name: null,
      tx_type: "UPI_SALE",
      item_name: "Tata Salt & Maggi",
      quantity_text: "Bundle",
      amount: 500.0,
      is_settled: true,
      raw_voice_transcript: "Tata Salt and Maggi 500",
      source_channel: "SOUNDBOX",
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 4,
      customer_id: 1,
      customer_name: "Ramesh Sharma",
      tx_type: "UDHAAR_GIVEN",
      item_name: "Chini (Sugar)",
      quantity_text: "3 kg",
      amount: 150.0,
      is_settled: false,
      raw_voice_transcript: "Ramesh Sharma ko Chini 150 udhaar diya",
      source_channel: "SOUNDBOX",
      created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    },
    {
      id: 5,
      customer_id: 3,
      customer_name: "Sunita Devi",
      tx_type: "UDHAAR_GIVEN",
      item_name: "Aashirvaad Aata",
      quantity_text: "1 pack (5kg)",
      amount: 320.0,
      is_settled: false,
      raw_voice_transcript: "Sunita Devi ko Aata 320 udhaar",
      source_channel: "SOUNDBOX",
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 6,
      customer_id: 4,
      customer_name: "Abdul Chacha",
      tx_type: "UDHAAR_GIVEN",
      item_name: "Chai Patti",
      quantity_text: "2 packets",
      amount: 80.0,
      is_settled: false,
      raw_voice_transcript: "Abdul Chacha Chai Patti 80 udhaar",
      source_channel: "SOUNDBOX",
      created_at: new Date(Date.now() - 1800000).toISOString(),
    },
  ],
  broadcasts: [
    {
      id: 1,
      item_name: "Aashirvaad Aata",
      discount_offer: "₹20 off per 5kg pack",
      message_text: "Namaste! Aaj Aashirvaad Aata par ₹20 ki vishesh chhoot uplabdh hai.",
      recipients_count: 5,
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ],
  creditScore: {
    score: 764,
    max_score: 900,
    rating_tier: "EXCELLENT (Gold Merchant)",
    pre_approved_loan_amount: 35000,
    interest_rate_monthly: "1.25%",
    origination_fee_pct: "1.0%",
    factors: [
      { label: "Daily UPI Inflow Velocity", impact: "+115 pts", detail: "₹3,450 verified digital inflow today" },
      { label: "Udhaar Recovery Ratio", impact: "+84 pts", detail: "78% of voice khata dues recovered within 7 days" },
      { label: "Active Voice Bookkeeping", impact: "+35 pts", detail: "6 structured voice ledger entries logged" },
      { label: "Repeat Customer Graph", impact: "+30 pts", detail: "5 verified repeat Paytm QR shoppers" },
    ],
  },
  sessionState: "IDLE",
});

let mockStore = INITIAL_MOCK_DATA();

// -------------------------------------------------------------------
// 1. processVoiceAudio(blob)
// -------------------------------------------------------------------
export async function processVoiceAudio(blob) {
  try {
    const formData = new FormData();
    formData.append('audio', blob, 'recording.wav');

    const res = await fetch(`${API_BASE_URL}/api/v1/voice/process-audio`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[API] processVoiceAudio backend offline, activating local mock fallback.');
  }

  // Fallback Mock
  const mockPayload = {
    event_type: "VOICE_PROCESSED",
    timestamp: new Date().toISOString(),
    soundbox_state: "IDLE",
    transcript: "Ramesh ko 250 ka tel udhaar diya",
    parsed_intent: {
      intent: "LOG_UDHAAR",
      customer_name: "Ramesh",
      item_name: "Tel",
      amount: 250.0,
      _meta: { groq_key_index: 1, model_used: "llama-3.3-70b-versatile" },
    },
    reply_text: "Khata mein do Ramesh hain—Ramesh Sharma ya Ramesh Verma?",
    tts_audio_base64: "",
    conversation_session_state: "AWAITING_DISAMBIGUATION",
    qr_preview_base64: null,
  };
  mockStore.sessionState = "AWAITING_DISAMBIGUATION";
  dispatchMockWsEvent(mockPayload);
  return mockPayload;
}

// -------------------------------------------------------------------
// 2. processVoiceText(text, source)
// -------------------------------------------------------------------
export async function processVoiceText(text, source = 'SOUNDBOX') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/voice/process-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, source }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[API] processVoiceText backend offline, activating local mock fallback.');
  }

  // Intelligent conversational state mock
  const lower = text.toLowerCase();
  let replyText = "Aapka aadesh darj kar liya gaya hai.";
  let nextSessionState = "IDLE";
  let intentName = "LOG_UDHAAR";
  let itemAmount = 250.0;
  let customerName = "Ramesh Sharma";

  if (mockStore.sessionState === "AWAITING_DISAMBIGUATION" || lower.includes("sharma") || lower.includes("verma")) {
    const chosen = lower.includes("verma") ? "Ramesh Verma" : "Ramesh Sharma";
    replyText = `${chosen} ke khate mein 250 rupaye likh diye gaye.`;
    nextSessionState = "IDLE";
    customerName = chosen;
    const cust = mockStore.customers.find((c) => c.name === chosen);
    if (cust) cust.total_udhaar_balance += 250.0;
  } else if (lower.includes("munna") && !lower.includes("98")) {
    replyText = "Munna khata mein darj nahi hai. Unka dus digit mobile number boliye.";
    nextSessionState = "AWAITING_NEW_CUSTOMER_PHONE";
    customerName = "Munna";
    itemAmount = 120.0;
  } else if (mockStore.sessionState === "AWAITING_NEW_CUSTOMER_PHONE" || /^[0-9]{10}$/.test(text.trim())) {
    const digits = text.replace(/\D/g, "") || "9810012345";
    replyText = `Munna (${digits}) ka naya khata ban gaya aur 120 rupaye udhaar likh liya gaya.`;
    nextSessionState = "IDLE";
    mockStore.customers.push({
      id: mockStore.customers.length + 1,
      name: "Munna",
      phone: digits,
      upi_vpa: `${digits}@paytm`,
      telegram_chat_id: null,
      is_regular: true,
      total_udhaar_balance: 120.0,
      total_lifetime_spend: 120.0,
      visit_count: 1,
      created_at: new Date().toISOString(),
    });
  } else if (lower.includes("chhoot") || lower.includes("discount") || lower.includes("broadcast")) {
    replyText = "Aaj Aashirvaad Aata par 20 rupaye ki chhoot sabhi pakke grahako ko message bhej diya gaya hai.";
    nextSessionState = "IDLE";
    intentName = "BROADCAST_OFFER";
  } else if (lower.includes("brief") || lower.includes("bikri") || lower.includes("hisaab")) {
    replyText = "Namaste! Aaj kul 4,000 rupaye ki bikri hui, jisme 3,450 rupaye UPI se aaye aur 550 rupaye udhaar mein darj huye.";
    nextSessionState = "IDLE";
    intentName = "NIGHTLY_BRIEF";
  } else if (lower.includes("becha") || lower.includes("sale") || lower.includes("500")) {
    replyText = "Fortune Tel 500 rupaye ki bikri Paytm par darj ho gayi.";
    nextSessionState = "IDLE";
    intentName = "LOG_CASH_SALE";
  } else {
    replyText = "Khata mein do Ramesh hain—Ramesh Sharma ya Ramesh Verma?";
    nextSessionState = "AWAITING_DISAMBIGUATION";
  }

  mockStore.sessionState = nextSessionState;

  const mockPayload = {
    event_type: "VOICE_PROCESSED",
    timestamp: new Date().toISOString(),
    soundbox_state: "IDLE",
    transcript: text,
    parsed_intent: {
      intent: intentName,
      customer_name: customerName,
      item_name: "Tel",
      amount: itemAmount,
      _meta: { groq_key_index: 1, model_used: "llama-3.3-70b-versatile" },
    },
    reply_text: replyText,
    tts_audio_base64: "",
    conversation_session_state: nextSessionState,
    qr_preview_base64: null,
  };

  dispatchMockWsEvent(mockPayload);
  return mockPayload;
}

// -------------------------------------------------------------------
// 3. triggerNightlyBrief()
// -------------------------------------------------------------------
export async function triggerNightlyBrief() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/soundbox/nightly-brief`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[API] triggerNightlyBrief backend offline, activating local mock fallback.');
  }

  const replyText = "Namaste! Aaj kul 4,000 rupaye ki bikri hui, jisme 3,450 rupaye UPI se aaye aur 550 rupaye udhaar mein darj huye. Aaj sabse zyada Aashirvaad Aata bika. Aapka Paytm Credit Score badh kar 764 ho gaya hai!";
  const mockPayload = {
    event_type: "NIGHTLY_BRIEF",
    timestamp: new Date().toISOString(),
    soundbox_state: "SPEAKING",
    reply_text: replyText,
    tts_audio_base64: "",
    total_daily_sales: 4000.0,
    total_upi_sales: 3450.0,
    total_unsettled_udhaar: 550.0,
    top_item: "Aashirvaad Aata",
  };

  dispatchMockWsEvent(mockPayload);
  return mockPayload;
}

// -------------------------------------------------------------------
// 4. fetchErpDashboard()
// -------------------------------------------------------------------
export async function fetchErpDashboard() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/erp/dashboard`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[API] fetchErpDashboard backend offline, activating local mock fallback.');
  }

  const activeUdhaarTotal = mockStore.customers.reduce((acc, c) => acc + c.total_udhaar_balance, 0);
  const activeUdhaarCount = mockStore.customers.filter((c) => c.total_udhaar_balance > 0).length;

  return {
    summary_metrics: {
      today_total_sales: 4000.0,
      today_upi_sales: 3450.0,
      today_udhaar_sales: 550.0,
      top_selling_item: "Aashirvaad Aata",
      total_active_udhaar: activeUdhaarTotal,
      active_udhaar_customer_count: activeUdhaarCount,
    },
    customers: [...mockStore.customers],
    transactions: [...mockStore.transactions],
    broadcasts: [...mockStore.broadcasts],
    credit_score: { ...mockStore.creditScore },
    api_pool_status: {
      sarvam_active_index: 1,
      sarvam_total_keys: 3,
      groq_active_index: 1,
      groq_total_keys: 3,
      telegram_bot_active: true,
    },
  };
}

// -------------------------------------------------------------------
// 5. sendKhataReminder(customerId)
// -------------------------------------------------------------------
export async function sendKhataReminder(customerId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/khata/remind/${customerId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[API] sendKhataReminder backend offline, activating local mock fallback.');
  }

  const cust = mockStore.customers.find((c) => c.id === customerId);
  const name = cust ? cust.name : "Customer";
  const amount = cust ? cust.total_udhaar_balance : 150.0;

  return {
    status: "sent",
    customer_id: customerId,
    delivered: true,
    caption: `🙏 Namaste ${name} ji!\nSharma Kirana Store par aapka naya udhaar darj hua hai:\n💰 Amount: ₹${amount.toFixed(2)}`,
    qr_base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  };
}

// -------------------------------------------------------------------
// 6. simulateUpiSettlement(customerId, amount)
// -------------------------------------------------------------------
export async function simulateUpiSettlement(customerId, amount, txId = null) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/webhooks/upi-settlement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: customerId, amount: Number(amount), tx_id: txId }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[API] simulateUpiSettlement backend offline, activating local mock fallback.');
  }

  const amt = Number(amount) || 150.0;
  const cust = mockStore.customers.find((c) => c.id === customerId);
  if (cust) {
    cust.total_udhaar_balance = Math.max(0.0, cust.total_udhaar_balance - amt);
  }

  mockStore.transactions.unshift({
    id: mockStore.transactions.length + 1,
    customer_id: customerId,
    customer_name: cust ? cust.name : "Customer",
    tx_type: "UDHAAR_SETTLED",
    item_name: "Paytm UPI Settlement",
    quantity_text: "Settled",
    amount: amt,
    is_settled: true,
    raw_voice_transcript: `Paytm par ₹${amt.toFixed(0)} prapt huye`,
    source_channel: "TELEGRAM",
    created_at: new Date().toISOString(),
  });

  // Bump credit score to 781 and unlock 45000 loan
  mockStore.creditScore.score = 781;
  mockStore.creditScore.pre_approved_loan_amount = 45000;

  const replyText = `Paytm par ${cust ? cust.name : "Customer"} se ${amt.toFixed(0)} rupaye udhaar vasool huye!`;
  const mockPayload = {
    event_type: "UPI_PAYMENT_RECEIVED",
    timestamp: new Date().toISOString(),
    soundbox_state: "ALERT_SUCCESS",
    reply_text: replyText,
    tts_audio_base64: "",
    customer_id: customerId,
    amount: amt,
  };

  dispatchMockWsEvent(mockPayload);
  return { status: "settled", customer_id: customerId, amount: amt };
}

// -------------------------------------------------------------------
// 7. sendDiscountBroadcast(itemName, discountText, customMessage)
// -------------------------------------------------------------------
export async function sendDiscountBroadcast(itemName, discountText, customMessage = "") {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/broadcast/discount`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item_name: itemName,
        discount_text: discountText,
        custom_message: customMessage || null,
      }),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[API] sendDiscountBroadcast backend offline, activating local mock fallback.');
  }

  const newBroadcast = {
    id: mockStore.broadcasts.length + 1,
    item_name: itemName,
    discount_offer: discountText,
    message_text: customMessage || `Aaj ${itemName} par ${discountText} vishesh chhoot uplabdh hai!`,
    recipients_count: 5,
    created_at: new Date().toISOString(),
  };
  mockStore.broadcasts.unshift(newBroadcast);

  const mockPayload = {
    event_type: "BROADCAST_SENT",
    timestamp: new Date().toISOString(),
    item_name: itemName,
    discount_offer: discountText,
    recipients_count: 5,
  };

  dispatchMockWsEvent(mockPayload);
  return { status: "broadcast_sent", recipients_count: 5 };
}

// -------------------------------------------------------------------
// 8. resetDemoData()
// -------------------------------------------------------------------
export async function resetDemoData() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/demo/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[API] resetDemoData backend offline, resetting local mock store.');
  }

  mockStore = INITIAL_MOCK_DATA();
  const mockPayload = {
    event_type: "DEMO_RESET",
    timestamp: new Date().toISOString(),
  };

  dispatchMockWsEvent(mockPayload);
  return { status: "reset_complete" };
}
