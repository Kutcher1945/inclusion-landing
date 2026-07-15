"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Controller, useFormContext, type FieldValues, type Path } from "react-hook-form";
import { ChevronDown, Search, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PassportFormValues } from "@/lib/passports/detail-types";

export type SelectOption = { value: number | string; label: string };

// ─── Core dropdown (stateless value) ─────────────────────────────────────────

type CustomSelectProps = {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
};

export function CustomSelect({
  value, onChange, onBlur, options, placeholder = "—", disabled,
}: CustomSelectProps) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState("");
  const rootRef   = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => String(o.value) === String(value));
  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const close = useCallback(() => { setOpen(false); setSearch(""); }, []);

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [close]);

  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [close]);

  // focus search on open
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => searchRef.current?.focus(), 40);
      return () => clearTimeout(t);
    }
  }, [open]);

  function select(v: string) {
    onChange(v);
    close();
    onBlur?.();
  }

  return (
    <div ref={rootRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm text-left",
          "bg-foreground/[0.04] border border-foreground/[0.08]",
          "transition-all duration-200 focus:outline-none",
          "hover:border-foreground/20 hover:bg-foreground/[0.06]",
          open
            ? "border-brand/50 ring-2 ring-brand/[0.10] bg-brand/[0.02]"
            : "focus-visible:border-brand/50 focus-visible:ring-2 focus-visible:ring-brand/[0.10]",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <span className={cn("flex-1 truncate", selected ? "text-foreground" : "text-foreground/25")}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 shrink-0 transition-all duration-200",
            open ? "rotate-180 text-brand/60" : "text-foreground/25",
          )}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      <div
        className={cn(
          "absolute z-[200] left-0 right-0 mt-1.5 rounded-xl overflow-hidden",
          "border border-foreground/[0.10] bg-surface",
          "shadow-2xl shadow-black/50",
          "transition-all duration-150 origin-top",
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-[0.97] -translate-y-1.5 pointer-events-none",
        )}
      >
        {/* Search bar */}
        <div className="p-2 border-b border-foreground/[0.06]">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-foreground/[0.05] border border-foreground/[0.07] transition-colors focus-within:border-brand/30">
            <Search className="w-3 h-3 text-foreground/30 shrink-0" aria-hidden="true" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск..."
              className="flex-1 min-w-0 text-xs bg-transparent text-foreground placeholder:text-foreground/30 focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="shrink-0 text-foreground/30 hover:text-foreground/60 transition-colors"
                aria-label="Очистить поиск"
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Options list */}
        <div className="max-h-56 overflow-y-auto overscroll-contain">
          {/* Empty / clear */}
          <button
            type="button"
            onClick={() => select("")}
            className={cn(
              "w-full flex items-center px-3.5 py-2.5 text-xs transition-colors",
              !value
                ? "bg-brand/[0.08] text-brand/70"
                : "text-foreground/35 hover:bg-foreground/[0.04] hover:text-foreground/55",
            )}
          >
            —
          </button>

          {filtered.length === 0 ? (
            <p className="px-3.5 py-5 text-xs text-foreground/30 text-center">Ничего не найдено</p>
          ) : (
            filtered.map((opt) => {
              const isSel = String(opt.value) === String(value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => select(String(opt.value))}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-left transition-colors",
                    isSel
                      ? "bg-brand/[0.10] text-brand font-medium"
                      : "text-foreground/65 hover:bg-foreground/[0.04] hover:text-foreground",
                  )}
                >
                  <span className="flex-1 leading-snug">{opt.label}</span>
                  {isSel && <Check className="w-3.5 h-3.5 shrink-0 text-brand" aria-hidden="true" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── RHF-connected wrapper ────────────────────────────────────────────────────

type StringFieldsOf<T> = { [K in keyof T]: T[K] extends string ? K : never }[keyof T];

type FormSelectProps<T extends FieldValues> = {
  name: StringFieldsOf<T>;
  label: string;
  options: SelectOption[];
  className?: string;
};

/** Generic over the RHF form-values type so both the edit form (PassportFormValues)
 *  and the create form (PassportCreateFormValues) can reuse the same select —
 *  defaults to PassportFormValues so existing call sites need no type argument. */
export function FormSelect<T extends FieldValues = PassportFormValues>({
  name, label, options, className,
}: FormSelectProps<T>) {
  const { control } = useFormContext<T>();
  return (
    <div className={cn("space-y-1.5", className)}>
      <span className="block text-xs font-medium text-foreground/45 tracking-wide">{label}</span>
      <Controller
        control={control}
        name={name as unknown as Path<T>}
        render={({ field }) => (
          <CustomSelect
            value={String(field.value ?? "")}
            onChange={(v) => field.onChange(v)}
            onBlur={field.onBlur}
            options={options}
          />
        )}
      />
    </div>
  );
}
