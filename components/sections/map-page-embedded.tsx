"use client";

import { useEffect, useState } from "react";
import type { MapData } from "@/lib/api";
import { MapRealWrapper } from "./map-real-wrapper";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://green-admin.smartalmaty.kz";

export function MapPageEmbedded() {
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
    // Fills the parent absolutely — parent must be relative + sized
    <div className="absolute inset-0 bg-neutral-100">
      {loading ? (
        <div className="w-full h-full bg-neutral-200 animate-pulse" />
      ) : data ? (
        <MapRealWrapper data={data} preview={false} fullscreen title="Карта объектов" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">
          Карта недоступна
        </div>
      )}
    </div>
  );
}
