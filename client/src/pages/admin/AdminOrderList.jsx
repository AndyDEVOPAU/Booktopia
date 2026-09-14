import React, { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";

const FULFILLMENT_OPTIONS = ["processing", "shipped", "delivered"];

const STATUS_BADGE = {
  paid: "bg-primary/20 text-primary",
  failed: "bg-accent/20 text-text",
  pending: "bg-text/10 text-text/60",
};

export default function AdminOrderList() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading");
  const [updatingId, setUpdatingId] = useState(null);
  const [rowError, setRowError] = useState({});

  const fetchOrders = useCallback(async () => {
    setStatus("loading");
    try {
      const { data } = await api.get("/orders/admin");
      setOrders(data);
      setStatus("success");
    } catch (err) {
      console.error("Failed to load orders:", err);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, fulfillmentStatus) => {
    setUpdatingId(orderId);
    setRowError((prev) => ({ ...prev, [orderId]: "" }));
    try {
      const { data } = await api.patch(`/orders/admin/${orderId}/status`, {
        fulfillmentStatus,
      });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data : o)));
    } catch (err) {
      console.error("Failed to update order status:", err);
      setRowError((prev) => ({
        ...prev,
        [orderId]: err.response?.data?.message || "Couldn't update status.",
      }));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-text sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 border-b border-text/10 pb-6">
          <p className="text-[11px] uppercase tracking-[0.15em] text-text/50">Admin</p>
          <h1 className="mt-1 text-2xl font-semibold text-text sm:text-3xl">Orders</h1>
        </div>

        {status === "loading" && <p className="text-sm text-text/60">Loading...</p>}

        {status === "error" && (
          <p className="text-sm text-text/60">
            Couldn't load orders.{" "}
            <button type="button" onClick={fetchOrders} className="underline">
              Retry
            </button>
          </p>
        )}

        {status === "success" && orders.length === 0 && (
          <p className="text-sm text-text/60">No orders yet.</p>
        )}

        {status === "success" && orders.length > 0 && (
          <div className="overflow-x-auto rounded-md border border-text/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-primary/5 text-text/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Subtotal</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Fulfillment</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-t border-text/10 align-top">
                    <td className="px-4 py-3 font-mono text-xs">
                      {order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{order.user?.name || "—"}</div>
                      <div className="text-xs text-text/50">{order.user?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-text/70">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-text/70">{order.items.length}</td>
                    <td className="px-4 py-3 font-mono">${order.subtotal.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          STATUS_BADGE[order.status]
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {order.status === "paid" ? (
                        <div className="flex flex-col gap-1">
                          <select
                            value={order.fulfillmentStatus}
                            disabled={updatingId === order._id}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className="rounded-md border border-text/15 bg-background px-2 py-1 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                          >
                            {FULFILLMENT_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                          {rowError[order._id] && (
                            <span className="text-xs text-accent">{rowError[order._id]}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-text/40">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
