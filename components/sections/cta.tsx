import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

export function CTA() {
  return (
    <section id="cta" className="py-28 bg-neutral-50">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div
          className="animate-scale-in rounded-3xl p-12 md:p-16 relative overflow-hidden brand-gradient"
        >
          {/* Radial glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] blur-3xl opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle, #6aa3ff, transparent 70%)" }}
          />

          <div className="relative z-10">
            <span
              className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-6"
              style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
            >
              Начните сейчас
            </span>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-5 tracking-tight leading-tight">
              Начните улучшать доступность
              <br className="hidden md:block" /> города уже сегодня
            </h2>

            <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>
              Запросите демо-доступ и убедитесь в возможностях платформы на реальных данных
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="mailto:demo@inclusion.kz"
                className="group flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-sm bg-white transition-all hover:scale-105 active:scale-100 hover:shadow-xl"
                style={{ color: "#3772ff" }}
              >
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                Запросить демо
              </Link>
              <Link
                href="mailto:info@inclusion.kz"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-sm border text-white transition-all hover:bg-white/10"
                style={{ borderColor: "rgba(255,255,255,0.25)" }}
              >
                <Mail className="w-4 h-4" />
                Связаться с нами
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
