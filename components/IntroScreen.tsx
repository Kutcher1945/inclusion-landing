"use client";

import { useEffect, useState } from "react";

type Stage = "img0" | "img1" | "img2" | "logo" | "text" | "exit" | "gone";

const STAGE_ORDER: Stage[] = ["img0", "img1", "img2", "logo", "text", "exit", "gone"];

const IMAGES = [
  { src: "/wheelchair.png",        label: "Доступная среда" },
  { src: "/visually-impaired.png", label: "Для незрячих"   },
  { src: "/walking-cane.png",      label: "Для всех"       },
];

export function IntroScreen() {
  const [stage, setStage] = useState<Stage | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("intro_done")) return;
    sessionStorage.setItem("intro_done", "1");

    setStage("img0");

    const timers = [
      setTimeout(() => setStage("img1"),  1600),
      setTimeout(() => setStage("img2"),  3200),
      setTimeout(() => setStage("logo"),  4800),
      setTimeout(() => setStage("text"),  6400),
      setTimeout(() => setStage("exit"),  8800),
      setTimeout(() => setStage("gone"),  9600),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  if (!stage || stage === "gone") return null;

  const stageIdx = STAGE_ORDER.indexOf(stage);

  const skip = () => {
    setStage("exit");
    setTimeout(() => setStage("gone"), 700);
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#040d14] overflow-hidden flex items-center justify-center transition-opacity duration-700 ${
        stage === "exit" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* ── Images (crossfade) ── */}
      {IMAGES.map((img, i) => {
        const imgStage = `img${i}` as Stage;
        const imgIdx = STAGE_ORDER.indexOf(imgStage);
        const isActive = imgIdx === stageIdx;

        return (
          <div
            key={img.src}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: isActive ? 1 : 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt=""
              className="w-full h-full object-cover"
              style={{
                filter: "brightness(0.5) grayscale(0.25)",
                transform: isActive ? "scale(1.0)" : "scale(1.06)",
                transition: "transform 4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.7s ease",
              }}
            />
            {/* Vignette */}
            <div
              className="absolute inset-0"
              style={{
                background: [
                  "radial-gradient(ellipse at center, transparent 20%, rgba(4,13,20,0.65) 100%)",
                  "linear-gradient(to bottom, rgba(4,13,20,0.4) 0%, transparent 30%)",
                  "linear-gradient(to top, rgba(4,13,20,0.6) 0%, transparent 30%)",
                ].join(", "),
              }}
            />
            {/* Label */}
            <div
              className="absolute bottom-12 left-1/2 -translate-x-1/2 transition-all duration-500"
              style={{ opacity: isActive ? 1 : 0 }}
            >
              <span className="text-[11px] uppercase tracking-[0.3em] text-white/40 font-medium">
                {img.label}
              </span>
            </div>
          </div>
        );
      })}

      {/* ── Image counter dots ── */}
      <div
        className="absolute bottom-12 right-8 flex gap-1.5 transition-opacity duration-500"
        style={{ opacity: stageIdx < 3 ? 1 : 0 }}
      >
        {IMAGES.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-400"
            style={{
              width:      i === stageIdx ? 20 : 6,
              height:     6,
              background: i === stageIdx ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>

      {/* ── Logo ── */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-all duration-700"
        style={{
          opacity:   stage === "logo" ? 1 : 0,
          transform: stage === "logo" ? "scale(1)" : "scale(0.88)",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-white-letters.png"
          alt="Инклюзия"
          className="w-64 md:w-96"
          style={{ filter: "drop-shadow(0 0 48px rgba(55,114,255,0.55))" }}
        />
      </div>

      {/* ── Text reveal ── */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
        style={{ opacity: stage === "text" || stage === "exit" ? 1 : 0 }}
      >
        <div className="text-center px-6 select-none">
          {/* City badge */}
          <div className="overflow-hidden mb-6">
            <p
              className="text-xs md:text-sm font-semibold tracking-[0.25em] uppercase text-white/35"
              style={{
                transform: stage === "text" || stage === "exit" ? "translateY(0)" : "translateY(120%)",
                transition: "transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0ms",
              }}
            >
              Алматы · Казахстан
            </p>
          </div>

          {/* Line 1: Доступный город */}
          <div className="flex flex-wrap justify-center gap-x-5 mb-2">
            {["Доступный", "город"].map((word, i) => (
              <div key={word} className="overflow-hidden">
                <span
                  className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight"
                  style={{
                    transform: stage === "text" || stage === "exit" ? "translateY(0)" : "translateY(115%)",
                    opacity:   stage === "text" || stage === "exit" ? 1 : 0,
                    transition: [
                      `transform 1s cubic-bezier(0.16, 1, 0.3, 1) ${80 + i * 110}ms`,
                      `opacity   0.6s ease ${80 + i * 110}ms`,
                    ].join(", "),
                  }}
                >
                  {word}
                </span>
              </div>
            ))}
          </div>

          {/* Line 2: ДЛЯ ВСЕХ (gradient) */}
          <div className="flex flex-wrap justify-center gap-x-4">
            {["ДЛЯ", "ВСЕХ"].map((word, i) => (
              <div key={word} className="overflow-hidden">
                <span
                  className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight"
                  style={{
                    background: "linear-gradient(135deg, #06b6d4 0%, #3772ff 55%, #0ea5e9 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    transform: stage === "text" || stage === "exit" ? "translateY(0)" : "translateY(115%)",
                    opacity:   stage === "text" || stage === "exit" ? 1 : 0,
                    transition: [
                      `transform 1s cubic-bezier(0.16, 1, 0.3, 1) ${300 + i * 130}ms`,
                      `opacity   0.6s ease ${300 + i * 130}ms`,
                    ].join(", "),
                  }}
                >
                  {word}
                </span>
              </div>
            ))}
          </div>

          {/* Tagline */}
          <div className="overflow-hidden mt-7">
            <p
              className="text-sm md:text-base text-white/30 tracking-wide"
              style={{
                transform: stage === "text" || stage === "exit" ? "translateY(0)" : "translateY(120%)",
                opacity:   stage === "text" || stage === "exit" ? 1 : 0,
                transition: "transform 1s cubic-bezier(0.16, 1, 0.3, 1) 600ms, opacity 0.6s ease 600ms",
              }}
            >
              Платформа мониторинга доступности городской инфраструктуры
            </p>
          </div>
        </div>
      </div>

      {/* ── Skip button ── */}
      <button
        onClick={skip}
        className="absolute bottom-8 right-8 text-[11px] uppercase tracking-[0.2em] text-white/25 hover:text-white/60 transition-colors"
      >
        Пропустить
      </button>
    </div>
  );
}
