import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { LazyWaterRippleGallery as WaterRippleGallery } from "./water-effect/LazyWaterRippleGallery";
import { HeroIntro } from "./HeroIntro";

const HERO_GALLERY_IMAGES = [
  { src: "/wheelchair.png", alt: "Доступная городская среда для колясочников" },
  { src: "/visually-impaired.png", alt: "Доступная среда для незрячих и слабовидящих" },
  { src: "/walking-cane.png", alt: "Доступная среда для людей с ограниченной мобильностью" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* ── Base background — matches intro overlay exactly ── */}
      <div className="absolute inset-0" style={{ background: "#040d14" }} />

      {/* ── Full-bleed WebGL gallery — starts below fixed navbar (h-20 = 5rem) ── */}
      <WaterRippleGallery
        images={HERO_GALLERY_IMAGES}
        className="absolute top-20 left-0 right-0 bottom-0 z-[1]"
      />

      {/* ── Overlay: mirrors the intro text-phase gradient exactly ── */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: [
            "linear-gradient(to right, rgba(4,13,20,0.93) 0%, rgba(4,13,20,0.82) 30%, rgba(4,13,20,0.45) 58%, rgba(4,13,20,0.05) 80%, transparent 100%)",
            "linear-gradient(to bottom, rgba(4,13,20,0.55) 0%, transparent 25%)",
            "linear-gradient(to top,    rgba(4,13,20,0.7)  0%, transparent 30%)",
          ].join(", "),
        }}
      />

      {/* ── Grain texture ── */}
      <div
        className="absolute inset-0 z-[3] opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Content ── */}
      <div className="pointer-events-none relative z-[4] w-full max-w-7xl mx-auto px-6 lg:px-10 py-28 lg:py-0 lg:min-h-screen flex items-center">
        <div className="pointer-events-auto max-w-xl lg:max-w-2xl text-left">

          {/* Status badge */}
          <div className="animate-fade-in flex items-center gap-2.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
            <span className="text-[11px] uppercase tracking-[0.18em] font-semibold" style={{ color: "rgba(255,255,255,0.45)" }}>
              Алматы · Казахстан · Платформа активна
            </span>
          </div>

          {/* Thin brand accent line */}
          <div className="animate-fade-in mb-7">
            <div className="h-px w-16" style={{ background: "rgba(6,182,212,0.7)" }} />
          </div>

          {/* Headline */}
          <div className="animate-fade-in-up mb-2">
            <h1>
              <span className="block text-4xl md:text-5xl xl:text-6xl font-black text-white leading-[1.05] tracking-tight">
                Доступный город
              </span>
              <span
                className="block text-[4.5rem] md:text-[6rem] xl:text-[7.5rem] font-black leading-none tracking-tighter mt-2"
                style={{
                  background: "linear-gradient(135deg, #06b6d4 0%, #3772ff 55%, #0ea5e9 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ДЛЯ ВСЕХ
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p
            className="animate-fade-in-up delay-200 text-base md:text-lg leading-relaxed mb-10 mt-7 max-w-md"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Платформа мониторинга и анализа доступности городской инфраструктуры
            для людей с инвалидностью
          </p>

          {/* CTA buttons */}
          <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row items-start gap-3 mb-14">
            <Link
              href="#map"
              className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-105 active:scale-100 text-white"
              style={{
                background: "#3772ff",
                boxShadow: "0 0 36px rgba(55,114,255,0.55), 0 0 80px rgba(55,114,255,0.2)",
              }}
            >
              <MapPin className="w-4 h-4" />
              Открыть карту
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-sm transition-all hover:bg-white/10"
              style={{ border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.85)" }}
            >
              Войти
            </Link>
          </div>

          {/* Stats — editorial */}
          <div className="animate-fade-in-up delay-400 flex items-center gap-0">
            {[
              { value: "40 000+", label: "объектов" },
              { value: "97", label: "показателей" },
              { value: "4", label: "категории" },
            ].map((s, i) => (
              <div key={s.label} className="flex items-stretch">
                {i > 0 && (
                  <div className="w-px mx-6 self-stretch" style={{ background: "rgba(255,255,255,0.12)" }} />
                )}
                <div>
                  <div className="text-3xl font-black text-white tabular-nums leading-none">{s.value}</div>
                  <div className="text-[10px] mt-1.5 uppercase tracking-[0.15em] font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Hero intro (plays once per session) ── */}
      <HeroIntro />

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in delay-600 z-[4]">
        <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.25)" }}>прокрутите вниз</div>
        <div className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent" />
      </div>
    </section>
  );
}
