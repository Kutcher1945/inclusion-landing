import { FileText, BarChart3, MapPin, Smartphone, MessageSquare, Building2 } from "lucide-react";

export function Features() {
  return (
    <section
      id="features"
      className="py-28 bg-[#070e1b] relative overflow-hidden"
      style={{
        borderRadius: "52px 52px 0 0",
        boxShadow: [
          "inset 0 40px 100px rgba(0,0,0,0.75)",
          "inset 0 1px 0 rgba(255,255,255,0.06)",
        ].join(", "),
      }}
    >
      {/* Ambient glows */}
      <div
        className="absolute top-0 left-1/4 w-[700px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(55,114,255,0.055) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)" }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-[11px] font-semibold tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-5 text-[#3772ff] bg-[#3772ff]/10 border border-[#3772ff]/20">
            Возможности
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Всё для управления{" "}
            <span style={{
              background: "linear-gradient(135deg, #3772ff 0%, #6aa3ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              доступностью
            </span>
          </h2>
          <p className="text-white/35 text-lg max-w-xl mx-auto leading-relaxed">
            Единая платформа от сбора данных до принятия управленческих решений
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">

          {/* ── Card 1: Паспорта доступности ── */}
          <div className="md:col-span-7 group relative rounded-2xl bg-white/[0.04] border border-white/[0.07] overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
            <div className="h-[3px]" style={{ background: "linear-gradient(to right, #3772ff, #6aa3ff, transparent)" }} />
            <div className="p-6">
              <div
                className="absolute top-6 right-6 w-64 h-64 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(55,114,255,0.12) 0%, transparent 70%)" }}
              />
              {/* Passport mockup */}
              <div className="mb-6 rounded-xl bg-[#0a1628] border border-white/[0.06] p-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.05] mb-3">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Паспорт объекта</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3772ff]/15 text-[#6aa3ff]">ТЦ «Апорт»</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { name: "Пандус при входе",       pct: 100, state: "ok"   },
                    { name: "Ширина дверных проёмов", pct: 85,  state: "ok"   },
                    { name: "Лифт / подъёмник",       pct: 70,  state: "ok"   },
                    { name: "Тактильные плитки",      pct: 40,  state: "warn" },
                    { name: "Туалет для МГН",         pct: 90,  state: "ok"   },
                  ].map((row) => (
                    <div key={row.name} className="flex items-center gap-2.5">
                      <span className="text-[10px] text-white/35 w-36 shrink-0 truncate">{row.name}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${row.pct}%`,
                            background: row.state === "warn"
                              ? "linear-gradient(to right, #f59e0b, #fbbf24)"
                              : "linear-gradient(to right, #3772ff, #6aa3ff)",
                          }}
                        />
                      </div>
                      <span className={`text-[11px] w-4 text-center font-bold ${row.state === "warn" ? "text-amber-400" : "text-emerald-400"}`}>
                        {row.state === "warn" ? "!" : "✓"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/[0.05]">
                  <span className="text-[9px] text-white/25">97 показателей</span>
                  <span className="text-[9px] text-emerald-400/60">● Обновлено сегодня</span>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(55,114,255,0.15)" }}>
                  <FileText className="w-4 h-4 text-[#6aa3ff]" />
                </div>
                <h3 className="text-white font-bold text-lg">Паспорта доступности</h3>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                97 показателей для каждого объекта — от пандусов и лифтов до тактильных навигаций и ширины дверей.
              </p>
            </div>
          </div>

          {/* ── Card 2: Аналитика ── */}
          <div className="md:col-span-5 group relative rounded-2xl bg-white/[0.04] border border-white/[0.07] overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
            <div className="h-[3px]" style={{ background: "linear-gradient(to right, #8b5cf6, #a78bfa, transparent)" }} />
            <div className="p-6">
              <div
                className="absolute top-6 right-6 w-64 h-64 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)" }}
              />
              {/* Analytics mockup */}
              <div className="mb-6 rounded-xl bg-[#0a1628] border border-white/[0.06] p-4">
                <div className="text-[10px] text-white/35 uppercase tracking-wider mb-4 font-medium">Районы по доступности</div>
                <div className="space-y-3">
                  {[
                    { name: "Медеуский",     pct: 78 },
                    { name: "Алмалинский",   pct: 61 },
                    { name: "Ауэзовский",    pct: 54 },
                    { name: "Бостандыкский", pct: 47 },
                    { name: "Алатауский",    pct: 38 },
                  ].map((d) => (
                    <div key={d.name} className="flex items-center gap-2.5">
                      <span className="text-[10px] text-white/35 w-24 shrink-0 truncate">{d.name}</span>
                      <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${d.pct}%`, background: "linear-gradient(to right, #8b5cf6, #a78bfa)" }}
                        />
                      </div>
                      <span className="text-[10px] text-white/40 w-8 text-right tabular-nums font-semibold">{d.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(139,92,246,0.15)" }}>
                  <BarChart3 className="w-4 h-4 text-[#a78bfa]" />
                </div>
                <h3 className="text-white font-bold text-lg">Аналитика и отчёты</h3>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                Сводные дашборды по районам, типам объектов, динамика изменений и экспорт в Excel.
              </p>
            </div>
          </div>

          {/* ── Card 3: Карта ── */}
          <div className="md:col-span-5 group relative rounded-2xl bg-white/[0.04] border border-white/[0.07] overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
            <div className="h-[3px]" style={{ background: "linear-gradient(to right, #0ea5e9, #38bdf8, transparent)" }} />
            <div className="p-6">
              <div
                className="absolute bottom-6 left-6 w-64 h-64 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)" }}
              />
              {/* Map mockup */}
              <div className="mb-6 rounded-xl bg-[#0a1628] border border-white/[0.06] overflow-hidden h-40 relative">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
                    backgroundSize: "14px 14px",
                  }}
                />
                {([
                  { l: "18%", t: "28%", c: "#3772ff", r: 5 },
                  { l: "42%", t: "18%", c: "#3772ff", r: 4 },
                  { l: "62%", t: "48%", c: "#ef4444", r: 5 },
                  { l: "28%", t: "62%", c: "#3772ff", r: 4 },
                  { l: "76%", t: "32%", c: "#10b981", r: 4 },
                  { l: "50%", t: "72%", c: "#3772ff", r: 5 },
                  { l: "14%", t: "78%", c: "#f59e0b", r: 3 },
                  { l: "82%", t: "64%", c: "#3772ff", r: 4 },
                  { l: "68%", t: "16%", c: "#10b981", r: 3 },
                  { l: "36%", t: "44%", c: "#8b5cf6", r: 5 },
                ] as { l: string; t: string; c: string; r: number }[]).map((pin, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      left: pin.l, top: pin.t,
                      width: pin.r * 2, height: pin.r * 2,
                      background: pin.c,
                      boxShadow: `0 0 ${pin.r * 3}px ${pin.c}`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                ))}
                <div
                  className="absolute rounded-full border border-[#3772ff]/30 animate-pulse"
                  style={{ left: "36%", top: "44%", width: 50, height: 50, transform: "translate(-50%, -50%)" }}
                />
                <div className="absolute bottom-2.5 left-0 right-0 text-center text-[9px] text-[#38bdf8]/60 font-medium tracking-wide">
                  40 000+ объектов · Алматы
                </div>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(14,165,233,0.15)" }}>
                  <MapPin className="w-4 h-4 text-[#38bdf8]" />
                </div>
                <h3 className="text-white font-bold text-lg">Геоинформационная карта</h3>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                Визуализация всех объектов на интерактивной карте города с фильтрами по типу и доступности.
              </p>
            </div>
          </div>

          {/* ── Card 4: Мобильный сбор ── */}
          <div className="md:col-span-7 group relative rounded-2xl bg-white/[0.04] border border-white/[0.07] overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
            <div className="h-[3px]" style={{ background: "linear-gradient(to right, #10b981, #34d399, transparent)" }} />
            <div className="p-6">
              <div
                className="absolute top-6 right-6 w-64 h-64 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)" }}
              />
              {/* Phone + stats */}
              <div className="mb-6 flex gap-4 items-stretch">
                <div className="shrink-0 w-24 rounded-2xl border border-white/[0.1] bg-[#0a1628] flex flex-col overflow-hidden">
                  <div className="h-4 bg-[#0d1f3c] flex items-center justify-center shrink-0">
                    <div className="w-8 h-1 bg-white/10 rounded-full" />
                  </div>
                  <div className="flex-1 p-2 flex flex-col gap-1.5 justify-between">
                    {[
                      { name: "Пандус", filled: 3 },
                      { name: "Лифт",   filled: 3 },
                      { name: "Туалет", filled: 2 },
                    ].map((field) => (
                      <div key={field.name} className="rounded-lg bg-white/[0.05] px-2 py-1.5">
                        <div className="text-[7px] text-white/25 mb-1">{field.name}</div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map((j) => (
                            <div
                              key={j}
                              className="flex-1 h-1 rounded-full"
                              style={{ background: j <= field.filled ? "#3772ff" : "rgba(255,255,255,0.08)" }}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="rounded-lg bg-[#3772ff] text-center py-1.5">
                      <span className="text-[7px] text-white font-semibold">Сохранить</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 rounded-xl bg-[#0a1628] border border-white/[0.06] p-4 flex flex-col justify-between">
                  <div className="text-[10px] text-white/35 uppercase tracking-wider font-medium">Активность</div>
                  <div className="space-y-2.5 my-3">
                    {[
                      { label: "Паспортов сегодня",  value: "47",     color: "#10b981" },
                      { label: "Инспекторов онлайн", value: "12",     color: "#3772ff" },
                      { label: "Офлайн данных",      value: "3.2 МБ", color: "#f59e0b" },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center justify-between">
                        <span className="text-[10px] text-white/35">{s.label}</span>
                        <span className="text-sm font-bold tabular-nums" style={{ color: s.color }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="text-[9px] text-white/25">Офлайн-режим активен</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(16,185,129,0.15)" }}>
                  <Smartphone className="w-4 h-4 text-[#34d399]" />
                </div>
                <h3 className="text-white font-bold text-lg">Мобильный сбор данных</h3>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                Инспекторы заполняют паспорта прямо на объекте через мобильное приложение с поддержкой офлайн-режима.
              </p>
            </div>
          </div>

          {/* ── Card 5: Обратная связь ── */}
          <div className="md:col-span-8 group relative rounded-2xl bg-white/[0.04] border border-white/[0.07] overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
            <div className="h-[3px]" style={{ background: "linear-gradient(to right, #f59e0b, #fbbf24, transparent)" }} />
            <div className="p-6">
              <div
                className="absolute bottom-6 left-6 w-64 h-64 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%)" }}
              />
              {/* Reviews */}
              <div className="mb-6 rounded-xl bg-[#0a1628] border border-white/[0.06] p-4 space-y-3">
                {[
                  { text: "Пандус сломан у входа в метро Абай",      stars: 2, color: "#ef4444", initials: "АМ", time: "2ч назад" },
                  { text: "Отличные пандусы! Лифт работает отлично",  stars: 5, color: "#10b981", initials: "СК", time: "вчера"   },
                  { text: "Нет тактильной плитки на первом этаже",    stars: 3, color: "#3772ff", initials: "НП", time: "2д назад" },
                ].map((r) => (
                  <div key={r.text} className="flex items-start gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                      style={{ background: `${r.color}20`, border: `1px solid ${r.color}30` }}
                    >
                      {r.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] text-white/60 truncate">{r.text}</span>
                        <span className="text-[9px] text-white/20 shrink-0">{r.time}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <svg key={s} className="w-2.5 h-2.5" viewBox="0 0 10 10">
                            <polygon
                              points="5,1 6.2,3.8 9.5,3.8 6.8,5.9 7.9,9 5,7 2.1,9 3.2,5.9 0.5,3.8 3.8,3.8"
                              fill={s <= r.stars ? r.color : "rgba(255,255,255,0.08)"}
                            />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(245,158,11,0.15)" }}>
                  <MessageSquare className="w-4 h-4 text-[#fbbf24]" />
                </div>
                <h3 className="text-white font-bold text-lg">Обратная связь от граждан</h3>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                Жители могут оставлять отзывы, оценки и сообщения о проблемах с привязкой к геолокации.
              </p>
            </div>
          </div>

          {/* ── Card 6: Панели для госорганов ── */}
          <div className="md:col-span-4 group relative rounded-2xl bg-white/[0.04] border border-white/[0.07] overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
            <div className="h-[3px]" style={{ background: "linear-gradient(to right, #ef4444, #f87171, transparent)" }} />
            <div className="p-6">
              <div
                className="absolute top-6 right-6 w-64 h-64 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(239,68,68,0.10) 0%, transparent 70%)" }}
              />
              {/* Gov stats */}
              <div className="mb-6 rounded-xl bg-[#0a1628] border border-white/[0.06] p-4 space-y-4">
                {[
                  { label: "Объектов проверено", value: "12 847", color: "#f87171" },
                  { label: "Новых паспортов",    value: "342",    color: "#f87171" },
                  { label: "Выполнение плана",   value: "89%",    color: "#10b981" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-[9px] text-white/25 uppercase tracking-wider mb-1 font-medium">{s.label}</div>
                    <div className="text-2xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(239,68,68,0.15)" }}>
                  <Building2 className="w-4 h-4 text-[#f87171]" />
                </div>
                <h3 className="text-white font-bold text-lg">Панели для госорганов</h3>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                Персонализированные дашборды для ответственных органов с мониторингом объектов по их ведомству.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
