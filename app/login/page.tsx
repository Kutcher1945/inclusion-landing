import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "./LoginForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ShineSweep } from "@/components/ui/ShineSweep";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export const metadata = { title: "Вход — Паспортизация" };

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const redirectTo =
    typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/passports";

  return (
    <div className="min-h-screen flex">
      {/* ── Brand panel ── */}
      <div className="hidden lg:flex lg:w-[52%] brand-gradient flex-col justify-between p-12 text-white relative overflow-hidden">

        {/* Fine grid */}
        <div className="absolute inset-0 opacity-[0.045]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }} />

        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(55,114,255,0.28), transparent 65%)" }} />
        <div className="absolute bottom-0 right-0 w-[320px] h-[320px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(106,163,255,0.15), transparent 65%)" }} />

        {/* City-network visualization */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" style={{ opacity: 0.13 }}>
          <svg viewBox="0 0 420 420" className="w-full h-full max-w-[520px]" fill="none">
            {/* Horizontal grid lines */}
            {[70,130,190,250,310,370].map(y => (
              <line key={`h${y}`} x1="30" y1={y} x2="390" y2={y} stroke="white" strokeWidth="0.6" />
            ))}
            {/* Vertical grid lines */}
            {[30,102,174,246,318,390].map(x => (
              <line key={`v${x}`} x1={x} y1="30" x2={x} y2="390" stroke="white" strokeWidth="0.6" />
            ))}
            {/* All intersection nodes */}
            {[70,130,190,250,310,370].flatMap(y =>
              [30,102,174,246,318,390].map(x => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="white" />
              ))
            )}
          </svg>
        </div>

        {/* Highlighted route overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg viewBox="0 0 420 420" className="w-full h-full max-w-[520px]" fill="none">
            {/* Accessible path highlight */}
            <polyline points="102,130 174,130 174,190 246,190 246,250 318,250" stroke="#3772ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
            <polyline points="30,250 102,250 102,310 174,310" stroke="#6aa3ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" />
            {/* Key nodes */}
            {[
              [174, 190, 9, "#3772ff", "rgba(55,114,255,0.25)"],
              [246, 250, 8, "#3772ff", "rgba(55,114,255,0.25)"],
              [102, 250, 7, "#6aa3ff", "rgba(106,163,255,0.2)"],
            ].map(([cx, cy, r, fill, glow]) => (
              <g key={`${cx}-${cy}`}>
                <circle cx={cx as number} cy={cy as number} r={(r as number) + 6} fill={glow as string} />
                <circle cx={cx as number} cy={cy as number} r={r as number} fill="none" stroke={fill as string} strokeWidth="1.5" opacity="0.7" />
                <circle cx={cx as number} cy={cy as number} r={(r as number) - 4} fill={fill as string} opacity="0.9" />
              </g>
            ))}
          </svg>
        </div>

        {/* Top: logo + back link */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-14">
            <Link
              href="/"
              className="group relative overflow-hidden flex items-center rounded-xl border border-white/[0.12] px-3 py-2 transition-colors duration-200 hover:bg-white/[0.05] hover:border-white/[0.25]"
            >
              <ShineSweep />
              <Image
                src="/logo-white-letters.png"
                alt="Инклюзия"
                width={1286}
                height={362}
                className="relative z-10 w-auto h-12"
                priority
              />
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 shrink-0" stroke="currentColor" strokeWidth={1.8}>
                <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Главная
            </Link>
          </div>

          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 border"
            style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.65)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.5)]" />
            Система активна · Алматы
          </div>

          <h1 className="text-[2.6rem] font-bold tracking-tight leading-[1.1] mb-4">
            Паспортизация
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed max-w-[280px]">
            Административная панель для управления паспортами доступности объектов городской инфраструктуры
          </p>
        </div>

        {/* Stats row */}
        <div className="relative z-10 grid grid-cols-3 gap-3 mb-10">
          {[
            { value: "40 000+", label: "объектов" },
            { value: "97", label: "показателей" },
            { value: "4", label: "категории" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl py-4 px-3 text-center"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.09)" }}>
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="relative z-10 text-[11px] text-white/30 tracking-wide">
          Доступ только для сотрудников · Almaty Smart City
        </div>
      </div>

      {/* ── Form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative bg-background">
        {/* Dot grid texture — adapts via currentColor opacity */}
        <div className="absolute inset-0 opacity-[0.18] dark:opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        {/* Mobile back link + theme toggle */}
        <div className="absolute top-5 left-5 right-5 flex items-center justify-between lg:hidden">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-foreground/40 hover:text-foreground/70 transition-colors">
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth={1.8}>
              <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Главная
          </Link>
          <ThemeToggle className="p-1.5 rounded-lg text-foreground/35 hover:text-foreground hover:bg-foreground/[0.06] transition-colors" />
        </div>

        {/* Theme toggle desktop */}
        <div className="absolute top-5 right-5 hidden lg:block">
          <ThemeToggle className="p-1.5 rounded-lg text-foreground/35 hover:text-foreground hover:bg-foreground/[0.06] transition-colors" />
        </div>

        {/* Form card */}
        <div className="relative z-10 w-full max-w-[360px]">
          <div
            className="bg-surface rounded-3xl px-8 py-10 border border-foreground/[0.07]"
            style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.06), 0 20px 48px -8px rgba(15,23,42,0.1)" }}
          >
            {/* Lock icon */}
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-7"
              style={{ background: "linear-gradient(135deg, #3772ff 0%, #6aa3ff 100%)", boxShadow: "0 4px 14px rgba(55,114,255,0.35)" }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>

            <div className="mb-7">
              <h2 className="text-[1.45rem] font-semibold text-foreground tracking-tight mb-1">
                Вход в систему
              </h2>
              <p className="text-sm text-foreground/45">
                Введите учётные данные для доступа к панели
              </p>
            </div>

            <LoginForm redirectTo={redirectTo} />
          </div>

          <p className="mt-5 text-center text-sm text-foreground/35">
            <Link href="/" className="hover:text-foreground/60 transition-colors">
              ← На главную
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
