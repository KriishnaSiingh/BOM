import { mulberry32, pick, intBetween } from "./rng";

export type Severity = "critical" | "high" | "medium" | "low";
export type Source = "SIEM" | "EDR" | "VPN" | "PAM" | "TXN" | "DECOY";
export type EntityKind = "user" | "device" | "account" | "merchant" | "decoy";

export interface Entity {
  id: string;
  kind: EntityKind;
  label: string;
  meta?: string;
}

export interface RawEvent {
  id: string;
  ts: number; // ms epoch (relative demo)
  source: Source;
  entityIds: string[];
  message: string;
  score: number; // 0..1 anomaly contribution
}

export interface Alert {
  id: string;
  ts: number;
  title: string;
  severity: Severity;
  score: number; // 0..100
  sources: Source[];
  entities: Entity[];
  events: RawEvent[];
  narrative: string;
  action: string;
  shap: { feature: string; weight: number }[]; // -1..1
}

export interface DecoyRecord {
  id: string;
  label: string;
  seededAt: number;
  lastAccess: number | null;
  reads: number;
  writes: number;
  hndlRisk: number; // 0..100
  status: "quiet" | "probed" | "harvested";
}

const NOW = Date.UTC(2026, 6, 16, 12, 0, 0); // stable demo "now"

const FIRST = ["arjun", "meera", "rohan", "priya", "kabir", "isha", "vikram", "neha", "sanjay", "ananya"];
const LAST = ["sharma", "iyer", "patel", "khan", "reddy", "das", "menon", "singh", "kulkarni", "bose"];
const HOSTS = ["core-tx-01", "core-tx-02", "risk-node-7", "vault-3", "ml-gpu-2", "hsm-primary", "swift-gw-1"];
const MERCHANTS = ["ShellCorp Wire", "Nova Exchange", "PayVault LLC", "MetaBank Ltd", "OffshoreOne"];
const ASN = ["AS9498 Airtel", "AS55836 Reliance", "AS58224 Iran-Tel", "AS197207 MCI", "AS4837 CN-UNI"];

