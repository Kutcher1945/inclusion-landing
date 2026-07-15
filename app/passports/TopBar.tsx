"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutList, Map, BarChart2, Plus, FileText, type LucideIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoutButton } from "./LogoutButton";

type Props = { username: string };

function getPageInfo(pathname: string): { label: string; icon: LucideIcon } {
  if (pathname === "/passports") return { label: "Паспорта объектов", icon: LayoutList };
  if (pathname.startsWith("/passports/map")) return { label: "Карта", icon: Map };
  if (pathname.startsWith("/passports/analytics")) return { label: "Аналитика", icon: BarChart2 };
  if (pathname.startsWith("/passports/new")) return { label: "Новая запись", icon: Plus };
  if (pathname.startsWith("/passports/")) return { label: "Паспорт объекта", icon: FileText };
  return { label: "Паспорта объектов", icon: LayoutList };
}

export function TopBar({ username }: Props) {
  const pathname = usePathname();
  const { label, icon: PageIcon } = getPageInfo(pathname);

  return (
    <header
      className="hidden lg:flex h-14 shrink-0 items-center justify-between gap-4 px-6 sticky top-0 z-10 border-b border-foreground/[0.06]"
      style={{
        background: "color-mix(in srgb, var(--surface) 85%, transparent)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Left — current section */}
      <div className="flex items-center gap-2 text-foreground/60">
        <PageIcon className="w-4 h-4 text-foreground/35" aria-hidden="true" />
        <span className="text-sm font-medium">{label}</span>
      </div>

      {/* Right — theme toggle + user chip */}
      <div className="flex items-center gap-3">
        <ThemeToggle className="p-1.5 rounded-lg text-foreground/35 hover:text-foreground hover:bg-foreground/[0.06] transition-colors" />

        <div className="w-px h-6 bg-foreground/[0.08]" aria-hidden="true" />

        {/* User chip */}
        <div className="flex items-center gap-2.5 pl-1.5 pr-1 py-1 rounded-xl hover:bg-foreground/[0.04] transition-colors">
          <Link href="/passports/profile" className="flex items-center gap-2.5" title="Профиль">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-bold ring-1 ring-white/15"
              style={{
                background: "linear-gradient(135deg, #3772ff, #6aa3ff)",
                boxShadow: "0 2px 8px rgba(55,114,255,0.4)",
              }}
            >
              {username.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-medium text-foreground">{username}</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-foreground/40 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                Сотрудник
              </span>
            </div>
          </Link>
          <LogoutButton compact />
        </div>
      </div>
    </header>
  );
}
