import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

const STATUS_LABEL = {
  pending: "Payment pending",
  paid: "Paid",
  failed: "Payment failed",
};

const FULFILLMENT_LABEL = {
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    setStatus("loading");
    api
      .get(`/orders/${id}`)
      .then(({ data }) => {
        setOrder(data);
        setStatus("success");
      })
      .catch((err) => {
        console.error("Failed to load order:", err);
        setStatus(err.response?.status === 404 ? "not-found" : "error");
      });
  }, [id]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background px-4 py-10 text-text sm:px-8">
        <p className="mx-auto max-w-2xl text-sm text-text/60">Loading order...</p>
      </div>
    );
  }

  if (status === "not-found" || status === "error") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-background px-4 text-center text-text">
        <p className="text-lg font-medium">
          {status === "not-found" ? "We couldn't find that order." : "This order didn't load."}
        </p>
        <Link to="/orders" className="text-primary hover:underline">
          Back to your orders
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-text sm:px-8">
      <div className="mx-auto max-w-2xl">
        <Link to="/orders" className="mb-6 inline-block text-sm text-text/60 hover:text-text">
          ← Back to your orders
        </Link>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-text/10 pb-6">
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-sm text-text/60">
              Placed{" "}
              {new Date(order.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                order.status === "paid"
                  ? "bg-primary/20 text-primary"
                  : order.status === "failed"
                  ? "bg-accent/20 text-text"
                  : "bg-text/10 text-text/60"
              }`}
            >
              {STATUS_LABEL[order.status]}
            </span>
            {order.status === "paid" && (
              <span className="rounded-full bg-secondary/30 px-2.5 py-1 text-xs font-medium text-text">
                {FULFILLMENT_LABEL[order.fulfillmentStatus]}
              </span>
            )}
          </div>
        </div>

        {order.stockIssues?.length > 0 && (
          <p className="mb-6 rounded-md bg-accent/10 px-3 py-2 text-sm text-text">
            One or more items in this order sold out right as it went through — we followed
            up separately about those.
          </p>
        )}

        <div className="flex flex-col gap-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex gap-4 rounded-md border border-text/10 bg-primary/5 p-4">
              <div className="h-20 w-14 shrink-0 overflow-hidden rounded-sm bg-primary/10">
                {item.book?.coverImage ? (
                  <img
                    src={item.book.coverImage}
                    alt={`Cover of ${item.title}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-1 text-center text-[9px] text-text/50">
                    {item.title}
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-center">
                <p className="font-medium text-text">{item.title}</p>
                {item.book?.author && <p className="text-sm text-text/60">{item.book.author}</p>}
                <p className="text-sm text-text/50">
                  {item.quantity} × ${item.price.toFixed(2)}
                </p>
              </div>
              <div className="whitespace-nowrap font-mono text-sm font-medium text-text">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end border-t border-text/10 pt-6">
          <p className="text-lg font-semibold">
            Subtotal: <span className="font-mono">${order.subtotal.toFixed(2)}</span>
          </p>
        </div>

        <div className="mt-8 rounded-md border border-text/10 bg-primary/5 p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text/60">
            Shipping Address
          </h2>
          <p className="text-sm text-text/80">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 && (
              <>
                <br />
                {order.shippingAddress.line2}
              </>
            )}
            <br />
            {order.shippingAddress.city}
            {order.shippingAddress.state && `, ${order.shippingAddress.state}`}{" "}
            {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.country}
          </p>
        </div>
      </div>
    </div>
  );
}
