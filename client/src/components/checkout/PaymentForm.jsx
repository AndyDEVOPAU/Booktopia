import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

export default function PaymentForm({ orderId }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return; // Stripe.js hasn't finished loading yet

    setSubmitting(true);
    setError("");

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      // if_required: only redirect away from the page when the payment
      // method genuinely needs it (e.g. 3D Secure). Most card payments
      // resolve right here without leaving the app.
      redirect: "if_required",
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation/${orderId}`,
      },
    });

    if (confirmError) {
      // Card declined, validation error, etc. — the customer stays on this
      // page and can retry, matching the "manual fix, no auto-retry" pattern
      // we've used elsewhere at checkout.
      setError(confirmError.message || "Payment failed. Please try again.");
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      navigate(`/order-confirmation/${orderId}`);
      return;
    }

    // Any other status (e.g. "processing") — send them to the confirmation
    // page, which polls the order status rather than assuming success here.
    navigate(`/order-confirmation/${orderId}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement />

      {error && (
        <p className="rounded-md bg-accent/10 px-3 py-2 text-sm text-text">{error}</p>
      )}

      <button
        type="submit"
        disabled={!stripe || submitting}
        className="mt-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-background hover:bg-secondary disabled:opacity-50"
      >
        {submitting ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}
