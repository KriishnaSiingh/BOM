import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/kavach/AppShell";
import { Panel, Kpi } from "@/components/kavach/primitives";
import { KeyRound, ShieldCheck, RefreshCw, FileSignature } from "lucide-react";
import { format } from "date-fns";
import { getMock } from "@/lib/mock/store";

export const Route = createFileRoute("/crypto")({
  head: () => ({ meta: [{ title: "PQC Vault · KAVACH" }] }),
  component: CryptoPage,
});

function CryptoPage() {
  const mock = getMock();
  return (
    <AppShell title="POST-QUANTUM VAULT" subtitle="All KAVACH-internal artefacts protected with NIST FIPS 203/204 standardized algorithms">
      <div className="grid grid-cols-4 gap-4 mb-4">
        <Kpi label="KEM in service" value="ML-KEM-768" tone="quantum" />
        <Kpi label="Signature scheme" value="ML-DSA-65" tone="quantum" />
        <Kpi label="Keys under rotation" value={42} delta="next rotation in 6h 12m" tone="ok" />
        <Kpi label="Signed audit entries (24h)" value="12,481" delta="0 verification failures" tone="ok" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Panel title="Algorithm inventory" className="col-span-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground border-b">
                <th className="px-4 py-2">Algorithm</th>
                <th className="px-2 py-2">Purpose</th>
                <th className="px-2 py-2">Params</th>
                <th className="px-2 py-2 w-28">NIST level</th>
                <th className="px-4 py-2 w-28 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                { a: "ML-KEM-768", p: "Model weights envelope", k: "pk=1184B ct=1088B", n: "3", ok: true },
                { a: "ML-KEM-1024", p: "Audit log payloads", k: "pk=1568B ct=1568B", n: "5", ok: true },
                { a: "ML-DSA-65", p: "Alert signature", k: "sig=3309B", n: "3", ok: true },
                { a: "ML-DSA-87", p: "Firmware attestation", k: "sig=4627B", n: "5", ok: true },
                { a: "SLH-DSA-SHA2-192s", p: "Long-term root of trust", k: "sig=16224B", n: "3", ok: true },
                { a: "AES-256-GCM", p: "Hybrid symmetric layer", k: "key=256b", n: "—", ok: true },
              ].map((r) => (
                <tr key={r.a} className="hover:bg-accent/40">
                  <td className="px-4 py-3 font-mono text-[12px] text-quantum flex items-center gap-2">
                    <KeyRound className="h-3.5 w-3.5" />{r.a}
                  </td>
                  <td className="px-2 py-3 text-foreground/90">{r.p}</td>
                  <td className="px-2 py-3 font-mono text-[11px] text-muted-foreground">{r.k}</td>
                  <td className="px-2 py-3 font-mono text-[11px]">Level {r.n}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-ok">
                      <ShieldCheck className="h-3 w-3" /> ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <div className="space-y-4">
          <Panel title="Key rotation schedule">
            <div className="p-4 space-y-3 text-xs">
              {[
                { name: "kek-artefacts (ML-KEM-768)", in: "6h 12m", tone: "text-ok" },
                { name: "audit-signer (ML-DSA-65)", in: "1d 4h", tone: "text-ok" },
                { name: "attestation-root (SLH-DSA)", in: "17d", tone: "text-muted-foreground" },
                { name: "hybrid-aes-256", in: "42m", tone: "text-warn" },
              ].map((r) => (
                <div key={r.name} className="flex items-center gap-2">
                  <RefreshCw className={`h-3.5 w-3.5 ${r.tone}`} />
                  <span className="flex-1 text-foreground/90">{r.name}</span>
                  <span className={`font-mono tabular-nums ${r.tone}`}>{r.in}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Latest signed audit entry" right={<span className="font-mono text-[10px] text-ok">✓ verified</span>}>
            <div className="p-4 space-y-2 text-[11px] font-mono">
              <div className="text-muted-foreground">alert.id</div>
              <div className="text-foreground">{mock.alerts[0].id}</div>
              <div className="text-muted-foreground mt-2">issued</div>
              <div className="text-foreground">{format(mock.alerts[0].ts, "yyyy-MM-dd'T'HH:mm:ss'Z'")}</div>
              <div className="text-muted-foreground mt-2">ml-dsa-65 signature</div>
              <div className="text-quantum break-all leading-relaxed">
                3f9c1a…dc44b7e8f00a1b2c9dd8e34a6f21c0087bb5e19c46a2f10dd77e91c3a4b8f5c2e0d1a7b93… ⟨3309B⟩
              </div>
              <div className="mt-3 flex items-center gap-2 text-ok">
                <FileSignature className="h-3.5 w-3.5" />
                <span>verified against attestation-root · SLH-DSA</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
