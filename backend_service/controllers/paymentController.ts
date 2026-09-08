const { QueryTypes } = require("sequelize");
const { sequelize } = require("../models");
const { findByToken } = require("./authHelpers");
const { createPayPalOrder, capturePayPalOrder } = require("../services/paypalService");

async function getAuthenticatedUser(req) {
  const authorization = String(req.headers.authorization || "");
  if (!authorization.startsWith("Bearer ")) return null;
  return findByToken(authorization.slice(7));
}

async function requireUser(req, res) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: "Authentication required." });
      return null;
    }
    return user;
  } catch {
    res.status(401).json({ error: "Invalid or expired authentication token." });
    return null;
  }
}

async function createPaymentOrder(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;
  const orderId = Number(req.body.orderId);
  if (!Number.isSafeInteger(orderId) || orderId <= 0) return res.status(400).json({ error: "A valid orderId is required." });

  try {
    const [order] = await sequelize.query(
      `SELECT "OrderId", "OrderNumber", "TotalAmount", "Currency", "Status"
       FROM "Orders" WHERE "OrderId" = :orderId AND "UserId" = :userId`,
      { replacements: { orderId, userId: user.UserId }, type: QueryTypes.SELECT },
    );
    if (!order) return res.status(404).json({ error: "Order not found." });
    if (!["pending", "failed"].includes(order.Status)) return res.status(409).json({ error: "This order is not available for payment." });

    const [existingPayment] = await sequelize.query(
      `SELECT "TransactionId", "Status", "ProviderResponse"
       FROM "Payments" WHERE "OrderId" = :orderId AND "PaymentMethod" = 'paypal'
       ORDER BY "CreatedAt" DESC LIMIT 1`,
      { replacements: { orderId }, type: QueryTypes.SELECT },
    );
    if (existingPayment?.Status === "paid") return res.status(409).json({ error: "This order has already been paid." });
    if (existingPayment?.TransactionId && existingPayment.Status === "pending") {
      return res.status(200).json({ paypalOrderId: existingPayment.TransactionId, approvalUrl: existingPayment.ProviderResponse?.links?.find((link) => link.rel === "approve")?.href || null });
    }

    const paypalOrder = await createPayPalOrder({ amount: order.TotalAmount, currency: order.Currency, referenceId: order.OrderNumber });
    await sequelize.query(
      `INSERT INTO "Payments" ("OrderId", "PaymentMethod", "TransactionId", "Amount", "Currency", "Status", "ProviderResponse")
       VALUES (:orderId, 'paypal', :transactionId, :amount, :currency, 'pending', CAST(:providerResponse AS jsonb))`,
      { replacements: { orderId, transactionId: paypalOrder.id, amount: order.TotalAmount, currency: order.Currency, providerResponse: JSON.stringify(paypalOrder) } },
    );

    return res.status(201).json({ paypalOrderId: paypalOrder.id, approvalUrl: paypalOrder.links?.find((link) => link.rel === "approve")?.href || null });
  } catch (error) {
    console.error("PayPal order creation failed", error);
    return res.status(error.statusCode && error.statusCode < 500 ? error.statusCode : 500).json({ error: error.statusCode === 503 ? error.message : "Unable to create PayPal order." });
  }
}

async function capturePaymentOrder(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;
  const paypalOrderId = String(req.body.paypalOrderId || "").trim();
  if (!paypalOrderId) return res.status(400).json({ error: "paypalOrderId is required." });

  try {
    const [payment] = await sequelize.query(
      `SELECT p."PaymentId", p."OrderId", p."Status"
       FROM "Payments" p JOIN "Orders" o ON o."OrderId" = p."OrderId"
       WHERE p."TransactionId" = :paypalOrderId AND o."UserId" = :userId`,
      { replacements: { paypalOrderId, userId: user.UserId }, type: QueryTypes.SELECT },
    );
    if (!payment) return res.status(404).json({ error: "PayPal payment not found." });
    if (payment.Status === "paid") return res.json({ status: "COMPLETED" });

    const capture = await capturePayPalOrder(paypalOrderId);
    const captureStatus = capture.status === "COMPLETED" ? "paid" : "failed";
    const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id || paypalOrderId;
    await sequelize.transaction(async (transaction) => {
      await sequelize.query(
        `UPDATE "Payments" SET "Status" = :status, "PaidAt" = CASE WHEN :status = 'paid' THEN CURRENT_TIMESTAMP ELSE "PaidAt" END, "ProviderResponse" = CAST(:providerResponse AS jsonb) WHERE "PaymentId" = :paymentId`,
        { replacements: { status: captureStatus, providerResponse: JSON.stringify({ ...capture, captureId }), paymentId: payment.PaymentId }, transaction },
      );
      if (captureStatus === "paid") {
        await sequelize.query(`UPDATE "Orders" SET "Status" = 'paid' WHERE "OrderId" = :orderId AND "Status" IN ('pending', 'processing')`, { replacements: { orderId: payment.OrderId }, transaction });
      }
    });

    return res.json({ status: capture.status, captureId });
  } catch (error) {
    console.error("PayPal capture failed", error);
    return res.status(error.statusCode && error.statusCode < 500 ? error.statusCode : 500).json({ error: error.statusCode === 503 ? error.message : "Unable to capture PayPal payment." });
  }
}

module.exports = { createPaymentOrder, capturePaymentOrder };
