import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, RefreshCw, Download } from "lucide-react";
import { api } from "@/lib/api";
import { DashboardClient } from "@/components/analytics/dashboard-client";

export default function AnalyticsPage() {
  const exportUrl       = api.exportUrl();
  const exportGeoJsonUrl = api.exportGeoJsonUrl();

  return (
    <div className="min-h-screen w-full bg-neutral-50 flex flex-col">

      {/* Top bar */}
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-40 flex-shrink-0">
        <div className="px-4 lg:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">На главную</span>
            </Link>
            <span className="text-neutral-200 hidden sm:inline">|</span>
            <Link href="/" className="shrink-0 overflow-hidden h-14 flex items-center -ml-2">
              <Image
                src="/logo-dark-letters.png"
                alt="Инклюзия"
                width={280}
                height={84}
                className="w-auto"
                style={{ height: "84px", marginTop: "-12px", marginBottom: "-12px" }}
                priority
              />
            </Link>
            <span className="text-neutral-200 hidden sm:inline">|</span>
            <h1 className="text-sm font-semibold text-neutral-900 truncate hidden sm:block">
              Аналитика
            </h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden md:flex items-center gap-1.5 text-xs text-neutral-400">
              <RefreshCw className="w-3 h-3" />
              Каждую минуту
            </span>
            <a
              href={exportGeoJsonUrl}
              download="inclusion_almaty.geojson"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GeoJSON</span>
            </a>
            <a
              href={exportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-white transition-all hover:opacity-90"
              style={{ background: "#3772ff" }}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Экспорт Excel</span>
            </a>
          </div>
        </div>
      </header>

      <DashboardClient exportUrl={exportUrl} />
    </div>
  );
}
