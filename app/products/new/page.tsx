"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AdminShell from "@/components/AdminShell";

const THEMES = [
  "Light",
  "Creation",
  "Soul",
  "Water",
  "Time",
  "Nature",
  "Mercy",
  "Judgment",
  "Knowledge",
];

const DEFAULT_PRINT_SIZES = [
  { label: "Small", dimensions: '12" × 16"', price: 4999 },
  { label: "Medium", dimensions: '18" × 24"', price: 7999 },
  { label: "Large", dimensions: '24" × 36"', price: 12999 },
];

const DEFAULT_FRAME_OPTIONS = [
  { label: "No Frame", material: "Unframed", priceAddon: 0 },
  { label: "Black Wood", material: "Wood", priceAddon: 2999 },
  { label: "Gold Metal", material: "Metal", priceAddon: 4999 },
  { label: "Walnut", material: "Wood", priceAddon: 3999 },
];

export default function NewProduct() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const [form, setForm] = useState({
    slug: "",
    verseId: "",
    arabic: "",
    translation: "",
    theme: "Light",
    previewImageUrl: "",
    highResS3Key: "",
    digitalPrice: 2999,
    printPriceBase: 4999,
    printSizes: DEFAULT_PRINT_SIZES,
    frameOptions: DEFAULT_FRAME_OPTIONS,
    status: "draft" as "draft" | "published",
    isAuctionPiece: false,
  });

  const updateField = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "artworks");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        updateField("previewImageUrl", data.url);
        updateField("highResS3Key", data.key);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const generateSlug = () => {
    if (form.verseId) {
      updateField("slug", form.verseId);
    } else if (form.theme) {
      updateField(
        "slug",
        `${form.theme}-${Date.now()}`.toLowerCase().replace(/\s+/g, "-")
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/products");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create product");
      }
    } catch {
      alert("Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell>
      <div className="mb-10">
        <h1
          className="text-3xl font-light tracking-wide"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Upload New Artwork
        </h1>
        <p className="text-[#e8e0d0]/40 text-sm mt-1">
          Add a new piece to your collection
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Image Upload */}
        <div className="border border-[#c9a96e]/15 bg-[#0d0d0d] p-8">
          <h2
            className="text-lg font-light tracking-wide mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Artwork Image
          </h2>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#c9a96e]/20 hover:border-[#c9a96e]/50 transition-colors cursor-pointer p-8 text-center relative overflow-hidden"
          >
            {previewUrl || form.previewImageUrl ? (
              <div className="relative w-full aspect-[4/3] max-w-md mx-auto">
                <Image
                  src={previewUrl || form.previewImageUrl}
                  alt="Preview"
                  fill
                  className="object-contain"
                  unoptimized
                />
                {uploading && (
                  <div className="absolute inset-0 bg-[#0a0a0a]/80 flex items-center justify-center">
                    <span className="text-[#c9a96e] text-sm animate-pulse">
                      Uploading...
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12">
                <span className="text-4xl text-[#c9a96e]/30 block mb-4">
                  ⬆
                </span>
                <p className="text-[#e8e0d0]/40 text-sm">
                  Click to upload artwork image
                </p>
                <p className="text-[#e8e0d0]/20 text-xs mt-2">
                  PNG, JPG, or WebP — max 20MB
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div className="mt-4">
            <label className="text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 mb-2 block">
              Or paste image URL
            </label>
            <input
              type="url"
              value={form.previewImageUrl}
              onChange={(e) => {
                updateField("previewImageUrl", e.target.value);
                setPreviewUrl(e.target.value);
              }}
              placeholder="https://..."
              className="w-full bg-[#1a1a1a] border border-[#c9a96e]/15 px-4 py-3 text-sm text-[#e8e0d0] placeholder:text-[#e8e0d0]/20 focus:border-[#c9a96e]/50 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Verse Details */}
        <div className="border border-[#c9a96e]/15 bg-[#0d0d0d] p-8">
          <h2
            className="text-lg font-light tracking-wide mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Verse Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 mb-2 block">
                Verse ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.verseId}
                  onChange={(e) => updateField("verseId", e.target.value)}
                  placeholder="e.g. light-an-nur-35"
                  className="flex-1 bg-[#1a1a1a] border border-[#c9a96e]/15 px-4 py-3 text-sm text-[#e8e0d0] placeholder:text-[#e8e0d0]/20 focus:border-[#c9a96e]/50 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={generateSlug}
                  className="px-4 py-3 border border-[#c9a96e]/30 text-[#c9a96e] text-xs hover:bg-[#c9a96e]/10 transition-colors"
                >
                  → Slug
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 mb-2 block">
                Slug
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => updateField("slug", e.target.value)}
                placeholder="unique-url-slug"
                required
                className="w-full bg-[#1a1a1a] border border-[#c9a96e]/15 px-4 py-3 text-sm text-[#e8e0d0] placeholder:text-[#e8e0d0]/20 focus:border-[#c9a96e]/50 focus:outline-none transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 mb-2 block">
                Arabic Text
              </label>
              <textarea
                value={form.arabic}
                onChange={(e) => updateField("arabic", e.target.value)}
                placeholder="Arabic verse text..."
                required
                dir="rtl"
                rows={3}
                className="w-full bg-[#1a1a1a] border border-[#c9a96e]/15 px-4 py-3 text-lg text-[#e8e0d0] placeholder:text-[#e8e0d0]/20 focus:border-[#c9a96e]/50 focus:outline-none transition-colors"
                style={{ fontFamily: "var(--font-arabic)" }}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 mb-2 block">
                Translation
              </label>
              <textarea
                value={form.translation}
                onChange={(e) => updateField("translation", e.target.value)}
                placeholder="English translation..."
                required
                rows={3}
                className="w-full bg-[#1a1a1a] border border-[#c9a96e]/15 px-4 py-3 text-sm text-[#e8e0d0] placeholder:text-[#e8e0d0]/20 focus:border-[#c9a96e]/50 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 mb-2 block">
                Theme
              </label>
              <select
                value={form.theme}
                onChange={(e) => updateField("theme", e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#c9a96e]/15 px-4 py-3 text-sm text-[#e8e0d0] focus:border-[#c9a96e]/50 focus:outline-none transition-colors"
              >
                {THEMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="border border-[#c9a96e]/15 bg-[#0d0d0d] p-8">
          <h2
            className="text-lg font-light tracking-wide mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Pricing
          </h2>

          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isAuctionPiece}
                onChange={(e) =>
                  updateField("isAuctionPiece", e.target.checked)
                }
                className="w-4 h-4 accent-[#c9a96e]"
              />
              <span className="text-sm text-[#e8e0d0]/70">
                This is an auction piece (One Piece Only)
              </span>
            </label>
          </div>

          {!form.isAuctionPiece && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 mb-2 block">
                  Digital Price (cents)
                </label>
                <input
                  type="number"
                  value={form.digitalPrice}
                  onChange={(e) =>
                    updateField("digitalPrice", parseInt(e.target.value) || 0)
                  }
                  className="w-full bg-[#1a1a1a] border border-[#c9a96e]/15 px-4 py-3 text-sm text-[#e8e0d0] focus:border-[#c9a96e]/50 focus:outline-none transition-colors"
                />
                <p className="text-xs text-[#e8e0d0]/20 mt-1">
                  ${(form.digitalPrice / 100).toFixed(2)}
                </p>
              </div>
              <div>
                <label className="text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 mb-2 block">
                  Print Base Price (cents)
                </label>
                <input
                  type="number"
                  value={form.printPriceBase}
                  onChange={(e) =>
                    updateField(
                      "printPriceBase",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full bg-[#1a1a1a] border border-[#c9a96e]/15 px-4 py-3 text-sm text-[#e8e0d0] focus:border-[#c9a96e]/50 focus:outline-none transition-colors"
                />
                <p className="text-xs text-[#e8e0d0]/20 mt-1">
                  ${(form.printPriceBase / 100).toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Status & Submit */}
        <div className="border border-[#c9a96e]/15 bg-[#0d0d0d] p-8">
          <h2
            className="text-lg font-light tracking-wide mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Publishing
          </h2>
          <div className="flex items-center gap-6 mb-8">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="draft"
                checked={form.status === "draft"}
                onChange={() => updateField("status", "draft")}
                className="accent-[#c9a96e]"
              />
              <span className="text-sm text-[#e8e0d0]/70">Save as Draft</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="published"
                checked={form.status === "published"}
                onChange={() => updateField("status", "published")}
                className="accent-[#c9a96e]"
              />
              <span className="text-sm text-[#e8e0d0]/70">
                Publish Immediately
              </span>
            </label>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-[#c9a96e] text-[#0a0a0a] text-sm tracking-[0.15em] uppercase hover:bg-[#d4b87a] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Create Product"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-3 border border-[#c9a96e]/30 text-[#e8e0d0]/50 text-sm tracking-[0.15em] uppercase hover:border-[#c9a96e]/60 hover:text-[#e8e0d0] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </AdminShell>
  );
}
