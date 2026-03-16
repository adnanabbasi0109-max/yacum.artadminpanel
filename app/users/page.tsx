"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";

interface User {
  _id: string;
  name: string;
  email: string;
  bids: string[];
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

      {loading ? (
        <div className="text-center py-20">
          <p className="text-[#e8e0d0]/30 animate-pulse">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 border border-[#c9a96e]/10">
          <p className="text-[#e8e0d0]/30 text-sm">No users registered yet</p>
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
                  Bids
                </th>
                <th className="text-left text-[10px] tracking-[0.3em] uppercase text-[#e8e0d0]/40 px-6 py-4">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-[#c9a96e]/10 last:border-0 hover:bg-[#c9a96e]/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#e8e0d0]">
                      {user.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#e8e0d0]/60">
                      {user.email}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-[#c9a96e] font-mono">
                      {user.bids?.length || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-[#e8e0d0]/40 font-mono">
                      {new Date(user.createdAt).toLocaleDateString()}
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
