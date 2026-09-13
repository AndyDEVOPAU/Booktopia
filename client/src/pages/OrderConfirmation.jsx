import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/useCart";
import api from "../api/axios";

// The Stripe webhook that finalizes the order (marks it "paid", decrements
// stock) runs asynchronously — it may not have landed yet by the time the
// customer is redirected here, even though their payment succeeded. So
// this polls briefly rather than assuming the order is already "paid".
const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 5;

export default function OrderConfirmation() {
  const { id } = useParams();
  const { refreshCart } = useCart();

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'error'
  const [pollCount, setPollCount] = useState(0);

  const fetchOrder = useCallback(async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
      setStatus("success");
      return data;
    } catch (err) {
      console.error("Failed to load order:", err);
      setStatus("error");
      return null;
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Keep polling while still "pending", up to MAX_POLLS times.
  useEffect(() => {
    if (status !== "success" || order?.status !== "pending" || pollCount >= MAX_POLLS) {
      return;
    }
    const timer = setTimeout(async () => {
      await fetchOrder();
      setPollCount((c) => c + 1);
    }, POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [status, order, pollCount, fetchOrder]);

  // Once the order is actually paid, the backend has cleared the cart —
  // sync that locally so the navbar badge/cart page reflect it.
  useEffect(() => {
    if (order?.status === "paid") {
      refreshCart();
    }
  }, [order?.status, refreshCart]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-text/60">
        Loading your order...
      </div>
    );
  }

  if (status === "error" || !order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-background px-4 text-center text-text">
        <p className="text-lg font-medium">We couldn't find that order.</p>
        <Link to="/books" className="text-primary hover:underline">
          Back to catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-background px-4 text-center text-text">
      {order.status === "paid" && (
        <>
          <p className="text-2xl font-semibold">Thank you — your order is confirmed!</p>
          <p className="text-sm text-text/70">Order #{order._id}</p>
          {order.stockIssues?.length > 0 && (
            <p className="max-w-md rounded-md bg-accent/10 px-3 py-2 text-sm text-text">
              Heads up: one or more items sold out right as your order went through. We'll
              follow up separately about those — everything else is confirmed.
            </p>
          )}
        </>
      )}

      {order.status === "pending" && (
        <>
          <p className="text-lg font-medium">Confirming your payment...</p>
          <p className="text-sm text-text/70">This usually takes just a few seconds.</p>
        </>
      )}

      {order.status === "failed" && (
        <>
          <p className="text-lg font-medium">Your payment didn't go through.</p>
          <p className="text-sm text-text/70">No charge was made. You can try again from your cart.</p>
          <Link
            to="/cart"
            className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-background hover:bg-secondary"
          >
            Back to Cart
          </Link>
        </>
      )}

      {order.status === "paid" && (
        <Link to="/books" className="mt-2 text-primary hover:underline">
          Continue shopping
        </Link>
      )}
    </div>
  );
}
