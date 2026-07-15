import { cn } from "@/lib/utils";

// Shared visual building blocks for the passport create and edit forms, so both
// stay pixel-identical without duplicating the section/field styling in two files.

export type SectionColor = "sky" | "emerald" | "violet" | "amber" | "cyan" | "yellow" | "indigo";

export const COLORS: Record<SectionColor, { iconBg: string; iconText: string; glow: string }> = {
  sky:     { iconBg: "bg-sky-500/15",     iconText: "text-sky-400",     glow: "via-sky-500/30" },
  emerald: { iconBg: "bg-emerald-500/15", iconText: "text-emerald-400", glow: "via-emerald-500/30" },
  violet:  { iconBg: "bg-violet-500/15",  iconText: "text-violet-400",  glow: "via-violet-500/30" },
  amber:   { iconBg: "bg-amber-500/15",   iconText: "text-amber-400",   glow: "via-amber-500/30" },
  cyan:    { iconBg: "bg-cyan-500/15",    iconText: "text-cyan-400",    glow: "via-cyan-500/30" },
  yellow:  { iconBg: "bg-yellow-500/15",  iconText: "text-yellow-400",  glow: "via-yellow-500/30" },
  indigo:  { iconBg: "bg-indigo-500/15",  iconText: "text-indigo-400",  glow: "via-indigo-500/30" },
};

type SectionCardProps = {
  id?: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  color: SectionColor;
  hint?: string;
  children: React.ReactNode;
};

export function SectionCard({ id, icon: Icon, title, color, hint, children }: SectionCardProps) {
  const c = COLORS[color];
  return (
    <section
      id={id}
      className="relative rounded-2xl border border-foreground/[0.07] bg-gradient-to-br from-foreground/[0.03] to-foreground/[0.01] scroll-mt-20"
    >
      <div className={cn("absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent", c.glow)} />

      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-xl shrink-0", c.iconBg)}>
            <Icon className={cn("w-4 h-4", c.iconText)} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground tracking-tight leading-none">{title}</h2>
            {hint && <p className="text-xs text-foreground/35 mt-1 leading-snug">{hint}</p>}
          </div>
        </div>

        {children}
      </div>
    </section>
  );
}

export const inputCls = [
  "w-full px-3.5 py-2.5 text-sm rounded-xl",
  "bg-foreground/[0.04] border border-foreground/[0.08]",
  "text-foreground placeholder:text-foreground/25",
  "focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/[0.12] focus:bg-brand/[0.03]",
  "transition-all duration-200",
].join(" ");

export const textareaCls = [
  "w-full px-3.5 py-2.5 text-sm rounded-xl resize-none",
  "bg-foreground/[0.04] border border-foreground/[0.08]",
  "text-foreground placeholder:text-foreground/25",
  "focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/[0.12] focus:bg-brand/[0.03]",
  "transition-all duration-200",
].join(" ");

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string };
export function Field({ label, className, ...props }: FieldProps) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-xs font-medium text-foreground/45 tracking-wide">{label}</span>
      <input {...props} className={inputCls} />
    </label>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; className?: string };
export function TextareaField({ label, className, ...props }: TextareaProps) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-xs font-medium text-foreground/45 tracking-wide">{label}</span>
      <textarea {...props} rows={props.rows ?? 2} className={textareaCls} />
    </label>
  );
}
