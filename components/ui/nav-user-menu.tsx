"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutList, LogOut, ChevronDown } from "lucide-react";

type Props = {
  username: string;
  scrolled: boolean;
};

export function NavUserMenu({ username, scrolled }: Props) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    setOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const initial = username.slice(0, 1).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all"
        style={{
          borderColor: scrolled ? "#e5e7eb" : "rgba(255,255,255,0.25)",
          background: open
            ? scrolled ? "rgba(55,114,255,0.06)" : "rgba(255,255,255,0.12)"
            : "transparent",
          color: scrolled ? "#374151" : "white",
        }}
      >
        {/* Avatar */}
        <span
          className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
          style={{ background: "linear-gradient(135deg, #3772ff, #6aa3ff)" }}
        >
          {initial}
        </span>
        <span className="text-sm font-medium max-w-[96px] truncate">{username}</span>
        <ChevronDown
          className="w-3.5 h-3.5 shrink-0 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none", opacity: 0.6 }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden z-50"
          style={{
            background: "white",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07), 0 16px 40px -8px rgba(15,23,42,0.14), 0 0 0 1px rgba(0,0,0,0.06)",
          }}
        >
          {/* Header */}
          <div className="px-4 py-3.5" style={{ borderBottom: "1px solid #f1f5f9" }}>
            <div className="flex items-center gap-2.5">
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ background: "linear-gradient(135deg, #3772ff, #6aa3ff)" }}
              >
                {initial}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{username}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <p className="text-[11px] text-gray-400">Сотрудник</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="py-1.5 px-1.5">
            <Link
              href="/passports"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <LayoutList className="w-4 h-4 text-gray-400 shrink-0" />
              Панель управления
            </Link>
          </div>

          <div className="py-1.5 px-1.5" style={{ borderTop: "1px solid #f1f5f9" }}>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {loggingOut ? "Выход…" : "Выйти"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
