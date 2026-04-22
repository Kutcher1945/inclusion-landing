"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export function Nav() {
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
        {/* Logo: PNG has ~15% whitespace on each side; overdraw then clip to h-20 */}
        <Link href="/" className="flex-shrink-0 overflow-hidden h-20 flex items-center -ml-4">
          <Image
            src={scrolled ? "/logo-dark-letters.png" : "/logo-white-letters.png"}
            alt="Инклюзия"
            width={380}
            height={114}
            className="w-auto"
            style={{ height: "114px", marginTop: "-17px", marginBottom: "-17px" }}
            priority
          />
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
          <Link
            href="#cta"
            className="text-sm font-medium px-4 py-2 rounded-xl border transition-all hover:bg-[#3772ff] hover:text-white hover:border-[#3772ff]"
            style={{
              borderColor: scrolled ? "#e5e7eb" : "rgba(255,255,255,0.3)",
              color: scrolled ? "#374151" : "white",
            }}
          >
            Запросить доступ
          </Link>
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
          <Link
            href="#cta"
            className="text-sm font-medium text-center py-2 rounded-xl border border-neutral-200 text-neutral-700"
            onClick={() => setOpen(false)}
          >
            Запросить доступ
          </Link>
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
