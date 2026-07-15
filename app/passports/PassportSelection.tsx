"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, FileDown, FileJson, FileSpreadsheet, Map, Trash2, Undo2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ExportPhase = "preparing" | "downloading" | "acting";

type SelectionContextValue = {
  selected: Set<number>;
  toggle: (id: number) => void;
  toggleMany: (ids: number[], checked: boolean) => void;
  clear: () => void;
  isBusy: boolean;
  triggerDownload: (url: string, fallbackFilename: string) => void;
  triggerAction: (path: string, body: Record<string, unknown>) => void;
};

const SelectionContext = createContext<SelectionContextValue | null>(null);

function filenameFromDisposition(disposition: string | null, fallback: string): string {
  const match = disposition ? /filename="?([^"]+)"?/.exec(disposition) : null;
  return match?.[1] ?? fallback;
}

function detailFromBody(body: unknown): string | null {
  if (body && typeof body === "object" && "detail" in body && typeof (body as { detail: unknown }).detail === "string") {
    return (body as { detail: string }).detail;
  }
  return null;
}

export function PassportSelectionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isBusy, setIsBusy] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportPhase, setExportPhase] = useState<ExportPhase>("preparing");

  const toggle = useCallback((id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleMany = useCallback((ids: number[], checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);

  // Downloads via fetch+blob (not a plain <a href>) so we can show a blocking overlay for
  // the whole request and guarantee the click can't be repeated — the bulk PDF export does
  // several blocking CDN photo fetches per object on the backend, so a double-click would
  // kick off a second multi-minute job for no reason.
  const triggerDownload = useCallback((url: string, fallbackFilename: string) => {
    if (isBusy) return; // guard against double-clicks firing a second job
    setIsBusy(true);
    setExportError(null);
    setExportPhase("preparing");
    setExportProgress(0);

    // No server signal exists for the "generating the file" phase (it's a single synchronous
    // request — any CDN photo fetches + rendering happen before any bytes are sent back), so
    // this climbs toward 92% and stalls there until headers actually arrive.
    const prepInterval: ReturnType<typeof setInterval> = setInterval(() => {
      setExportProgress((p) => (p >= 92 ? p : p + (92 - p) * 0.08));
    }, 200);

    void (async () => {
      try {
        const res = await fetch(url);
        clearInterval(prepInterval);

        if (!res.ok) {
          let detail = `Не удалось выгрузить файл (код ${res.status}).`;
          try {
            detail = detailFromBody(await res.json()) ?? detail;
          } catch {
            // Non-JSON error body — keep the generic message.
          }
          setExportError(detail);
          return;
        }

        const filename = filenameFromDisposition(res.headers.get("Content-Disposition"), fallbackFilename);
        const total = Number(res.headers.get("Content-Length") ?? 0);

        let blob: Blob;
        if (res.body && total > 0) {
          setExportPhase("downloading");
          setExportProgress(0);
          const reader = res.body.getReader();
          const chunks: Uint8Array[] = [];
          let received = 0;
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              chunks.push(value);
              received += value.length;
              setExportProgress(Math.min(99, (received / total) * 100));
            }
          }
          blob = new Blob(chunks as BlobPart[]);
        } else {
          // No Content-Length available (e.g. stripped along the way) — can't track real bytes.
          blob = await res.blob();
        }

        setExportProgress(100);
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      } catch {
        setExportError("Не удалось выгрузить файл. Проверьте соединение и попробуйте снова.");
      } finally {
        clearInterval(prepInterval);
        setIsBusy(false);
      }
    })();
  }, [isBusy]);

  // Bulk mutations (status change / soft-delete / restore) — same blocking overlay as
  // triggerDownload, refreshes the server-rendered list and clears the selection on success.
  const triggerAction = useCallback((path: string, body: Record<string, unknown>) => {
    if (isBusy) return;
    setIsBusy(true);
    setExportError(null);
    setExportPhase("acting");
    setExportProgress(0);

    const prepInterval: ReturnType<typeof setInterval> = setInterval(() => {
      setExportProgress((p) => (p >= 92 ? p : p + (92 - p) * 0.08));
    }, 200);

    void (async () => {
      try {
        const res = await fetch(path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        clearInterval(prepInterval);
        const data: unknown = await res.json().catch(() => null);

        if (!res.ok) {
          setExportError(detailFromBody(data) ?? `Не удалось выполнить действие (код ${res.status}).`);
          return;
        }

        setExportProgress(100);
        clear();
        router.refresh();
      } catch {
        setExportError("Не удалось выполнить действие. Проверьте соединение и попробуйте снова.");
      } finally {
        clearInterval(prepInterval);
        setIsBusy(false);
      }
    })();
  }, [isBusy, clear, router]);

  const value = useMemo(
    () => ({ selected, toggle, toggleMany, clear, isBusy, triggerDownload, triggerAction }),
    [selected, toggle, toggleMany, clear, isBusy, triggerDownload, triggerAction],
  );

  const overlayLabel = exportPhase === "downloading" ? "Скачиваем файл…" : exportPhase === "acting" ? "Выполняем действие…" : "Готовим файл…";

  return (
    <SelectionContext.Provider value={value}>
      {children}
      {isBusy && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center"
        >
          <div className="bg-surface rounded-2xl border border-foreground/10 shadow-2xl px-6 py-5 w-72 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-foreground">{overlayLabel}</span>
              <span className="text-sm font-mono text-foreground/45 tabular-nums shrink-0">
                {Math.round(exportProgress)}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-foreground/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-200 ease-out"
                style={{ width: `${exportProgress}%`, background: "#3772ff" }}
              />
            </div>
          </div>
        </div>
      )}
      {exportError && (
        <div role="alertdialog" className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-surface rounded-2xl border border-foreground/10 shadow-2xl px-6 py-5 max-w-sm space-y-3">
            <p className="text-sm text-foreground">{exportError}</p>
            <button
              type="button"
              onClick={() => setExportError(null)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity"
              style={{ background: "#3772ff" }}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </SelectionContext.Provider>
  );
}

function useSelection(): SelectionContextValue {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection must be used within PassportSelectionProvider");
  return ctx;
}

export function PassportRowCheckbox({ id }: { id: number }) {
  const { selected, toggle } = useSelection();
  return (
    <input
      type="checkbox"
      checked={selected.has(id)}
      onChange={() => toggle(id)}
      aria-label="Выбрать объект"
      className="w-4 h-4 rounded border-foreground/25 text-brand accent-brand cursor-pointer"
    />
  );
}

export function PassportSelectAllCheckbox({ ids }: { ids: number[] }) {
  const { selected, toggleMany } = useSelection();
  const ref = useRef<HTMLInputElement>(null);
  const allSelected = ids.length > 0 && ids.every((id) => selected.has(id));
  const someSelected = !allSelected && ids.some((id) => selected.has(id));

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = someSelected;
  }, [someSelected]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={allSelected}
      onChange={(e) => toggleMany(ids, e.target.checked)}
      aria-label="Выбрать все на странице"
      className="w-4 h-4 rounded border-foreground/25 text-brand accent-brand cursor-pointer"
    />
  );
}

/** Per-row "download this passport's PDF" button — routed through the same blocking-overlay download. */
export function PassportRowPdfButton({ id }: { id: number }) {
  const { isBusy, triggerDownload } = useSelection();
  return (
    <button
      type="button"
      onClick={() => triggerDownload(`/passports/${id}/pdf`, `passport_${id}.pdf`)}
      disabled={isBusy}
      title="Скачать PDF"
      aria-label="Скачать PDF"
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-foreground/40 hover:text-foreground hover:bg-foreground/8 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <FileDown className="w-4 h-4" />
    </button>
  );
}

type ExportFormat = "pdf" | "excel" | "json" | "geojson";

function MenuItem({
  icon: Icon, label, onClick, disabled, danger, title,
}: {
  icon?: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
        danger ? "text-red-500 hover:bg-red-500/10" : "text-foreground/75 hover:bg-foreground/[0.05] hover:text-foreground",
      )}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />}
      <span className="truncate">{label}</span>
    </button>
  );
}

