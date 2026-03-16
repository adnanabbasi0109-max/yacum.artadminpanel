"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";

interface PopulatedArtwork {
  _id: string;
  slug: string;
  theme: string;
  arabic: string;
  translation: string;
  previewImageUrl: string;
}

interface Auction {
  _id: string;
  artworkId: PopulatedArtwork | null;
  startingBid: number;
  currentBid: number;
  bidIncrement: number;
  bidHistory: Array<{ userId: string; userName: string; amount: number; time: string }>;
  endTime: string;
  status: "upcoming" | "live" | "ended" | "sold" | "unsold";
  serialNumber: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  live: "#4ade80",
  upcoming: "#facc15",
  ended: "#f87171",
  sold: "#c9a96e",
  unsold: "#666",
};

export default function AuctionsList() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuctions = () => {
    setLoading(true);
    fetch("/api/auctions")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAuctions(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this auction?")) return;
    try {
      await fetch(`/api/auctions/${id}`, { method: "DELETE" });
      fetchAuctions();
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
    return `$${(cents / 100).toFixed(0)}`;
  };

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1
            className="text-3xl font-light tracking-wide"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Auctions
          </h1>
          <p className="text-[#e8e0d0]/40 text-sm mt-1">
            {auctions.length} auction{auctions.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/auctions/new"
          className="px-6 py-3 bg-[#c9a96e] text-[#0a0a0a] text-sm tracking-[0.15em] uppercase hover:bg-[#d4b87a] transition-colors"
        >
          + New Auction
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#e8e0d0]/30">
          Loading auctions...
        </div>
      ) : auctions.length === 0 ? (
        <div className="text-center py-20 border border-[#c9a96e]/15 bg-[#0d0d0d]">
          <p className="text-[#e8e0d0]/40 mb-4">No auctions yet</p>
          <Link
            href="/auctions/new"
            className="text-[#c9a96e] hover:underline"
          >
            Create your first auction →
          </Link>
        </div>
      ) : (
        <div className="border border-[#c9a96e]/15 bg-[#0d0d0d] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#c9a96e]/15">
                <th className="text-left p-4 text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40">
                  Artwork
                </th>
                <th className="text-left p-4 text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40">
                  Status
                </th>
                <th className="text-left p-4 text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40">
                  Current Bid
                </th>
                <th className="text-left p-4 text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40">
                  Bids
                </th>
                <th className="text-left p-4 text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40">
                  End Time
                </th>
                <th className="text-right p-4 text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {auctions.map((auction) => (
                <tr
                  key={auction._id}
                  className="border-b border-[#c9a96e]/8 hover:bg-[#c9a96e]/5 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#1a1a1a] overflow-hidden flex-shrink-0">
                        {auction.artworkId?.previewImageUrl && (
                          <img
                            src={auction.artworkId.previewImageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-[#e8e0d0] truncate max-w-[200px]">
                          {auction.artworkId?.translation?.slice(0, 50) || "Unknown artwork"}...
                        </p>
                        <p className="text-xs text-[#e8e0d0]/30 mt-0.5">
                          SN: {auction.serialNumber}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: statusColors[auction.status] || "#666",
                        }}
                      />
                      <span className="text-xs capitalize text-[#e8e0d0]/50">
                        {auction.status}
                      </span>
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm" style={{ color: "#c9a96e" }}>
                      {auction.currentBid > 0
                        ? formatCurrency(auction.currentBid)
                        : formatCurrency(auction.startingBid) + " (start)"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-[#e8e0d0]/60">
                      {auction.bidHistory.length}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-[#e8e0d0]/50">
                      {formatDate(auction.endTime)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/auctions/${auction._id}`}
                        className="text-xs text-[#c9a96e]/60 hover:text-[#c9a96e] transition-colors"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(auction._id)}
                        className="text-xs text-[#f87171]/60 hover:text-[#f87171] transition-colors"
                      >
                        Delete
                      </button>
                    </div>
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
