"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Search, SlidersHorizontal, X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RefItem } from "@/lib/passports/types";

type Props = {
  statuses: RefItem[];
  deliveryStatuses: RefItem[];
  districts: RefItem[];
  activityTypes: RefItem[];
  activitySubTypes: RefItem[];
};

export function PassportFilters({ statuses, deliveryStatuses, districts, activityTypes, activitySubTypes }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [search, setSearch]           = useState(searchParams.get("search") ?? "");
  const [district, setDistrict]       = useState(searchParams.get("district") ?? "");
  const [status, setStatus]           = useState(searchParams.get("status") ?? "");
  const [delivery, setDelivery]       = useState(searchParams.get("delivery_status") ?? "");
  const [activity, setActivity]       = useState(searchParams.get("type_of_activity") ?? "");
  const [subActivity, setSubActivity] = useState(searchParams.get("sub_type_of_activity") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Tracks the search value *we* last pushed to the URL. The resync effect below only
  // overwrites local `search` state when the URL's value differs from this — otherwise,
  // fast typing during the 380ms debounce window gets clobbered by our own stale push
  // landing back through searchParams (letters appearing to "disappear" while typing).
  const lastPushedSearch = useRef(search);

  const activeCount = [search, district, status, delivery, activity, subActivity].filter(Boolean).length;
  const hasFilters = activeCount > 0;

  function buildUrl(overrides: Record<string, string> = {}): string {
    const params = new URLSearchParams();
    const vals: Record<string, string> = {
      search, district, status, delivery_status: delivery,
      type_of_activity: activity, sub_type_of_activity: subActivity,
      ...overrides,
    };
    const tab = searchParams.get("tab");
    if (tab) params.set("tab", tab);
    Object.entries(vals).forEach(([k, v]) => { if (v) params.set(k, v); });
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function navigate(overrides: Record<string, string> = {}) {
    lastPushedSearch.current = overrides.search ?? search;
    startTransition(() => router.push(buildUrl(overrides)));
  }

  function handleSearch(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate({ search: value }), 380);
  }

  function handleSelect(key: string, value: string) {
    if (key === "district")                  setDistrict(value);
    else if (key === "status")               setStatus(value);
    else if (key === "delivery_status")      setDelivery(value);
    else if (key === "type_of_activity")     setActivity(value);
    else if (key === "sub_type_of_activity") setSubActivity(value);
    navigate({ [key]: value });
  }

  function clearAll() {
    setSearch(""); setDistrict(""); setStatus(""); setDelivery(""); setActivity(""); setSubActivity("");
    lastPushedSearch.current = "";
    startTransition(() => router.push(pathname));
  }

  useEffect(() => {
    const urlSearch = searchParams.get("search") ?? "";
    setSearch((current) => (urlSearch === lastPushedSearch.current ? current : urlSearch));
    lastPushedSearch.current = urlSearch;
    setDistrict(searchParams.get("district") ?? "");
    setStatus(searchParams.get("status") ?? "");
    setDelivery(searchParams.get("delivery_status") ?? "");
    setActivity(searchParams.get("type_of_activity") ?? "");
    setSubActivity(searchParams.get("sub_type_of_activity") ?? "");
  }, [searchParams]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-[220px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/35 pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Поиск по названию, адресу…"
          className="w-full pl-8 pr-3 py-2 text-sm text-foreground border border-foreground/15 rounded-xl bg-surface focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 placeholder:text-foreground/30 transition"
        />
      </div>

      <div className="flex items-center text-foreground/25">
        <SlidersHorizontal className="w-3.5 h-3.5" />
      </div>

      <FilterDropdown
        value={district}
        onChange={(v) => handleSelect("district", v)}
        placeholder="Район"
        options={districts}
      />
      <FilterDropdown
        value={status}
        onChange={(v) => handleSelect("status", v)}
        placeholder="Статус"
        options={statuses}
      />
      <FilterDropdown
        value={delivery}
        onChange={(v) => handleSelect("delivery_status", v)}
        placeholder="Отправка"
        options={deliveryStatuses}
      />
      <FilterDropdown
        value={activity}
        onChange={(v) => handleSelect("type_of_activity", v)}
        placeholder="Вид деятельности"
        options={activityTypes}
      />
      <FilterDropdown
        value={subActivity}
        onChange={(v) => handleSelect("sub_type_of_activity", v)}
        placeholder="Подвид деятельности"
        options={activitySubTypes}
      />

      <button
        type="button"
        onClick={clearAll}
        disabled={!hasFilters}
        className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-foreground/15 text-foreground/50 hover:enabled:border-foreground/30 hover:enabled:text-foreground hover:enabled:bg-foreground/5"
      >
        <X className="w-3.5 h-3.5" />
        Сбросить{hasFilters ? ` (${activeCount})` : ""}
      </button>
    </div>
  );
}

function cleanLabel(name: string | null | undefined, id: number): string {
  return name?.replace(/^[\p{Emoji}\s]+/u, "").trim() || `#${id}`;
}

function FilterDropdown({
  value, onChange, placeholder, options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: RefItem[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const active = Boolean(value);
  const selectedLabel = active
    ? cleanLabel(options.find((o) => String(o.id) === value)?.name_ru, Number(value))
    : null;

  const filtered = query
    ? options.filter((o) => cleanLabel(o.name_ru, o.id).toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 40);

    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
    }
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function select(id: string) {
    onChange(id);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-2 text-sm rounded-xl border transition-all select-none",
          "bg-surface focus:outline-none",
          active
            ? "border-brand/40 text-brand font-medium pr-2.5"
            : "border-foreground/15 text-foreground/50 hover:border-foreground/25 hover:text-foreground/70",
          open && (active ? "ring-2 ring-brand/15" : "border-foreground/25 ring-2 ring-foreground/[0.06]"),
        )}
      >
        {active ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
            <span className="max-w-[140px] truncate">{selectedLabel}</span>
          </>
        ) : (
          <span>{placeholder}</span>
        )}
        <ChevronDown className={cn("w-3.5 h-3.5 shrink-0 opacity-40 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-50 w-60 bg-surface border border-foreground/[0.08] rounded-2xl shadow-xl overflow-hidden">
          {/* Search input */}
          <div className="px-3 pt-3 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-foreground/30 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск…"
                className="w-full pl-7 pr-3 py-1.5 text-sm bg-foreground/[0.04] rounded-lg outline-none placeholder:text-foreground/30 text-foreground"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-56 overflow-y-auto pb-1.5">
            {/* Clear option */}
            {active && (
              <button
                type="button"
                onClick={() => select("")}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground/40 hover:bg-foreground/[0.04] transition-colors"
              >
                <X className="w-3 h-3 shrink-0" />
                Сбросить фильтр
              </button>
            )}

            {filtered.length === 0 ? (
              <p className="px-3 py-5 text-sm text-foreground/30 text-center">Ничего не найдено</p>
            ) : (
              filtered.map((o) => {
                const label = cleanLabel(o.name_ru, o.id);
                const isActive = String(o.id) === value;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => select(String(o.id))}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors",
                      isActive
                        ? "bg-brand/[0.06] text-brand"
                        : "text-foreground/65 hover:bg-foreground/[0.04] hover:text-foreground",
                    )}
                  >
                    <span className="flex-1 truncate">{label}</span>
                    {isActive && <Check className="w-3.5 h-3.5 shrink-0 text-brand" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
