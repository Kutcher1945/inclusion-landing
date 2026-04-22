"use client";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import type { MapData, MapPoint } from "@/lib/api";
import { Search, X, MapPin, ArrowRight, ChevronRight, PenLine, Square, Trash2, Download } from "lucide-react";
import Link from "next/link";

// ── Geometry helpers ──────────────────────────────────────────────────────────

function pointInPolygon(lat: number, lng: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [lati, lngi] = poly[i];
    const [latj, lngj] = poly[j];
    if (((lati > lat) !== (latj > lat)) &&
        (lng < (lngj - lngi) * (lat - lati) / (latj - lati) + lngi))
      inside = !inside;
  }
  return inside;
}

import { api } from "@/lib/api";

async function exportGeoJSON(points: MapPoint[], polygon: [number, number][]) {
  const ids = points.map((p) => p.id);

  try {
    const res = await api.exportGeoJsonByIds(ids);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "selection_full.geojson"; a.click();
    URL.revokeObjectURL(url);
  } catch {
    // Fallback: client-side export with available fields
    const ring = [...polygon.map(([lat, lng]) => [lng, lat]), [polygon[0][1], polygon[0][0]]];
    const fc = {
      type: "FeatureCollection",
      features: [
        { type: "Feature", geometry: { type: "Polygon", coordinates: [ring] },
          properties: { type: "selection_area", count: points.length } },
        ...points.map((p) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [p.lng, p.lat] },
          properties: { id: p.id, name: p.name, address: p.address, type: p.type,
            district: p.district, status: p.status, k: p.k, o: p.o, s: p.s, z: p.z },
        })),
      ],
    };
    const blob = new Blob([JSON.stringify(fc, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "selection.geojson"; a.click();
    URL.revokeObjectURL(url);
  }
}

// ── Virtual list ─────────────────────────────────────────────────────────────
const ROW_H = 56; // px — fixed row height

function VirtualList({
  items,
  renderRow,
  className = "",
}: {
  items: MapPoint[];
  renderRow: (item: MapPoint, index: number) => React.ReactNode;
  className?: string;
}) {
  const outerRef  = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState(0);
  const [height, setHeight] = useState(400);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    setHeight(el.clientHeight);
    const ro = new ResizeObserver(() => setHeight(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onScroll = useCallback(() => {
    if (outerRef.current) setScroll(outerRef.current.scrollTop);
  }, []);

  const overscan  = 6;
  const startIdx  = Math.max(0, Math.floor(scroll / ROW_H) - overscan);
  const endIdx    = Math.min(items.length - 1, Math.ceil((scroll + height) / ROW_H) + overscan);
  const totalH    = items.length * ROW_H;
  const offsetTop = startIdx * ROW_H;

  return (
    <div ref={outerRef} className={`overflow-y-auto ${className}`} onScroll={onScroll}>
      <div style={{ height: totalH, position: "relative" }}>
        <div style={{ position: "absolute", top: offsetTop, left: 0, right: 0 }}>
          {items.slice(startIdx, endIdx + 1).map((item, i) => renderRow(item, startIdx + i))}
        </div>
      </div>
    </div>
  );
}

const STATUS_META = {
  accessible:   { color: "#10b981", label: "Доступен",    bg: "#ecfdf5" },
  partial:      { color: "#f59e0b", label: "Частично",    bg: "#fffbeb" },
  inaccessible: { color: "#ef4444", label: "Не доступен", bg: "#fff1f2" },
  unknown:      { color: "#9ca3af", label: "Нет оценки",  bg: "#f9fafb" },
} as const;

const KOZS_NAMES:  Record<string, string> = { k: "Кресло", o: "Опора", s: "Слух", z: "Зрение" };
const KOZS_LABELS: Record<string, string> = { k: "К", o: "О", s: "С", z: "З" };

interface Props {
  data: MapData;
  preview?: boolean;
  fullscreen?: boolean;
}

// ── Object card popup ────────────────────────────────────────────────────────

function ObjectCard({ obj, onClose, fullscreen }: { obj: MapPoint; onClose: () => void; fullscreen: boolean }) {
  const s = STATUS_META[obj.status];
  const pos = fullscreen
    ? "absolute bottom-6 left-6 z-[1000]"
    : "absolute bottom-5 left-5 z-[1000]";
  return (
    <div className={`${pos} bg-white rounded-2xl shadow-2xl shadow-black/10 border border-neutral-100 w-80 overflow-hidden`}>
      <div style={{ background: s.bg }} className="px-4 pt-4 pb-3 border-b border-neutral-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0">
            <div className="mt-1 w-2 h-2 rounded-full shrink-0" style={{ background: s.color, boxShadow: `0 0 0 3px ${s.color}22` }} />
            <p className="text-sm font-semibold text-neutral-900 leading-snug">{obj.name}</p>
          </div>
          <button onClick={onClose} className="text-neutral-300 hover:text-neutral-500 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        {obj.address && <p className="text-xs text-neutral-400 mt-1.5 pl-4 leading-snug">{obj.address}</p>}
      </div>
      <div className="px-4 py-2.5 flex flex-wrap gap-1.5 border-b border-neutral-100">
        <span className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ background: s.bg, color: s.color }}>{s.label}</span>
        {obj.type     && <span className="text-xs px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-500">{obj.type}</span>}
        {obj.district && <span className="text-xs px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-500">{obj.district}</span>}
      </div>
      <div className="px-4 py-3 grid grid-cols-4 gap-1.5">
        {(["k","o","s","z"] as const).map((key) => {
          const val = obj[key];
          const color = val === "Доступен" ? "#10b981" : val === "Частично доступен" ? "#f59e0b" : val === "Не доступен" ? "#ef4444" : "#d1d5db";
          const sym   = val === "Доступен" ? "✓" : val === "Частично доступен" ? "~" : val === "Не доступен" ? "✗" : "—";
          return (
            <div key={key} className="rounded-xl p-2 text-center" style={{ background: color + "14" }}>
              <div className="text-[9px] text-neutral-400 mb-1 truncate">{KOZS_NAMES[key]}</div>
              <div className="text-[13px] font-bold leading-none" style={{ color }}>{sym}</div>
              <div className="text-[10px] font-bold mt-1" style={{ color }}>{KOZS_LABELS[key]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Leaflet map ──────────────────────────────────────────────────────────────

const KOZS_META = [
  { key: "k" as const, label: "К — Кресло",  short: "К", color: "#6366f1" },
  { key: "o" as const, label: "О — Опора",   short: "О", color: "#8b5cf6" },
  { key: "z" as const, label: "З — Зрение",  short: "З", color: "#ec4899" },
  { key: "s" as const, label: "С — Слух",    short: "С", color: "#14b8a6" },
];

function kozsColor(val: string | null | undefined): string {
  if (val === "Доступен")          return "#10b981";
  if (val === "Частично доступен") return "#f59e0b";
  if (val === "Не доступен")       return "#ef4444";
  return "#d1d5db";
}

function LeafletMap({
  points, onSelect, kozsKey, drawTool, onShapeDrawn, clearDraw,
}: {
  points: MapPoint[];
  onSelect: (obj: MapPoint) => void;
  kozsKey: "k" | "o" | "z" | "s" | null;
  drawTool?: "rectangle" | "polygon" | null;
  onShapeDrawn?: (latlngs: [number, number][]) => void;
  clearDraw?: number;
}) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<unknown>(null);
  const groupRef      = useRef<unknown>(null);
  const LRef          = useRef<unknown>(null);
  const drawLayerRef  = useRef<unknown>(null);
  const onSelectRef   = useRef(onSelect);
  const onShapeRef    = useRef(onShapeDrawn);
  const [ready, setReady] = useState(false);
  onSelectRef.current  = onSelect;
  onShapeRef.current   = onShapeDrawn;

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    const init = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled) return;

      // Clear any leftover Leaflet state on the container (React Strict Mode double-invoke)
      const container = containerRef.current!;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((container as any)._leaflet_id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (container as any)._leaflet_id = null;
      }

      // @ts-expect-error internal
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(container, {
        center: [43.238, 76.945], zoom: 12,
        zoomControl: false, attributionControl: false,
      });
      L.control.zoom({ position: "topright" }).addTo(map);
      L.control.attribution({ position: "bottomleft", prefix: false })
        .addAttribution('© <a href="https://carto.com">CARTO</a> © <a href="https://openstreetmap.org">OSM</a>')
        .addTo(map);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd", maxZoom: 19,
      }).addTo(map);

      let mcg: unknown = null;
      try {
        await import("leaflet.markercluster/dist/MarkerCluster.css" as string);
        await import("leaflet.markercluster/dist/MarkerCluster.Default.css" as string);
        await import("leaflet.markercluster" as string);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mcg = (L as any).markerClusterGroup({ maxClusterRadius: 50, disableClusteringAtZoom: 16 });
      } catch { /* fallback: plain layer group */ }

      if (cancelled) {
        map.remove();
        return;
      }

      const group = mcg ?? L.layerGroup();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (group as any).addTo(map);

      LRef.current     = L;
      groupRef.current = group;
      mapRef.current   = map;
      setReady(true);
    };
    init();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        // @ts-expect-error remove
        mapRef.current.remove();
        mapRef.current = null;
        groupRef.current = null;
        LRef.current = null;
        setReady(false);
      }
    };
  }, []); // eslint-disable-line

  // Update markers whenever points change (or map becomes ready)
  useEffect(() => {
    const L     = LRef.current;
    const group = groupRef.current;
    if (!ready || !L || !group) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (group as any).clearLayers();

    for (const obj of points) {
      if (!obj.lat || !obj.lng) continue;
      const color = kozsKey
        ? kozsColor(obj[kozsKey])
        : STATUS_META[obj.status].color;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const icon = (L as any).divIcon({
        className: "",
        html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.25),0 0 0 1px ${color}44"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7],
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const marker = (L as any).marker([obj.lat, obj.lng], { icon });
      marker.on("click", () => onSelectRef.current(obj));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (group as any).addLayer(marker);
    }
  }, [points, ready, kozsKey]);

  // Draw tool — activate leaflet-draw when drawTool changes
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L   = LRef.current as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = mapRef.current as any;
    if (!ready || !L || !map) return;

    // Clear any previous drawn layer
    if (drawLayerRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.removeLayer(drawLayerRef.current as any);
      drawLayerRef.current = null;
    }
    if (!drawTool) return;

    let cancelled = false;
    const activate = async () => {
      await import("leaflet-draw/dist/leaflet.draw.css" as string);
      await import("leaflet-draw");
      if (cancelled || !mapRef.current) return;

      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);
      drawLayerRef.current = drawnItems;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Handler = drawTool === "rectangle" ? (L.Draw as any).Rectangle : (L.Draw as any).Polygon;
      const handler = new Handler(map, drawTool === "polygon" ? { allowIntersection: false } : {});
      handler.enable();

      const onCreated = (e: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layer = (e as any).layer;
        drawnItems.addLayer(layer);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw: [number, number][] = (layer.getLatLngs()[0] as any[]).map((ll: any) => [ll.lat, ll.lng]);
        onShapeRef.current?.(raw);
      };
      map.on("draw:created", onCreated);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (map as any).__drawCleanup = () => {
        map.off("draw:created", onCreated);
        if (drawLayerRef.current) { map.removeLayer(drawLayerRef.current); drawLayerRef.current = null; }
      };
    };
    activate();
    return () => {
      cancelled = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (map as any).__drawCleanup?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawTool, ready]);

  // Clear drawn shapes when clearDraw increments
  useEffect(() => {
    if (!clearDraw) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = mapRef.current as any;
    if (drawLayerRef.current && map) {
      map.removeLayer(drawLayerRef.current);
      drawLayerRef.current = null;
    }
  }, [clearDraw]);

  return <div ref={containerRef} className="w-full h-full" />;
}

