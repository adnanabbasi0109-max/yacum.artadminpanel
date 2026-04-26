"use client";

import { useEffect, useState, useMemo } from "react";
import AdminShell from "@/components/AdminShell";

interface User {
  _id: string;
  name: string;
  email: string;
  bids: string[];
  orders?: string[];
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  const stats = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    return {
      total: users.length,
      today: users.filter(
        (u) => now - new Date(u.createdAt).getTime() < oneDay
      ).length,
      week: users.filter(
        (u) => now - new Date(u.createdAt).getTime() < oneDay * 7
      ).length,
      withOrders: users.filter((u) => (u.orders?.length || 0) > 0).length,
    };
  }, [users]);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1
            className="text-3xl font-light tracking-wide"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Users
          </h1>
          <p className="text-[#e8e0d0]/40 text-sm mt-1">
            {users.length} registered account{users.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="border border-[#c9a96e]/15 bg-[#0d0d0d] p-4">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40">
            Total
          </p>
          <p className="text-2xl font-light text-[#e8e0d0] mt-1">
            {stats.total}
          </p>
        </div>
        <div className="border border-[#c9a96e]/15 bg-[#0d0d0d] p-4">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40">
            Today
          </p>
          <p className="text-2xl font-light text-[#c9a96e] mt-1">
            {stats.today}
          </p>
        </div>
        <div className="border border-[#c9a96e]/15 bg-[#0d0d0d] p-4">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40">
            Last 7 Days
          </p>
          <p className="text-2xl font-light text-[#e8e0d0] mt-1">
            {stats.week}
          </p>
        </div>
        <div className="border border-[#c9a96e]/15 bg-[#0d0d0d] p-4">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40">
            With Orders
          </p>
          <p className="text-2xl font-light text-[#e8e0d0] mt-1">
            {stats.withOrders}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full bg-[#0d0d0d] border border-[#c9a96e]/15 px-4 py-3 text-sm text-[#e8e0d0] placeholder:text-[#e8e0d0]/30 focus:border-[#c9a96e]/50 focus:outline-none transition-colors"
        />
      </div>

      {loading ? (
        <div className="text-center py-20">
          <p className="text-[#e8e0d0]/30 animate-pulse">Loading users...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border border-[#c9a96e]/10">
          <p className="text-[#e8e0d0]/30 text-sm">
            {users.length === 0
              ? "No users registered yet"
              : "No users match your search"}
          </p>
        </div>
      ) : (
        <div className="border border-[#c9a96e]/15 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#c9a96e]/15 bg-[#0d0d0d]">
                <th className="text-left text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 px-6 py-4">
                  Name
                </th>
                <th className="text-left text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 px-6 py-4">
                  Email
                </th>
                <th className="text-left text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 px-6 py-4">
                  Orders
                </th>
                <th className="text-left text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 px-6 py-4">
                  Bids
                </th>
                <th className="text-left text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 px-6 py-4">
                  Registered
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-[#c9a96e]/10 last:border-0 hover:bg-[#c9a96e]/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#c9a96e]/15 flex items-center justify-center text-[#c9a96e] text-xs font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-[#e8e0d0]">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`mailto:${user.email}`}
                      className="text-sm text-[#c9a96e]/80 hover:text-[#c9a96e] transition-colors"
                    >
                      {user.email}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-mono ${
                        (user.orders?.length || 0) > 0
                          ? "text-[#4ade80]"
                          : "text-[#e8e0d0]/30"
                      }`}
                    >
                      {user.orders?.length || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-mono ${
                        (user.bids?.length || 0) > 0
                          ? "text-[#c9a96e]"
                          : "text-[#e8e0d0]/30"
                      }`}
                    >
                      {user.bids?.length || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-[#e8e0d0]/50 font-mono">
                      {fmt(user.createdAt)}
                    </span>
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
