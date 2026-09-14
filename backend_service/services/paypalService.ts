const paypalBaseUrl = process.env.PAYPAL_API_BASE_URL || "https://api-m.sandbox.paypal.com";
type PayPalRequestOptions = { method?: string; headers?: Record<string, string>; body?: string };
type PayPalError = Error & { statusCode?: number; details?: unknown };

function requirePayPalConfig() {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    const error = new Error("PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in the backend environment.") as PayPalError;
    error.statusCode = 503;
    throw error;
  }

  if (!String(paypalBaseUrl).includes("sandbox")) {
    const error = new Error("Sandbox mode is required for local testing. PAYPAL_API_BASE_URL must use https://api-m.sandbox.paypal.com.") as PayPalError;
    error.statusCode = 503;
    throw error;
  }
}

async function getAccessToken() {
  requirePayPalConfig();
  const credentials = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error_description || data?.message || `PayPal token request failed with status ${response.status}.`) as PayPalError;
    error.statusCode = response.status;
    error.details = data;
    throw error;
  }

  return data.access_token;
}

async function paypalRequest(path: string, options: PayPalRequestOptions = {}) {
  const accessToken = await getAccessToken();
  const response = await fetch(`${paypalBaseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.message || `PayPal request failed with status ${response.status}.`) as PayPalError;
    error.statusCode = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

function createPayPalOrder({ amount, currency, referenceId }) {
  return paypalRequest("/v2/checkout/orders", {
    method: "POST",
    headers: { "PayPal-Request-Id": `marketplace-${referenceId}` },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        reference_id: referenceId,
        amount: { currency_code: currency, value: Number(amount).toFixed(2) },
      }],
      application_context: {
        brand_name: "Digital Products Marketplace",
        user_action: "PAY_NOW",
        return_url: process.env.PAYPAL_RETURN_URL || "http://localhost:3000/checkout/success",
        cancel_url: process.env.PAYPAL_CANCEL_URL || "http://localhost:3000/checkout/cancel",
      },
    }),
  });
}

function capturePayPalOrder(paypalOrderId) {
  return paypalRequest(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
    method: "POST",
    headers: { "PayPal-Request-Id": `marketplace-capture-${paypalOrderId}` },
    body: "{}",
  });
}

async function setupPaymentToken({ cardNumber, cardExpiry, cardCvc, cardName }) {
  if (!cardNumber || !cardExpiry || !cardCvc) {
    const error = new Error("Card number, expiry date, and CVV are required.") as PayPalError;
    error.statusCode = 400;
    throw error;
  }

  const [expiryMonth, expiryYear] = String(cardExpiry).split("/");
  const cleanedExpiryMonth = String(expiryMonth || "").trim();
  const cleanedExpiryYear = String(expiryYear || "").trim();
  const twoDigitYear = cleanedExpiryYear.length === 4 ? cleanedExpiryYear.slice(-2) : cleanedExpiryYear;

  const cardData: any = {
    number: String(cardNumber).replace(/\s/g, ""),
    expire_month: cleanedExpiryMonth,
    expire_year: twoDigitYear,
    cvv: String(cardCvc).trim(),
    name: String(cardName || "Test Buyer").trim() || "Test Buyer",
  };

  return paypalRequest("/v3/vault/setup-tokens", {
    method: "POST",
    body: JSON.stringify({
      payment_source: {
        card: cardData,
      },
    }),
  });
}

module.exports = { createPayPalOrder, capturePayPalOrder, setupPaymentToken };
