import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, ShieldAlert, Network, KeyRound, Skull } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Overview", icon: Activity },
  { to: "/alerts", label: "Alerts", icon: ShieldAlert },
  { to: "/graph", label: "Correlation Graph", icon: Network },
  { to: "/decoy-ledger", label: "Quantum Decoy Ledger", icon: Skull },
  { to: "/crypto", label: "PQC Vault", icon: KeyRound },
] as const;

export function AppShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen flex w-full grid-bg">
      <aside className="w-60 shrink-0 border-r bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="px-4 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-sm bg-primary/20 border border-primary/50 grid place-items-center">
              <span className="font-mono text-primary text-sm font-bold">K</span>
            </div>
            <div>
              <div className="font-mono text-sm tracking-widest text-primary">KAVACH</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">SOC · v0.9-preview</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-primary"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 border-l-2 border-transparent"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="text-[10px] font-mono text-muted-foreground uppercase">Bank of Maharashtra</div>
          <div className="text-[10px] font-mono text-muted-foreground">Hackathon 2026 · PS2</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-ok animate-pulse" />
            <span className="text-[10px] font-mono text-ok">LIVE · 42.3k eps</span>
          </div>
        </div>
      </aside>
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 border-b bg-background/80 backdrop-blur flex items-center justify-between px-6">
          <div>
            <h1 className="font-mono text-sm tracking-wider text-foreground">{title}</h1>
            {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px] text-muted-foreground">
            <span>ML-KEM-768 · ML-DSA-65</span>
            <span className="text-ok">● integrity ok</span>
            <span>analyst: r.sharma</span>
          </div>
        </header>
        <div className="flex-1 min-w-0 p-6">{children}</div>
      </main>
    </div>
  );
}
