import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    api
      .get("/orders")
      .then(({ data }) => {
        setOrders(data);
        setStatus("success");
      })
      .catch((err) => {
        console.error("Failed to load orders:", err);
        setStatus("error");
      });
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background px-4 py-10 text-text sm:px-8">
        <p className="mx-auto max-w-3xl text-sm text-text/60">Loading your orders...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 bg-background px-4 text-center text-text">
        <p className="font-medium">Your orders didn't load.</p>
        <p className="text-sm text-text/60">Check your connection and refresh.</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-background px-4 text-center text-text">
        <p className="text-lg font-medium">No orders yet.</p>
        <p className="max-w-sm text-sm text-text/70">
          Once you place an order, it'll show up here.
        </p>
        <Link
          to="/books"
          className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-background hover:bg-secondary"
        >
          Browse Books
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-text sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-semibold sm:text-3xl">Your Orders</h1>

        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="flex flex-col gap-2 rounded-md border border-text/10 bg-primary/5 p-4 transition-colors hover:bg-primary/10 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-text">
                  Order #{order._id.slice(-8).toUpperCase()}
                </p>
                <p className="text-xs text-text/50">
                  {new Date(order.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  · {order.items.length} {order.items.length === 1 ? "item" : "items"}
                </p>
              </div>

              <div className="flex items-center gap-3">
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
                <span className="font-mono text-sm font-semibold">
                  ${order.subtotal.toFixed(2)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
