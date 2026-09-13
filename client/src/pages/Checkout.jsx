import React, { useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "../utils/stripe";
import { useCart } from "../context/useCart";
import ShippingAddressForm from "../components/checkout/ShippingAddressForm";
import PaymentForm from "../components/checkout/PaymentForm";
import api from "../api/axios";

export default function Checkout() {
  const { cart } = useCart();

  const [step, setStep] = useState("address"); // 'address' | 'payment'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState(null);
  const [orderId, setOrderId] = useState(null);

  const handleAddressSubmit = async (shippingAddress) => {
    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post("/orders/create-payment-intent", { shippingAddress });
      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
      setStep("payment");
    } catch (err) {
      console.error("Failed to create payment intent:", err);
      // The backend returns a specific "issues" array when cart items have
      // stock/availability problems (our checkout-time re-validation) —
      // surface that over the generic message when present.
      const issues = err.response?.data?.issues;
      setError(
        issues?.length
          ? issues.join(" ")
          : err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 bg-background px-4 text-center text-text">
        <p className="text-lg font-medium">Your cart is empty.</p>
        <p className="text-sm text-text/70">Add something to your cart before checking out.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-text sm:px-8">
      <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-[1fr_280px]">
        <div>
          <h1 className="mb-6 text-2xl font-semibold sm:text-3xl">Checkout</h1>

          {error && (
            <p className="mb-4 rounded-md bg-accent/10 px-3 py-2 text-sm text-text">{error}</p>
          )}

          {step === "address" && (
            <ShippingAddressForm onSubmit={handleAddressSubmit} submitting={submitting} />
          )}

          {step === "payment" && clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm orderId={orderId} />
            </Elements>
          )}
        </div>

        {/* Order summary — visible through both steps */}
        <aside className="h-fit rounded-md border border-text/10 bg-primary/5 p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text/60">
            Order Summary
          </h2>
          <ul className="flex flex-col gap-2 text-sm">
            {cart.items.map((item) => (
              <li key={item.book?._id} className="flex justify-between gap-2">
                <span className="text-text/80">
                  {item.book?.title} × {item.quantity}
                </span>
                <span className="font-mono">${item.lineTotal.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t border-text/10 pt-3 text-sm font-semibold">
            Subtotal: <span className="font-mono">${cart.subtotal.toFixed(2)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
