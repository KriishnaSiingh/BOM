import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { AppShell } from "@/components/kavach/AppShell";
import { Panel, SeverityChip, SourceBadge, ScoreBar } from "@/components/kavach/primitives";
import { AlertDrawer } from "@/components/kavach/AlertDrawer";
import { getMock } from "@/lib/mock/store";
import type { Alert, Severity } from "@/lib/mock/data";
import { Search } from "lucide-react";

export const Route = createFileRoute("/alerts")({
  head: () => ({ meta: [{ title: "Alerts · KAVACH SOC" }] }),
  component: AlertsPage,
});

const SEV: Severity[] = ["critical", "high", "medium", "low"];

function AlertsPage() {
  const mock = getMock();
  const [selected, setSelected] = useState<Alert | null>(null);
  const [q, setQ] = useState("");
  const [sev, setSev] = useState<Set<Severity>>(new Set(SEV));

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return mock.alerts.filter((a) =>
      sev.has(a.severity) &&
      (!needle || a.title.toLowerCase().includes(needle) || a.id.toLowerCase().includes(needle) ||
       a.entities.some((e) => e.label.toLowerCase().includes(needle)))
    );
  }, [mock, q, sev]);

  return (
    <AppShell title="ALERTS" subtitle="Correlated multi-source incidents · click any row for the full attack narrative">
      <Panel
        title={`${rows.length} alerts`}
        right={
          <div className="flex items-center gap-2">
            {SEV.map((s) => {
              const on = sev.has(s);
              return (
                <button
                  key={s}
                  onClick={() => {
                    const n = new Set(sev);
                    on ? n.delete(s) : n.add(s);
                    setSev(n);
                  }}
                  className={`font-mono text-[10px] tracking-widest px-2 py-1 rounded-sm border transition-colors ${
                    on ? "bg-accent text-foreground border-border" : "text-muted-foreground border-transparent"
                  }`}
                >
                  {s.toUpperCase()}
                </button>
              );
            })}
            <div className="relative ml-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="search id, title, entity…"
                className="pl-7 pr-2 py-1 bg-background border rounded-sm font-mono text-[11px] w-56 outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        }
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground border-b">
              <th className="px-4 py-2 w-20">ID</th>
              <th className="px-2 py-2 w-24">Severity</th>
              <th className="px-2 py-2">Title</th>
              <th className="px-2 py-2 w-40">Sources</th>
              <th className="px-2 py-2 w-40">Score</th>
              <th className="px-4 py-2 w-32 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((a) => (
              <tr key={a.id} onClick={() => setSelected(a)} className="hover:bg-accent/40 cursor-pointer">
                <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{a.id}</td>
                <td className="px-2 py-3"><SeverityChip severity={a.severity} /></td>
                <td className="px-2 py-3">{a.title}</td>
                <td className="px-2 py-3">
                  <div className="flex flex-wrap gap-1">
                    {a.sources.map((s) => <SourceBadge key={s} source={s} />)}
                  </div>
                </td>
                <td className="px-2 py-3"><ScoreBar value={a.score} tone={a.severity === "critical" ? "danger" : a.severity === "high" ? "warn" : "ok"} /></td>
                <td className="px-4 py-3 text-right font-mono text-[11px] text-muted-foreground">{format(a.ts, "MMM d HH:mm")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <AlertDrawer alert={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </AppShell>
  );
}