// ── Fullscreen layout ────────────────────────────────────────────────────────

function FullscreenMap({ data }: { data: MapData }) {
  const [selected, setSelected] = useState<MapPoint | null>(null);
  const [filter, setFilter]     = useState<string>("all");
  const [kozsFilter, setKozsFilter] = useState<"k"|"o"|"z"|"s"|null>(null);
  const [search, setSearch]     = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawTool, setDrawTool] = useState<"rectangle" | "polygon" | null>(null);
  const [clearDraw, setClearDraw] = useState(0);
  const [selection, setSelection] = useState<{ points: MapPoint[]; polygon: [number, number][] } | null>(null);

  const handleShapeDrawn = useCallback((polygon: [number, number][]) => {
    const inside = data.points.filter(
      (p) => p.lat && p.lng && pointInPolygon(p.lat, p.lng, polygon)
    );
    setSelection({ points: inside, polygon });
    setDrawTool(null);
  }, [data.points]);

  const clearSelection = () => {
    setSelection(null);
    setClearDraw((n) => n + 1);
  };

  // Map status filter key → exact DB value for KOZS fields
  const statusToKozs: Record<string, string | null> = {
    all:          null,
    accessible:   "Доступен",
    partial:      "Частично доступен",
    inaccessible: "Не доступен",
    unknown:      "Нет сведений",
  };

  const targetKozsVal = statusToKozs[filter] ?? null; // null = "Все"

  const filteredPoints = useMemo(() => {
    let pts = data.points;
    if (kozsFilter) {
      // Filter by specific KOZS category value
      if (targetKozsVal) {
        // e.g. "Доступен" + "К" → only objects where k === "Доступен"
        pts = pts.filter((p) => p[kozsFilter] === targetKozsVal);
      } else {
        // "Все" + "К" → show all objects with any assessment for К, colored by K value
        pts = pts.filter((p) => p[kozsFilter] && p[kozsFilter] !== "Нет сведений");
      }
    } else if (filter !== "all") {
      // Only row-1 status filter active
      pts = pts.filter((p) => p.status === filter);
    }
    return pts;
  }, [data.points, filter, kozsFilter, targetKozsVal]);

  // Row 1 counts — always by overall status
  const counts = useMemo(() => ({
    accessible:   data.points.filter((p) => p.status === "accessible").length,
    partial:      data.points.filter((p) => p.status === "partial").length,
    inaccessible: data.points.filter((p) => p.status === "inaccessible").length,
    unknown:      data.points.filter((p) => p.status === "unknown").length,
  }), [data.points]);

  // Row 2 counts — depend on selected status:
  //   "Все" → how many objects have any assessment for that KOZS category
  //   "Доступен" → how many have К="Доступен", etc.
  const kozsCounts = useMemo(() => {
    const countFor = (key: "k"|"o"|"z"|"s") =>
      targetKozsVal
        ? data.points.filter((p) => p[key] === targetKozsVal).length
        : data.points.filter((p) => p[key] && p[key] !== "Нет сведений").length;
    return { k: countFor("k"), o: countFor("o"), z: countFor("z"), s: countFor("s") };
  }, [data.points, targetKozsVal]);

  const listItems = useMemo(() => {
    if (!search) return data.points;
    const q = search.toLowerCase();
    return data.points.filter((p) =>
      p.name.toLowerCase().includes(q) || (p.address || "").toLowerCase().includes(q)
    );
  }, [data.points, search]);

  return (
    <div className="w-full h-full relative">
      {/* Map fills entire screen */}
      <LeafletMap
        points={filteredPoints}
        onSelect={setSelected}
        kozsKey={kozsFilter}
        drawTool={drawTool}
        onShapeDrawn={handleShapeDrawn}
        clearDraw={clearDraw}
      />

      {/* Object card popup */}
      {selected && (
        <ObjectCard obj={selected} onClose={() => setSelected(null)} fullscreen />
      )}

      {/* ── Selection result panel ── */}
      {selection && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1100] bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl shadow-black/10 border border-neutral-200/80 px-5 py-4 flex items-center gap-5 min-w-[420px]">
          <div>
            <p className="text-xs text-neutral-400 mb-0.5">Объектов в области</p>
            <p className="text-2xl font-bold text-neutral-900 tabular-nums">{selection.points.length.toLocaleString("ru-RU")}</p>
          </div>
          <div className="w-px h-10 bg-neutral-100 shrink-0" />
          <div className="flex gap-3 text-xs flex-1">
            {(["accessible","partial","inaccessible","unknown"] as const).map((s) => {
              const m = STATUS_META[s];
              const n = selection.points.filter((p) => p.status === s).length;
              return (
                <div key={s} className="flex flex-col items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                  <span className="tabular-nums font-semibold text-neutral-800">{n}</span>
                  <span className="text-neutral-400 text-[10px]">{m.label}</span>
                </div>
              );
            })}
          </div>
          <div className="w-px h-10 bg-neutral-100 shrink-0" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportGeoJSON(selection.points, selection.polygon)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
              style={{ background: "#3772ff" }}
            >
              <Download className="w-3.5 h-3.5" />
              GeoJSON
            </button>
            <button
              onClick={clearSelection}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-neutral-200 text-neutral-500 hover:bg-neutral-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Очистить
            </button>
          </div>
        </div>
      )}

      {/* ── Floating filter toolbar ── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1100] flex flex-col items-center gap-2">
        {/* Row 1: Status */}
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-lg shadow-black/10 border border-neutral-200/80">
          {(["all", "accessible", "partial", "inaccessible", "unknown"] as const).map((f) => {
            const meta   = f === "all" ? null : STATUS_META[f];
            const count  = f === "all" ? data.with_coords : counts[f];
            const active = filter === f;
            return (
              <button key={f}
                onClick={() => setFilter(f)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl transition-all"
                style={active
                  ? { background: meta?.color ?? "#111827", color: "white" }
                  : { background: "transparent", color: "#6b7280" }
                }
              >
                {meta && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: active ? "white" : meta.color }} />}
                {f === "all" ? "Все" : meta!.label}
                <span className={`tabular-nums ${active ? "opacity-70" : "opacity-50"}`}>{count.toLocaleString("ru-RU")}</span>
              </button>
            );
          })}
        </div>

        {/* Row 2: КОЗС — counts reflect selected status */}
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-lg shadow-black/10 border border-neutral-200/80">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide shrink-0">По МГН</span>
          <div className="w-px h-4 bg-neutral-200 shrink-0" />
          <button
            onClick={() => setKozsFilter(null)}
            className="text-xs font-medium px-3 py-1.5 rounded-xl transition-all shrink-0"
            style={kozsFilter === null ? { background: "#111827", color: "white" } : { background: "transparent", color: "#6b7280" }}
          >
            Все
          </button>
          {KOZS_META.map(({ key, label, short, color: catColor }) => {
            const active = kozsFilter === key;
            const cnt    = kozsCounts[key];
            // Active button color: use the status color if a status is selected, else the category color
            const activeBg = filter !== "all" && STATUS_META[filter as keyof typeof STATUS_META]
              ? STATUS_META[filter as keyof typeof STATUS_META].color
              : catColor;
            return (
              <button key={key}
                onClick={() => setKozsFilter(active ? null : key)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl transition-all"
                style={active ? { background: activeBg, color: "white" } : { background: "transparent", color: "#6b7280" }}
                title={label}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: active ? "white" : catColor }} />
                {short}
                <span className={`tabular-nums text-[11px] ${active ? "opacity-70" : "opacity-40"}`}>{cnt.toLocaleString("ru-RU")}</span>
              </button>
            );
          })}
          {/* Legend: show only when "Все" status + KOZS selected (to explain colors) */}
          {kozsFilter && filter === "all" && (
            <>
              <div className="w-px h-4 bg-neutral-200 shrink-0" />
              <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10b981]" />Доступен</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f59e0b]" />Частично</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ef4444]" />Нет</span>
              </div>
            </>
          )}
        </div>

        {/* Row 3: Draw tools */}
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-lg shadow-black/10 border border-neutral-200/80">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide shrink-0">Область</span>
          <div className="w-px h-4 bg-neutral-200 shrink-0" />
          <button
            onClick={() => { clearSelection(); setDrawTool(drawTool === "rectangle" ? null : "rectangle"); }}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl transition-all"
            style={drawTool === "rectangle" ? { background: "#3772ff", color: "white" } : { background: "transparent", color: "#6b7280" }}
          >
            <Square className="w-3.5 h-3.5" />
            Прямоугольник
          </button>
          <button
            onClick={() => { clearSelection(); setDrawTool(drawTool === "polygon" ? null : "polygon"); }}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl transition-all"
            style={drawTool === "polygon" ? { background: "#3772ff", color: "white" } : { background: "transparent", color: "#6b7280" }}
          >
            <PenLine className="w-3.5 h-3.5" />
            Полигон
          </button>
        </div>
      </div>

      {/* ── Sidebar toggle button ── */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-4 right-4 z-[1100] bg-white rounded-xl p-2.5 shadow-lg shadow-black/10 border border-neutral-200/80 text-neutral-500 hover:text-neutral-900 transition-colors"
      >
        <ChevronRight className={`w-4 h-4 transition-transform ${sidebarOpen ? "rotate-0" : "rotate-180"}`} />
      </button>

      {/* ── Right sidebar ── */}
      <div
        className={`absolute top-0 right-0 h-full z-[1050] flex flex-col bg-white/95 backdrop-blur-sm border-l border-neutral-200/80 shadow-2xl shadow-black/10 transition-all duration-300 ${
          sidebarOpen ? "w-72 translate-x-0" : "w-72 translate-x-full"
        }`}
      >
        {/* Sidebar header */}
        <div className="px-4 pt-24 pb-3 border-b border-neutral-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-300" />
            <input
              type="text"
              placeholder="Поиск объекта..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-[#3772ff] focus:bg-white transition-colors placeholder:text-neutral-300"
            />
          </div>
        </div>

        {/* List — virtualized, renders only visible rows */}
        <VirtualList
          items={listItems}
          className="flex-1 min-h-0"
          renderRow={(obj) => {
            const s = STATUS_META[obj.status];
            return (
              <div
                key={obj.id}
                style={{ height: ROW_H }}
                className="px-4 flex items-center gap-2 hover:bg-neutral-50 cursor-pointer transition-colors border-b border-neutral-50"
                onClick={() => obj.lat && obj.lng ? setSelected(obj) : undefined}
              >
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.color }} />
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="text-xs font-medium text-neutral-800 leading-snug truncate">{obj.name}</p>
                  {obj.district && <p className="text-[10px] text-neutral-400 mt-0.5">{obj.district}</p>}
                </div>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0" style={{ background: s.bg, color: s.color }}>
                  {s.label}
                </span>
              </div>
            );
          }}
        />

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-neutral-100 text-[11px] text-neutral-400 text-center shrink-0">
          {search
            ? `${listItems.length.toLocaleString("ru-RU")} результатов`
            : `${data.with_coords.toLocaleString("ru-RU")} объектов`}
        </div>
      </div>
    </div>
  );
}

