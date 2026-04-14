import Link from "next/link";
import { ArrowRight, MapPin, BarChart3 } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden brand-gradient">
      {/* Noise/texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Radial glow blobs */}
      <div
        className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #3772ff, transparent 70%)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #6aa3ff, transparent 70%)" }}
      />

      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="animate-fade-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 border"
          style={{ borderColor: "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.8)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Платформа активна · Алматы, Казахстан
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up text-5xl md:text-7xl font-bold text-white leading-[1.08] tracking-tight mb-6">
          Доступный город{" "}
          <br />
          <span className="text-brand-gradient">для всех</span>
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-in-up delay-200 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto"
          style={{ color: "rgba(255,255,255,0.65)" }}>
          Платформа мониторинга и анализа доступности городской инфраструктуры
          для людей с инвалидностью
        </p>

        {/* CTA buttons */}
        <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="#map"
            className="group flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:opacity-90 hover:scale-105 active:scale-100"
            style={{ background: "#3772ff", color: "white" }}
          >
            <MapPin className="w-4 h-4" />
            Открыть карту
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="#cta"
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:bg-white/10 border"
            style={{ borderColor: "rgba(255,255,255,0.25)", color: "white" }}
          >
            Запросить доступ
          </Link>
        </div>

        {/* Stats row */}
        <div className="animate-fade-in-up delay-400 grid grid-cols-3 gap-4 max-w-xl mx-auto">
          {[
            { value: "5 000+", label: "объектов" },
            { value: "97", label: "показателей" },
            { value: "4", label: "категории" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl py-4 px-3 text-center"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in delay-600">
        <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>прокрутите вниз</div>
        <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
      </div>
    </section>
  );
}
