import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Download,
  Search,
  TrendingUp,
  TrendingDown,
  Shield,
  Server,
  Users as UsersIcon,
  Activity,
  Webhook,
  UserCog,
  CreditCard,
  Cog,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type LogStatus = "success" | "error" | "warning" | "info";
type LogCategory = "api" | "trade" | "user" | "security" | "admin" | "payment" | "system";

interface AuditLog {
  id: number;
  timestamp: string;
  action: string;
  actor: string;
  category: LogCategory;
  details: string;
  status: LogStatus;
  meta?: string;
}

const MOCK_LOGS: AuditLog[] = [
  { id: 1, timestamp: "2026-04-18 14:32:15", action: "GET /api/binance/positions", actor: "user:johndoe", category: "api", details: "200 · 84ms · 12 rows returned", status: "success", meta: "84ms" },
  { id: 2, timestamp: "2026-04-18 14:31:08", action: "POST /api/flask/past-position", actor: "flask-bot", category: "api", details: "201 · 42ms · payload stored", status: "success", meta: "42ms" },
  { id: 3, timestamp: "2026-04-18 14:30:51", action: "PUT /api/admin/config", actor: "admin", category: "api", details: "200 · 128ms · system_config updated", status: "success", meta: "128ms" },
  { id: 4, timestamp: "2026-04-18 14:29:30", action: "GET /api/admin/users", actor: "admin", category: "api", details: "200 · 62ms · 25 users returned", status: "success", meta: "62ms" },
  { id: 5, timestamp: "2026-04-18 14:28:10", action: "POST /api/login", actor: "anon", category: "api", details: "401 · 38ms · invalid credentials", status: "error", meta: "38ms" },
  { id: 6, timestamp: "2026-04-18 14:27:02", action: "GET /api/binance/past-positions", actor: "user:alicebrown", category: "api", details: "200 · 91ms · 318 rows returned", status: "success", meta: "91ms" },
  { id: 7, timestamp: "2026-04-18 14:26:18", action: "POST /api/flask/positions", actor: "flask-bot", category: "api", details: "503 · 2200ms · upstream timeout", status: "error", meta: "2.2s" },

  { id: 10, timestamp: "2026-04-18 14:32:15", action: "Trade Opened", actor: "John Doe", category: "trade", details: "BTC/USDT LONG · entry $43,250 · 0.12 qty", status: "success" },
  { id: 11, timestamp: "2026-04-18 14:30:08", action: "Trade Closed", actor: "Jane Smith", category: "trade", details: "ETH/USDT SHORT · exit $2,280 · PnL +$1,200", status: "success" },
  { id: 12, timestamp: "2026-04-18 14:25:12", action: "Trade Opened", actor: "Bob Johnson", category: "trade", details: "SOL/USDT LONG · entry $98.50 · 5 qty", status: "success" },
  { id: 13, timestamp: "2026-04-18 14:20:10", action: "Trade Closed", actor: "Alice Brown", category: "trade", details: "ADA/USDT LONG · exit $0.47 · PnL +$850", status: "success" },
  { id: 14, timestamp: "2026-04-18 14:00:45", action: "Trade Closed", actor: "John Doe", category: "trade", details: "SOL/USDT LONG · exit $95.20 · PnL -$280", status: "error" },

  { id: 20, timestamp: "2026-04-18 14:28:45", action: "User Registered", actor: "system", category: "user", details: "New user 'alice@example.com' via referral SAMPLEBIN", status: "info" },
  { id: 21, timestamp: "2026-04-18 14:18:05", action: "User Suspended", actor: "admin", category: "user", details: "User 'charlie@example.com' suspended for abuse", status: "warning" },
  { id: 22, timestamp: "2026-04-18 13:45:22", action: "User Verified", actor: "admin", category: "user", details: "Affiliate verification approved for diana@example.com", status: "success" },

  { id: 30, timestamp: "2026-04-18 14:22:33", action: "Password Changed", actor: "admin", category: "security", details: "Admin password updated", status: "warning" },
  { id: 31, timestamp: "2026-04-18 13:40:11", action: "Failed Login", actor: "anon", category: "security", details: "5 consecutive failures from 192.168.1.54", status: "error" },
  { id: 32, timestamp: "2026-04-18 13:20:02", action: "API Key Rotated", actor: "user:johndoe", category: "security", details: "Binance API key replaced", status: "info" },

  { id: 40, timestamp: "2026-04-18 14:12:28", action: "API Key Generated", actor: "admin", category: "admin", details: "New API key created for external access", status: "info" },
  { id: 41, timestamp: "2026-04-18 14:08:50", action: "Maintenance Mode Toggled", actor: "admin", category: "admin", details: "Maintenance mode enabled", status: "warning" },
  { id: 42, timestamp: "2026-04-18 13:55:20", action: "Config Updated", actor: "admin", category: "admin", details: "binance_affiliatelink updated", status: "info" },

  { id: 50, timestamp: "2026-04-18 14:03:18", action: "Payment Processed", actor: "Fiona Taylor", category: "payment", details: "Premium subscription · $49.99", status: "success" },
  { id: 51, timestamp: "2026-04-18 13:10:55", action: "Payment Failed", actor: "Greg Hill", category: "payment", details: "Card declined · $49.99", status: "error" },

  { id: 60, timestamp: "2026-04-18 13:58:22", action: "Backup Completed", actor: "system", category: "system", details: "Daily backup stored to s3://backups/2026-04-18", status: "info" },
  { id: 61, timestamp: "2026-04-18 13:30:10", action: "Cron Fired", actor: "system", category: "system", details: "positions_sync ran in 1.2s", status: "success" },
];

