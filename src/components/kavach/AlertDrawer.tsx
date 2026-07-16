import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { format } from "date-fns";
import { SeverityChip, SourceBadge, ScoreBar } from "./primitives";
import type { Alert } from "@/lib/mock/data";
import { ArrowRight } from "lucide-react";

export function AlertDrawer({ alert, onOpenChange }: { alert: Alert | null; onOpenChange: (o: boolean) => void }) {
  return (
    <Sheet open={!!alert} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        {alert && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-[11px] text-muted-foreground">{alert.id}</span>
                <SeverityChip severity={alert.severity} />
                {alert.sources.map((s) => <SourceBadge key={s} source={s} />)}
              </div>
              <SheetTitle className="text-left leading-snug">{alert.title}</SheetTitle>
              <SheetDescription className="text-left font-mono text-[11px]">
                {format(alert.ts, "MMM d, yyyy · HH:mm:ss 'IST'")}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Composite Score</div>
                <ScoreBar value={alert.score} tone={alert.severity === "critical" ? "danger" : alert.severity === "high" ? "warn" : "ok"} />
                <p className="mt-3 text-sm leading-relaxed text-foreground/90">{alert.narrative}</p>
              </div>

              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Entities in scope</div>
                <div className="flex flex-wrap gap-1.5">
                  {alert.entities.map((e) => (
                    <span key={e.id} className="rounded-sm border bg-muted px-2 py-1 font-mono text-[11px]">
                      <span className="text-muted-foreground mr-1.5">{e.kind}</span>{e.label}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Correlated timeline</div>
                <ol className="relative border-l border-border ml-2 space-y-3">
                  {alert.events.map((ev) => (
                    <li key={ev.id} className="pl-4 relative">
                      <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                      <div className="flex items-center gap-2">
                        <SourceBadge source={ev.source} />
                        <span className="font-mono text-[10px] text-muted-foreground">{format(ev.ts, "HH:mm:ss")}</span>
                        <span className="ml-auto font-mono text-[10px] text-muted-foreground">w={ev.score.toFixed(2)}</span>
                      </div>
                      <div className="mt-1 text-sm">{ev.message}</div>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">SHAP feature attribution</div>
                <div className="space-y-2">
                  {alert.shap.map((f) => (
                    <div key={f.feature} className="flex items-center gap-3">
                      <div className="w-40 text-xs text-muted-foreground truncate">{f.feature}</div>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${f.weight * 100}%` }} />
                      </div>
                      <div className="w-10 text-right font-mono text-[11px] tabular-nums">{(f.weight * 100).toFixed(0)}%</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-sm border border-danger/40 bg-danger/10 p-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-danger mb-1">Recommended action</div>
                <div className="text-sm flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-danger shrink-0" />
                  <span>{alert.action}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
