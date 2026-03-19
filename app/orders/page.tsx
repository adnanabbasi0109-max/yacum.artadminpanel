"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";

interface OrderItem {
  title: string;
  type: string;
  quantity: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  name: string;
  email: string;
  items: OrderItem[];
  total: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  trackingNumber?: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all"
      ? orders
      : orders.filter((o) => (o.fulfillmentStatus || "processing") === filter);

  const statusColors: Record<string, string> = {
    processing: "#facc15",
    confirmed: "#60a5fa",
    printing: "#c084fc",
    shipped: "#4ade80",
    delivered: "#22d3ee",
  };

  const paymentColors: Record<string, string> = {
    paid: "#4ade80",
    pending: "#facc15",
    failed: "#f87171",
  };

  const counts = {
    all: orders.length,
    processing: orders.filter((o) => (o.fulfillmentStatus || "processing") === "processing").length,
    confirmed: orders.filter((o) => o.fulfillmentStatus === "confirmed").length,
    printing: orders.filter((o) => o.fulfillmentStatus === "printing").length,
    shipped: orders.filter((o) => o.fulfillmentStatus === "shipped").length,
    delivered: orders.filter((o) => o.fulfillmentStatus === "delivered").length,
  };

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1
            className="text-3xl font-light tracking-wide"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Orders
          </h1>
          <p className="text-[#e8e0d0]/40 text-sm mt-1">
            {orders.length} order{orders.length !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(
          [
            "all",
            "processing",
            "confirmed",
            "printing",
            "shipped",
            "delivered",
          ] as const
        ).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 text-xs tracking-[0.15em] uppercase border transition-colors ${
              filter === s
                ? "border-[#c9a96e] text-[#c9a96e] bg-[#c9a96e]/10"
                : "border-[#c9a96e]/15 text-[#e8e0d0]/50 hover:border-[#c9a96e]/30"
            }`}
          >
            {s} ({counts[s]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#e8e0d0]/30">
          Loading orders...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border border-[#c9a96e]/15 bg-[#0d0d0d]">
          <p className="text-[#e8e0d0]/40">
            {filter === "all" ? "No orders yet" : `No ${filter} orders`}
          </p>
        </div>
      ) : (
        <div className="border border-[#c9a96e]/15 bg-[#0d0d0d] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#c9a96e]/15">
                <th className="text-left p-4 text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40">
                  Order
                </th>
                <th className="text-left p-4 text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40">
                  Customer
                </th>
                <th className="text-left p-4 text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40">
                  Items
                </th>
                <th className="text-left p-4 text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40">
                  Total
                </th>
                <th className="text-left p-4 text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40">
                  Payment
                </th>
                <th className="text-left p-4 text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40">
                  Status
                </th>
                <th className="text-left p-4 text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40">
                  Date
                </th>
                <th className="text-right p-4 text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr
                  key={order._id}
                  className="border-b border-[#c9a96e]/8 hover:bg-[#c9a96e]/5 transition-colors"
                >
                  <td className="p-4">
                    <span className="text-xs font-mono text-[#c9a96e]">
                      {order.orderNumber}
                    </span>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-sm text-[#e8e0d0]">{order.name}</p>
                      <p className="text-xs text-[#e8e0d0]/30">{order.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-[#e8e0d0]/60">
                      {order.items.reduce((sum, i) => sum + i.quantity, 0)} item
                      {order.items.reduce((sum, i) => sum + i.quantity, 0) !== 1
                        ? "s"
                        : ""}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-mono">
                      ₹{(order.total / 100).toFixed(0)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className="text-[10px] tracking-wider uppercase px-2 py-1"
                      style={{
                        backgroundColor: `${paymentColors[order.paymentStatus] || "#666"}20`,
                        color: paymentColors[order.paymentStatus] || "#666",
                      }}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            statusColors[order.fulfillmentStatus || "processing"] ||
                            "#666",
                        }}
                      />
                      <span className="text-xs capitalize text-[#e8e0d0]/50">
                        {order.fulfillmentStatus || "processing"}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-[#e8e0d0]/40">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/orders/${order._id}`}
                      className="text-xs text-[#c9a96e]/60 hover:text-[#c9a96e] transition-colors"
                    >
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
