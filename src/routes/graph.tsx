import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/kavach/AppShell";
import { Panel } from "@/components/kavach/primitives";
import { CorrelationGraph } from "@/components/kavach/CorrelationGraph";
import { getMock } from "@/lib/mock/store";
import type { EntityKind } from "@/lib/mock/data";

export const Route = createFileRoute("/graph")({
  head: () => ({ meta: [{ title: "Correlation Graph · KAVACH SOC" }] }),
  component: GraphPage,
});

const KINDS: EntityKind[] = ["user", "device", "account", "merchant", "decoy"];

function GraphPage() {
  const mock = getMock();
  const [filter, setFilter] = useState<Set<EntityKind>>(new Set(KINDS));

  return (
    <AppShell title="CORRELATION GRAPH" subtitle="Unified identity ↔ asset ↔ transaction ↔ decoy graph across the last 24h">
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-3">
          <Panel
            title="Temporal correlation subgraph"
            right={
              <div className="flex gap-1.5">
                {KINDS.map((k) => {
                  const on = filter.has(k);
                  return (
                    <button
                      key={k}
                      onClick={() => {
                        const n = new Set(filter);
                        on ? n.delete(k) : n.add(k);
                        setFilter(n);
                      }}
                      className={`font-mono text-[10px] tracking-widest px-2 py-1 rounded-sm border transition-colors ${
                        on ? "bg-accent text-foreground border-border" : "text-muted-foreground border-transparent"
                      }`}
                    >
                      {k.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            }
          >
            <div className="p-2"><CorrelationGraph mock={mock} filter={filter} /></div>
          </Panel>
        </div>
        <div className="space-y-4">
          <Panel title="Legend">
            <div className="p-4 text-xs space-y-2">
              <p className="text-muted-foreground leading-relaxed">
                Nodes are entities; edges represent co-occurrence inside a correlated alert weighted by composite anomaly score.
              </p>
              <ul className="mt-3 space-y-1.5">
                <li><span className="font-mono text-danger">─── red</span> · score &gt; 85</li>
                <li><span className="font-mono text-warn">─── amber</span> · score &gt; 65</li>
                <li><span className="font-mono text-primary">─── cyan</span> · lower correlation</li>
                <li><span className="font-mono text-quantum">◎ pulse</span> · quantum decoy token</li>
              </ul>
            </div>
          </Panel>
          <Panel title="Top entities by centrality">
            <ul className="p-3 space-y-1.5 font-mono text-[11px]">
              {mock.alerts.slice(0, 6).flatMap((a) => a.entities).slice(0, 8).map((e, i) => (
                <li key={`${e.id}-${i}`} className="flex justify-between">
                  <span className="text-foreground/90">{e.label}</span>
                  <span className="text-muted-foreground">{e.kind}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
