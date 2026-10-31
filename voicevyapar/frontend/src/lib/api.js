const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function processVoiceAudio(blob) {
  const formData = new FormData();
  formData.append('audio', blob, 'recording.wav');

  const response = await fetch(`${API_BASE_URL}/api/v1/voice/process-audio`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Audio processing failed with HTTP ${response.status}`);
  }
  return response.json();
}

export async function processVoiceText(text, source = 'SOUNDBOX') {
  const response = await fetch(`${API_BASE_URL}/api/v1/voice/process-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, source }),
  });
  if (!response.ok) {
    throw new Error(`Text processing failed with HTTP ${response.status}`);
  }
  return response.json();
}

export async function triggerNightlyBrief() {
  const response = await fetch(`${API_BASE_URL}/api/v1/soundbox/nightly-brief`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!response.ok) {
    throw new Error(`Nightly brief failed with HTTP ${response.status}`);
  }
  return response.json();
}

export async function fetchErpDashboard() {
  const response = await fetch(`${API_BASE_URL}/api/v1/erp/dashboard`);
  if (!response.ok) {
    throw new Error(`Dashboard fetch failed with HTTP ${response.status}`);
  }
  return response.json();
}

export async function sendKhataReminder(customerId) {
  const response = await fetch(`${API_BASE_URL}/api/v1/khata/remind/${customerId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!response.ok) {
    throw new Error(`Khata reminder failed with HTTP ${response.status}`);
  }
  return response.json();
}

export async function simulateUpiSettlement(customerId, amount, txId = null) {
  const response = await fetch(`${API_BASE_URL}/api/v1/webhooks/upi-settlement`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer_id: customerId, amount, tx_id: txId }),
  });
  if (!response.ok) {
    throw new Error(`UPI settlement failed with HTTP ${response.status}`);
  }
  return response.json();
}

export async function sendDiscountBroadcast(itemName, discountText, customMessage = null) {
  const response = await fetch(`${API_BASE_URL}/api/v1/broadcast/discount`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      item_name: itemName,
      discount_text: discountText,
      custom_message: customMessage,
    }),
  });
  if (!response.ok) {
    throw new Error(`Discount broadcast failed with HTTP ${response.status}`);
  }
  return response.json();
}

export async function resetDemoData() {
  const response = await fetch(`${API_BASE_URL}/api/v1/demo/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!response.ok) {
    throw new Error(`Demo reset failed with HTTP ${response.status}`);
  }
  return response.json();
}