type TabKey = "all" | "api" | "trade" | "user" | "security" | "admin" | "payment" | "system";

const TABS: { key: TabKey; label: string; icon: typeof FileText; tint: string }[] = [
  { key: "all",      label: "All",       icon: FileText,    tint: "text-muted-foreground" },
  { key: "api",      label: "API calls", icon: Webhook,     tint: "text-primary" },
  { key: "trade",    label: "Trades",    icon: Activity,    tint: "text-primary" },
  { key: "user",     label: "Users",     icon: UsersIcon,   tint: "text-blue-500" },
  { key: "security", label: "Security",  icon: Shield,      tint: "text-yellow-500" },
  { key: "admin",    label: "Admin",     icon: UserCog,     tint: "text-purple-500" },
  { key: "payment",  label: "Payments",  icon: CreditCard,  tint: "text-green-500" },
  { key: "system",   label: "System",    icon: Cog,         tint: "text-gray-400" },
];

const AuditLogs = () => {
  const [tab, setTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = {
      all: MOCK_LOGS.length,
      api: 0, trade: 0, user: 0, security: 0, admin: 0, payment: 0, system: 0,
    };
    for (const l of MOCK_LOGS) c[l.category]++;
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_LOGS.filter((l) => {
      if (tab !== "all" && l.category !== tab) return false;
      if (!q) return true;
      return (
        l.action.toLowerCase().includes(q) ||
        l.actor.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q)
      );
    });
  }, [tab, search]);

  const stats = useMemo(() => {
    const successes = filtered.filter((l) => l.status === "success").length;
    const errors = filtered.filter((l) => l.status === "error").length;
    const warnings = filtered.filter((l) => l.status === "warning").length;
    return { total: filtered.length, successes, errors, warnings };
  }, [filtered]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full bg-primary/12 blur-[160px]" />
        <div className="absolute -right-20 top-1/3 h-[600px] w-[600px] rounded-full bg-accent/10 blur-[180px]" />
        <div className="absolute bottom-[-15%] left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/8 blur-[140px]" />
      </div>

      <header className="relative z-20 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Activity logs</h1>
              <p className="text-xs text-muted-foreground">
                API calls · Trades · User, security and system events
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/60 px-4 py-2 text-xs font-medium text-foreground transition hover:bg-primary/10 hover:text-primary"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1600px] px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          <StatCard label="Entries" value={stats.total} positive subtle="in current view" />
          <StatCard label="Success" value={stats.successes} positive subtle={`${pct(stats.successes, stats.total)}%`} />
          <StatCard label="Errors" value={stats.errors} positive={stats.errors === 0} subtle={`${pct(stats.errors, stats.total)}%`} />
          <StatCard label="Warnings" value={stats.warnings} positive={stats.warnings === 0} subtle={`${pct(stats.warnings, stats.total)}%`} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-6"
        >
          <Card className="overflow-hidden border-border/40 bg-gradient-to-br from-card/80 via-card/40 to-card/20 backdrop-blur-xl">
            <CardContent className="p-0">
              <div className="flex flex-wrap items-center gap-3 border-b border-border/40 px-6 pt-5 pb-3">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  const active = tab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTab(t.key)}
                      className={`relative inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                        active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="logs-tab-pill"
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent shadow-[0_0_16px_hsl(var(--primary)/0.35)]"
                          transition={{ type: "spring", stiffness: 260, damping: 22 }}
                        />
                      )}
                      <span className="relative flex items-center gap-1.5">
                        <Icon className={`h-3.5 w-3.5 ${active ? "" : t.tint}`} />
                        {t.label}
                        <span
                          className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                            active ? "bg-background/20" : "bg-muted/40 text-muted-foreground"
                          }`}
                        >
                          {counts[t.key]}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div className="relative min-w-[260px] flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search action, actor, or details…"
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
                  {MOCK_LOGS.length} entries
                </div>
              </div>

              <div className="border-t border-border/25 bg-background/10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab + search}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="max-h-[640px] divide-y divide-border/30 overflow-y-auto"
                  >
                    {filtered.length === 0 ? (
                      <div className="px-6 py-16 text-center text-sm text-muted-foreground">
                        No entries match your filter.
                      </div>
                    ) : (
                      filtered.map((log) => <LogRow key={log.id} log={log} />)
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

function StatCard({
  label,
  value,
  subtle,
  positive,
}: {
  label: string;
  value: number;
  subtle: string;
  positive: boolean;
}) {
  return (
    <Card className="group relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10">
      <div
        className={`absolute inset-x-0 top-0 h-px ${
          positive
            ? "bg-gradient-to-r from-transparent via-primary to-transparent"
            : "bg-gradient-to-r from-transparent via-destructive to-transparent"
        }`}
      />
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/15 blur-2xl" />
      <CardContent className="relative p-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
          {label}
        </p>
        <p
          className={`mt-2.5 text-2xl font-bold tracking-tight ${
            positive ? "text-primary" : "text-destructive"
          }`}
        >
          {value}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground/60">{subtle}</p>
      </CardContent>
    </Card>
  );
}

function LogRow({ log }: { log: AuditLog }) {
  return (
    <div className="flex items-start justify-between gap-4 px-6 py-3.5 transition hover:bg-primary/5">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ${
            statusRing(log.status)
          }`}
        >
          {statusIcon(log.status)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium text-foreground">{log.action}</span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusPill(log.status)}`}
            >
              {log.status}
            </span>
            <span
              className={`rounded-full border border-border/50 bg-muted/30 px-2 py-0.5 text-[10px] font-medium ${categoryColor(log.category)}`}
            >
              {log.category}
            </span>
          </div>
          <div className="mt-1 truncate text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">{log.actor}</span>
            {" · "}
            {log.details}
          </div>
        </div>
      </div>
      <div className="shrink-0 whitespace-nowrap text-right text-[11px] text-muted-foreground">
        {log.timestamp}
        {log.meta ? (
          <div className="mt-0.5 text-[10px] text-muted-foreground/70">{log.meta}</div>
        ) : null}
      </div>
    </div>
  );
}

function statusIcon(status: LogStatus) {
  switch (status) {
    case "success":
      return <TrendingUp className="h-4 w-4 text-primary" />;
    case "error":
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    case "warning":
      return <Shield className="h-4 w-4 text-yellow-500" />;
    default:
      return <Server className="h-4 w-4 text-blue-500" />;
  }
}

function statusRing(status: LogStatus) {
  switch (status) {
    case "success":
      return "bg-primary/10 ring-primary/30";
    case "error":
      return "bg-destructive/10 ring-destructive/30";
    case "warning":
      return "bg-yellow-500/10 ring-yellow-500/30";
    default:
      return "bg-blue-500/10 ring-blue-500/30";
  }
}

function statusPill(status: LogStatus) {
  switch (status) {
    case "success":
      return "bg-primary/10 text-primary border-primary/20";
    case "error":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "warning":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    default:
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  }
}

function categoryColor(c: LogCategory) {
  switch (c) {
    case "api":      return "text-primary";
    case "trade":    return "text-primary";
    case "user":     return "text-blue-500";
    case "security": return "text-yellow-500";
    case "admin":    return "text-purple-500";
    case "payment":  return "text-green-500";
    case "system":   return "text-gray-400";
    default:         return "text-muted-foreground";
  }
}

function pct(n: number, total: number) {
  if (!total) return 0;
  return Math.round((n / total) * 100);
}

export default AuditLogs;
