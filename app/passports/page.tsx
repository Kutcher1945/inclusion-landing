import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown, Plus, Building2 } from "lucide-react";
import { Suspense } from "react";
import { fetchPassportList, fetchReferenceData, PASSPORT_PAGE_SIZE } from "@/lib/passports/api";
import type { PassportListFilters } from "@/lib/passports/api";
import { cn } from "@/lib/utils";
import type { RefItem } from "@/lib/passports/types";
import { toAbsoluteUrl } from "@/lib/passports/cdn";
import { StatusPill, DeliveryPill, statusVariant, criteriaBarColor } from "./StatusPill";
import { PassportHoverPreview } from "./PassportHoverPreview";
import { PassportFilters } from "./PassportFilters";
import { RestorePassportButton } from "./RestorePassportButton";
import { DeleteRowButton } from "./DeleteRowButton";
import { InlineStatusSelect } from "./InlineStatusSelect";
import {
  PassportSelectionProvider,
  PassportRowCheckbox,
  PassportSelectAllCheckbox,
  PassportActionsMenu,
  PassportRowPdfButton,
} from "./PassportSelection";

// Mirrors BULK_PDF_EXPORT_LIMIT in green_backend/inclusion/admin_api/views.py — keep in sync.
const BULK_PDF_EXPORT_LIMIT = 300;

type Props = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    district?: string;
    status?: string;
    delivery_status?: string;
    type_of_activity?: string;
    sub_type_of_activity?: string;
    tab?: string;
    sort?: string;
  }>;
};

function buildLookup(items: RefItem[]): Map<number, string> {
  return new Map(items.map((item) => [item.id, item.name_ru ?? `#${item.id}`]));
}

/** Shared filter params every link on this page needs to preserve. */
function baseParams(filters: PassportListFilters, tab: string): URLSearchParams {
  const params = new URLSearchParams();
  if (tab === "deleted") params.set("tab", "deleted");
  if (filters.search)                params.set("search",                filters.search);
  if (filters.district)              params.set("district",              filters.district);
  if (filters.status)                params.set("status",                filters.status);
  if (filters.delivery_status)       params.set("delivery_status",       filters.delivery_status);
  if (filters.type_of_activity)      params.set("type_of_activity",      filters.type_of_activity);
  if (filters.sub_type_of_activity)  params.set("sub_type_of_activity",  filters.sub_type_of_activity);
  if (filters.ordering)              params.set("sort",                  filters.ordering);
  return params;
}

/** Build a bulk-export href (any format) covering every record matching the current filters (no page param — the whole filtered set). */
function exportHref(format: "pdf" | "excel" | "json" | "geojson", filters: PassportListFilters, tab: string): string {
  return `/passports/export/${format}?${baseParams(filters, tab).toString()}`;
}

/** Build a pagination href that preserves all active filter/sort params and the current tab. */
function pageHref(page: number, filters: PassportListFilters, tab: string): string {
  const params = baseParams(filters, tab);
  params.set("page", String(page));
  return `/passports?${params.toString()}`;
}

/** Build a sort-toggle href for a column: unsorted/desc → asc, asc → desc. */
function sortHref(field: string, filters: PassportListFilters, tab: string): string {
  const isAsc = filters.ordering === field;
  const params = baseParams({ ...filters, ordering: undefined }, tab);
  params.set("page", "1");
  params.set("sort", isAsc ? `-${field}` : field);
  return `/passports?${params.toString()}`;
}

function SortIndicator({ field, currentSort }: { field: string; currentSort: string | undefined }) {
  if (currentSort === field) return <ChevronUp className="w-3 h-3" aria-hidden="true" />;
  if (currentSort === `-${field}`) return <ChevronDown className="w-3 h-3" aria-hidden="true" />;
  return <ChevronsUpDown className="w-3 h-3 opacity-30" aria-hidden="true" />;
}

function SortableTh({ field, filters, tab, className, children }: {
  field: string;
  filters: PassportListFilters;
  tab: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <th scope="col" className={className}>
      <Link href={sortHref(field, filters, tab)} className="inline-flex items-center gap-1 hover:text-foreground/60 transition-colors">
        {children}
        <SortIndicator field={field} currentSort={filters.ordering} />
      </Link>
    </th>
  );
}

