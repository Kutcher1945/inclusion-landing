"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutList, Map, BarChart2, ChevronDown, ClipboardList, LineChart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ShineSweep } from "@/components/ui/ShineSweep";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
};

type NavGroup = {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
};

const NAV: NavGroup[] = [
  {
    label: "Паспортизация",
    icon: ClipboardList,
    items: [
      { href: "/passports", label: "Паспорта объектов", icon: LayoutList, exact: true },
    ],
  },
  {
    label: "Аналитика",
    icon: LineChart,
    items: [
      { href: "/passports/map",       label: "Карта",     icon: Map },
      { href: "/passports/analytics", label: "Аналитика", icon: BarChart2 },
    ],
  },
];

type SidebarNavProps = { collapsed?: boolean };

export function SidebarNav({ collapsed = false }: SidebarNavProps) {
  const pathname = usePathname();
  return (
    <div className={cn("py-2", collapsed ? "space-y-3" : "space-y-5")}>
      {NAV.map((group) => (
        <SidebarGroup key={group.label} group={group} pathname={pathname} collapsed={collapsed} />
      ))}
    </div>
  );
}

function SidebarGroup({ group, pathname, collapsed }: { group: NavGroup; pathname: string; collapsed: boolean }) {
  const [open, setOpen] = useState(true);
  const isOpen = collapsed || open;

  return (
    <div>
      {/* Group header — card-style pill, hidden entirely in collapsed mode (icon-only items below speak for themselves) */}
      {!collapsed && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "group relative overflow-hidden w-[calc(100%-1rem)] mx-2 mb-1.5 flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors duration-200",
            open ? "bg-white/[0.04] border-white/[0.07]" : "border-white/[0.06] hover:bg-white/[0.03] hover:border-white/[0.12]",
          )}
        >
          <ShineSweep />
          <group.icon
            className="w-3.5 h-3.5 shrink-0 transition-colors"
            style={{ color: open ? "#5b8fff" : "rgba(255,255,255,0.4)" }}
          />
          <span
            className="flex-1 text-left text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors"
            style={{ color: open ? "#5b8fff" : "rgba(255,255,255,0.4)" }}
          >
            {group.label}
          </span>
          <ChevronDown
            className={cn("w-3 h-3 shrink-0 transition-all duration-200", !open && "-rotate-90")}
            style={{ color: open ? "#5b8fff" : "rgba(255,255,255,0.25)" }}
          />
        </button>
      )}

      {/* Items — with a connecting accent rail running down the group's icon column */}
      {isOpen && (
        <ul className={cn(
          "space-y-2",
          collapsed
            ? "flex flex-col items-center gap-1"
            : "relative ml-[27px] pl-4 border-l",
        )}
        style={collapsed ? undefined : { borderColor: "rgba(55,114,255,0.25)" }}
        >
          {group.items.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);

            if (collapsed) {
              return (
                <li key={href}>
                  <Link
                    href={href}
                    title={label}
                    aria-label={label}
                    className={cn(
                      "group relative overflow-hidden flex items-center justify-center w-11 h-11 rounded-xl border transition-all duration-200",
                      active
                        ? "text-white shadow-lg border-blue-400/50"
                        : "text-gray-300 border-white/[0.08] hover:text-white hover:border-white/20 hover:bg-white/[0.06]",
                    )}
                    style={active ? { background: "rgba(37,99,235,0.85)", boxShadow: "0 4px 16px rgba(55,114,255,0.28)" } : undefined}
                  >
                    <ShineSweep />
                    <Icon
                      className="relative z-10 w-4 h-4"
                      style={{ color: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)" }}
                    />
                  </Link>
                </li>
              );
            }

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "group relative mr-3 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium",
                    "transition-all duration-200 ease-out border overflow-hidden",
                    active
                      ? "text-white shadow-lg border-blue-400/50"
                      : "text-gray-300 border-white/[0.08] hover:text-white hover:border-white/20",
                  )}
                  style={
                    active
                      ? {
                          background: "rgba(37,99,235,0.85)",
                          boxShadow: "0 4px 16px rgba(55,114,255,0.28)",
                        }
                      : undefined
                  }
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "linear-gradient(to right, rgba(255,255,255,0.08), rgba(255,255,255,0.04))";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                    }
                  }}
                >
                  <ShineSweep />

                  {/* Animated blue glow overlay when active */}
                  {active && (
                    <span
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{ background: "rgba(55,114,255,0.1)", animation: "sidebarGlow 4s ease-in-out infinite" }}
                    />
                  )}

                  {/* Left gradient accent bar */}
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                      style={{ background: "linear-gradient(to bottom, #ffffff, #c1d3ff, #3772ff)" }}
                    />
                  )}

                  {/* Icon */}
                  <span className="relative z-10 w-5 h-5 flex items-center justify-center shrink-0">
                    <Icon
                      className="w-4 h-4 transition-transform duration-200"
                      style={{
                        color: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)",
                        transform: active ? "scale(1.1)" : undefined,
                      }}
                    />
                  </span>

                  {/* Label */}
                  <span className="relative z-10 flex-1 truncate">{label}</span>

                  {/* Pulsing dot for active */}
                  {active && (
                    <span
                      className="relative z-10 w-2 h-2 rounded-full bg-white shrink-0"
                      style={{ animation: "sidebarDot 2s ease-in-out infinite" }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <style>{`
        @keyframes sidebarGlow {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
        @keyframes sidebarDot {
          0%, 100% { transform: scale(1);   opacity: 1;   }
          50%       { transform: scale(1.2); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
