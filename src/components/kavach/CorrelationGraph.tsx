import { useEffect, useMemo, useRef, useState } from "react";
import { ENTITY_COLOR, type Mock, type EntityKind } from "@/lib/mock/data";

interface Node { id: string; kind: EntityKind; label: string; x: number; y: number; vx: number; vy: number; }
interface Edge { s: string; t: string; w: number; }

export function CorrelationGraph({ mock, filter }: { mock: Mock; filter: Set<EntityKind> }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<Node | null>(null);
  const [tick, setTick] = useState(0);

  const { nodes, edges } = useMemo(() => {
    const nodeIds = new Set<string>();
    const edgeList: Edge[] = [];
    for (const a of mock.alerts) {
      const ents = a.entities.filter((e) => filter.has(e.kind));
      for (const e of ents) nodeIds.add(e.id);
      for (let i = 0; i < ents.length; i++) {
        for (let j = i + 1; j < ents.length; j++) {
          edgeList.push({ s: ents[i].id, t: ents[j].id, w: a.score / 100 });
        }
      }
    }
    const nodes: Node[] = mock.entities
      .filter((e) => nodeIds.has(e.id))
      .map((e, i, arr) => {
        const angle = (i / arr.length) * Math.PI * 2;
        return {
          id: e.id, kind: e.kind, label: e.label,
          x: 400 + Math.cos(angle) * 180, y: 260 + Math.sin(angle) * 180,
          vx: 0, vy: 0,
        };
      });
    return { nodes, edges: edgeList };
  }, [mock, filter]);

  // Simple force sim
  useEffect(() => {
    let raf = 0;
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    let iter = 0;
    const step = () => {
      iter++;
      for (const n of nodes) {
        // center gravity
        n.vx += (400 - n.x) * 0.002;
        n.vy += (260 - n.y) * 0.002;
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const d2 = dx * dx + dy * dy + 20;
          const f = 800 / d2;
          const d = Math.sqrt(d2);
          a.vx -= (dx / d) * f; a.vy -= (dy / d) * f;
          b.vx += (dx / d) * f; b.vy += (dy / d) * f;
        }
      }
      for (const e of edges) {
        const a = nodeMap.get(e.s), b = nodeMap.get(e.t);
        if (!a || !b) continue;
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const k = 0.02 * (d - 120);
        a.vx += (dx / d) * k; a.vy += (dy / d) * k;
        b.vx -= (dx / d) * k; b.vy -= (dy / d) * k;
      }
      for (const n of nodes) {
        n.vx *= 0.82; n.vy *= 0.82;
        n.x += n.vx; n.y += n.vy;
        n.x = Math.max(30, Math.min(770, n.x));
        n.y = Math.max(30, Math.min(490, n.y));
      }
      setTick((t) => t + 1);
      if (iter < 220) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [nodes, edges]);

  void tick;
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div className="relative w-full h-[540px] rounded-sm border bg-card overflow-hidden">
      <svg ref={svgRef} viewBox="0 0 800 520" className="w-full h-full">
        <defs>
          <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.6" fill="var(--grid)" />
          </pattern>
        </defs>
        <rect width="800" height="520" fill="url(#dots)" />
        {edges.map((e, i) => {
          const a = nodeMap.get(e.s), b = nodeMap.get(e.t);
          if (!a || !b) return null;
          return (
            <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={e.w > 0.85 ? "var(--danger)" : e.w > 0.65 ? "var(--warn)" : "var(--primary)"}
              strokeOpacity={0.35 + e.w * 0.4}
              strokeWidth={0.6 + e.w * 2}
            />
          );
        })}
        {nodes.map((n) => (
          <g key={n.id} transform={`translate(${n.x},${n.y})`}
             onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(null)}
             style={{ cursor: "pointer" }}>
            <circle r={n.kind === "decoy" ? 8 : 6} fill={ENTITY_COLOR[n.kind]}
                    stroke="var(--background)" strokeWidth={2} />
            {n.kind === "decoy" && (
              <circle r={12} fill="none" stroke="var(--quantum)" strokeOpacity={0.6}
                      strokeDasharray="2 2">
                <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            <text y={-12} textAnchor="middle" fontSize={9} fill="var(--muted-foreground)"
                  fontFamily="var(--font-mono)">
              {n.label.length > 18 ? n.label.slice(0, 16) + "…" : n.label}
            </text>
          </g>
        ))}
      </svg>
      {hover && (
        <div className="absolute top-3 left-3 rounded-sm border bg-popover p-3 font-mono text-[11px] max-w-xs">
          <div className="text-muted-foreground uppercase tracking-widest text-[9px]">{hover.kind}</div>
          <div className="text-foreground mt-0.5">{hover.label}</div>
        </div>
      )}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 text-[10px] font-mono">
        {(["user","device","account","merchant","decoy"] as EntityKind[]).map((k) => (
          <div key={k} className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: ENTITY_COLOR[k] }} />
            {k}
          </div>
        ))}
      </div>
    </div>
  );
}
