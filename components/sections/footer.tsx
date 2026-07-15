import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Phone, ArrowRight } from "lucide-react";
import { ShineSweep } from "@/components/ui/ShineSweep";

export function Footer() {
  return (
    <footer className="bg-[#040b14] relative overflow-hidden">
      {/* Top glow separator */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px"
        style={{ background: "linear-gradient(to right, transparent, rgba(55,114,255,0.4), transparent)" }}
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-20 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top, rgba(55,114,255,0.08) 0%, transparent 70%)" }}
      />

      {/* Ghost watermark */}
      <div
        className="absolute bottom-8 right-0 text-[11rem] font-black leading-none pointer-events-none select-none tracking-tighter pr-6"
        style={{ color: "rgba(255,255,255,0.055)" }}
      >
        ИНКЛЮЗИЯ
      </div>

      <div className="relative max-w-7xl mx-auto px-6">

        {/* ── Editorial CTA block ── */}
        <div className="py-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-8 border-b border-white/[0.06]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/25 mb-3">Платформа доступности</p>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
              Доступный город{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #06b6d4 0%, #3772ff 55%, #0ea5e9 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                для всех
              </span>
            </h2>
          </div>
          <Link
            href="/login"
            className="group relative overflow-hidden inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-semibold text-sm text-white shrink-0 transition-all hover:scale-105 active:scale-100"
            style={{
              background: "#3772ff",
              boxShadow: "0 0 28px rgba(55,114,255,0.4)",
            }}
          >
            <ShineSweep />
            <span className="relative z-10">Открыть платформу</span>
            <ArrowRight className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* ── Main footer grid ── */}
        <div className="py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">

          {/* Brand — 5 cols */}
          <div className="lg:col-span-5">
            <Link
              href="/"
              className="group relative overflow-hidden inline-flex items-center rounded-xl border border-white/[0.1] px-3 py-2 mb-5 transition-all duration-200 hover:bg-white/[0.05] hover:border-white/[0.2]"
            >
              <ShineSweep />
              <Image
                src="/logo-white-letters.png"
                alt="Инклюзия"
                width={1286}
                height={362}
                className="relative z-10 w-auto h-10"
              />
            </Link>
            <p className="text-sm text-white/35 leading-relaxed max-w-xs mb-6">
              Платформа мониторинга доступности городской инфраструктуры для людей с инвалидностью в городе Алматы.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { label: "Казахстан",  style: "text-white/30 bg-white/[0.05] border-white/[0.07]" },
                { label: "Алматы",     style: "text-white/30 bg-white/[0.05] border-white/[0.07]" },
              ].map((t) => (
                <span key={t.label} className={`text-[11px] px-2.5 py-1 rounded-lg border ${t.style}`}>
                  {t.label}
                </span>
              ))}
              <span className="text-[11px] px-2.5 py-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Активна
              </span>
            </div>
          </div>

          {/* Nav links — 3 cols */}
          <div className="lg:col-span-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-5">Платформа</h4>
            <ul className="space-y-3">
              {[
                ["#features",  "Возможности"],
                ["#how",       "Как работает"],
                ["#analytics", "Аналитика"],
                ["#map",       "Карта объектов"],
                ["/login",     "Войти"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-[#3772ff] transition-all duration-200 shrink-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts — 4 cols */}
          <div className="lg:col-span-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-5">Контакты</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:info@inclusion.kz"
                  className="group flex items-center gap-3 text-sm text-white/40 hover:text-white transition-colors"
                >
                  <span className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.07] flex items-center justify-center shrink-0 group-hover:border-[#3772ff]/30 group-hover:bg-[#3772ff]/10 transition-colors">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  info@inclusion.kz
                </a>
              </li>
              <li>
                <a
                  href="tel:+77272000000"
                  className="group flex items-center gap-3 text-sm text-white/40 hover:text-white transition-colors"
                >
                  <span className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.07] flex items-center justify-center shrink-0 group-hover:border-[#3772ff]/30 group-hover:bg-[#3772ff]/10 transition-colors">
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  +7 (727) 200-00-00
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-sm text-white/40">
                  <span className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.07] flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                  </span>
                  <span className="leading-relaxed">
                    г. Алматы, пр. Абая 1<br />
                    <span className="text-white/25 text-xs">Акимат города Алматы</span>
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-white/[0.06] py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} ИС «Инклюзия». Все права защищены.
          </p>
          <p className="text-xs text-white/20">
            Разработано для Акимата города Алматы
          </p>
        </div>

      </div>
    </footer>
  );
}
