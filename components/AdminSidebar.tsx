"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: "◆" },
  { href: "/products", label: "Products", icon: "◇" },
  { href: "/products/new", label: "Add Product", icon: "+" },
  { href: "/auctions", label: "Auctions", icon: "⬡" },
  { href: "/users", label: "Users", icon: "⏣" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const mainSiteUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://yacum.art";

  return (
    <aside
      className={`${sidebarOpen ? "w-64" : "w-20"} border-r border-[#c9a96e]/20 bg-[#0d0d0d] flex flex-col transition-all duration-300 min-h-screen fixed left-0 top-0`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-[#c9a96e]/20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="yacum."
            width={120}
            height={40}
            className={sidebarOpen ? "block" : "hidden"}
          />
          <Image
            src="/icon.png"
            alt="y"
            width={32}
            height={32}
            className={sidebarOpen ? "hidden" : "block"}
          />
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-[#c9a96e]/60 hover:text-[#c9a96e] transition-colors text-sm"
        >
          {sidebarOpen ? "◁" : "▷"}
        </button>
      </div>

      {/* Admin Badge */}
      {sidebarOpen && (
        <div className="px-6 py-3 border-b border-[#c9a96e]/10">
          <span className="text-[10px] tracking-[0.3em] uppercase text-[#c9a96e]/50">
            Admin Panel
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 transition-all duration-200 ${
                isActive
                  ? "bg-[#c9a96e]/10 text-[#c9a96e] border-r-2 border-[#c9a96e]"
                  : "text-[#e8e0d0]/50 hover:text-[#e8e0d0] hover:bg-[#c9a96e]/5"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && (
                <span className="text-sm tracking-wide">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Back to site */}
      <div className="p-6 border-t border-[#c9a96e]/20">
        <a
          href={mainSiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[#e8e0d0]/40 hover:text-[#c9a96e] transition-colors text-sm"
        >
          <span>←</span>
          {sidebarOpen && <span>Back to Site</span>}
        </a>
      </div>
    </aside>
  );
}
