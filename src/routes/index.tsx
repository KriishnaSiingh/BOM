import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format, formatDistanceToNowStrict } from "date-fns";
import { AppShell } from "@/components/kavach/AppShell";
import { Panel, Kpi, SeverityChip, SourceBadge, ScoreBar } from "@/components/kavach/primitives";
import { ThreatTimeline } from "@/components/kavach/ThreatTimeline";
import { AlertDrawer } from "@/components/kavach/AlertDrawer";
import { getMock } from "@/lib/mock/store";
import type { Alert } from "@/lib/mock/data";
import { ShieldAlert, Skull, TrendingUp, Cpu } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Overview · KAVACH SOC" }] }),
  component: Overview,
});

function Overview() {
  const mock = getMock();
  const [selected, setSelected] = useState<Alert | null>(null);
  const critical = mock.alerts.filter((a) => a.severity === "critical").length;
  const decoyHits = mock.decoys.filter((d) => d.reads + d.writes > 0).length;

  return (
    <AppShell title="OVERVIEW" subtitle="Real-time correlation of SIEM/EDR/VPN/PAM telemetry with core-banking transactions">
      <div className="grid grid-cols-4 gap-4 mb-4">
        <Kpi label="Critical alerts (24h)" value={critical} delta="+2 vs 24h prior" tone="danger" />
        <Kpi label="Correlated events" value="1,284" delta="from 4.2M raw events" tone="default" />
        <Kpi label="Decoy tokens triggered" value={decoyHits} delta="of 6 seeded · HNDL surface" tone="quantum" />
        <Kpi label="Model AUC (rolling 7d)" value="0.978" delta="GNN + IF + XGB ensemble" tone="ok" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Panel
          title="Live correlated alert feed"
          right={<span className="flex items-center gap-1.5 text-[10px] font-mono text-ok"><span className="h-1.5 w-1.5 rounded-full bg-ok animate-pulse" />streaming</span>}
          className="col-span-2"
        >
          <ul className="divide-y">
            {mock.alerts.map((a) => (
              <li
                key={a.id}
                onClick={() => setSelected(a)}
                className="px-4 py-3 hover:bg-accent/40 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] text-muted-foreground w-16">{a.id}</span>
                  <SeverityChip severity={a.severity} />
                  {a.sources.map((s) => <SourceBadge key={s} source={s} />)}
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                    {formatDistanceToNowStrict(a.ts, { addSuffix: true })}
                  </span>
                </div>
                <div className="text-sm text-foreground/95 leading-snug">{a.title}</div>
                <div className="mt-2 max-w-md"><ScoreBar value={a.score} tone={a.severity === "critical" ? "danger" : a.severity === "high" ? "warn" : "ok"} /></div>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-4">
          <Panel title="Anomaly score · last 24h">
            <div className="p-2"><ThreatTimeline mock={mock} /></div>
          </Panel>

          <Panel title="Ensemble contribution">
            <div className="p-4 space-y-3">
              {[
                { icon: Cpu, label: "GNN (graph attention)", w: 0.52, tone: "text-primary" },
                { icon: TrendingUp, label: "XGBoost (tabular)", w: 0.31, tone: "text-txn" },
                { icon: ShieldAlert, label: "IsolationForest", w: 0.11, tone: "text-warn" },
                { icon: Skull, label: "Decoy-ledger prior", w: 0.06, tone: "text-quantum" },
              ].map((r) => {
                const Icon = r.icon;
                return (
                  <div key={r.label} className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${r.tone}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-foreground/90">{r.label}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">{(r.w * 100).toFixed(0)}%</span>
                      </div>
                      <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${r.w * 100}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <Panel title="Ingest health" className="col-span-2">
          <div className="grid grid-cols-6 divide-x">
            {[
              { s: "SIEM", eps: "12.4k", ok: true },
              { s: "EDR", eps: "8.1k", ok: true },
              { s: "VPN", eps: "1.2k", ok: true },
              { s: "PAM", eps: "0.3k", ok: true },
              { s: "TXN", eps: "20.2k", ok: true },
              { s: "DECOY", eps: "12", ok: true },
            ].map((r) => (
              <div key={r.s} className="p-4">
                <div className="font-mono text-[10px] tracking-widest text-muted-foreground">{r.s}</div>
                <div className="mt-1 font-mono text-lg tabular-nums">{r.eps}<span className="text-[10px] text-muted-foreground ml-1">eps</span></div>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-ok">
                  <span className="h-1 w-1 rounded-full bg-ok" />healthy
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Recent audit signatures">
          <ul className="p-3 space-y-1.5 font-mono text-[11px]">
            {mock.alerts.slice(0, 5).map((a) => (
              <li key={a.id} className="flex items-center gap-2 text-muted-foreground">
                <span className="text-ok">✓</span>
                <span className="text-foreground/80">{a.id}</span>
                <span className="truncate">·  {format(a.ts, "HH:mm:ss")} · ML-DSA-65</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <AlertDrawer alert={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </AppShell>
  );
}