export function buildMock(seed = 42) {
  const rng = mulberry32(seed);

  const users: Entity[] = Array.from({ length: 14 }, (_, i) => ({
    id: `u_${i}`,
    kind: "user",
    label: `${pick(rng, FIRST)}.${pick(rng, LAST)}`,
    meta: pick(rng, ["Ops", "Treasury", "Risk", "Admin", "SwiftOps", "Reconciliation"]),
  }));

  const devices: Entity[] = HOSTS.map((h, i) => ({
    id: `d_${i}`,
    kind: "device",
    label: h,
    meta: pick(rng, ["Prod", "Staging", "DMZ"]),
  }));

  const accounts: Entity[] = Array.from({ length: 10 }, (_, i) => ({
    id: `a_${i}`,
    kind: "account",
    label: `ACC-${100000 + intBetween(rng, 0, 899999)}`,
    meta: pick(rng, ["Corp", "Retail", "Nostro", "Vostro"]),
  }));

  const merchants: Entity[] = MERCHANTS.map((m, i) => ({
    id: `m_${i}`,
    kind: "merchant",
    label: m,
    meta: pick(rng, ["Mauritius", "Dubai", "Cayman", "Panama", "Cyprus"]),
  }));

  const decoys: DecoyRecord[] = [
    { id: "dk_0", label: "ACC-999001 · CEO shadow account", seededAt: NOW - 86400000 * 90, lastAccess: NOW - 3600_000 * 4, reads: 3, writes: 0, hndlRisk: 82, status: "probed" },
    { id: "dk_1", label: "vault-3://kek-2019-legacy.pem", seededAt: NOW - 86400000 * 60, lastAccess: NOW - 60_000 * 22, reads: 11, writes: 0, hndlRisk: 96, status: "harvested" },
    { id: "dk_2", label: "swift-gw-1://mt103.template.decoy", seededAt: NOW - 86400000 * 30, lastAccess: null, reads: 0, writes: 0, hndlRisk: 4, status: "quiet" },
    { id: "dk_3", label: "ACC-999044 · dormant treasury", seededAt: NOW - 86400000 * 45, lastAccess: NOW - 3600_000 * 27, reads: 2, writes: 0, hndlRisk: 41, status: "probed" },
    { id: "dk_4", label: "hsm-primary://kyber-rotation.log.bak", seededAt: NOW - 86400000 * 14, lastAccess: NOW - 60_000 * 8, reads: 7, writes: 1, hndlRisk: 91, status: "harvested" },
    { id: "dk_5", label: "ml-gpu-2://gnn.weights.q4.decoy", seededAt: NOW - 86400000 * 20, lastAccess: null, reads: 0, writes: 0, hndlRisk: 6, status: "quiet" },
  ];

  const decoyEntities: Entity[] = decoys.map((d) => ({
    id: d.id.replace("dk_", "de_"),
    kind: "decoy",
    label: d.label.split(" · ")[0].split("://").pop()!,
    meta: "honeytoken",
  }));

  // --- Correlated alerts ---
  const alerts: Alert[] = [
    {
      id: "AL-2041",
      ts: NOW - 60_000 * 12,
      title: "Privileged access from novel ASN → 4.2Cr wire to shell entity",
      severity: "critical",
      score: 97,
      sources: ["VPN", "PAM", "TXN"],
      entities: [users[3], devices[5], accounts[2], merchants[0]],
      events: [
        { id: "e1", ts: NOW - 60_000 * 42, source: "VPN", entityIds: [users[3].id], message: `VPN login ${users[3].label} from ${ASN[2]} (first seen)`, score: 0.71 },
        { id: "e2", ts: NOW - 60_000 * 31, source: "PAM", entityIds: [users[3].id, devices[5].id], message: `Just-in-time elevation on ${devices[5].label} approved by self-ticket`, score: 0.63 },
        { id: "e3", ts: NOW - 60_000 * 19, source: "EDR", entityIds: [devices[5].id], message: `mimikatz-like memory read on ${devices[5].label}`, score: 0.88 },
        { id: "e4", ts: NOW - 60_000 * 12, source: "TXN", entityIds: [accounts[2].id, merchants[0].id], message: `Wire ₹4,21,00,000 → ${merchants[0].label} (Mauritius), first-ever counterparty`, score: 0.94 },
      ],
      narrative:
        "GNN correlated a novel-ASN privileged login with a memory-scraping EDR event and an outbound wire to a first-seen offshore counterparty within a 30-minute window on the same identity graph.",
      action: "Freeze wire · revoke session · rotate PAM secret · page L2",
      shap: [
        { feature: "novel ASN for identity", weight: 0.34 },
        { feature: "counterparty never seen", weight: 0.28 },
        { feature: "EDR: credential dumping", weight: 0.22 },
        { feature: "amount vs 90d p99", weight: 0.11 },
        { feature: "time-of-day", weight: 0.05 },
      ],
    },
    {
      id: "AL-2040",
      ts: NOW - 60_000 * 34,
      title: "Decoy KEK read burst — HNDL reconnaissance pattern",
      severity: "critical",
      score: 93,
      sources: ["DECOY", "SIEM"],
      entities: [decoyEntities[1], devices[3], users[7]],
      events: [
        { id: "e1", ts: NOW - 60_000 * 55, source: "SIEM", entityIds: [devices[3].id], message: `Bulk read of legacy key material on ${devices[3].label}`, score: 0.72 },
        { id: "e2", ts: NOW - 60_000 * 40, source: "DECOY", entityIds: [decoyEntities[1].id], message: `Honeytoken kek-2019-legacy.pem read 9× in 4min`, score: 0.95 },
        { id: "e3", ts: NOW - 60_000 * 34, source: "DECOY", entityIds: [decoyEntities[4].id], message: `Honeytoken kyber-rotation.log.bak accessed`, score: 0.82 },
      ],
      narrative:
        "Two Quantum Decoy Ledger tokens were touched in rapid succession by a service account with no legitimate need — classic harvest-now-decrypt-later staging behaviour.",
      action: "Quarantine host · rotate ML-KEM-768 domain keys · preserve forensics",
      shap: [
        { feature: "decoy access velocity", weight: 0.41 },
        { feature: "target = key material", weight: 0.29 },
        { feature: "off-hours", weight: 0.14 },
        { feature: "no ticket linkage", weight: 0.10 },
        { feature: "identity kind = service", weight: 0.06 },
      ],
    },
    {
      id: "AL-2039",
      ts: NOW - 3600_000 * 2,
      title: "Structured layering — 47 transfers just under reporting cap",
      severity: "high",
      score: 81,
      sources: ["TXN"],
      entities: [accounts[5], accounts[7], merchants[2]],
      events: [
        { id: "e1", ts: NOW - 3600_000 * 3, source: "TXN", entityIds: [accounts[5].id], message: `47 transfers of ₹9.8L–₹9.99L over 92 minutes`, score: 0.86 },
        { id: "e2", ts: NOW - 3600_000 * 2, source: "TXN", entityIds: [accounts[7].id, merchants[2].id], message: `Consolidation to ${merchants[2].label}`, score: 0.74 },
      ],
      narrative: "Classic smurfing pattern — many sub-threshold debits fan out then re-consolidate into a single payout account.",
      action: "SAR pre-fill · hold outbound · notify FIU-liaison",
      shap: [
        { feature: "sub-threshold clustering", weight: 0.38 },
        { feature: "fan-in ratio", weight: 0.27 },
        { feature: "velocity vs baseline", weight: 0.20 },
        { feature: "merchant risk", weight: 0.15 },
      ],
    },
    {
      id: "AL-2038",
      ts: NOW - 3600_000 * 4,
      title: "Impossible travel — same identity, Mumbai → Tehran in 11min",
      severity: "high",
      score: 76,
      sources: ["SIEM", "VPN"],
      entities: [users[9], devices[0]],
      events: [
        { id: "e1", ts: NOW - 3600_000 * 4 - 60_000 * 11, source: "SIEM", entityIds: [users[9].id], message: `SSO login from Mumbai IP`, score: 0.4 },
        { id: "e2", ts: NOW - 3600_000 * 4, source: "VPN", entityIds: [users[9].id], message: `VPN login from ${ASN[2]}`, score: 0.82 },
      ],
      narrative: "Geo-impossible session on a treasury identity — likely token replay after phishing.",
      action: "Revoke refresh tokens · force step-up MFA · review last 24h queries",
      shap: [
        { feature: "geo distance / Δt", weight: 0.44 },
        { feature: "sanctioned ASN", weight: 0.31 },
        { feature: "identity privilege", weight: 0.25 },
      ],
    },
    {
      id: "AL-2037",
      ts: NOW - 3600_000 * 6,
      title: "PAM secret used outside change window",
      severity: "medium",
      score: 58,
      sources: ["PAM"],
      entities: [users[4], devices[6]],
      events: [
        { id: "e1", ts: NOW - 3600_000 * 6, source: "PAM", entityIds: [users[4].id, devices[6].id], message: `Break-glass account used on ${devices[6].label}`, score: 0.58 },
      ],
      narrative: "Break-glass credential used with no matching change ticket.",
      action: "Verify with on-call · rotate secret if unlinked",
      shap: [
        { feature: "no CAB ticket link", weight: 0.52 },
        { feature: "off business hours", weight: 0.30 },
        { feature: "asset criticality", weight: 0.18 },
      ],
    },
    {
      id: "AL-2036",
      ts: NOW - 3600_000 * 9,
      title: "EDR quarantine — packed binary on risk-node-7",
      severity: "medium",
      score: 52,
      sources: ["EDR"],
      entities: [devices[2]],
      events: [
        { id: "e1", ts: NOW - 3600_000 * 9, source: "EDR", entityIds: [devices[2].id], message: `UPX-packed binary auto-quarantined`, score: 0.52 },
      ],
      narrative: "Endpoint self-remediated; no downstream telemetry correlated.",
      action: "Confirm quarantine · sample to malware review",
      shap: [
        { feature: "packer entropy", weight: 0.6 },
        { feature: "signer unknown", weight: 0.4 },
      ],
    },
    {
      id: "AL-2035",
      ts: NOW - 3600_000 * 14,
      title: "New merchant onboarded — matched shell-entity pattern (23%)",
      severity: "low",
      score: 34,
      sources: ["TXN"],
      entities: [merchants[3], accounts[1]],
      events: [
        { id: "e1", ts: NOW - 3600_000 * 14, source: "TXN", entityIds: [merchants[3].id, accounts[1].id], message: `KYC completed for ${merchants[3].label}`, score: 0.34 },
      ],
      narrative: "Onboarding features weakly resemble known shell entities; watchlist only.",
      action: "Enhanced due diligence at next payment",
      shap: [
        { feature: "directors overlap", weight: 0.5 },
        { feature: "registered address density", weight: 0.3 },
        { feature: "beneficial owner opacity", weight: 0.2 },
      ],
    },
  ];

  // 24h anomaly timeline
  const timeline = Array.from({ length: 48 }, (_, i) => {
    const ts = NOW - (47 - i) * 30 * 60_000;
    const base = 8 + 6 * Math.sin(i / 3) + rng() * 8;
    const spikes = alerts
      .filter((a) => Math.abs(a.ts - ts) < 30 * 60_000)
      .reduce((s, a) => s + a.score * 0.6, 0);
    return { ts, score: Math.min(100, base + spikes) };
  });

  return {
    now: NOW,
    entities: [...users, ...devices, ...accounts, ...merchants, ...decoyEntities],
    users,
    devices,
    accounts,
    merchants,
    decoyEntities,
    decoys,
    alerts,
    timeline,
  };
}

