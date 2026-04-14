"use client";
import dynamic from "next/dynamic";
import type { MapData } from "@/lib/api";

const MapReal = dynamic(
  () => import("./map-real").then((m) => m.MapReal),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-3 text-neutral-400">
          <div className="w-8 h-8 border-2 border-[#3772ff] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Загрузка карты...</span>
        </div>
      </div>
    ),
  }
);

interface Props {
  data: MapData;
  preview?: boolean;
  fullscreen?: boolean;
}

export function MapRealWrapper({ data, preview = true, fullscreen = false }: Props) {
  return <MapReal data={data} preview={preview} fullscreen={fullscreen} />;
}
