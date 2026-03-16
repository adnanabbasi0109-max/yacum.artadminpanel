"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import Link from "next/link";

interface ArtworkOption {
  _id: string;
  slug: string;
  theme: string;
  translation: string;
  previewImageUrl: string;
  isAuctionPiece: boolean;
}

export default function NewAuction() {
  const router = useRouter();
  const [artworks, setArtworks] = useState<ArtworkOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [artworksLoading, setArtworksLoading] = useState(true);

  const [form, setForm] = useState({
    artworkId: "",
    startingBid: "",
    bidIncrement: "",
    endTime: "",
    serialNumber: "",
    status: "upcoming" as "upcoming" | "live",
  });

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setArtworks(data.filter((a: ArtworkOption) => a.isAuctionPiece));
        }
      })
      .catch(() => {})
      .finally(() => setArtworksLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.artworkId || !form.startingBid || !form.bidIncrement || !form.endTime || !form.serialNumber) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auctions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artworkId: form.artworkId,
          startingBid: Math.round(parseFloat(form.startingBid) * 100),
          bidIncrement: Math.round(parseFloat(form.bidIncrement) * 100),
          endTime: form.endTime,
          serialNumber: form.serialNumber,
          status: form.status,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create auction");
      }

      router.push("/auctions");
    } catch {
      alert("Failed to create auction");
    } finally {
      setLoading(false);
    }
  };

  const selectedArtwork = artworks.find((a) => a._id === form.artworkId);

  const inputClass =
    "w-full bg-[#0a0a0a] border border-[#c9a96e]/20 px-4 py-3 text-sm text-[#e8e0d0] focus:border-[#c9a96e]/60 focus:outline-none transition-colors placeholder:text-[#e8e0d0]/20";
  const labelClass =
    "block text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 mb-2";

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1
            className="text-3xl font-light tracking-wide"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            New Auction
          </h1>
          <p className="text-[#e8e0d0]/40 text-sm mt-1">
            Create a new auction for an artwork piece
          </p>
        </div>
        <Link
          href="/auctions"
          className="text-sm text-[#e8e0d0]/40 hover:text-[#c9a96e] transition-colors"
        >
          ← Back to Auctions
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="border border-[#c9a96e]/15 bg-[#0d0d0d] p-8 mb-6">
          <h2
            className="text-lg font-light tracking-wide mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Select Artwork
          </h2>

          {artworksLoading ? (
            <p className="text-[#e8e0d0]/30 text-sm">Loading artworks...</p>
          ) : artworks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#e8e0d0]/40 mb-2 text-sm">
                No auction-eligible artworks found
              </p>
              <p className="text-[#e8e0d0]/25 text-xs">
                Mark artworks as &quot;Auction Piece&quot; in product settings first
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {artworks.map((artwork) => (
                <button
                  key={artwork._id}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, artworkId: artwork._id }))
                  }
                  className={`border p-3 text-left transition-all ${
                    form.artworkId === artwork._id
                      ? "border-[#c9a96e] bg-[#c9a96e]/10"
                      : "border-[#c9a96e]/15 hover:border-[#c9a96e]/40"
                  }`}
                >
                  <div className="aspect-square bg-[#1a1a1a] mb-2 overflow-hidden">
                    {artwork.previewImageUrl && (
                      <img
                        src={artwork.previewImageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <p className="text-xs text-[#e8e0d0]/70 truncate">
                    {artwork.translation?.slice(0, 40)}...
                  </p>
                  <p className="text-[10px] text-[#c9a96e]/50 uppercase tracking-wider mt-1">
                    {artwork.theme}
                  </p>
                </button>
              ))}
            </div>
          )}

          {selectedArtwork && (
            <div className="mt-4 p-3 border border-[#c9a96e]/30 bg-[#c9a96e]/5">
              <p className="text-xs text-[#c9a96e]">
                Selected: {selectedArtwork.translation?.slice(0, 60)}...
              </p>
            </div>
          )}
        </div>

        <div className="border border-[#c9a96e]/15 bg-[#0d0d0d] p-8 mb-6">
          <h2
            className="text-lg font-light tracking-wide mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Auction Settings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Starting Bid ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.startingBid}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, startingBid: e.target.value }))
                }
                placeholder="100.00"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Bid Increment ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.bidIncrement}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, bidIncrement: e.target.value }))
                }
                placeholder="10.00"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>End Time</label>
              <input
                type="datetime-local"
                value={form.endTime}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, endTime: e.target.value }))
                }
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Serial Number</label>
              <input
                type="text"
                value={form.serialNumber}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, serialNumber: e.target.value }))
                }
                placeholder="YCM-2026-001"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Initial Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    status: e.target.value as "upcoming" | "live",
                  }))
                }
                className={inputClass}
              >
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link
            href="/auctions"
            className="px-6 py-3 text-sm text-[#e8e0d0]/40 hover:text-[#e8e0d0] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !form.artworkId}
            className="px-8 py-3 bg-[#c9a96e] text-[#0a0a0a] text-sm tracking-[0.15em] uppercase hover:bg-[#d4b87a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Auction"}
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
