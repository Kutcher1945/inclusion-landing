import { Smartphone, Cpu, LineChart } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Smartphone,
    title: "Сбор данных",
    desc: "Инспекторы выезжают на объекты и заполняют паспорт доступности через мобильное приложение. 97 показателей — от входной группы до санузлов.",
    color: "#3772ff",
    bg: "#eff4ff",
    tags: ["Мобильное приложение", "Фото и видео", "Офлайн-режим"],
  },
  {
    num: "02",
    icon: Cpu,
    title: "Обработка и оценка",
    desc: "Система автоматически рассчитывает итоговый статус доступности по 4 категориям: К (кресло), О (опорно-двиг.), С (слух), З (зрение).",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    tags: ["Автооценка", "Заключения", "Рекомендации"],
  },
  {
    num: "03",
    icon: LineChart,
    title: "Аналитика и решения",
    desc: "Руководители и госорганы получают готовые отчёты, карты проблемных объектов и приоритеты для адаптации.",
    color: "#10b981",
    bg: "#ecfdf5",
    tags: ["Дашборды", "Экспорт Excel", "API для интеграций"],
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-28 bg-[#f8fafc] relative overflow-hidden">
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(55,114,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(55,114,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-[11px] font-semibold tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-4 text-[#3772ff] bg-[#eff4ff] border border-[#3772ff]/15">
            Как это работает
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4 tracking-tight">
            Три шага до результата
          </h2>
          <p className="text-neutral-500 text-lg max-w-lg mx-auto">
            От полевого обследования до управленческого решения
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div
              key={s.num}
              className="group relative bg-white rounded-3xl border border-neutral-100 p-8 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-neutral-200"
              style={{
                boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)",
              }}
            >
              {/* Hover top accent */}
              <div
                className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(to right, transparent, ${s.color}, transparent)` }}
              />

              {/* Ghost step number — clipped inside overflow-hidden card */}
              <div
                className="text-[80px] font-black leading-none absolute top-2 right-3 select-none pointer-events-none"
                style={{ color: `${s.color}12` }}
              >
                {s.num}
              </div>

              <div className="text-[10px] font-bold tracking-[0.25em] uppercase mb-5 text-neutral-300">
                Шаг {s.num}
              </div>

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                style={{ background: s.bg }}
              >
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>

              <h3 className="text-lg font-bold text-neutral-900 mb-3">{s.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed mb-6">{s.desc}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {s.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-lg"
                    style={{ background: s.bg, color: s.color }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
