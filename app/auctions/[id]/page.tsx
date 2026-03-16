"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import Link from "next/link";

interface PopulatedArtwork {
  _id: string;
  slug: string;
  theme: string;
  arabic: string;
  translation: string;
  previewImageUrl: string;
  verseId: string;
}

interface BidEntry {
  userId: string;
  userName: string;
  amount: number;
  time: string;
}

interface Auction {
  _id: string;
  artworkId: PopulatedArtwork | null;
  startingBid: number;
  currentBid: number;
  bidIncrement: number;
  bidHistory: BidEntry[];
  endTime: string;
  status: "upcoming" | "live" | "ended" | "sold" | "unsold";
  winner?: { userId: string; finalBid: number; paidAt?: string };
  serialNumber: string;
  certificateS3Url?: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  live: "#4ade80",
  upcoming: "#facc15",
  ended: "#f87171",
  sold: "#c9a96e",
  unsold: "#666",
};

const allStatuses = ["upcoming", "live", "ended", "sold", "unsold"] as const;

export default function AuctionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);

  const [editForm, setEditForm] = useState({
    startingBid: "",
    bidIncrement: "",
    endTime: "",
    serialNumber: "",
  });

  const fetchAuction = () => {
    setLoading(true);
    fetch(`/api/auctions/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setAuction(data);
          setEditForm({
            startingBid: (data.startingBid / 100).toString(),
            bidIncrement: (data.bidIncrement / 100).toString(),
            endTime: new Date(data.endTime).toISOString().slice(0, 16),
            serialNumber: data.serialNumber,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAuction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/auctions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchAuction();
        setEditingStatus(false);
      }
    } catch {
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const saveDetails = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/auctions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startingBid: Math.round(parseFloat(editForm.startingBid) * 100),
          bidIncrement: Math.round(parseFloat(editForm.bidIncrement) * 100),
          endTime: editForm.endTime,
          serialNumber: editForm.serialNumber,
        }),
      });
      if (res.ok) {
        fetchAuction();
        setEditingDetails(false);
      }
    } catch {
      alert("Failed to update auction");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this auction?")) return;
    try {
      await fetch(`/api/auctions/${id}`, { method: "DELETE" });
      router.push("/auctions");
    } catch {
      alert("Failed to delete auction");
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const inputClass =
    "w-full bg-[#0a0a0a] border border-[#c9a96e]/20 px-4 py-3 text-sm text-[#e8e0d0] focus:border-[#c9a96e]/60 focus:outline-none transition-colors";
  const labelClass =
    "block text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 mb-2";

  if (loading) {
    return (
      <AdminShell>
        <div className="text-center py-20 text-[#e8e0d0]/30">
          Loading auction...
        </div>
      </AdminShell>
    );
  }

  if (!auction) {
    return (
      <AdminShell>
        <div className="text-center py-20 border border-[#c9a96e]/15 bg-[#0d0d0d]">
          <p className="text-[#e8e0d0]/40 mb-4">Auction not found</p>
          <Link href="/auctions" className="text-[#c9a96e] hover:underline">
            ← Back to Auctions
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1
            className="text-3xl font-light tracking-wide"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Auction Detail
          </h1>
          <p className="text-[#e8e0d0]/40 text-sm mt-1">
            SN: {auction.serialNumber}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-xs text-[#f87171]/60 hover:text-[#f87171] border border-[#f87171]/20 hover:border-[#f87171]/40 transition-colors"
          >
            Delete Auction
          </button>
          <Link
            href="/auctions"
            className="text-sm text-[#e8e0d0]/40 hover:text-[#c9a96e] transition-colors"
          >
            ← Back
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Artwork Preview */}
        <div className="border border-[#c9a96e]/15 bg-[#0d0d0d] p-6">
          <h2
            className="text-lg font-light tracking-wide mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Artwork
          </h2>
          {auction.artworkId ? (
            <>
              <div className="aspect-square bg-[#1a1a1a] mb-4 overflow-hidden">
                {auction.artworkId.previewImageUrl && (
                  <img
                    src={auction.artworkId.previewImageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <p className="text-sm text-[#e8e0d0]/70 mb-1">
                {auction.artworkId.translation?.slice(0, 80)}...
              </p>
              <p className="text-xs text-[#c9a96e]/50 uppercase tracking-wider">
                {auction.artworkId.theme} &middot; {auction.artworkId.verseId}
              </p>
            </>
          ) : (
            <p className="text-[#e8e0d0]/30 text-sm">Artwork not found</p>
          )}
        </div>

        {/* Status & Key Info */}
        <div className="border border-[#c9a96e]/15 bg-[#0d0d0d] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-light tracking-wide"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Status
            </h2>
            <button
              onClick={() => setEditingStatus(!editingStatus)}
              className="text-xs text-[#c9a96e]/60 hover:text-[#c9a96e] transition-colors"
            >
              {editingStatus ? "Cancel" : "Change"}
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: statusColors[auction.status] || "#666",
              }}
            />
            <span
              className="text-xl capitalize font-light"
              style={{
                color: statusColors[auction.status] || "#666",
                fontFamily: "var(--font-heading)",
              }}
            >
              {auction.status}
            </span>
          </div>

          {editingStatus && (
            <div className="grid grid-cols-2 gap-2 mb-6">
              {allStatuses.map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  disabled={updating || s === auction.status}
                  className={`px-3 py-2 text-xs capitalize border transition-all ${
                    s === auction.status
                      ? "border-[#c9a96e]/40 bg-[#c9a96e]/10 text-[#c9a96e]"
                      : "border-[#c9a96e]/15 hover:border-[#c9a96e]/40 text-[#e8e0d0]/50 hover:text-[#e8e0d0]"
                  } disabled:opacity-40`}
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
                    style={{ backgroundColor: statusColors[s] || "#666" }}
                  />
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 mb-1">
                Current Bid
              </p>
              <p
                className="text-2xl font-light"
                style={{ color: "#c9a96e", fontFamily: "var(--font-heading)" }}
              >
                {auction.currentBid > 0
                  ? formatCurrency(auction.currentBid)
                  : "No bids yet"}
              </p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 mb-1">
                Starting Bid
              </p>
              <p className="text-sm text-[#e8e0d0]/70">
                {formatCurrency(auction.startingBid)}
              </p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 mb-1">
                Bid Increment
              </p>
              <p className="text-sm text-[#e8e0d0]/70">
                {formatCurrency(auction.bidIncrement)}
              </p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 mb-1">
                End Time
              </p>
              <p className="text-sm text-[#e8e0d0]/70">
                {formatDate(auction.endTime)}
              </p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 mb-1">
                Total Bids
              </p>
              <p className="text-sm text-[#e8e0d0]/70">
                {auction.bidHistory.length}
              </p>
            </div>
          </div>

          {auction.winner && (
            <div className="mt-6 p-4 border border-[#c9a96e]/30 bg-[#c9a96e]/5">
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#c9a96e] mb-2">
                Winner
              </p>
              <p className="text-sm text-[#e8e0d0]/70">
                ID: {auction.winner.userId}
              </p>
              <p className="text-sm text-[#c9a96e]">
                Final Bid: {formatCurrency(auction.winner.finalBid)}
              </p>
              {auction.winner.paidAt && (
                <p className="text-xs text-[#4ade80] mt-1">
                  Paid: {formatDate(auction.winner.paidAt)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Edit Details */}
        <div className="border border-[#c9a96e]/15 bg-[#0d0d0d] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-light tracking-wide"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Edit Details
            </h2>
            {editingDetails && (
              <button
                onClick={() => setEditingDetails(false)}
                className="text-xs text-[#e8e0d0]/40 hover:text-[#e8e0d0] transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          {!editingDetails ? (
            <button
              onClick={() => setEditingDetails(true)}
              className="w-full py-3 border border-[#c9a96e]/20 text-sm text-[#c9a96e]/60 hover:text-[#c9a96e] hover:border-[#c9a96e]/40 transition-colors"
            >
              Edit Auction Settings
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Starting Bid ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.startingBid}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      startingBid: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Bid Increment ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.bidIncrement}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      bidIncrement: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>End Time</label>
                <input
                  type="datetime-local"
                  value={editForm.endTime}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      endTime: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Serial Number</label>
                <input
                  type="text"
                  value={editForm.serialNumber}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      serialNumber: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>
              <button
                onClick={saveDetails}
                disabled={updating}
                className="w-full py-3 bg-[#c9a96e] text-[#0a0a0a] text-sm tracking-[0.15em] uppercase hover:bg-[#d4b87a] transition-colors disabled:opacity-40"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-[#c9a96e]/10">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 mb-1">
              Created
            </p>
            <p className="text-xs text-[#e8e0d0]/50">
              {formatDate(auction.createdAt)}
            </p>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 mb-1 mt-3">
              Last Updated
            </p>
            <p className="text-xs text-[#e8e0d0]/50">
              {formatDate(auction.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Bid History */}
      <div className="border border-[#c9a96e]/15 bg-[#0d0d0d] p-8">
        <h2
          className="text-lg font-light tracking-wide mb-6"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Bid History
        </h2>

        {auction.bidHistory.length === 0 ? (
          <p className="text-[#e8e0d0]/30 text-sm text-center py-8">
            No bids have been placed yet
          </p>
        ) : (
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#c9a96e]/15">
                  <th className="text-left p-3 text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40">
                    #
                  </th>
                  <th className="text-left p-3 text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40">
                    Bidder
                  </th>
                  <th className="text-left p-3 text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40">
                    Amount
                  </th>
                  <th className="text-left p-3 text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...auction.bidHistory]
                  .sort(
                    (a, b) =>
                      new Date(b.time).getTime() - new Date(a.time).getTime()
                  )
                  .map((bid, index) => (
                    <tr
                      key={index}
                      className={`border-b border-[#c9a96e]/8 ${
                        index === 0
                          ? "bg-[#c9a96e]/5"
                          : "hover:bg-[#c9a96e]/3"
                      } transition-colors`}
                    >
                      <td className="p-3">
                        <span className="text-xs text-[#e8e0d0]/30">
                          {auction.bidHistory.length - index}
                        </span>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="text-sm text-[#e8e0d0]/70">
                            {bid.userName}
                          </p>
                          <p className="text-[10px] text-[#e8e0d0]/25">
                            {bid.userId}
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className="text-sm font-medium"
                          style={{
                            color: index === 0 ? "#c9a96e" : "#e8e0d0",
                            opacity: index === 0 ? 1 : 0.6,
                          }}
                        >
                          {formatCurrency(bid.amount)}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-xs text-[#e8e0d0]/40">
                          {formatDate(bid.time)}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
