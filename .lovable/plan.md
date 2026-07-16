
# KAVACH Analyst Dashboard — Prototype Plan

A frontend-only prototype of Project KAVACH's SOC dashboard. All data is synthesized in-browser (deterministic seeded mocks) so the UI feels alive without any backend, Kafka, Neo4j, ML, or PQC dependencies.

## Visual direction

Dark "war-room" SOC aesthetic — near-black background, monospaced accents, cyan/amber/red status tokens, dense information layout. Not another purple/indigo AI dashboard. Semantic tokens defined in `src/styles.css`.

## Routes (TanStack Start, file-based)

```
src/routes/
  __root.tsx              → sidebar shell + head metadata
  index.tsx               → Overview: KPIs, live alert feed, threat timeline
  alerts.tsx              → Correlated alerts table + drill-down drawer with SHAP-style bars
  graph.tsx               → Force-directed correlation graph (users↔devices↔accounts↔transactions)
  decoy-ledger.tsx        → Quantum Decoy Ledger: honeytokens, access attempts, HNDL risk
  crypto.tsx              → PQC status panel (ML-KEM-768, ML-DSA-65 key rotation, signed audit log)
```

Each route sets its own `head()` title/description.

## Key components

- `AppSidebar` — shadcn sidebar with route icons, collapsible.
- `KpiCard` — count, delta, sparkline.
- `AlertFeed` — streaming-style list, severity chip, source badges (SIEM/EDR/TXN).
- `AlertDrawer` — timeline of correlated events, entity chips, SHAP-style feature attribution bars, recommended action.
- `CorrelationGraph` — `react-force-graph-2d` with nodes (user/device/account/txn/decoy) colored by type, edges weighted by anomaly score. Filter chips.
- `DecoyLedgerTable` — honeytoken accounts, last-touched, access pattern flags, HNDL risk score.
- `CryptoStatus` — algorithm cards, key age, next rotation, mock Dilithium signature verification of an audit log entry.
- `ThreatTimeline` — Recharts area chart of anomaly score over last 24h with event markers.

## Mock data layer

`src/lib/mock/` with seeded generators (`seedrandom`):
- `entities.ts` — users, devices, accounts, merchants.
- `events.ts` — telemetry + transaction events over the last 24h.
- `correlate.ts` — rules-based scorer producing correlated alerts (e.g. VPN login from new ASN → privileged access → large outbound wire within 15min).
- `decoys.ts` — honeytoken records + simulated read attempts.
- `shap.ts` — per-alert feature contributions.

A small `useTick` hook advances a "live" cursor every few seconds so the feed and timeline update.

## Dependencies to add

`react-force-graph-2d`, `recharts`, `seedrandom`, `date-fns`, `lucide-react` (already present). shadcn sidebar/table/drawer/badge/tabs installed as needed.

## Out of scope (explicit)

No Kafka, Neo4j, PyTorch, liboqs, FastAPI, Docker, Lovable Cloud, or real auth. The PQC panel is a visual mock — no actual crypto is performed. This is a demo UI for the hackathon pitch.

## Deliverable

A polished, navigable 5-page dashboard that a judge can click through end-to-end within 60 seconds, with realistic-looking correlated cyber+transaction alerts and a Quantum Decoy Ledger view that tells the HNDL story.
