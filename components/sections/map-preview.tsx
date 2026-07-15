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
    <section id="map" className="py-24 bg-[#f8fafc] relative overflow-hidden isolate">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <span className="inline-block text-[11px] font-semibold tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-4 text-[#3772ff] bg-[#eff4ff] border border-[#3772ff]/15">
              Карта
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">
              Все паспортизированные объекты на одной карте
            </h2>
            <p className="text-neutral-500 text-base mt-2 max-w-md">
              Реальные данные ИС «Инклюзия» — фильтруйте по доступности, ищите объекты
            </p>
          </div>

          <div className="flex items-center gap-5 shrink-0">
            {data && (
              <>
                <div className="text-right">
                  <div className="text-2xl font-black text-neutral-900 tabular-nums">{data.with_coords.toLocaleString("ru-RU")}</div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-neutral-400 mt-0.5">на карте</div>
                </div>
                <div className="w-px h-8 bg-neutral-200" />
                <div className="text-right">
                  <div className="text-2xl font-black text-neutral-900 tabular-nums">{data.total.toLocaleString("ru-RU")}</div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-neutral-400 mt-0.5">всего</div>
                </div>
                <div className="w-px h-8 bg-neutral-200" />
              </>
            )}
            <Link
              href="/map"
              className="group flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:scale-105 active:scale-100"
              style={{
                background: "#3772ff",
                boxShadow: "0 0 20px rgba(55,114,255,0.35)",
              }}
            >
              Открыть карту
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Map container */}
        {loading ? (
          <div className="rounded-2xl border border-neutral-200 h-80 bg-neutral-100 animate-pulse" />
        ) : data ? (
          <div
            className="rounded-2xl overflow-hidden border border-neutral-200"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
          >
            <MapRealWrapper data={data} preview={true} />
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-200 h-80 flex items-center justify-center bg-neutral-50">
            <p className="text-neutral-400 text-sm">Карта недоступна — бэкенд не запущен</p>
          </div>
        )}
      </div>
    </section>
  );
}
