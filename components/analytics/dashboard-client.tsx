"use client";
import { useState } from "react";
import {
  Building2, Hotel, Home, BusFront, DoorOpen,
  Layers, MapPin, Activity, BarChart2, TrendingUp, Table2, PieChart, Sparkles,
  type LucideIcon,
} from "lucide-react";
import type {
  Overview, AdaptationStats, DistrictStat, ActivityTypeStat, Trends, DeepAccessibility,
} from "@/lib/api";
import { MetricCard }          from "./metric-card";
import { DistrictChart }       from "./district-chart";
import { ActivityChart }       from "./activity-chart";
import { AdaptationChart }     from "./adaptation-chart";
import { StatusBreakdown }     from "./status-breakdown";
import { TrendsWrapper }       from "./trends-wrapper";
import { KozsOverview }        from "./kozs-overview";
import { KozsTypeDetail }      from "./kozs-type-detail";
import { DistrictKozsTable }   from "./district-kozs-table";
import { ActivityKozsChart }   from "./activity-kozs-chart";
import { AiSummary }           from "./ai-summary";
import { ActivityDetailTable } from "./activity-detail-table";
import { PassportAdaptation }  from "./passport-adaptation";

// ── Types ────────────────────────────────────────────────────────────────────

type TabId = "all" | "objects" | "hotels" | "hostels" | "stops" | "entrances" | "ai";

interface Tab {
  id:    TabId;
  label: string;
  icon:  LucideIcon;
  color: string;
  bg:    string;
  count: number;
}

interface Props {
  overview:   Overview   | null;
  adaptation: AdaptationStats | null;
  districts:  DistrictStat[]  | null;
  activities: ActivityTypeStat[] | null;
  trends:     Trends | null;
  deep:       DeepAccessibility | null;
  exportUrl:  string;
}

// ── Section heading ──────────────────────────────────────────────────────────

function SHead({ id, title, sub }: { id: string; title: string; sub?: string }) {
  return (
    <div id={id} className="flex items-baseline gap-3 mb-4 scroll-mt-20">
      <h2 className="text-base font-bold text-neutral-900">{title}</h2>
      {sub && <span className="text-xs text-neutral-400">{sub}</span>}
    </div>
  );
}

// ── Per-type view ────────────────────────────────────────────────────────────

