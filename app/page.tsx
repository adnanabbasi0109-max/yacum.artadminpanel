"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";

interface Stats {
  total: number;
  published: number;
  draft: number;
  auction: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    published: 0,
    draft: 0,
    auction: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStats({
            total: data.length,
            published: data.filter(
              (p: { status: string }) => p.status === "published"
            ).length,
            draft: data.filter(
              (p: { status: string }) => p.status === "draft"
            ).length,
            auction: data.filter(
              (p: { isAuctionPiece: boolean }) => p.isAuctionPiece
            ).length,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Total Products", value: stats.total, color: "#c9a96e" },
    { label: "Published", value: stats.published, color: "#4ade80" },
    { label: "Drafts", value: stats.draft, color: "#facc15" },
    { label: "Auction Pieces", value: stats.auction, color: "#f87171" },
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {cards.map((card) => (
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

      {/* Quick Actions */}
      <div className="border border-[#c9a96e]/15 bg-[#0d0d0d] p-8">
        <h2
          className="text-lg font-light tracking-wide mb-6"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