export default async function PassportsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const activeTab = sp.tab === "deleted" ? "deleted" : "active";
  const isDeleted = activeTab === "deleted";

  const filters: PassportListFilters = {
    search:                sp.search                || undefined,
    district:              sp.district              || undefined,
    status:                sp.status                || undefined,
    delivery_status:       sp.delivery_status       || undefined,
    type_of_activity:      sp.type_of_activity      || undefined,
    sub_type_of_activity:  sp.sub_type_of_activity  || undefined,
    show_deleted:          isDeleted,
    ordering:              sp.sort                  || undefined,
  };

  const [passportData, refs] = await Promise.all([
    fetchPassportList(page, filters),
    fetchReferenceData(),
  ]);

  if (passportData === null) {
    const { readSessionTokens } = await import("@/lib/auth/session");
    const { access } = await readSessionTokens();
    if (!access) redirect("/login");
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
        <div className="w-12 h-12 rounded-full bg-foreground/[0.06] flex items-center justify-center">
          <Building2 className="w-6 h-6 text-foreground/30" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground/70">Сервер недоступен</p>
          <p className="text-xs text-foreground/40 mt-1">Бэкенд API не отвечает. Попробуйте обновить страницу.</p>
        </div>
      </div>
    );
  }

  const { count, results } = passportData;
  const totalPages = Math.max(1, Math.ceil(count / PASSPORT_PAGE_SIZE));

  const statusMap   = buildLookup(refs.statuses);
  const deliveryMap = buildLookup(refs.deliveryStatuses);
  const districtMap = buildLookup(refs.districts);
  const typeMap     = buildLookup(refs.activityTypes);
  const subTypeMap  = buildLookup(refs.activitySubTypes);

  const hasFilters = Object.entries(filters)
    .filter(([k]) => k !== "show_deleted")
    .some(([, v]) => Boolean(v));

  const statusList = refs.statuses;

  return (
    <PassportSelectionProvider>
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 id="passports-heading" className="text-xl font-semibold text-foreground">
            {isDeleted ? "Удалённые записи" : "Паспорта объектов"}
          </h1>
          <p className="text-sm text-foreground/50 mt-0.5">
            {count.toLocaleString("ru-RU")} объектов
            {hasFilters ? " — отфильтровано" : ` · страница ${page} из ${totalPages.toLocaleString("ru-RU")}`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <PassportActionsMenu
            exportHrefs={{
              pdf: exportHref("pdf", filters, activeTab),
              excel: exportHref("excel", filters, activeTab),
              json: exportHref("json", filters, activeTab),
              geojson: exportHref("geojson", filters, activeTab),
            }}
            filteredCount={count}
            pdfLimit={BULK_PDF_EXPORT_LIMIT}
            isDeletedTab={isDeleted}
          />
          {!isDeleted && (
            <Link
              href="/passports/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity"
              style={{ background: "#3772ff" }}
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Создать запись
            </Link>
          )}
        </div>
      </div>

      {/* Toolbar: tabs + filters unified into one card */}
      <div className="bg-surface rounded-2xl border border-foreground/8 shadow-sm">
        <div className="flex items-center justify-between gap-4 px-4 pt-4 pb-3 border-b border-foreground/[0.06]">
          <div className="flex items-center gap-1 p-1 bg-foreground/[0.06] rounded-xl w-fit">
            <Link
              href="/passports"
              className={cn(
                "px-4 py-1.5 text-sm rounded-lg transition-all",
                !isDeleted
                  ? "bg-surface shadow-sm font-medium text-foreground"
                  : "text-foreground/50 hover:text-foreground/70",
              )}
            >
              Активные
            </Link>
            <Link
              href="/passports?tab=deleted"
              className={cn(
                "px-4 py-1.5 text-sm rounded-lg transition-all",
                isDeleted
                  ? "bg-surface shadow-sm font-medium text-foreground"
                  : "text-foreground/50 hover:text-foreground/70",
              )}
            >
              Удалённые
            </Link>
          </div>
          {hasFilters && (
            <span className="text-xs font-medium text-brand bg-brand/10 px-2.5 py-1 rounded-full shrink-0">
              Фильтры активны
            </span>
          )}
        </div>
        <div className="px-4 py-3">
          <Suspense>
            <PassportFilters
              statuses={refs.statuses}
              deliveryStatuses={refs.deliveryStatuses}
              districts={refs.districts}
              activityTypes={refs.activityTypes}
              activitySubTypes={refs.activitySubTypes}
            />
          </Suspense>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-foreground/8 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full" aria-labelledby="passports-heading">
            <thead>
              <tr className="border-b border-foreground/[0.06] divide-x divide-foreground/[0.05]">
                <th scope="col" className="px-4 py-3 w-10">
                  <PassportSelectAllCheckbox ids={results.map((p) => p.id)} />
                </th>
                <SortableTh field="id" filters={filters} tab={activeTab}
                  className="px-4 py-3 text-left text-[11px] font-semibold text-foreground/35 uppercase tracking-wider w-16">
                  ID
                </SortableTh>
                <SortableTh field="name_ru" filters={filters} tab={activeTab}
                  className="px-5 py-3 text-left text-[11px] font-semibold text-foreground/35 uppercase tracking-wider">
                  Объект
                </SortableTh>
                <SortableTh field="district__name_ru" filters={filters} tab={activeTab}
                  className="px-4 py-3 text-left text-[11px] font-semibold text-foreground/35 uppercase tracking-wider hidden lg:table-cell">
                  Район
                </SortableTh>
                <SortableTh field="type_of_activity__name_ru" filters={filters} tab={activeTab}
                  className="px-4 py-3 text-left text-[11px] font-semibold text-foreground/35 uppercase tracking-wider hidden lg:table-cell">
                  Вид деятельности
                </SortableTh>
                <SortableTh field="sub_type_of_activity__name_ru" filters={filters} tab={activeTab}
                  className="px-4 py-3 text-left text-[11px] font-semibold text-foreground/35 uppercase tracking-wider hidden xl:table-cell">
                  Подвид
                </SortableTh>
                <SortableTh field="criteria_filled" filters={filters} tab={activeTab}
                  className="px-4 py-3 text-left text-[11px] font-semibold text-foreground/35 uppercase tracking-wider hidden xl:table-cell">
                  Критерии
                </SortableTh>
                <SortableTh field="status__name_ru" filters={filters} tab={activeTab}
                  className="px-4 py-3 text-left text-[11px] font-semibold text-foreground/35 uppercase tracking-wider">
                  Статус
                </SortableTh>
                {isDeleted ? (
                  <th scope="col" className="px-4 py-3 text-left text-[11px] font-semibold text-foreground/35 uppercase tracking-wider hidden sm:table-cell">
                    ID
                  </th>
                ) : (
                  <SortableTh field="delivery_status__name_ru" filters={filters} tab={activeTab}
                    className="px-4 py-3 text-left text-[11px] font-semibold text-foreground/35 uppercase tracking-wider hidden sm:table-cell">
                    Отправка
                  </SortableTh>
                )}
                <th scope="col" className="px-3 py-3 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/[0.04]">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center text-sm text-foreground/35">
                    {isDeleted ? "Нет удалённых объектов" : "Объекты не найдены"}
                  </td>
                </tr>
              ) : results.map((passport) => {
                const name = passport.name_ru ?? passport.name_kz ?? null;
                const coverPhoto = passport.entry_group_img_url ?? passport.site_area_img_url ?? null;
                const hoverPhotos = [
                  passport.entry_group_img_url,
                  passport.site_area_img_url,
                  passport.path_of_travel_img_url,
                  passport.sanitary_facilities_img_url,
                ]
                  .filter((u): u is string => Boolean(u))
                  .map(toAbsoluteUrl);
                const variantKey = statusVariant(passport.status);
                const criteriaFilled = passport.checklist.filter((c) => c.is_adapted).length;
                const criteriaTotal = passport.checklist.length;
                const criteriaPct = criteriaTotal > 0 ? Math.round((criteriaFilled / criteriaTotal) * 100) : 0;
                const hoverInfo = {
                  id: passport.id,
                  name,
                  address: passport.address,
                  district: passport.district ? (districtMap.get(passport.district) ?? null) : null,
                  activityType: passport.type_of_activity ? (typeMap.get(passport.type_of_activity) ?? null) : null,
                  statusLabel: passport.status ? (statusMap.get(passport.status) ?? null) : null,
                  statusVariant: variantKey,
                  deliveryLabel: passport.delivery_status ? (deliveryMap.get(passport.delivery_status) ?? null) : null,
                  deliverySent: passport.delivery_status === 2,
                  criteriaFilled,
                  criteriaTotal,
                  updatedAt: passport.updated_at,
                };

                return (
                  <tr
                    key={passport.id}
                    className={cn(
                      "group transition-colors divide-x divide-foreground/[0.05]",
                      isDeleted ? "opacity-60 hover:opacity-80" : "hover:bg-foreground/[0.025]",
                    )}
                  >
                    {/* Select */}
                    <td className="px-4 py-3.5 w-10">
                      <PassportRowCheckbox id={passport.id} />
                    </td>

                    {/* ID */}
                    <td className="px-4 py-3.5 w-16">
                      <span className="text-xs font-mono text-foreground/35">#{passport.id}</span>
                    </td>

                    {/* Name + address cell */}
                    <td className="px-5 py-3.5">
                      <PassportHoverPreview photos={hoverPhotos} info={hoverInfo} className="flex items-center gap-3 min-w-0">
                        {/* Cover photo, falling back to a neutral placeholder */}
                        {coverPhoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={toAbsoluteUrl(coverPhoto)}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover shrink-0 border border-foreground/10"
                          />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-foreground/[0.06] border border-foreground/10"
                            aria-hidden="true"
                          >
                            <Building2 className="w-4 h-4 text-foreground/25" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground/85 leading-snug truncate max-w-xs">
                            {isDeleted ? (
                              name ?? <em className="not-italic text-foreground/30">Без названия</em>
                            ) : (
                              <Link
                                href={`/passports/${passport.id}`}
                                className="hover:text-brand transition-colors"
                              >
                                {name ?? <em className="not-italic text-foreground/30">Без названия</em>}
                              </Link>
                            )}
                          </div>
                          {passport.address && (
                            <div className="text-xs text-foreground/30 mt-0.5 truncate max-w-xs">
                              {passport.address}
                            </div>
                          )}
                        </div>
                      </PassportHoverPreview>
                    </td>

                    {/* District */}
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-sm text-foreground/55">
                        {passport.district
                          ? (districtMap.get(passport.district) ?? `#${passport.district}`)
                          : <span className="text-foreground/20">—</span>}
                      </span>
                    </td>

                    {/* Activity type */}
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-xs text-foreground/50 block max-w-[160px] truncate">
                        {passport.type_of_activity
                          ? (typeMap.get(passport.type_of_activity) ?? `#${passport.type_of_activity}`)
                          : <span className="text-foreground/20">—</span>}
                      </span>
                    </td>

                    {/* Activity subtype */}
                    <td className="px-4 py-3.5 hidden xl:table-cell">
                      <span className="text-xs text-foreground/40 block max-w-[150px] truncate">
                        {passport.sub_type_of_activity
                          ? (subTypeMap.get(passport.sub_type_of_activity) ?? `#${passport.sub_type_of_activity}`)
                          : <span className="text-foreground/20">—</span>}
                      </span>
                    </td>

                    {/* Criteria completion */}
                    <td className="px-4 py-3.5 hidden xl:table-cell">
                      {criteriaTotal > 0 ? (
                        <div className="w-24">
                          <div className="flex items-baseline justify-between mb-1">
                            <span className="text-xs font-semibold tabular-nums" style={{ color: criteriaBarColor(criteriaPct) }}>
                              {criteriaPct}%
                            </span>
                            <span className="text-[10px] text-foreground/30 tabular-nums">{criteriaFilled}/{criteriaTotal}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-foreground/8 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${criteriaPct}%`, background: criteriaBarColor(criteriaPct) }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-foreground/20 text-xs">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      {isDeleted ? (
                        passport.status
                          ? <StatusPill label={statusMap.get(passport.status) ?? `#${passport.status}`} variant={variantKey} />
                          : <span className="text-foreground/20 text-xs">—</span>
                      ) : (
                        <InlineStatusSelect
                          id={passport.id}
                          statusId={passport.status}
                          statuses={statusList}
                        />
                      )}
                    </td>

                    {/* Delivery / ID */}
                    {isDeleted ? (
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <span className="text-sm font-mono font-medium text-foreground/60">#{passport.id}</span>
                      </td>
                    ) : (
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        {passport.delivery_status
                          ? <DeliveryPill
                              label={deliveryMap.get(passport.delivery_status) ?? `#${passport.delivery_status}`}
                              sent={passport.delivery_status === 2}
                            />
                          : <span className="text-foreground/20 text-xs">—</span>}
                      </td>
                    )}

                    {/* Actions */}
                    <td className="px-3 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <PassportRowPdfButton id={passport.id} />
                        {isDeleted
                          ? <RestorePassportButton id={passport.id} />
                          : <DeleteRowButton id={passport.id} />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <nav className="flex items-center justify-between" aria-label="Pagination">
        <p className="text-sm text-foreground/50">
          {count > 0
            ? `Показано ${(page - 1) * PASSPORT_PAGE_SIZE + 1}–${Math.min(page * PASSPORT_PAGE_SIZE, count)} из ${count.toLocaleString("ru-RU")}`
            : "Нет объектов"}
        </p>
        <div className="flex items-center gap-2">
          {page > 1 ? (
            <Link
              href={pageHref(page - 1, filters, activeTab)}
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-foreground/15 hover:border-foreground/30 hover:bg-foreground/5 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
              Назад
            </Link>
          ) : (
            <button type="button" disabled aria-disabled="true"
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-foreground/8 text-foreground/30 cursor-not-allowed">
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
              Назад
            </button>
          )}

          <span className="text-sm px-3 py-1.5 font-medium text-foreground/70" aria-current="page">
            {page} / {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              href={pageHref(page + 1, filters, activeTab)}
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-foreground/15 hover:border-foreground/30 hover:bg-foreground/5 transition-colors"
            >
              Вперёд
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          ) : (
            <button type="button" disabled aria-disabled="true"
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-foreground/8 text-foreground/30 cursor-not-allowed">
              Вперёд
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </nav>
    </div>
    </PassportSelectionProvider>
  );
}
