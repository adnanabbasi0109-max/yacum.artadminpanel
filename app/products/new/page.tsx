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
  { label: "Small", dimensions: '12" × 16"', price: 149900 },
  { label: "Medium", dimensions: '18" × 24"', price: 249900 },
  { label: "Large", dimensions: '24" × 36"', price: 399900 },
];

const DEFAULT_FRAME_OPTIONS = [
  { label: "No Frame", material: "Unframed", priceAddon: 0 },
  { label: "Black Wood", material: "Solid Black Wood", priceAddon: 99900 },
  { label: "Gold Metal", material: "Brushed Gold Metal", priceAddon: 149900 },
  { label: "Walnut", material: "Natural Walnut Wood", priceAddon: 129900 },
];

export default function NewProduct() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const [form, setForm] = useState({
    slug: "",
    title: "",
    verseId: "",
    arabic: "",
    transliteration: "",
    translation: "",
    tafsir: "",
    surah: "",
    surahNumber: 0,
    ayah: 0,
    theme: "Light",
    previewImageUrl: "",
    highResS3Key: "",
    digitalPrice: 49900,
    printPriceBase: 149900,
    printSizes: DEFAULT_PRINT_SIZES,
    frameOptions: DEFAULT_FRAME_OPTIONS,
    status: "draft" as "draft" | "published",
    orientation: "vertical" as "vertical" | "horizontal",
    description: "",
    isAuctionPiece: false,
    isFeatured: false,
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
    if (form.title) {
      const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      updateField("slug", slug);
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

  const inputClass =
    "w-full bg-[#1a1a1a] border border-[#c9a96e]/15 px-4 py-3 text-sm text-[#e8e0d0] placeholder:text-[#e8e0d0]/20 focus:border-[#c9a96e]/50 focus:outline-none transition-colors";
  const labelClass =
    "text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 mb-2 block";

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
                <span className="text-4xl text-[#c9a96e]/30 block mb-4">⬆</span>
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

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Or paste image URL</label>
              <input
                type="url"
                value={form.previewImageUrl}
                onChange={(e) => {
                  updateField("previewImageUrl", e.target.value);
                  setPreviewUrl(e.target.value);
                }}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Orientation</label>
              <select
                value={form.orientation}
                onChange={(e) => updateField("orientation", e.target.value)}
                className={inputClass}
              >
                <option value="vertical">Vertical (15&quot; × 20&quot;)</option>
                <option value="horizontal">Horizontal (16&quot; × 9&quot;)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Basics */}
        <div className="border border-[#c9a96e]/15 bg-[#0d0d0d] p-8">
          <h2
            className="text-lg font-light tracking-wide mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Basics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="e.g. Sibghatallah"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Slug *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  placeholder="unique-url-slug"
                  required
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={generateSlug}
                  className="px-4 py-3 border border-[#c9a96e]/30 text-[#c9a96e] text-xs hover:bg-[#c9a96e]/10 transition-colors whitespace-nowrap"
                >
                  Auto
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Theme *</label>
              <select
                value={form.theme}
                onChange={(e) => updateField("theme", e.target.value)}
                className={inputClass}
              >
                {THEMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Verse ID *</label>
              <input
                type="text"
                value={form.verseId}
                onChange={(e) => updateField("verseId", e.target.value)}
                placeholder="e.g. al-baqarah-2-138"
                required
                className={inputClass}
              />
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className={labelClass}>Surah Name</label>
              <input
                type="text"
                value={form.surah}
                onChange={(e) => updateField("surah", e.target.value)}
                placeholder="e.g. Al-Baqarah"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Surah Number</label>
              <input
                type="number"
                value={form.surahNumber || ""}
                onChange={(e) =>
                  updateField("surahNumber", parseInt(e.target.value) || 0)
                }
                placeholder="2"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Ayah Number</label>
              <input
                type="number"
                value={form.ayah || ""}
                onChange={(e) => updateField("ayah", parseInt(e.target.value) || 0)}
                placeholder="138"
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className={labelClass}>Arabic Text *</label>
              <textarea
                value={form.arabic}
                onChange={(e) => updateField("arabic", e.target.value)}
                placeholder="Arabic verse text..."
                required
                dir="rtl"
                rows={3}
                className={`${inputClass} text-lg`}
                style={{ fontFamily: "var(--font-arabic)" }}
              />
            </div>
            <div>
              <label className={labelClass}>Transliteration</label>
              <textarea
                value={form.transliteration}
                onChange={(e) => updateField("transliteration", e.target.value)}
                placeholder="Sibghatallāhi wa man aḥsanu minallāhi sibghatan..."
                rows={2}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Translation *</label>
              <textarea
                value={form.translation}
                onChange={(e) => updateField("translation", e.target.value)}
                placeholder="English translation..."
                required
                rows={3}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Tafsir / Description</label>
              <textarea
                value={form.tafsir}
                onChange={(e) => updateField("tafsir", e.target.value)}
                placeholder="Detailed scholarly explanation, context, and meaning of the verse..."
                rows={6}
                className={inputClass}
              />
              <p className="text-xs text-[#e8e0d0]/30 mt-1">
                This appears as the &quot;Description&quot; below the painting on the website.
              </p>
            </div>
            <div>
              <label className={labelClass}>Short Description (optional)</label>
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="A brief 1-2 sentence description of the artwork..."
                rows={2}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="border border-[#c9a96e]/15 bg-[#0d0d0d] p-8">
          <h2
            className="text-lg font-light tracking-wide mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Pricing & Type
          </h2>

          <div className="mb-6 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => updateField("isFeatured", e.target.checked)}
                className="w-4 h-4 accent-[#c9a96e]"
              />
              <span className="text-sm text-[#e8e0d0]/70">
                Feature on homepage
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isAuctionPiece}
                onChange={(e) => updateField("isAuctionPiece", e.target.checked)}
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
                <label className={labelClass}>Digital Price (paise)</label>
                <input
                  type="number"
                  value={form.digitalPrice}
                  onChange={(e) =>
                    updateField("digitalPrice", parseInt(e.target.value) || 0)
                  }
                  className={inputClass}
                />
                <p className="text-xs text-[#e8e0d0]/30 mt-1">
                  ₹{(form.digitalPrice / 100).toFixed(0)}
                </p>
              </div>
              <div>
                <label className={labelClass}>Print Base Price (paise)</label>
                <input
                  type="number"
                  value={form.printPriceBase}
                  onChange={(e) =>
                    updateField("printPriceBase", parseInt(e.target.value) || 0)
                  }
                  className={inputClass}
                />
                <p className="text-xs text-[#e8e0d0]/30 mt-1">
                  ₹{(form.printPriceBase / 100).toFixed(0)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Publishing */}
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
