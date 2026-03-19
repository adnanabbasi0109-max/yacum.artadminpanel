"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";

interface Stats {
  total: number;
  published: number;
  draft: number;
  auction: number;
  orders: number;
}

interface AuctionStats {
  totalAuctions: number;
  liveAuctions: number;
  upcomingAuctions: number;
  endedAuctions: number;
  totalBids: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    published: 0,
    draft: 0,
    auction: 0,
    orders: 0,
  });
  const [auctionStats, setAuctionStats] = useState<AuctionStats>({
    totalAuctions: 0,
    liveAuctions: 0,
    upcomingAuctions: 0,
    endedAuctions: 0,
    totalBids: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/products")
        .then((r) => r.json())
        .catch(() => []),
      fetch("/api/auctions")
        .then((r) => r.json())
        .catch(() => []),
      fetch("/api/orders")
        .then((r) => r.json())
        .catch(() => []),
    ])
      .then(([products, auctions, orders]) => {
        if (Array.isArray(products)) {
          setStats({
            total: products.length,
            published: products.filter(
              (p: { status: string }) => p.status === "published"
            ).length,
            draft: products.filter(
              (p: { status: string }) => p.status === "draft"
            ).length,
            auction: products.filter(
              (p: { isAuctionPiece: boolean }) => p.isAuctionPiece
            ).length,
            orders: Array.isArray(orders) ? orders.length : 0,
          });
        }
        if (Array.isArray(auctions)) {
          setAuctionStats({
            totalAuctions: auctions.length,
            liveAuctions: auctions.filter(
              (a: { status: string }) => a.status === "live"
            ).length,
            upcomingAuctions: auctions.filter(
              (a: { status: string }) => a.status === "upcoming"
            ).length,
            endedAuctions: auctions.filter(
              (a: { status: string }) =>
                a.status === "ended" ||
                a.status === "sold" ||
                a.status === "unsold"
            ).length,
            totalBids: auctions.reduce(
              (sum: number, a: { bidHistory: unknown[] }) =>
                sum + (a.bidHistory?.length || 0),
              0
            ),
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const productCards = [
    { label: "Total Products", value: stats.total, color: "#c9a96e" },
    { label: "Published", value: stats.published, color: "#4ade80" },
    { label: "Drafts", value: stats.draft, color: "#facc15" },
    { label: "Auction Pieces", value: stats.auction, color: "#f87171" },
    { label: "Orders", value: stats.orders, color: "#60a5fa" },
  ];

  const auctionCards = [
    {
      label: "Total Auctions",
      value: auctionStats.totalAuctions,
      color: "#c9a96e",
    },
    {
      label: "Live Now",
      value: auctionStats.liveAuctions,
      color: "#4ade80",
    },
    {
      label: "Upcoming",
      value: auctionStats.upcomingAuctions,
      color: "#facc15",
    },
    {
      label: "Total Bids",
      value: auctionStats.totalBids,
      color: "#c9a96e",
    },
  ];

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1
            className="text-3xl font-light tracking-wide"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Dashboard
          </h1>
          <p className="text-[#e8e0d0]/40 text-sm mt-1">
            Manage your artwork collection
          </p>
        </div>
        <Link
          href="/products/new"
          className="px-6 py-3 bg-[#c9a96e] text-[#0a0a0a] text-sm tracking-[0.15em] uppercase hover:bg-[#d4b87a] transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {/* Product Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {productCards.map((card) => (
          <div
            key={card.label}
            className="border border-[#c9a96e]/15 bg-[#0d0d0d] p-6"
          >
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 mb-3">
              {card.label}
            </p>
            <p
              className="text-4xl font-light"
              style={{ color: card.color, fontFamily: "var(--font-heading)" }}
            >
              {loading ? "—" : card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Auction Stats */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg font-light tracking-wide"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Auction Overview
          </h2>
          <Link
            href="/auctions"
            className="text-xs text-[#c9a96e]/60 hover:text-[#c9a96e] transition-colors"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {auctionCards.map((card) => (
            <div
              key={card.label}
              className="border border-[#c9a96e]/15 bg-[#0d0d0d] p-6"
            >
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 mb-3">
                {card.label}
              </p>
              <p
                className="text-4xl font-light"
                style={{
                  color: card.color,
                  fontFamily: "var(--font-heading)",
                }}
              >
                {loading ? "—" : card.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border border-[#c9a96e]/15 bg-[#0d0d0d] p-8">
        <h2
          className="text-lg font-light tracking-wide mb-6"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <Link
            href="/products/new"
            className="border border-[#c9a96e]/20 p-5 hover:border-[#c9a96e]/50 hover:bg-[#c9a96e]/5 transition-all text-center"
          >
            <span className="text-2xl block mb-2">+</span>
            <span className="text-sm text-[#e8e0d0]/60">Upload New Artwork</span>
          </Link>
          <Link
            href="/products"
            className="border border-[#c9a96e]/20 p-5 hover:border-[#c9a96e]/50 hover:bg-[#c9a96e]/5 transition-all text-center"
          >
            <span className="text-2xl block mb-2">◇</span>
            <span className="text-sm text-[#e8e0d0]/60">View All Products</span>
          </Link>
          <Link
            href="/orders"
            className="border border-[#c9a96e]/20 p-5 hover:border-[#c9a96e]/50 hover:bg-[#c9a96e]/5 transition-all text-center"
          >
            <span className="text-2xl block mb-2">▤</span>
            <span className="text-sm text-[#e8e0d0]/60">Manage Orders</span>
          </Link>
          <Link
            href="/auctions/new"
            className="border border-[#c9a96e]/20 p-5 hover:border-[#c9a96e]/50 hover:bg-[#c9a96e]/5 transition-all text-center"
          >
            <span className="text-2xl block mb-2">⬡</span>
            <span className="text-sm text-[#e8e0d0]/60">Create Auction</span>
          </Link>
          <a
            href={process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://yacum.art"}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[#c9a96e]/20 p-5 hover:border-[#c9a96e]/50 hover:bg-[#c9a96e]/5 transition-all text-center"
          >
            <span className="text-2xl block mb-2">◈</span>
            <span className="text-sm text-[#e8e0d0]/60">View Storefront</span>
          </a>
        </div>
      </div>
    </AdminShell>
  );
}