export type Mock = ReturnType<typeof buildMock>;

export const SEVERITY_STYLES: Record<Severity, { fg: string; bg: string; label: string }> = {
  critical: { fg: "text-danger", bg: "bg-danger/15 text-danger border border-danger/40", label: "CRITICAL" },
  high:     { fg: "text-warn",   bg: "bg-warn/15 text-warn border border-warn/40",     label: "HIGH" },
  medium:   { fg: "text-primary",bg: "bg-primary/15 text-primary border border-primary/40", label: "MEDIUM" },
  low:      { fg: "text-muted-foreground", bg: "bg-muted text-muted-foreground border border-border", label: "LOW" },
};

export const SOURCE_TINT: Record<Source, string> = {
  SIEM: "bg-cyber/15 text-cyber border-cyber/40",
  EDR: "bg-cyber/15 text-cyber border-cyber/40",
  VPN: "bg-cyber/15 text-cyber border-cyber/40",
  PAM: "bg-cyber/15 text-cyber border-cyber/40",
  TXN: "bg-txn/15 text-txn border-txn/40",
  DECOY: "bg-quantum/15 text-quantum border-quantum/40",
};

export const ENTITY_COLOR: Record<EntityKind, string> = {
  user: "var(--cyber)",
  device: "var(--warn)",
  account: "var(--txn)",
  merchant: "var(--foreground)",
  decoy: "var(--quantum)",
};
