import { Download, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { DashboardClient } from "@/components/analytics/dashboard-client";

export const metadata = { title: "Аналитика — Паспортизация" };

export default function PassportsAnalyticsPage() {
  const exportUrl        = api.exportUrl();
  const exportGeoJsonUrl = api.exportGeoJsonUrl();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Аналитика</h1>
          <p className="text-sm text-foreground/45 mt-0.5 flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3" />
            Обновляется каждую минуту
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={exportGeoJsonUrl}
            download="inclusion_almaty.geojson"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-foreground/15 text-foreground/70 hover:bg-foreground/5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            GeoJSON
          </a>
          <a
            href={exportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl text-white transition-all hover:opacity-90"
            style={{ background: "#3772ff" }}
          >
            <Download className="w-3.5 h-3.5" />
            Экспорт Excel
          </a>
        </div>
      </div>

      <DashboardClient exportUrl={exportUrl} />
    </div>
  );
}