function TypeView({ tab, deep, districts, activities, adaptation }: {
  tab: Tab;
  deep: DeepAccessibility;
  districts: DistrictStat[] | null;
  activities: ActivityTypeStat[] | null;
  adaptation: AdaptationStats | null;
}) {
  const typeData = deep[tab.id as "objects" | "hotels" | "hostels" | "stops"];
  if (!typeData) {
    if (tab.id === "entrances") {
      return (
        <div className="space-y-6">
          <SHead id="summary" title="Подъезды" />
          <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center text-neutral-400 text-sm">
            Для подъездов доступность К/О/С/З не фиксируется в системе.
            <div className="mt-3 text-2xl font-bold text-neutral-700">
              {deep.summary.total_entrances.toLocaleString("ru-RU")} паспортов
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  const hasDistricts = tab.id === "objects";
  const hasActivity  = tab.id === "objects";
  const hasAdaptation = "adaptation" in typeData;

  return (
    <div className="space-y-8">
      {/* Metric */}
      <section>
        <SHead id="summary" title={tab.label} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-neutral-100 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: tab.bg }}>
              <tab.icon className="w-6 h-6" style={{ color: tab.color }} />
            </div>
            <div>
              <div className="text-2xl font-bold tabular-nums text-neutral-900">
                {typeData.total.toLocaleString("ru-RU")}
              </div>
              <div className="text-xs text-neutral-400 mt-0.5">Всего паспортов</div>
            </div>
          </div>

          {hasAdaptation && (
            <>
              <div className="bg-white rounded-2xl border border-neutral-100 p-5">
                <div className="text-xs text-neutral-400 mb-1">Средний % адаптации</div>
                <div className="text-2xl font-bold tabular-nums" style={{ color: tab.color }}>
                  {(typeData as typeof deep.objects).adaptation.average_pct}%
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-100 mt-2 overflow-hidden">
                  <div
                    style={{ width: `${(typeData as typeof deep.objects).adaptation.average_pct}%`, background: tab.color }}
                    className="h-full"
                  />
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-neutral-100 p-5">
                <div className="text-xs text-neutral-400 mb-2">Уровни адаптации</div>
                {(() => {
                  const lvl = (typeData as typeof deep.objects).adaptation.levels;
                  const tot = (typeData as typeof deep.objects).adaptation.total || 1;
                  return (
                    <div className="flex h-4 rounded-full overflow-hidden gap-px">
                      {[
                        { v: lvl.fully,      c: "#10b981" },
                        { v: lvl.highly,     c: "#3772ff" },
                        { v: lvl.moderately, c: "#f59e0b" },
                        { v: lvl.poorly,     c: "#f97316" },
                        { v: lvl.none,       c: "#ef4444" },
                      ].map(({ v, c }, i) =>
                        v > 0 ? (
                          <div
                            key={i}
                            style={{ width: `${(v / tot) * 100}%`, background: c }}
                            className="h-full"
                            title={`${v}`}
                          />
                        ) : null
                      )}
                    </div>
                  );
                })()}
                <div className="flex flex-wrap gap-x-2 mt-2 text-[10px] text-neutral-400">
                  <span><span className="inline-block w-2 h-2 rounded-sm bg-[#10b981] mr-0.5" />Полностью</span>
                  <span><span className="inline-block w-2 h-2 rounded-sm bg-[#3772ff] mr-0.5" />Высоко</span>
                  <span><span className="inline-block w-2 h-2 rounded-sm bg-[#f59e0b] mr-0.5" />Средне</span>
                  <span><span className="inline-block w-2 h-2 rounded-sm bg-[#ef4444] mr-0.5" />Нет</span>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* KOZS detail */}
      <section>
        <SHead id="kozs" title="Доступность К/О/С/З" sub="Кресло-коляска · Опорно-двигательная · Слух · Зрение" />
        <KozsTypeDetail kozs={typeData.kozs} total={typeData.total} />
      </section>

      {/* District table — objects only */}
      {hasDistricts && (
        <section>
          <SHead id="districts" title="По районам" />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {districts && <DistrictChart data={districts} />}
            <DistrictKozsTable data={(deep.objects as typeof deep.objects).by_district} />
          </div>
        </section>
      )}

      {/* Activity with subtypes — objects only */}
      {hasActivity && (
        <section>
          <SHead id="activities" title="По видам деятельности" sub="Нажмите на вид чтобы раскрыть подвиды" />
          <div className="space-y-6">
            {activities && <ActivityChart data={activities} />}
            <ActivityDetailTable data={(deep.objects as typeof deep.objects).by_activity_detail} />
          </div>
        </section>
      )}

      {/* Full adaptation breakdown — objects only */}
      {hasAdaptation && tab.id === "objects" && adaptation && (
        <section>
          <SHead id="adaptation" title="Адаптация" sub="По 97 показателям" />
          <AdaptationChart data={adaptation} />
        </section>
      )}
    </div>
  );
}

// ── Main dashboard client ────────────────────────────────────────────────────

export function DashboardClient({ overview, adaptation, districts, activities, trends, deep, exportUrl }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const s = deep?.summary;

  const TABS: Tab[] = [
    { id: "all",       label: "Все типы",  icon: Layers,    color: "#64748b", bg: "#f1f5f9", count: s?.total_all      ?? 0 },
    { id: "objects",   label: "Объекты",   icon: Building2, color: "#3772ff", bg: "#eff4ff", count: s?.total_objects  ?? overview?.total_objects  ?? 0 },
    { id: "hotels",    label: "Гостиницы", icon: Hotel,     color: "#8b5cf6", bg: "#f5f3ff", count: s?.total_hotels   ?? overview?.total_hotels   ?? 0 },
    { id: "hostels",   label: "Общежития", icon: Home,      color: "#10b981", bg: "#f0fdf4", count: s?.total_hostels  ?? overview?.total_hostels  ?? 0 },
    { id: "stops",     label: "Остановки", icon: BusFront,  color: "#f59e0b", bg: "#fffbeb", count: s?.total_stops    ?? overview?.total_bus_stops ?? 0 },
    { id: "entrances", label: "Подъезды",  icon: DoorOpen,  color: "#ef4444", bg: "#fef2f2", count: s?.total_entrances ?? 0 },
  ];

  const active = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="flex flex-1 min-h-0 w-full">

      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-white border-r border-neutral-100 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">

        {/* Passport type tabs */}
        <div className="px-3 pt-4 pb-2">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 px-3 mb-2">
            Тип объекта
          </div>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all mb-0.5 ${
                activeTab === tab.id
                  ? "text-neutral-900 font-semibold"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
              }`}
              style={activeTab === tab.id ? { background: tab.bg } : {}}
            >
              <tab.icon className="w-4 h-4 shrink-0" style={{ color: activeTab === tab.id ? tab.color : undefined }} />
              <span className="flex-1 text-left">{tab.label}</span>
              <span
                className="text-[11px] tabular-nums font-medium px-1.5 py-0.5 rounded-md"
                style={activeTab === tab.id
                  ? { background: "white", color: tab.color }
                  : { background: "#f3f4f6", color: "#6b7280" }
                }
              >
                {tab.count.toLocaleString("ru-RU")}
              </span>
            </button>
          ))}
        </div>

        {/* AI tab — separate at the bottom */}
        <div className="px-3 mt-auto pb-4 pt-2 border-t border-neutral-100">
          <button
            onClick={() => setActiveTab("ai")}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
              activeTab === "ai"
                ? "text-white font-semibold"
                : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
            }`}
            style={activeTab === "ai"
              ? { background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }
              : {}
            }
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left">ИИ-анализ</span>
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
              style={activeTab === "ai"
                ? { background: "rgba(255,255,255,0.2)", color: "white" }
                : { background: "#eef2ff", color: "#6366f1" }
              }
            >
              Mistral
            </span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="px-4 lg:px-8 py-6 space-y-10 w-full">

          {/* Mobile tab pills */}
          <div className="flex lg:hidden gap-2 overflow-x-auto pb-1 -mx-4 px-4">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all"
                style={activeTab === tab.id
                  ? { background: tab.bg, color: tab.color }
                  : { background: "#f3f4f6", color: "#6b7280" }
                }
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
            <button
              onClick={() => setActiveTab("ai")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all"
              style={activeTab === "ai"
                ? { background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white" }
                : { background: "#eef2ff", color: "#6366f1" }
              }
            >
              <Sparkles className="w-3.5 h-3.5" />
              ИИ-анализ
            </button>
          </div>

          {/* Error */}
          {!overview && !deep && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
              ⚠️ Не удалось подключиться к бэкенду.
            </div>
          )}

          {/* ── ALL TAB ─────────────────────────────────────────── */}
          {activeTab === "all" && (
            <>
              {/* 1. Сводка */}
              <section>
                <SHead id="summary" title="Общая сводка" />
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                  {TABS.slice(1).map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="text-left">
                      <MetricCard
                        label={tab.label}
                        value={tab.count}
                        sub="нажмите для деталей"
                        icon={tab.icon}
                        color={tab.color}
                        bg={tab.bg}
                      />
                    </button>
                  ))}
                </div>
              </section>

              {/* 2. Статусы */}
              {overview && (
                <section>
                  <SHead id="statuses" title="Статусы объектов" sub="Статусы и статусы доставки по учреждениям" />
                  <StatusBreakdown overview={overview} />
                </section>
              )}

              {/* 3. К/О/С/З */}
              {deep && (
                <section>
                  <SHead id="kozs" title="Доступность К/О/С/З" sub="Кресло-коляска · Опорно-двигательная · Слух · Зрение" />
                  <KozsOverview kozs={deep.kozs} />
                </section>
              )}

              {/* 4. По районам */}
              <section>
                <SHead id="districts" title="По районам" sub="Объекты и доступность К/О/С/З по районам" />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {districts && <DistrictChart data={districts} />}
                  {deep && <DistrictKozsTable data={deep.objects.by_district} />}
                </div>
              </section>

              {/* 5. По деятельности */}
              <section>
                <SHead id="activities" title="По видам деятельности" />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {activities && <ActivityChart data={activities} />}
                  {deep && <ActivityKozsChart data={deep.objects.by_activity} />}
                </div>
              </section>

              {/* 6. Адаптация */}
              <section>
                <SHead id="adaptation" title="Уровни адаптации" sub="По типам паспортов" />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                  {adaptation && <AdaptationChart data={adaptation} />}
                  {deep && (
                    <div className="bg-white rounded-2xl border border-neutral-100 p-6">
                      <h3 className="font-semibold text-neutral-900 text-sm mb-5">Средний % по типам</h3>
                      <div className="space-y-4">
                        {[
                          { label: "Объекты",   color: "#3772ff", d: deep.objects.adaptation },
                          { label: "Гостиницы", color: "#8b5cf6", d: deep.hotels.adaptation  },
                          { label: "Общежития", color: "#10b981", d: deep.hostels.adaptation },
                        ].map(({ label, color, d }) => (
                          <div key={label}>
                            <div className="flex justify-between mb-1">
                              <span className="text-xs font-medium text-neutral-700">{label}</span>
                              <span className="text-sm font-bold" style={{ color }}>{d.average_pct}%</span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-neutral-100 overflow-hidden">
                              <div style={{ width: `${d.average_pct}%`, background: color }} className="h-full" />
                            </div>
                            <div className="text-xs text-neutral-400 mt-0.5">{d.total.toLocaleString("ru-RU")} паспортов</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {deep && (
                  <PassportAdaptation types={[
                    { label: "Объекты",   color: "#3772ff", adaptation: deep.objects.adaptation },
                    { label: "Гостиницы", color: "#8b5cf6", adaptation: deep.hotels.adaptation  },
                    { label: "Общежития", color: "#10b981", adaptation: deep.hostels.adaptation },
                  ]} />
                )}
              </section>

              {/* 7. Динамика */}
              {trends && (
                <section>
                  <SHead id="trends" title="Динамика активности" sub="Создание и обновление паспортов" />
                  <TrendsWrapper initial={trends} />
                </section>
              )}

              {/* 8. Таблица */}
              {activities && activities.length > 0 && (
                <section>
                  <SHead id="table" title="Таблица по видам деятельности" />
                  <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-neutral-100 bg-neutral-50">
                            <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Вид деятельности</th>
                            <th className="text-right px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Объектов</th>
                            <th className="text-right px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden md:table-cell">Услуг для МГН</th>
                            <th className="text-right px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden lg:table-cell">Ср. этажность</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                          {activities.map((a, i) => (
                            <tr key={i} className="hover:bg-neutral-50 transition-colors">
                              <td className="px-5 py-3 text-neutral-800 font-medium">{a.type_of_activity__name_ru ?? "—"}</td>
                              <td className="px-5 py-3 text-right tabular-nums font-semibold text-neutral-900">{a.total_objects.toLocaleString("ru-RU")}</td>
                              <td className="px-5 py-3 text-right tabular-nums text-neutral-500 hidden md:table-cell">{(a.services_for_disabled ?? 0).toLocaleString("ru-RU")}</td>
                              <td className="px-5 py-3 text-right tabular-nums text-neutral-500 hidden lg:table-cell">{a.avg_floors != null ? Number(a.avg_floors).toFixed(1) : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-neutral-100 bg-neutral-50">
                            <td className="px-5 py-3 text-xs font-bold text-neutral-700">Итого</td>
                            <td className="px-5 py-3 text-right text-xs font-bold text-neutral-900 tabular-nums">
                              {activities.reduce((s, a) => s + a.total_objects, 0).toLocaleString("ru-RU")}
                            </td>
                            <td className="px-5 py-3 hidden md:table-cell" />
                            <td className="px-5 py-3 hidden lg:table-cell" />
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}

          {/* ── AI TAB ──────────────────────────────────────────── */}
          {activeTab === "ai" && deep && (
            <div className="w-full space-y-6">

              {/* Header */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-900">ИИ-анализ доступной среды</h2>
                  <p className="text-xs text-neutral-400">Mistral Large · автоматически по актуальным данным</p>
                </div>
              </div>

              {/* Methodology + AI side by side */}
              <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6 items-start">

                {/* Methodology card */}
                <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-neutral-50">
                    <div className="text-sm font-semibold text-neutral-900">Методология анализа</div>
                    <div className="text-xs text-neutral-400 mt-0.5">Как собираются и интерпретируются данные</div>
                  </div>

                  <div className="px-5 py-4 space-y-5 text-xs text-neutral-600">

                    {/* Data sources */}
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">Источники данных</div>
                      <div className="space-y-1.5">
                        {[
                          { label: "Объекты (учреждения)", count: deep.summary.total_objects,  color: "#3772ff" },
                          { label: "Гостиницы",             count: deep.summary.total_hotels,   color: "#8b5cf6" },
                          { label: "Общежития",             count: deep.summary.total_hostels,  color: "#10b981" },
                          { label: "Остановки",             count: deep.summary.total_stops,    color: "#f59e0b" },
                          { label: "Подъезды",              count: deep.summary.total_entrances,color: "#ef4444" },
                        ].map(({ label, count, color }) => (
                          <div key={label} className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                              <span>{label}</span>
                            </div>
                            <span className="font-semibold text-neutral-800 tabular-nums">{count.toLocaleString("ru-RU")}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-1.5 border-t border-neutral-100">
                          <span className="font-semibold text-neutral-700">Итого паспортов</span>
                          <span className="font-bold text-neutral-900 tabular-nums">{deep.summary.total_all.toLocaleString("ru-RU")}</span>
                        </div>
                      </div>
                    </div>

                    {/* KOZS */}
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">Категории доступности К/О/С/З</div>
                      <div className="space-y-1.5">
                        {[
                          { code: "К", label: "Кресло-коляска",      desc: "Пандусы, лифты, широкие проходы, санузлы",          color: "#3772ff" },
                          { code: "О", label: "Опорно-двигательная", desc: "Поручни, ступени, покрытие, зоны отдыха",            color: "#8b5cf6" },
                          { code: "С", label: "Слух",                desc: "Звуковые маяки, визуальные табло, петли индукции",   color: "#10b981" },
                          { code: "З", label: "Зрение",              desc: "Тактильные таблички, брайль, контрастная разметка",  color: "#f59e0b" },
                        ].map(({ code, label, desc, color }) => (
                          <div key={code} className="flex gap-2">
                            <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5" style={{ background: color + "20", color }}>
                              {code}
                            </span>
                            <div>
                              <div className="font-medium text-neutral-700">{label}</div>
                              <div className="text-neutral-400 leading-relaxed">{desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Statuses */}
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">Статусы доступности</div>
                      <div className="space-y-1.5">
                        {[
                          { label: "Доступен",            desc: "Объект полностью соответствует требованиям",        color: "#10b981" },
                          { label: "Частично доступен",   desc: "Часть требований выполнена, есть ограничения",       color: "#f59e0b" },
                          { label: "Не доступен",         desc: "Объект не приспособлен для данной категории",        color: "#ef4444" },
                          { label: "Нет сведений",        desc: "Оценка не проводилась или данные отсутствуют",       color: "#9ca3af" },
                        ].map(({ label, desc, color }) => (
                          <div key={label} className="flex gap-2">
                            <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: color }} />
                            <div>
                              <span className="font-medium text-neutral-700">{label}</span>
                              <span className="text-neutral-400"> — {desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Adaptation */}
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">Расчёт адаптации</div>
                      <p className="leading-relaxed text-neutral-500">
                        Каждый паспорт учреждения содержит <strong className="text-neutral-700">97 показателей</strong> адаптации
                        (булевые поля <code className="bg-neutral-100 px-1 rounded">is_adapted_1..97</code>).
                        Средний % = сумма всех выполненных показателей / (97 × кол-во паспортов) × 100.
                      </p>
                      <div className="mt-2 space-y-1">
                        {[
                          { range: "87–97",  label: "Полностью адаптирован", color: "#10b981" },
                          { range: "70–86",  label: "Высокий уровень",       color: "#3772ff" },
                          { range: "40–69",  label: "Средний уровень",       color: "#f59e0b" },
                          { range: "1–39",   label: "Слабая адаптация",      color: "#f97316" },
                          { range: "0",      label: "Не адаптирован",        color: "#ef4444" },
                        ].map(({ range, label, color }) => (
                          <div key={range} className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                            <span className="text-neutral-400 w-12">{range}</span>
                            <span className="text-neutral-600">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI method */}
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">Как работает ИИ-анализ</div>
                      <p className="leading-relaxed text-neutral-500">
                        Агрегированные данные (без персональных данных) передаются в модель{" "}
                        <strong className="text-neutral-700">Mistral Large</strong>. Модель получает сводку по
                        всем типам паспортов, распределение К/О/С/З, уровни адаптации и районную разбивку.
                        На основе этого генерируется текстовое резюме с выявлением проблем и рекомендациями.
                        Анализ не является официальным заключением — используется как вспомогательный инструмент.
                      </p>
                    </div>

                  </div>
                </div>

                {/* AI summary */}
                <AiSummary deep={deep} />
              </div>
            </div>
          )}

          {/* ── TYPE TABS ───────────────────────────────────────── */}
          {activeTab !== "all" && activeTab !== "ai" && deep && (
            <TypeView
              tab={active}
              deep={deep}
              districts={districts}
              activities={activities}
              adaptation={adaptation}
            />
          )}

          <p className="text-xs text-neutral-400 text-center pb-6">
            Данные обновляются каждую минуту · ИС «Инклюзия» · Алматы
          </p>
        </div>
      </main>
    </div>
  );
}
