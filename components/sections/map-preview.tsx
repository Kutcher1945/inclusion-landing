"use client";

import { useEffect, useState } from "react";
import type { MapData } from "@/lib/api";
import { MapRealWrapper } from "./map-real-wrapper";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://green-admin.smartalmaty.kz";

export function MapPreview() {
  const [data, setData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/inclusion-api/analytics/map_points/`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="map" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <span className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-3 text-[#3772ff] bg-[#eff4ff]">
              Карта
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">
              Все паспортизированные объекты на одной карте
            </h2>
            <p className="text-neutral-500 text-base mt-2 max-w-md">
              Реальные данные ИС «Инклюзия» — фильтруйте по доступности, ищите объекты
            </p>
          </div>
          {data && (
            <div className="flex items-center gap-5 text-sm text-neutral-500 shrink-0">
              <span><strong className="text-neutral-900 text-lg">{data.with_coords.toLocaleString("ru-RU")}</strong> на карте</span>
              <span><strong className="text-neutral-900 text-lg">{data.total.toLocaleString("ru-RU")}</strong> всего</span>
              <Link
                href="/map"
                className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-xl transition-opacity hover:opacity-90 shrink-0"
                style={{ background: "#3772ff" }}
              >
                Открыть карту <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-neutral-200 h-80 bg-neutral-50 animate-pulse" />
        ) : data ? (
          <MapRealWrapper data={data} preview={true} />
        ) : (
          <div className="rounded-2xl border border-neutral-200 h-80 flex items-center justify-center text-neutral-400 text-sm">
            Карта недоступна — бэкенд не запущен
          </div>
        )}
      </div>
    </section>
  );
}
