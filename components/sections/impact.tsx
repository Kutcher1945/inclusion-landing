const stats = [
  { value: "40 000+", label: "объектов в реестре",      sub: "учреждения, остановки, гостиницы, подъезды", color: "#3772ff", bg: "#eff4ff" },
  { value: "97",      label: "показателей доступности", sub: "по каждому паспорту объекта",               color: "#8b5cf6", bg: "#f5f3ff" },
  { value: "4",       label: "категории инвалидности",  sub: "К · О · С · З",                             color: "#10b981", bg: "#ecfdf5" },
  { value: "8",       label: "районов города",          sub: "полное покрытие Алматы",                    color: "#f59e0b", bg: "#fffbeb" },
];

export function Impact() {
  return (
    <section className="py-28 bg-white relative overflow-hidden">
      {/* Decorative large circle */}
      <div
        className="absolute -right-48 -top-48 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(55,114,255,0.04) 0%, transparent 65%)" }}
      />
      <div
        className="absolute -left-32 bottom-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 65%)" }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-[11px] font-semibold tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-4 text-[#3772ff] bg-[#eff4ff] border border-[#3772ff]/15">
            Влияние
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4 tracking-tight">
            Используется госорганами
          </h2>
          <p className="text-neutral-500 text-lg max-w-lg mx-auto">
            Реальные данные, на основе которых принимаются решения об адаптации городской инфраструктуры
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="group bg-white rounded-3xl border border-neutral-100 p-7 overflow-hidden relative transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-neutral-200"
              style={{
                boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)",
                animationDelay: `${i * 0.08}s`,
              }}
            >
              {/* Colored top bar */}
              <div
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{ background: s.color }}
              />
              {/* Icon bg dot */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-5"
                style={{ background: s.bg }}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              </div>

              <div
                className="text-4xl md:text-5xl font-black tabular-nums leading-none mb-2"
                style={{ color: s.color }}
              >
                {s.value}
              </div>
              <div className="text-sm font-semibold text-neutral-800 mb-1 leading-tight">{s.label}</div>
              <div className="text-xs text-neutral-400 leading-snug">{s.sub}</div>
            </div>
          ))}
        </div>

        <p className="text-center mt-10 text-[11px] uppercase tracking-[0.2em] text-neutral-400">
          Акимат города Алматы · Отдел по поддержке людей с инвалидностью
        </p>
      </div>
    </section>
  );
}
