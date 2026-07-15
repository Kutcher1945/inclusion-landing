import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { ShineSweep } from "@/components/ui/ShineSweep";

export function CTA() {
  return (
    <section id="cta" className="py-28 bg-[#070e1b] relative overflow-hidden">
      {/* Ambient glows */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-3xl opacity-[0.1] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, #3772ff, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full blur-3xl opacity-[0.06] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, #8b5cf6, transparent 70%)" }}
      />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        {/* Eyebrow */}
        <span className="inline-block text-[11px] font-semibold tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-6 text-[#3772ff] bg-[#3772ff]/10 border border-[#3772ff]/20">
          Начните сейчас
        </span>

        {/* Headline */}
        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-[1.05]">
          Начните улучшать{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #06b6d4 0%, #3772ff 55%, #0ea5e9 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            доступность города
          </span>
          {" "}уже сегодня
        </h2>

        <p className="text-lg text-white/45 mb-12 max-w-xl mx-auto leading-relaxed">
          Запросите демо-доступ и убедитесь в возможностях платформы на реальных данных Алматы
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="mailto:demo@inclusion.kz"
            className="group relative overflow-hidden flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-sm text-white transition-all hover:scale-105 active:scale-100"
            style={{
              background: "#3772ff",
              boxShadow: "0 0 40px rgba(55,114,255,0.55), 0 0 100px rgba(55,114,255,0.2)",
            }}
          >
            <ShineSweep />
            <span className="relative z-10 flex items-center gap-2.5">
              <ArrowRight className="w-4 h-4" />
              Запросить демо
            </span>
          </Link>

          <Link
            href="mailto:info@inclusion.kz"
            className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl font-semibold text-sm transition-all hover:bg-white/[0.06]"
            style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.75)" }}
          >
            <Mail className="w-4 h-4" />
            Связаться с нами
          </Link>
        </div>

        {/* Trust note */}
        <p className="mt-10 text-[11px] uppercase tracking-[0.2em] text-white/20">
          Акимат города Алматы · Официальная платформа доступности
        </p>
      </div>
    </section>
  );
}
