"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminShell from "@/components/AdminShell";

interface TrackingUpdate {
  status: string;
  message: string;
  timestamp: string;
}

interface OrderData {
  _id: string;
  orderNumber: string;
  name: string;
  email: string;
  phone?: string;
  items: Array<{
    title: string;
    type: string;
    printSize?: string;
    frameOption?: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  currency: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  trackingNumber?: string;
  trackingCarrier?: string;
  trackingUpdates: TrackingUpdate[];
  adminNotes?: string;
  shippingAddress?: {
    address: string;
    city: string;
    country: string;
    zip: string;
  };
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

const STATUSES = [
  "processing",
  "confirmed",
  "printing",
  "shipped",
  "delivered",
];
const CARRIERS = [
  "India Post",
  "DTDC",
  "Delhivery",
  "BlueDart",
  "FedEx",
  "DHL",
  "Other",
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  // Form state
  const [fulfillmentStatus, setFulfillmentStatus] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingCarrier, setTrackingCarrier] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  // Custom update
  const [customMessage, setCustomMessage] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data._id) {
          setOrder(data);
          setFulfillmentStatus(data.fulfillmentStatus || "processing");
          setTrackingNumber(data.trackingNumber || "");
          setTrackingCarrier(data.trackingCarrier || "");
          setAdminNotes(data.adminNotes || "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");

    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fulfillmentStatus,
          statusMessage: statusMessage || undefined,
          trackingNumber,
          trackingCarrier,
          adminNotes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrder(data);
        setStatusMessage("");
        setSuccess("Order updated successfully");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleAddCustomUpdate = async () => {
    if (!customMessage.trim()) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customUpdate: {
            message: customMessage.trim(),
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrder(data);
        setCustomMessage("");
        setSuccess("Update added");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const statusColors: Record<string, string> = {
    processing: "#facc15",
    confirmed: "#60a5fa",
    printing: "#c084fc",
    shipped: "#4ade80",
    delivered: "#22d3ee",
  };

  if (loading) {
    return (
      <AdminShell>
        <div className="text-center py-20 text-[#e8e0d0]/30">
          Loading order...
        </div>
      </AdminShell>
    );
  }

  if (!order) {
    return (
      <AdminShell>
        <div className="text-center py-20">
          <p className="text-[#e8e0d0]/40 mb-4">Order not found</p>
          <button
            onClick={() => router.push("/orders")}
            className="text-[#c9a96e] text-sm hover:underline"
          >
            ← Back to Orders
          </button>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/orders"
            className="text-[#c9a96e]/60 text-xs hover:text-[#c9a96e] transition-colors mb-2 inline-block"
          >
            ← Back to Orders
          </Link>
          <h1
            className="text-2xl font-light tracking-wide"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Order {order.orderNumber}
          </h1>
          <p className="text-[#e8e0d0]/40 text-sm mt-1">
            Placed{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor:
                statusColors[order.fulfillmentStatus] || "#666",
            }}
          />
          <span className="text-sm capitalize text-[#e8e0d0]/70">
            {order.fulfillmentStatus || "processing"}
          </span>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-3 bg-[#4ade80]/10 border border-[#4ade80]/30 text-[#4ade80] text-sm">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Payment */}
          <div className="border border-[#c9a96e]/15 bg-[#0d0d0d] p-6">
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 mb-4">
              Customer Details
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#e8e0d0]/40 text-xs mb-1">Name</p>
                <p className="text-[#e8e0d0]">{order.name}</p>
              </div>
              <div>
                <p className="text-[#e8e0d0]/40 text-xs mb-1">Email</p>
                <p className="text-[#e8e0d0]">{order.email}</p>
              </div>
              {order.phone && (
                <div>
                  <p className="text-[#e8e0d0]/40 text-xs mb-1">Phone</p>
                  <p className="text-[#e8e0d0]">{order.phone}</p>
                </div>
              )}
              <div>
                <p className="text-[#e8e0d0]/40 text-xs mb-1">Payment Status</p>
                <p
                  className={
                    order.paymentStatus === "paid"
                      ? "text-[#4ade80]"
                      : "text-[#facc15]"
                  }
                >
                  {order.paymentStatus.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-[#e8e0d0]/40 text-xs mb-1">Payment ID</p>
                <p className="text-[#e8e0d0]/60 font-mono text-xs">
                  {order.razorpayPaymentId || "—"}
                </p>
              </div>
            </div>

            {order.shippingAddress && (
              <div className="mt-4 pt-4 border-t border-[#c9a96e]/10">
                <p className="text-[#e8e0d0]/40 text-xs mb-1">
                  Shipping Address
                </p>
                <p className="text-[#e8e0d0] text-sm">
                  {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
                  {order.shippingAddress.zip}, {order.shippingAddress.country}
                </p>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="border border-[#c9a96e]/15 bg-[#0d0d0d] p-6">
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 mb-4">
              Items
            </h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-[#c9a96e]/8 last:border-0"
                >
                  <div>
                    <p className="text-sm text-[#e8e0d0]">{item.title}</p>
                    <p className="text-xs text-[#e8e0d0]/40 capitalize">
                      {item.type}
                      {item.printSize && ` — ${item.printSize}`}
                      {item.frameOption && ` — ${item.frameOption}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-[#e8e0d0]">
                      ₹{(item.price / 100).toFixed(0)}
                    </p>
                    <p className="text-xs text-[#e8e0d0]/40">×{item.quantity}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-[#e8e0d0]/60">Total</p>
                <p className="text-lg font-mono text-[#c9a96e]">
                  ₹{(order.total / 100).toFixed(0)}
                </p>
              </div>
            </div>
          </div>

          {/* Tracking Timeline */}
          <div className="border border-[#c9a96e]/15 bg-[#0d0d0d] p-6">
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 mb-4">
              Tracking Timeline
            </h2>

            {order.trackingUpdates.length === 0 ? (
              <p className="text-[#e8e0d0]/30 text-sm">
                No tracking updates yet. Update the status to add the first one.
              </p>
            ) : (
              <div className="space-y-0">
                {[...order.trackingUpdates]
                  .sort(
                    (a, b) =>
                      new Date(b.timestamp).getTime() -
                      new Date(a.timestamp).getTime()
                  )
                  .map((update, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                            i === 0 ? "bg-[#c9a96e]" : "bg-[#c9a96e]/20"
                          }`}
                        />
                        {i < order!.trackingUpdates.length - 1 && (
                          <div className="w-px h-full min-h-[32px] bg-[#c9a96e]/15" />
                        )}
                      </div>
                      <div className="pb-5">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] uppercase tracking-wider px-1.5 py-0.5"
                            style={{
                              backgroundColor: `${statusColors[update.status] || "#666"}20`,
                              color: statusColors[update.status] || "#666",
                            }}
                          >
                            {update.status}
                          </span>
                        </div>
                        <p className="text-sm text-[#e8e0d0]/70 mt-1">
                          {update.message}
                        </p>
                        <p className="text-[10px] font-mono text-[#e8e0d0]/30 mt-0.5">
                          {new Date(update.timestamp).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}{" "}
                          at{" "}
                          {new Date(update.timestamp).toLocaleTimeString(
                            "en-IN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Add custom update */}
            <div className="mt-4 pt-4 border-t border-[#c9a96e]/10">
              <p className="text-[#e8e0d0]/40 text-xs mb-2">
                Add Custom Update
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="e.g. Package handed over to courier"
                  className="flex-1 bg-[#1a1a1a] border border-[#c9a96e]/15 text-[#e8e0d0] px-3 py-2 text-sm placeholder:text-[#e8e0d0]/20 focus:border-[#c9a96e] focus:outline-none"
                />
                <button
                  onClick={handleAddCustomUpdate}
                  disabled={saving || !customMessage.trim()}
                  className="px-4 py-2 bg-[#c9a96e]/20 text-[#c9a96e] text-xs tracking-wider uppercase hover:bg-[#c9a96e]/30 transition-colors disabled:opacity-30"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Update Panel */}
        <div className="space-y-6">
          {/* Fulfillment Status */}
          <div className="border border-[#c9a96e]/15 bg-[#0d0d0d] p-6">
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 mb-4">
              Update Status
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-[#e8e0d0]/50 text-xs block mb-2">
                  Fulfillment Status
                </label>
                <select
                  value={fulfillmentStatus}
                  onChange={(e) => setFulfillmentStatus(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#c9a96e]/15 text-[#e8e0d0] px-3 py-2.5 text-sm focus:border-[#c9a96e] focus:outline-none appearance-none"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#e8e0d0]/50 text-xs block mb-2">
                  Status Message (optional)
                </label>
                <input
                  type="text"
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  placeholder="Custom message for this status change"
                  className="w-full bg-[#1a1a1a] border border-[#c9a96e]/15 text-[#e8e0d0] px-3 py-2 text-sm placeholder:text-[#e8e0d0]/20 focus:border-[#c9a96e] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Tracking Info */}
          <div className="border border-[#c9a96e]/15 bg-[#0d0d0d] p-6">
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 mb-4">
              Shipping & Tracking
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-[#e8e0d0]/50 text-xs block mb-2">
                  Carrier
                </label>
                <select
                  value={trackingCarrier}
                  onChange={(e) => setTrackingCarrier(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#c9a96e]/15 text-[#e8e0d0] px-3 py-2.5 text-sm focus:border-[#c9a96e] focus:outline-none appearance-none"
                >
                  <option value="">Select carrier</option>
                  {CARRIERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#e8e0d0]/50 text-xs block mb-2">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. DTDC123456789"
                  className="w-full bg-[#1a1a1a] border border-[#c9a96e]/15 text-[#e8e0d0] px-3 py-2 text-sm font-mono placeholder:text-[#e8e0d0]/20 focus:border-[#c9a96e] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="border border-[#c9a96e]/15 bg-[#0d0d0d] p-6">
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 mb-4">
              Admin Notes
            </h2>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal notes (not visible to customer)"
              rows={4}
              className="w-full bg-[#1a1a1a] border border-[#c9a96e]/15 text-[#e8e0d0] px-3 py-2 text-sm placeholder:text-[#e8e0d0]/20 focus:border-[#c9a96e] focus:outline-none resize-none"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 bg-[#c9a96e] text-[#0a0a0a] text-sm tracking-[0.15em] uppercase hover:bg-[#d4b87a] transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </AdminShell>
  );
}