// ── Preview layout (embedded in landing page) ────────────────────────────────

function PreviewMap({ data }: { data: MapData }) {
  const [selected, setSelected] = useState<MapPoint | null>(null);
  const [filter, setFilter]     = useState<string>("all");

  const filteredPoints = useMemo(() => {
    let pts = data.points;
    if (filter !== "all") pts = pts.filter((p) => p.status === filter);
    return pts;
  }, [data.points, filter]);

  const counts = useMemo(() => ({
    accessible:   data.points.filter((p) => p.status === "accessible").length,
    partial:      data.points.filter((p) => p.status === "partial").length,
    inaccessible: data.points.filter((p) => p.status === "inaccessible").length,
    unknown:      data.points.filter((p) => p.status === "unknown").length,
  }), [data.points]);

  const previewItems = data.points.slice(0, 7);

  return (
    <div className="rounded-2xl border border-neutral-200 overflow-hidden shadow-xl shadow-neutral-200/40 bg-white">
      {/* Toolbar */}
      <div className="bg-white border-b border-neutral-100 px-4 py-2.5 flex flex-wrap items-center gap-1.5">
        <div className="flex flex-wrap gap-1.5">
          {(["all", "accessible", "partial", "inaccessible", "unknown"] as const).map((f) => {
            const meta  = f === "all" ? null : STATUS_META[f];
            const count = f === "all" ? data.with_coords : counts[f];
            const active = filter === f;
            return (
              <button key={f} onClick={() => setFilter(f)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                style={active ? { background: meta?.color ?? "#111827", color: "white" } : { background: "#f3f4f6", color: "#6b7280" }}
              >
                {meta && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: active ? "white" : meta.color }} />}
                {f === "all" ? "Все" : meta!.label}
                <span className={active ? "opacity-70" : "opacity-50"}>{count.toLocaleString("ru-RU")}</span>
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[11px] text-neutral-400">
          <MapPin className="w-3 h-3 text-[#3772ff]" />
          <span><span className="font-semibold text-neutral-600">{data.with_coords.toLocaleString("ru-RU")}</span> на карте</span>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px]">
        {/* Map */}
        <div className="h-64 lg:h-[420px] relative bg-neutral-100">
          <LeafletMap points={filteredPoints} onSelect={setSelected} kozsKey={null} />
          {selected && <ObjectCard obj={selected} onClose={() => setSelected(null)} fullscreen={false} />}
        </div>

        {/* Sidebar */}
        <div className="border-l border-neutral-100 flex flex-col bg-white h-64 lg:h-[420px] overflow-hidden">
          <div className="px-4 pt-3 pb-2 border-b border-neutral-100 shrink-0">
            <p className="text-xs font-semibold text-neutral-700">Объекты на карте</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">Нажмите на объект для подробной информации</p>
          </div>

          <div className="flex-1 overflow-hidden min-h-0">
            {previewItems.map((obj) => {
              const s = STATUS_META[obj.status];
              return (
                <div
                  key={obj.id}
                  className="px-3 py-2.5 hover:bg-neutral-50 cursor-pointer transition-colors border-b border-neutral-50"
                  onClick={() => obj.lat && obj.lng ? setSelected(obj) : undefined}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.color }} />
                    <p className="text-xs font-medium text-neutral-800 leading-snug line-clamp-1 flex-1">{obj.name}</p>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0" style={{ background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            href="/map"
            className="flex items-center justify-center gap-2 px-4 py-3 border-t border-neutral-100 text-xs font-semibold text-[#3772ff] hover:bg-[#eff4ff] transition-colors group shrink-0"
          >
            Открыть полную карту — {data.total.toLocaleString("ru-RU")} объектов
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Export ───────────────────────────────────────────────────────────────────

export function MapReal({ data, preview = false, fullscreen = false }: Props) {
  if (fullscreen) return <FullscreenMap data={data} />;
  if (preview)    return <PreviewMap data={data} />;

  // standalone (unused currently, kept as fallback)
  return <PreviewMap data={data} />;
}
