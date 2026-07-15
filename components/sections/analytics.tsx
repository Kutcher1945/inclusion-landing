import { Download } from "lucide-react";

const districts = [
  { name: "Алатауский",    total: 412, pct: 38 },
  { name: "Алмалинский",   total: 387, pct: 54 },
  { name: "Ауэзовский",    total: 356, pct: 41 },
  { name: "Бостандыкский", total: 298, pct: 62 },
  { name: "Медеуский",     total: 271, pct: 47 },
];

const categories = [
  { code: "К", label: "Кресло-коляска",     pct: 42, color: "#3772ff" },
  { code: "О", label: "Опорно-двигательная", pct: 55, color: "#8b5cf6" },
  { code: "С", label: "Слух",               pct: 68, color: "#10b981" },
  { code: "З", label: "Зрение",             pct: 31, color: "#f59e0b" },
];

const sparkline = [28, 31, 29, 35, 38, 33, 42, 45, 41, 50, 53, 48, 57, 61, 58, 65, 62, 68, 71, 74];

export function Analytics() {
  const max = Math.max(...sparkline);
  const min = Math.min(...sparkline);

  const points = sparkline
    .map((v, i) => {
      const x = (i / (sparkline.length - 1)) * 280;
      const y = 48 - ((v - min) / (max - min)) * 44;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <section id="analytics" className="py-28 bg-[#070e1b] relative overflow-hidden">
      {/* Ambient glows */}
      <div
        className="absolute top-0 right-1/3 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(55,114,255,0.05) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)" }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-[11px] font-semibold tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-4 text-[#3772ff] bg-[#3772ff]/10 border border-[#3772ff]/20">
            Аналитика
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Данные, которые помогают решать
          </h2>
          <p className="text-white/35 text-lg max-w-lg mx-auto">
            Интерактивные дашборды с возможностью экспорта для отчётности
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">

          {/* ── Hero stat: total objects + sparkline ── */}
          <div className="md:col-span-5 group relative rounded-2xl bg-white/[0.04] border border-white/[0.07] p-6 overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
            <div
              className="absolute -top-16 -left-16 w-64 h-64 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(55,114,255,0.15) 0%, transparent 70%)" }}
            />
            <div className="text-[10px] text-white/35 uppercase tracking-wider mb-4">Всего объектов</div>
            <div className="text-6xl font-black text-white tabular-nums leading-none mb-1">5 241</div>
            <div className="text-[13px] text-emerald-400 mb-6">+312 за последний месяц ↑</div>

            {/* Sparkline */}
            <div className="rounded-xl bg-[#0a1628] border border-white/[0.06] p-4">
              <div className="text-[9px] text-white/25 uppercase tracking-wider mb-2">Динамика паспортов</div>
              <svg viewBox="0 0 280 52" className="w-full" preserveAspectRatio="none" style={{ height: 52 }}>
                {/* Fill area */}
                <defs>
                  <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3772ff" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3772ff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon
                  points={`0,52 ${points} 280,52`}
                  fill="url(#sparkFill)"
                />
                <polyline
                  points={points}
                  fill="none"
                  stroke="#3772ff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {/* Last point dot */}
                <circle
                  cx={(((sparkline.length - 1) / (sparkline.length - 1)) * 280).toString()}
                  cy={(48 - ((sparkline[sparkline.length - 1] - min) / (max - min)) * 44).toString()}
                  r="3"
                  fill="#3772ff"
                />
              </svg>
              <div className="flex justify-between text-[8px] text-white/20 mt-1">
                <span>Янв</span><span>Апр</span><span>Июл</span><span>Сег</span>
              </div>
            </div>
          </div>

          {/* ── 4 mini metric tiles ── */}
          <div className="md:col-span-7 grid grid-cols-2 gap-3">
            {[
              { label: "Доступных объектов", value: "1 893", sub: "36% от всех",          color: "#3772ff",  positive: true  },
              { label: "Без заключения",     value: "648",   sub: "требуют оценки",       color: "#f59e0b",  positive: false },
              { label: "Новых за месяц",     value: "312",   sub: "паспортов добавлено",  color: "#10b981",  positive: true  },
              { label: "Экспортов Excel",    value: "124",   sub: "за последние 30 дней", color: "#8b5cf6",  positive: true  },
            ].map((m) => (
              <div
                key={m.label}
                className="group relative rounded-2xl bg-white/[0.04] border border-white/[0.07] p-5 overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 100% 0%, ${m.color}12 0%, transparent 60%)` }}
                />
                <div className="text-[10px] text-white/35 mb-3 leading-snug">{m.label}</div>
                <div className="text-3xl font-black tabular-nums leading-none mb-1.5" style={{ color: m.color }}>
                  {m.value}
                </div>
                <div className={`text-[10px] ${m.positive ? "text-white/30" : "text-amber-400/70"}`}>{m.sub}</div>
              </div>
            ))}
          </div>

          {/* ── District breakdown ── */}
          <div className="md:col-span-7 group relative rounded-2xl bg-white/[0.04] border border-white/[0.07] p-6 overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
            <div
              className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(55,114,255,0.12) 0%, transparent 70%)" }}
            />
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-[10px] text-white/35 uppercase tracking-wider mb-0.5">Разрез по районам</div>
                <div className="text-white font-semibold">Доступность объектов</div>
              </div>
              <button className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg text-[#3772ff] bg-[#3772ff]/10 border border-[#3772ff]/20 hover:bg-[#3772ff]/20 transition-colors">
                <Download className="w-3 h-3" />
                Excel
              </button>
            </div>
            <div className="space-y-3">
              {[...districts].sort((a, b) => b.pct - a.pct).map((d, i) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="text-[10px] text-white/25 w-3 tabular-nums">{i + 1}</span>
                  <span className="text-[11px] text-white/50 w-24 shrink-0">{d.name}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${d.pct}%`,
                        background: `linear-gradient(to right, #3772ff, #6aa3ff)`,
                        opacity: 0.5 + (d.pct / 100) * 0.5,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-white/30 w-16 text-right tabular-nums shrink-0">{d.total} obj.</span>
                  <span className="text-sm font-bold tabular-nums text-white/70 w-8 text-right shrink-0">{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Category breakdown ── */}
          <div className="md:col-span-5 group relative rounded-2xl bg-white/[0.04] border border-white/[0.07] p-6 overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
            <div
              className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)" }}
            />
            <div className="text-[10px] text-white/35 uppercase tracking-wider mb-0.5">Категории МГН</div>
            <div className="text-white font-semibold mb-5">Доступность по типу</div>

            <div className="space-y-4">
              {categories.map((c) => (
                <div key={c.code} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black text-white shrink-0"
                    style={{ background: `${c.color}20`, border: `1px solid ${c.color}30`, color: c.color }}
                  >
                    {c.code}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-white/50">{c.label}</span>
                      <span className="text-sm font-bold tabular-nums" style={{ color: c.color }}>{c.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${c.pct}%`, background: c.color }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[9px] text-white/20 mt-5 pt-4 border-t border-white/[0.05]">
              % объектов, получивших оценку «доступно» или «частично доступно»
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