/**
 * Single "Действия" dropdown covering everything that used to be Django-admin bulk actions:
 * exports (PDF/Excel/JSON/GeoJSON) plus, once something is checked, status changes and
 * delete/restore. An explicit selection always overrides the current filters for exports.
 */
export function PassportActionsMenu({
  exportHrefs,
  filteredCount,
  pdfLimit,
  isDeletedTab,
}: {
  exportHrefs: Record<ExportFormat, string>;
  filteredCount: number;
  pdfLimit: number;
  isDeletedTab: boolean;
}) {
  const { selected, clear, isBusy, triggerDownload, triggerAction } = useSelection();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const hasSelection = selected.size > 0;
  const ids = Array.from(selected);
  const pdfBlocked = !hasSelection && filteredCount > pdfLimit;

  const exportFilenames: Record<ExportFormat, string> = {
    pdf: "passports_export.zip",
    excel: `Inclusion_objects_${new Date().toISOString().slice(0, 10)}.xlsx`,
    json: "object_passport.json",
    geojson: "object_passport.geojson",
  };

  function runExport(format: ExportFormat) {
    setOpen(false);
    const href = hasSelection
      ? `/passports/export/${format}?ids=${ids.join(",")}`
      : exportHrefs[format];
    triggerDownload(href, exportFilenames[format]);
  }

  function runStatusChange(statusId: 1 | 2 | 3) {
    setOpen(false);
    triggerAction("/passports/bulk-action/set-status", { ids, status_id: statusId });
  }

  function runDelete() {
    setOpen(false);
    if (!window.confirm(`Удалить ${ids.length} объект(ов)? Их можно будет восстановить во вкладке «Удалённые».`)) return;
    triggerAction("/passports/bulk-action/delete", { ids });
  }

  function runRestore() {
    setOpen(false);
    triggerAction("/passports/bulk-action/restore?tab=deleted", { ids });
  }

  return (
    <div ref={ref} className="relative flex items-center gap-2">
      {hasSelection && <span className="text-sm text-foreground/60 shrink-0">{selected.size} выбрано</span>}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isBusy}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-foreground/15 text-foreground/70 hover:bg-foreground/5 hover:border-foreground/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Действия
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>

      {hasSelection && (
        <button
          type="button"
          onClick={clear}
          disabled={isBusy}
          title="Сбросить выбор"
          aria-label="Сбросить выбор"
          className="p-2 rounded-xl text-foreground/40 hover:text-foreground hover:bg-foreground/8 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {open && (
        <div className="absolute top-full right-0 mt-1.5 z-50 w-64 bg-surface border border-foreground/[0.08] rounded-2xl shadow-xl overflow-hidden py-1.5">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-foreground/35 uppercase tracking-wider">Экспорт</div>
          <MenuItem
            icon={FileDown}
            label="PDF"
            onClick={() => runExport("pdf")}
            disabled={pdfBlocked}
            title={pdfBlocked ? `Слишком много объектов (${filteredCount}) — лимит ${pdfLimit}, уточните фильтры или выберите объекты вручную` : undefined}
          />
          <MenuItem icon={FileSpreadsheet} label="Excel" onClick={() => runExport("excel")} />
          <MenuItem icon={FileJson} label="JSON" onClick={() => runExport("json")} />
          <MenuItem icon={Map} label="GeoJSON" onClick={() => runExport("geojson")} />

          {hasSelection && (
            <>
              <div className="my-1.5 border-t border-foreground/[0.06]" />
              <div className="px-3 py-1.5 text-[11px] font-semibold text-foreground/35 uppercase tracking-wider">Статус</div>
              <MenuItem label="Взять в работу" onClick={() => runStatusChange(1)} />
              <MenuItem label="Отправить на согласование" onClick={() => runStatusChange(2)} />
              <MenuItem label="Согласовать" onClick={() => runStatusChange(3)} />

              <div className="my-1.5 border-t border-foreground/[0.06]" />
              {isDeletedTab ? (
                <MenuItem icon={Undo2} label="Восстановить выбранные" onClick={runRestore} />
              ) : (
                <MenuItem icon={Trash2} label="Удалить выбранные" onClick={runDelete} danger />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
