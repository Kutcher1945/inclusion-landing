import {
  ClipboardList,
  Map,
  BarChart3,
  Smartphone,
  MessageSquare,
  Building2,
} from "lucide-react";

const features = [
  {
    icon: ClipboardList,
    title: "Паспорта доступности",
    desc: "97 показателей для каждого объекта — от пандусов и лифтов до тактильных навигаций и ширины дверей.",
    color: "#3772ff",
    bg: "#eff4ff",
  },
  {
    icon: Map,
    title: "Геоинформационная карта",
    desc: "Визуализация всех объектов на интерактивной карте города с фильтрами по типу и доступности.",
    color: "#0ea5e9",
    bg: "#f0f9ff",
  },
  {
    icon: BarChart3,
    title: "Аналитика и отчёты",
    desc: "Сводные дашборды по районам, типам объектов, динамика изменений и экспорт в Excel.",
    color: "#8b5cf6",
    bg: "#f5f3ff",
  },
  {
    icon: Smartphone,
    title: "Мобильный сбор данных",
    desc: "Инспекторы заполняют паспорта прямо на объекте через мобильное приложение с поддержкой офлайн-режима.",
    color: "#10b981",
    bg: "#f0fdf4",
  },
  {
    icon: MessageSquare,
    title: "Обратная связь от граждан",
    desc: "Жители могут оставлять отзывы, оценки и сообщения о проблемах с привязкой к геолокации.",
    color: "#f59e0b",
    bg: "#fffbeb",
  },
  {
    icon: Building2,
    title: "Панели для госорганов",
    desc: "Персонализированные дашборды для ответственных органов с мониторингом объектов по их ведомству.",
    color: "#ef4444",
    bg: "#fff1f2",
  },
];

export function Features() {
  return (
    <section id="features" className="py-28 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4 text-[#3772ff] bg-[#eff4ff]">
            Возможности
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4 tracking-tight">
            Всё для управления доступностью
          </h2>
          <p className="text-neutral-500 text-lg max-w-xl mx-auto leading-relaxed">
            Единая платформа от сбора данных до принятия управленческих решений
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="animate-fade-in-up group bg-white rounded-2xl p-7 border border-neutral-100 hover:shadow-xl hover:shadow-neutral-200/60 hover:-translate-y-1 transition-all duration-300 cursor-default"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                style={{ background: f.bg }}
              >
                <f.icon className="w-5 h-5" style={{ color: f.color }} />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 mb-2">{f.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
