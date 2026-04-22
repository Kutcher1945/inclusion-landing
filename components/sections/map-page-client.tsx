"use client";

import { useEffect, useState } from "react";
import type { MapData } from "@/lib/api";
import { MapRealWrapper } from "./map-real-wrapper";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://green-admin.smartalmaty.kz";

export function MapPageClient() {
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
    <div className="fixed inset-0 bg-neutral-100">
      {/* Floating header bar */}
      <div className="absolute top-4 left-4 z-[1100] flex items-center gap-2">
        <Link
          href="/"
          className="flex items-center gap-1.5 bg-white rounded-xl px-3 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 shadow-md shadow-black/5 border border-neutral-200/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Link>
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-md shadow-black/5 border border-neutral-200/80">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg,#29358f,#3772ff)" }}
          >
            <MapPin className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold text-neutral-900 text-sm">Карта объектов</span>
          {data && (
            <span className="text-xs text-neutral-400 border-l border-neutral-200 pl-2 ml-1">
              {data.with_coords.toLocaleString("ru-RU")} на карте
            </span>
          )}
        </div>
      </div>

      {/* Full-screen map */}
      {loading ? (
        <div className="w-full h-full bg-neutral-200 animate-pulse" />
      ) : data ? (
        <MapRealWrapper data={data} preview={false} fullscreen />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">
          Карта недоступна — бэкенд не запущен
        </div>
      )}
    </div>
  );
}
