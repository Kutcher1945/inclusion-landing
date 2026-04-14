import { TrendingUp, Download, BarChart2, PieChart } from "lucide-react";

const districts = [
  { name: "Алатауский", total: 412, pct: 38 },
  { name: "Алмалинский", total: 387, pct: 54 },
  { name: "Ауэзовский", total: 356, pct: 41 },
  { name: "Бостандыкский", total: 298, pct: 62 },
  { name: "Медеуский", total: 271, pct: 47 },
];

const categories = [
  { code: "К", label: "Кресло-коляска", pct: 42, color: "#3772ff" },
  { code: "О", label: "Опорно-двигательная", pct: 55, color: "#8b5cf6" },
  { code: "С", label: "Слух", pct: 68, color: "#10b981" },
  { code: "З", label: "Зрение", pct: 31, color: "#f59e0b" },
];

const metrics = [
  { label: "Всего объектов", value: "5 241", delta: "+312 за месяц", icon: BarChart2, positive: true },
  { label: "Доступных объектов", value: "1 893", delta: "36% от всех", icon: TrendingUp, positive: true },
  { label: "Без заключения", value: "648", delta: "требуют оценки", icon: PieChart, positive: false },
  { label: "Экспортов Excel", value: "124", delta: "за последние 30 дней", icon: Download, positive: true },
];

export function Analytics() {
  return (
    <section id="analytics" className="py-28 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4 text-[#3772ff] bg-[#eff4ff]">
            Аналитика
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4 tracking-tight">
            Данные, которые помогают решать
          </h2>
          <p className="text-neutral-500 text-lg max-w-lg mx-auto">
            Интерактивные дашборды с возможностью экспорта для отчётности
          </p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className="animate-fade-in-up bg-white rounded-2xl p-5 border border-neutral-100 hover:shadow-md transition-all"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-medium text-neutral-500 leading-snug max-w-[80%]">{m.label}</p>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${m.positive ? "bg-[#eff4ff]" : "bg-orange-50"}`}>
                  <m.icon className={`w-4 h-4 ${m.positive ? "text-[#3772ff]" : "text-orange-400"}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-900">{m.value}</div>
              <div className={`text-xs mt-1 ${m.positive ? "text-green-600" : "text-orange-500"}`}>{m.delta}</div>
            </div>
          ))}
        </div>

        {/* Bottom grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* District breakdown */}
          <div className="bg-white rounded-2xl p-7 border border-neutral-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-neutral-900">Разрез по районам</h3>
              <button
                className="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#3772ff] bg-[#eff4ff] hover:bg-[#dce9ff] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Экспорт Excel
              </button>
            </div>
            <div className="space-y-4">
              {districts.map((d) => (
                <div key={d.name}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm text-neutral-700">{d.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-neutral-400">{d.total} объектов</span>
                      <span className="text-xs font-semibold text-neutral-700">{d.pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${d.pct}%`,
                        background: "linear-gradient(90deg, #3772ff, #6aa3ff)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="bg-white rounded-2xl p-7 border border-neutral-100">
            <h3 className="font-semibold text-neutral-900 mb-6">Доступность по категориям</h3>
            <div className="space-y-5">
              {categories.map((c) => (
                <div key={c.code} className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: c.color }}
                  >
                    {c.code}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm text-neutral-700">{c.label}</span>
                      <span className="text-sm font-semibold" style={{ color: c.color }}>{c.pct}%</span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${c.pct}%`, background: c.color }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-neutral-400 mt-5 pt-5 border-t border-neutral-100">
              % объектов, получивших оценку «доступно» или «частично доступно»
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
