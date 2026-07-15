"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { NavUserMenu } from "./nav-user-menu";
import { ShineSweep } from "./ShineSweep";
import { cn } from "@/lib/utils";

type Props = { user?: { username: string } | null };

export function Nav({ user = null }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#features", label: "Возможности" },
    { href: "#how", label: "Как работает" },
    { href: "/analytics", label: "Аналитика" },
    { href: "/map", label: "Карта" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-neutral-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo: white/dark variants have slightly different intrinsic ratios (1286x362 / 1189x320). */}
        <Link
          href="/"
          className={cn(
            "group relative overflow-hidden flex-shrink-0 flex items-center rounded-xl border px-3 py-2 transition-colors duration-200",
            scrolled
              ? "border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
              : "border-white/[0.12] hover:bg-white/[0.05] hover:border-white/[0.25]",
          )}
        >
          <ShineSweep />
          {scrolled ? (
            <Image
              src="/logo-dark-letters.png"
              alt="Инклюзия"
              width={1189}
              height={320}
              className="relative z-10 w-auto h-12"
              priority
            />
          ) : (
            <Image
              src="/logo-white-letters.png"
              alt="Инклюзия"
              width={1286}
              height={362}
              className="relative z-10 w-auto h-12"
              priority
            />
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors hover:text-[#3772ff] ${
                scrolled ? "text-neutral-600" : "text-white/80"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <NavUserMenu username={user.username} scrolled={scrolled} />
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium px-4 py-2 rounded-xl border transition-all hover:bg-[#3772ff] hover:text-white hover:border-[#3772ff]"
              style={{
                borderColor: scrolled ? "#e5e7eb" : "rgba(255,255,255,0.3)",
                color: scrolled ? "#374151" : "white",
              }}
            >
              Войти
            </Link>
          )}
          <Link
            href="/map"
            className="text-sm font-medium px-4 py-2 rounded-xl text-white transition-all hover:opacity-90"
            style={{ background: "#3772ff" }}
          >
            Открыть карту
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          className={`md:hidden p-2 rounded-lg ${scrolled ? "text-neutral-700" : "text-white"}`}
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-b border-neutral-100 px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-neutral-700 hover:text-[#3772ff]"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <div className="flex items-center justify-between py-2 px-1">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #3772ff, #6aa3ff)" }}>
                  {user.username.slice(0, 1).toUpperCase()}
                </span>
                <span className="text-sm font-medium text-neutral-700">{user.username}</span>
              </div>
              <Link href="/passports" onClick={() => setOpen(false)}
                className="text-sm text-[#3772ff] font-medium">
                Панель →
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-center py-2 rounded-xl border border-neutral-200 text-neutral-700"
              onClick={() => setOpen(false)}
            >
              Войти
            </Link>
          )}
          <Link
            href="/map"
            className="text-sm font-medium text-center py-2 rounded-xl text-white"
            style={{ background: "#3772ff" }}
            onClick={() => setOpen(false)}
          >
            Открыть карту
          </Link>
        </div>
      )}
    </header>
  );
}
