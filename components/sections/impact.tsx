const stats = [
  { value: "5 000+", label: "объектов в реестре", sub: "учреждения, остановки, гостиницы, подъезды" },
  { value: "97", label: "показателей доступности", sub: "по каждому паспорту объекта" },
  { value: "4", label: "категории инвалидности", sub: "К · О · С · З" },
  { value: "8", label: "районов города", sub: "полное покрытие Алматы" },
];

export function Impact() {
  return (
    <section className="py-28 brand-gradient relative overflow-hidden">
      {/* Grid bg */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #3772ff, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
            style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
            Влияние
          </span>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Используется госорганами
          </h2>
          <p className="text-lg max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
            Реальные данные, на основе которых принимаются решения об адаптации городской инфраструктуры
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="animate-fade-in-up text-center p-8 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">{s.value}</div>
              <div className="text-sm font-semibold mb-1" style={{ color: "rgba(255,255,255,0.8)" }}>
                {s.label}
              </div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center mt-12 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
          Акимат города Алматы · Отдел по поддержке людей с инвалидностью
        </p>
      </div>
    </section>
  );
}
