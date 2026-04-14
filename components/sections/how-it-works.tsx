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
    bg: "#f0fdf4",
    tags: ["Дашборды", "Экспорт Excel", "API для интеграций"],
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4 text-[#3772ff] bg-[#eff4ff]">
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
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div
                key={s.num}
                className="animate-fade-in-up relative flex flex-col items-center text-center p-8 rounded-2xl border border-neutral-100 bg-neutral-50 hover:shadow-lg hover:shadow-neutral-200/60 hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {/* Step number */}
                <div className="text-xs font-bold tracking-widest uppercase mb-4 text-neutral-400">
                  Шаг {s.num}
                </div>

                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: s.bg }}
                >
                  <s.icon className="w-7 h-7" style={{ color: s.color }} />
                </div>

                <h3 className="text-lg font-bold text-neutral-900 mb-3">{s.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed mb-5">{s.desc}</p>

                {/* Tags */}
                <div className="flex flex-wrap justify-center gap-2">
                  {s.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg"
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
      </div>
    </section>
  );
}
