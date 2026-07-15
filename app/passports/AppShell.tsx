"use client";

import { type ReactNode, useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Accessibility, Ear, Eye, PersonStanding, HeartHandshake } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "./LogoutButton";
import { SidebarNav } from "./SidebarNav";
import { ShineSweep } from "@/components/ui/ShineSweep";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TopBar } from "./TopBar";

const STORAGE_KEY = "passports-sidebar-collapsed";

// Keep in sync with the Tailwind width classes below (w-82 / w-20).
const EXPANDED_CLASS  = "w-82";
const COLLAPSED_CLASS = "w-20";
const EXPANDED_MARGIN  = "lg:ml-82";
const COLLAPSED_MARGIN = "lg:ml-20";

const ACCESSIBILITY_ICONS = [Accessibility, Ear, Eye, PersonStanding, HeartHandshake];
const FALLING_ICON_COUNT = 12;

type FallingIcon = {
  Icon: ComponentType<{ className?: string; style?: React.CSSProperties }>;
  left: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
};

type Props = { username: string; children: ReactNode };

export function AppShell({ username, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [fallingIcons, setFallingIcons] = useState<FallingIcon[]>([]);

  // Read the persisted preference after mount only — avoids an SSR/client
  // hydration mismatch (the server always renders the expanded markup).
  // The falling icons are randomized per-mount for the same reason: generating
  // them during SSR would produce markup that differs from the client render.
  useEffect(() => {
    setMounted(true);
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    setFallingIcons(
      Array.from({ length: FALLING_ICON_COUNT }, () => ({
        Icon: ACCESSIBILITY_ICONS[Math.floor(Math.random() * ACCESSIBILITY_ICONS.length)],
        left: Math.random() * 100,
        size: 24 + Math.random() * 20,
        opacity: 0.08 + Math.random() * 0.11,
        duration: 16 + Math.random() * 14,
        delay: Math.random() * -25,
      })),
    );
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  const isCollapsed = mounted && collapsed;

  return (
    <div className="min-h-screen flex bg-background">

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "hidden lg:flex shrink-0 flex-col fixed inset-y-0 left-0 z-20 transition-[width] duration-200",
          isCollapsed ? COLLAPSED_CLASS : EXPANDED_CLASS,
        )}
        style={{
          background: "linear-gradient(160deg, #050810 0%, #0a0f24 45%, #0d1430 100%)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.3)",
        }}
      >
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Radial glow at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(55,114,255,0.18), transparent 70%)" }}
        />

        {/* Faint falling accessibility icons drifting down the empty lower area */}
        <div
          className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none overflow-hidden"
          style={{ maskImage: "linear-gradient(180deg, transparent, black 15%, black 85%, transparent)" }}
        >
          {fallingIcons.map(({ Icon, left, size, opacity, duration, delay }, i) => (
            <Icon
              key={i}
              className="absolute text-white"
              style={{
                left: `${left}%`,
                width: size,
                height: size,
                opacity,
                animation: `iconFall ${duration}s linear ${delay}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Logo */}
        <div
          className={cn("relative z-10 flex items-center shrink-0", isCollapsed ? "justify-center px-2 py-4" : "px-3 py-3")}
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <Link
            href="/passports"
            className={cn(
              "group relative overflow-hidden flex items-center rounded-xl border border-white/[0.06] transition-colors duration-200 hover:bg-white/[0.03] hover:border-white/[0.12]",
              isCollapsed ? "w-11 h-11 justify-center" : "w-full px-3 py-2",
            )}
          >
            <ShineSweep />
            {isCollapsed ? (
              <Image
                src="/logo-without-letters.png"
                alt="Инклюзия"
                width={353}
                height={349}
                sizes="44px"
                className="relative z-10 w-7 h-auto"
                priority
              />
            ) : (
              <Image
                src="/logo-white-letters.png"
                alt="Инклюзия"
                width={1286}
                height={362}
                sizes="280px"
                className="relative z-10 w-full h-auto"
                priority
              />
            )}
          </Link>

          {/* Collapse toggle — anchored to this header's own bottom border, not a guessed offset */}
          <button
            type="button"
            onClick={toggle}
            aria-label={isCollapsed ? "Развернуть меню" : "Свернуть меню"}
            className="absolute -right-3 bottom-0 translate-y-1/2 z-30 w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300 hover:scale-110"
            style={{
              background: "linear-gradient(135deg, #1e2d5a, #2a3f8a)",
              borderColor: "rgba(55,114,255,0.45)",
              boxShadow: "0 4px 16px rgba(55,114,255,0.4)",
            }}
          >
            <ChevronLeft
              className="w-3.5 h-3.5 transition-transform duration-300"
              style={{ color: "rgba(255,255,255,0.85)", transform: isCollapsed ? "rotate(180deg)" : "none" }}
            />
          </button>
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex-1 overflow-y-auto py-5 px-3">
          {!isCollapsed && (
            <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: "rgba(255,255,255,0.25)" }}>
              Управление
            </p>
          )}
          <SidebarNav collapsed={isCollapsed} />
        </nav>

        <style>{`
          @keyframes iconFall {
            from { top: -10%; transform: rotate(0deg); }
            to   { top: 108%; transform: rotate(25deg); }
          }
        `}</style>
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-surface border-b border-foreground/8 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg brand-gradient flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white" stroke="currentColor" strokeWidth={2.5}>
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <Link href="/passports" className="text-sm font-semibold text-foreground">
            Паспортизация
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground/50">{username}</span>
          <ThemeToggle className="p-1.5 rounded-lg text-foreground/40 hover:text-foreground hover:bg-foreground/8 transition-colors" />
          <LogoutButton compact />
        </div>
      </header>

      {/* ── Main content ── */}
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-[margin] duration-200",
        isCollapsed ? COLLAPSED_MARGIN : EXPANDED_MARGIN,
      )}>
        <TopBar username={username} />
        <main className="flex-1 px-6 py-6 pt-[4.5rem] lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
