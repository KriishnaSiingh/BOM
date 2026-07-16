import { createFileRoute } from "@tanstack/react-router";
import { formatDistanceToNowStrict } from "date-fns";
import { AppShell } from "@/components/kavach/AppShell";
import { Panel, ScoreBar, Kpi } from "@/components/kavach/primitives";
import { getMock } from "@/lib/mock/store";
import { Skull, Activity, Waves } from "lucide-react";

export const Route = createFileRoute("/decoy-ledger")({
  head: () => ({ meta: [{ title: "Quantum Decoy Ledger · KAVACH" }] }),
  component: DecoyPage,
});

const STATUS_STYLE = {
  quiet: "text-muted-foreground border-border",
  probed: "text-warn border-warn/40 bg-warn/10",
  harvested: "text-danger border-danger/40 bg-danger/10",
} as const;

function DecoyPage() {
  const mock = getMock();
  const harvested = mock.decoys.filter((d) => d.status === "harvested").length;
  const probed = mock.decoys.filter((d) => d.status === "probed").length;
  const total = mock.decoys.length;

  return (
    <AppShell title="QUANTUM DECOY LEDGER" subtitle="Honeytoken records that look like key material, dormant accounts, and model artefacts — indistinguishable from real assets to an attacker">
      <div className="grid grid-cols-4 gap-4 mb-4">
        <Kpi label="Decoys seeded" value={total} tone="quantum" />
        <Kpi label="Probed" value={probed} tone="warn" />
        <Kpi label="Harvested (HNDL)" value={harvested} tone="danger" delta="post-quantum-relevant reads" />
        <Kpi label="Mean HNDL risk" value={Math.round(mock.decoys.reduce((s,d)=>s+d.hndlRisk,0)/total)} tone="danger" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Panel title="Ledger" className="col-span-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground border-b">
                <th className="px-4 py-2">Token</th>
                <th className="px-2 py-2 w-24">Status</th>
                <th className="px-2 py-2 w-20 text-right">Reads</th>
                <th className="px-2 py-2 w-32">Last touch</th>
                <th className="px-4 py-2 w-40">HNDL risk</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mock.decoys.map((d) => (
                <tr key={d.id} className="hover:bg-accent/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Skull className="h-3.5 w-3.5 text-quantum" />
                      <span className="font-mono text-[12px]">{d.label}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-sm border ${STATUS_STYLE[d.status]}`}>
                      {d.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-right font-mono text-[12px] tabular-nums">{d.reads}</td>
                  <td className="px-2 py-3 font-mono text-[11px] text-muted-foreground">
                    {d.lastAccess ? formatDistanceToNowStrict(d.lastAccess, { addSuffix: true }) : "—"}
                  </td>
                  <td className="px-4 py-3"><ScoreBar value={d.hndlRisk} tone={d.hndlRisk > 80 ? "danger" : d.hndlRisk > 40 ? "warn" : "ok"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <div className="space-y-4">
          <Panel title="Why this exists">
            <div className="p-4 text-xs leading-relaxed space-y-2 text-foreground/85">
              <p>
                <span className="text-quantum font-mono">Harvest-now-decrypt-later</span> attackers exfiltrate ciphertext today to break it once
                a cryptographically relevant quantum computer exists.
              </p>
              <p>
                KAVACH seeds decoy key material, dormant accounts, and fake model weights across the estate. No legitimate process touches them —
                any read is a high-fidelity signal of reconnaissance.
              </p>
              <p className="text-muted-foreground">
                Detection latency: <span className="font-mono text-foreground">&lt; 8s</span> from touch to alert.
              </p>
            </div>
          </Panel>
          <Panel title="Signal quality">
            <div className="p-4 space-y-3 text-xs">
              <Row icon={Activity} label="False-positive rate (30d)" val="0.00%" tone="text-ok" />
              <Row icon={Waves} label="Attacker dwell before touch (avg)" val="6.4d" tone="text-warn" />
              <Row icon={Skull} label="Escalations to L2 (7d)" val="3" tone="text-danger" />
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ icon: Icon, label, val, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; val: string; tone: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-3.5 w-3.5 ${tone}`} />
      <span className="text-foreground/85 flex-1">{label}</span>
      <span className={`font-mono tabular-nums ${tone}`}>{val}</span>
    </div>
  );
}
