"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";

interface Product {
  _id: string;
  slug: string;
  theme: string;
  arabic: string;
  translation: string;
  digitalPrice: number;
  printPriceBase: number;
  status: "draft" | "published" | "soldout";
  isAuctionPiece: boolean;
  previewImageUrl: string;
  createdAt: string;
}

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = () => {
    setLoading(true);
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch {
      alert("Failed to delete product");
    }
  };

  const toggleStatus = async (product: Product) => {
    const newStatus = product.status === "published" ? "draft" : "published";
    try {
      await fetch(`/api/products/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchProducts();
    } catch {
      alert("Failed to update status");
    }
  };

  const statusColors: Record<string, string> = {
    published: "#4ade80",
    draft: "#facc15",
    soldout: "#f87171",
  };

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1
            className="text-3xl font-light tracking-wide"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Products
          </h1>
          <p className="text-[#e8e0d0]/40 text-sm mt-1">
            {products.length} artwork{products.length !== 1 ? "s" : ""} in
            collection
          </p>
        </div>
        <Link
          href="/products/new"
          className="px-6 py-3 bg-[#c9a96e] text-[#0a0a0a] text-sm tracking-[0.15em] uppercase hover:bg-[#d4b87a] transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#e8e0d0]/30">
          Loading products...
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 border border-[#c9a96e]/15 bg-[#0d0d0d]">
          <p className="text-[#e8e0d0]/40 mb-4">No products yet</p>
          <Link
            href="/products/new"
            className="text-[#c9a96e] hover:underline"
          >
            Upload your first artwork →
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
                  Theme
                </th>
                <th className="text-left p-4 text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40">
                  Price
                </th>
                <th className="text-left p-4 text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40">
                  Status
                </th>
                <th className="text-right p-4 text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product._id}
                  className="border-b border-[#c9a96e]/8 hover:bg-[#c9a96e]/5 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#1a1a1a] overflow-hidden flex-shrink-0">
                        {product.previewImageUrl && (
                          <img
                            src={product.previewImageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-[#e8e0d0] truncate max-w-[200px]">
                          {product.translation?.slice(0, 60)}...
                        </p>
                        <p className="text-xs text-[#e8e0d0]/30 mt-0.5">
                          {product.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs tracking-[0.15em] uppercase text-[#c9a96e]/70">
                      {product.theme}
                    </span>
                  </td>
                  <td className="p-4">
                    {product.isAuctionPiece ? (
                      <span className="text-xs text-[#f87171]">Auction</span>
                    ) : (
                      <span className="text-sm">
                        ${(product.digitalPrice / 100).toFixed(0)}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleStatus(product)}
                      className="flex items-center gap-2 group"
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            statusColors[product.status] || "#666",
                        }}
                      />
                      <span className="text-xs capitalize text-[#e8e0d0]/50 group-hover:text-[#e8e0d0]">
                        {product.status}
                      </span>
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/products/${product._id}/edit`}
                        className="text-xs text-[#c9a96e]/60 hover:text-[#c9a96e] transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
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
