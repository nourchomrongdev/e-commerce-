const apiUrl = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ?? "http://localhost:5000/api";

type PayPalOrderResponse = {
  paypalOrderId: string;
  approvalUrl: string | null;
};

export async function createPayPalOrder(orderId: number, token: string): Promise<PayPalOrderResponse> {
  const response = await fetch(`${apiUrl}/payments/paypal/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ orderId }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Unable to start PayPal checkout.");
  return data;
}

export async function startPayPalCheckout(orderId: number) {
  if (typeof window === "undefined") throw new Error("PayPal checkout must start in the browser.");
  const token = window.localStorage.getItem("marketplace-token");
  if (!token) throw new Error("Please sign in before checkout.");

  const order = await createPayPalOrder(orderId, token);
  if (!order.approvalUrl) throw new Error("PayPal did not return an approval URL.");
  window.location.assign(order.approvalUrl);
}

export async function capturePayPalOrder(paypalOrderId: string, token: string) {
  const response = await fetch(`${apiUrl}/payments/paypal/capture`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ paypalOrderId }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Unable to capture PayPal payment.");
  return data;
}
