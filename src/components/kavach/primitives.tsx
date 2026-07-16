import type { ReactNode } from "react";
import { SEVERITY_STYLES, SOURCE_TINT, type Severity, type Source } from "@/lib/mock/data";

export function Panel({
  title,
  right,
  children,
  className = "",
}: {
  title?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-sm border bg-card ${className}`}>
      {(title || right) && (
        <header className="flex items-center justify-between px-4 py-2.5 border-b">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{title}</h2>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}

export function SeverityChip({ severity }: { severity: Severity }) {
  const s = SEVERITY_STYLES[severity];
  return (
    <span className={`inline-flex items-center rounded-sm px-1.5 py-0.5 font-mono text-[10px] tracking-wider ${s.bg}`}>
      {s.label}
    </span>
  );
}

export function SourceBadge({ source }: { source: Source }) {
  return (
    <span className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-[10px] tracking-wider ${SOURCE_TINT[source]}`}>
      {source}
    </span>
  );
}

export function ScoreBar({ value, tone = "danger" }: { value: number; tone?: "danger" | "warn" | "ok" | "quantum" }) {
  const color = tone === "danger" ? "bg-danger" : tone === "warn" ? "bg-warn" : tone === "quantum" ? "bg-quantum" : "bg-ok";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      <span className="font-mono text-[11px] tabular-nums w-9 text-right">{Math.round(value)}</span>
    </div>
  );
}

export function Kpi({
  label,
  value,
  delta,
  tone = "default",
}: {
  label: string;
  value: string | number;
  delta?: string;
  tone?: "default" | "danger" | "warn" | "ok" | "quantum";
}) {
  const toneColor =
    tone === "danger" ? "text-danger"
    : tone === "warn" ? "text-warn"
    : tone === "ok" ? "text-ok"
    : tone === "quantum" ? "text-quantum"
    : "text-primary";
  return (
    <div className="rounded-sm border bg-card p-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-2 font-mono text-3xl tabular-nums ${toneColor}`}>{value}</div>
      {delta && <div className="mt-1 font-mono text-[11px] text-muted-foreground">{delta}</div>}
    </div>
  );
}
