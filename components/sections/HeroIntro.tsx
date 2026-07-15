"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";

/*
 * Card positions derived from RipplePlanes.ts (desktop, count=3):
 *   planeWidth = viewWidth / 4.5  → 22.22%
 *   margin     = viewWidth / 7.5  → 13.33%
 *   space      = (viewWidth - 2*margin - planeWidth) / 2 → 25.56%
 */

type Phase = "dark" | "img0" | "img1" | "img2" | "bw" | "logo" | "text" | "exit" | "done";
const ORDER: Phase[] = ["dark", "img0", "img1", "img2", "bw", "logo", "text", "exit", "done"];

const IMAGES = ["/wheelchair.png", "/visually-impaired.png", "/walking-cane.png"];
const LEFTS  = ["13.33%", "38.89%", "64.44%"];
const TAGLINE = "Платформа мониторинга и анализа доступности городской инфраструктуры для людей с инвалидностью";

const CARD_W = "calc(100% / 4.5)";
const CARD_H = "calc((100vh - 80px) * 0.92)";
const CARD_T = "calc(80px + (100vh - 80px) * 0.04)";
const CARD_R = "clamp(14px, 1.56vw, 24px)";

export function HeroIntro() {
  const [phase, setPhase]     = useState<Phase | null>(null);
  const [typed, setTyped]     = useState("");
  const [headIn, setHeadIn]   = useState(false);
  const [btnsIn, setBtnsIn]   = useState(false);
  const [statsIn, setStatsIn] = useState(false);
  const typerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Main sequence ──
  useEffect(() => {
    if (sessionStorage.getItem("intro_done")) return;
    sessionStorage.setItem("intro_done", "1");

    setPhase("dark");
    const t = [
      setTimeout(() => setPhase("img0"),  350),
      setTimeout(() => setPhase("img1"),  1450),
      setTimeout(() => setPhase("img2"),  2550),
      setTimeout(() => setPhase("bw"),    3700),
      setTimeout(() => setPhase("logo"),  4700),
      setTimeout(() => setPhase("text"),  6400),
      setTimeout(() => setPhase("exit"),  11000),  // extended: full hero visible 4.6s
      setTimeout(() => setPhase("done"),  11800),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  // ── Text phase: staggered reveal via timers ──
  useEffect(() => {
    if (phase !== "text") return;

    // Headline slides in immediately
    setHeadIn(true);

    // Buttons appear at 1.3s
    const t1 = setTimeout(() => setBtnsIn(true), 1300);

    // Stats appear at 1.8s
    const t2 = setTimeout(() => setStatsIn(true), 1800);

    // Tagline starts typing at 600ms (after headlines settled)
    let i = 0;
    const typeDelay = setTimeout(() => {
      typerRef.current = setInterval(() => {
        i++;
        setTyped(TAGLINE.slice(0, i));
        if (i >= TAGLINE.length && typerRef.current) {
          clearInterval(typerRef.current);
          typerRef.current = null;
        }
      }, 24);
    }, 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(typeDelay);
      if (typerRef.current) clearInterval(typerRef.current);
    };
  }, [phase]);

  if (!phase || phase === "done") return null;

  const pIdx        = ORDER.indexOf(phase);
  const imgVisible  = (i: number) => pIdx >= i + 1 && pIdx <= 6;
  const isGrayscale = pIdx >= 4;

  // Shared slide-up transition helper
  const slideIn = (active: boolean, delayMs = 0) => ({
    transform:  active ? "translateY(0)"   : "translateY(14px)",
    opacity:    active ? 1                 : 0,
    transition: `transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delayMs}ms, opacity 0.55s ease ${delayMs}ms`,
  });

  return (
    <div
      className="absolute inset-0 z-[5]"
      style={{
        opacity:       phase === "exit" ? 0 : 1,
        transition:    "opacity 0.85s ease",
        pointerEvents: phase === "exit" ? "none" : "auto",
        background:    "#040d14",
        overflow:      "hidden",
      }}
    >
      {/* ── Cards — identical position/size to Three.js planes ── */}
      {IMAGES.map((src, i) => (
        <div
          key={src}
          style={{
            position:     "absolute",
            left:         LEFTS[i],
            top:          CARD_T,
            width:        CARD_W,
            height:       CARD_H,
            borderRadius: CARD_R,
            overflow:     "hidden",
            opacity:      imgVisible(i) ? 1 : 0,
            transition:   "opacity 0.7s ease",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            style={{
              width:      "100%",
              height:     "100%",
              objectFit:  "cover",
              display:    "block",
              filter:     isGrayscale ? "brightness(0.5) grayscale(1)" : "brightness(0.85)",
              transition: "filter 1.1s ease",
            }}
          />
        </div>
      ))}

      {/* ── Logo ── */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity:    phase === "logo" ? 1 : 0,
          transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div className="absolute inset-0" style={{ background: "rgba(4,13,20,0.65)" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-white-letters.png"
          alt="Инклюзия"
          className="relative"
          style={{
            width:      "min(360px, 58vw)",
            transform:  phase === "logo" ? "scale(1)" : "scale(0.86)",
            transition: "transform 0.9s cubic-bezier(0.16,1,0.3,1)",
            filter:     "drop-shadow(0 0 60px rgba(55,114,255,0.75)) drop-shadow(0 0 20px rgba(55,114,255,0.4))",
          }}
        />
      </div>

      {/* ── Text phase — mirrors real hero content exactly ── */}
      <div
        className="absolute inset-0 flex items-center pointer-events-none"
        style={{
          opacity:    phase === "text" || phase === "exit" ? 1 : 0,
          transition: "opacity 0.5s ease",
          background: [
            "linear-gradient(to right, rgba(4,13,20,0.93) 0%, rgba(4,13,20,0.82) 30%, rgba(4,13,20,0.45) 58%, rgba(4,13,20,0.05) 80%, transparent 100%)",
            "linear-gradient(to bottom, rgba(4,13,20,0.55) 0%, transparent 25%)",
            "linear-gradient(to top,    rgba(4,13,20,0.7)  0%, transparent 30%)",
          ].join(", "),
        }}
      >
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-xl lg:max-w-2xl">

            {/* Badge */}
            <div style={{ overflow: "hidden", marginBottom: "1.5rem" }}>
              <div
                className="flex items-center gap-2.5"
                style={{
                  transform:  headIn ? "translateY(0)" : "translateY(110%)",
                  transition: "transform 0.9s cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
                <span className="text-[11px] uppercase tracking-[0.18em] font-semibold" style={{ color: "rgba(255,255,255,0.45)" }}>
                  Алматы · Казахстан · Платформа активна
                </span>
              </div>
            </div>

            {/* Accent line */}
            <div style={{ overflow: "hidden", marginBottom: "1.75rem" }}>
              <div
                className="h-px w-16"
                style={{
                  background:  "rgba(6,182,212,0.7)",
                  transform:   headIn ? "translateX(0)" : "translateX(-100%)",
                  transition:  "transform 0.9s cubic-bezier(0.16,1,0.3,1) 80ms",
                }}
              />
            </div>

            {/* Headline 1 */}
            <div style={{ overflow: "hidden", marginBottom: "0.5rem" }}>
              <h1
                className="text-4xl md:text-5xl xl:text-6xl font-black text-white leading-[1.05] tracking-tight"
                style={{
                  transform:  headIn ? "translateY(0)" : "translateY(110%)",
                  opacity:    headIn ? 1 : 0,
                  transition: "transform 1s cubic-bezier(0.16,1,0.3,1) 150ms, opacity 0.6s ease 150ms",
                }}
              >
                Доступный город
              </h1>
            </div>

            {/* Headline 2 — gradient */}
            <div style={{ overflow: "hidden", marginBottom: "1.75rem" }}>
              <h1
                className="font-black leading-none tracking-tighter"
                style={{
                  fontSize: "clamp(3.5rem, 9vw, 7.5rem)",
                  background: "linear-gradient(135deg, #06b6d4 0%, #3772ff 55%, #0ea5e9 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor:  "transparent",
                  backgroundClip:       "text",
                  transform:  headIn ? "translateY(0)" : "translateY(110%)",
                  opacity:    headIn ? 1 : 0,
                  transition: "transform 1s cubic-bezier(0.16,1,0.3,1) 290ms, opacity 0.6s ease 290ms",
                }}
              >
                ДЛЯ ВСЕХ
              </h1>
            </div>

            {/* Tagline — typewriter */}
            <p
              className="text-base md:text-lg leading-relaxed max-w-md"
              style={{ color: "rgba(255,255,255,0.5)", minHeight: "3.5rem", marginBottom: "2.5rem" }}
            >
              {typed}
              {typed.length > 0 && typed.length < TAGLINE.length && (
                <span
                  className="inline-block w-[2px] h-[1.1em] ml-0.5 align-middle animate-pulse"
                  style={{ background: "rgba(255,255,255,0.6)" }}
                />
              )}
            </p>

            {/* CTA buttons */}
            <div
              className="flex flex-col sm:flex-row items-start gap-3 mb-14"
              style={slideIn(btnsIn)}
            >
              <a
                href="#map"
                className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-sm text-white"
                style={{
                  background: "#3772ff",
                  boxShadow:  "0 0 36px rgba(55,114,255,0.55), 0 0 80px rgba(55,114,255,0.2)",
                }}
              >
                <MapPin className="w-4 h-4" />
                Открыть карту
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="/login"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-sm"
                style={{ border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.85)" }}
              >
                Войти
              </a>
            </div>

            {/* Stats */}
            <div
              className="flex items-center gap-0"
              style={slideIn(statsIn, 80)}
            >
              {[
                { value: "40 000+", label: "объектов"    },
                { value: "97",      label: "показателей" },
                { value: "4",       label: "категории"   },
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
      </div>

    </div>
  );
}
