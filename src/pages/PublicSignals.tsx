import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  TrendingUp,
  Zap,
  Plus,
  Minus,
  X,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AnimatedBackground from "@/components/AnimatedBackground";
import { PublicNav } from "@/components/PublicNav";
import {
  getPublicSignals,
  getPublicEquity,
  type PublicSignal,
  type EquityResponse,
} from "@/lib/api";

// ─── helpers ────────────────────────────────────────────────────────────────

const fmt = (v: string | number | null | undefined, d = 2) => {
  if (v === undefined || v === null || v === "") return "0.00";
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (Number.isNaN(n)) return "0.00";
  return n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
};

const timeAgo = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "just now";
  const m = Math.floor(ms / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const PAGE_SIZE = 12;

// ─── event config ────────────────────────────────────────────────────────────

function eventConfig(ev: string) {
  switch (ev.toUpperCase()) {
    case "OPEN":
      return {
        label: "NEW POSITION",
        bg: "from-primary/15 to-primary/5",
        ring: "ring-primary/40",
        shimmer: "from-primary/0 via-primary/20 to-primary/0",
        icon: <Zap className="h-4 w-4" />,
        text: "text-primary",
      };
    case "CLOSE":
      return {
        label: "CLOSE POSITION",
        bg: "from-orange-500/15 to-orange-500/5",
        ring: "ring-orange-500/40",
        shimmer: "from-orange-500/0 via-orange-500/20 to-orange-500/0",
        icon: <X className="h-4 w-4" />,
        text: "text-orange-400",
      };
    case "INCREMENT":
      return {
        label: "INCREMENT",
        bg: "from-blue-500/15 to-cyan-500/5",
        ring: "ring-blue-500/40",
        shimmer: "from-blue-500/0 via-blue-500/20 to-blue-500/0",
        icon: <Plus className="h-4 w-4" />,
        text: "text-blue-400",
      };
    case "DECREMENT":
      return {
        label: "DECREMENT",
        bg: "from-amber-500/15 to-amber-500/5",
        ring: "ring-amber-500/40",
        shimmer: "from-amber-500/0 via-amber-500/20 to-amber-500/0",
        icon: <Minus className="h-4 w-4" />,
        text: "text-amber-400",
      };
    default:
      return {
        label: ev,
        bg: "from-muted/15 to-muted/5",
        ring: "ring-muted/40",
        shimmer: "from-muted/0 via-muted/20 to-muted/0",
        icon: <Activity className="h-4 w-4" />,
        text: "text-muted-foreground",
      };
  }
}

// ─── signal card ─────────────────────────────────────────────────────────────

function SignalCard({
  signal,
  index,
  globalIndex,
  shine,
}: {
  signal: PublicSignal;
  index: number;
  globalIndex: number;
  shine: boolean;
}) {
  const cfg = eventConfig(signal.event_type);
  const isLong = (signal.position_side || "").toUpperCase() === "LONG";
  const pnl = parseFloat(signal.realized_pnl || "0");
  const pnlPct = parseFloat(signal.pnl_pct || "0");
  const isClose = signal.event_type.toUpperCase() === "CLOSE";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="h-full"
    >
      <div
        className={`relative flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br ${cfg.bg} ring-1 ${cfg.ring} transition hover:ring-2`}
      >
        {/* Shimmer sweep */}
        <AnimatePresence>
          {shine && (
            <motion.div
              key="shimmer"
              className={`pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r ${cfg.shimmer} skew-x-[-20deg]`}
              initial={{ translateX: "-100%" }}
              animate={{ translateX: "200%" }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>

        <div className="flex flex-1 flex-col gap-3 p-5">
          {/* header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background/70 ring-1 ${cfg.ring} ${cfg.text}`}
              >
                {cfg.icon}
              </div>
              <div>
                <div className={`text-[10px] font-semibold uppercase tracking-wider ${cfg.text}`}>
                  {cfg.label}
                </div>
                <div className="text-base font-bold text-foreground">{signal.symbol}</div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="rounded-full bg-background/50 px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground ring-1 ring-border/50">
                #{globalIndex}
              </span>
              <span className="text-[10px] text-muted-foreground">{timeAgo(signal.signal_time)}</span>
            </div>
          </div>

          {/* chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {signal.position_side && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${
                  isLong ? "bg-primary/15 text-primary" : "bg-orange-500/15 text-orange-400"
                }`}
              >
                {isLong ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {signal.position_side}
              </span>
            )}
            {signal.leverage && parseFloat(signal.leverage) > 0 && (
              <span className="rounded-full bg-background/60 px-2 py-0.5 font-medium text-muted-foreground ring-1 ring-border/60">
                {parseFloat(signal.leverage).toFixed(0)}x
              </span>
            )}
            {signal.strategy && (
              <span className="truncate rounded-full bg-background/60 px-2 py-0.5 font-medium text-muted-foreground ring-1 ring-border/60 max-w-[120px]">
                {signal.strategy}
              </span>
            )}
          </div>

          {/* price grid */}
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-background/50 p-3 text-xs ring-1 ring-border/40">
            {signal.entry_price && (
              <div>
                <div className="text-muted-foreground">Entry</div>
                <div className="font-mono font-medium text-foreground">${fmt(signal.entry_price, 4)}</div>
              </div>
            )}
            {signal.exit_price && (
              <div>
                <div className="text-muted-foreground">Exit</div>
                <div className="font-mono font-medium text-foreground">${fmt(signal.exit_price, 4)}</div>
              </div>
            )}
            {signal.position_amt && (
              <div>
                <div className="text-muted-foreground">Size</div>
                <div className="font-mono font-medium text-foreground">{fmt(signal.position_amt, 4)}</div>
              </div>
            )}
            {isClose && signal.realized_pnl !== null && (
              <div>
                <div className="text-muted-foreground">Realized P&amp;L</div>
                <div className={`font-mono font-semibold ${pnl >= 0 ? "text-primary" : "text-destructive"}`}>
                  {pnl >= 0 ? "+" : ""}${fmt(pnl)}
                  {signal.pnl_pct && (
                    <span className="ml-1 text-[10px]">
                      ({pnlPct >= 0 ? "+" : ""}{fmt(pnlPct, 2)}%)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* note — fixed height placeholder to keep cards uniform */}
          <div className="min-h-[1.25rem] text-xs italic text-muted-foreground">
            {signal.note || ""}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────

export default function PublicSignals() {
  const [signals, setSignals] = useState<PublicSignal[]>([]);
  const [equity, setEquity] = useState<EquityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [shineIds, setShineIds] = useState<Set<number>>(new Set());
  const shineTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = async () => {
    try {
      const [sig, eq] = await Promise.all([getPublicSignals(200), getPublicEquity()]);
      setSignals(sig.data);
      setEquity(eq);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const refresh = setInterval(() => void load(), 30_000);
    return () => clearInterval(refresh);
  }, []);

  // Shimmer every 5 s — cycle through all cards on current page
  useEffect(() => {
    shineTimerRef.current = setInterval(() => {
      const start = (page - 1) * PAGE_SIZE;
      const ids = signals.slice(start, start + PAGE_SIZE).map((s) => s.id);
      setShineIds(new Set(ids));
      setTimeout(() => setShineIds(new Set()), 800);
    }, 5_000);
    return () => {
      if (shineTimerRef.current) clearInterval(shineTimerRef.current);
    };
  }, [signals, page]);

  const totalPages = Math.max(1, Math.ceil(signals.length / PAGE_SIZE));
  const pageSignals = signals.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const equityData = useMemo(() => {
    if (!equity?.data) return [];
    return equity.data.map((p, i) => ({
      i,
      equity: p.equity,
      label: p.t ? new Date(p.t).toLocaleDateString() : "",
    }));
  }, [equity]);

  const lastEquity = equity?.data?.[equity.data.length - 1]?.equity ?? 0;
  const firstEquity = equity?.data?.[0]?.equity ?? 0;
  const equityDelta = lastEquity - firstEquity;
  const equityPct = firstEquity > 0 ? (equityDelta / firstEquity) * 100 : 0;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <AnimatedBackground />
      <div className="relative z-10">
        <PublicNav />

        <main className="mx-auto max-w-[1600px] px-6 pt-24 pb-12">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col gap-2"
          >
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Live Signal Feed
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Trading Signals Channel
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Real-time trades from our automated strategies. Every entry, increment and exit is
              broadcast publicly so you can follow what the bots are doing.
            </p>
          </motion.div>

          {/* Equity curve */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-10"
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Equity Curve
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {equity?.account
                      ? `Tracking ${equity.account.name} — ${equity.account.currency_type}`
                      : "No account connected yet"}
                  </p>
                </div>
                {equity?.account && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">${fmt(lastEquity)}</div>
                    <div className={`text-sm font-medium ${equityDelta >= 0 ? "text-primary" : "text-destructive"}`}>
                      {equityDelta >= 0 ? "+" : ""}${fmt(equityDelta)} ({equityDelta >= 0 ? "+" : ""}{fmt(equityPct, 2)}%)
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="h-[260px] pt-4">
                {loading ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : equityData.length < 2 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Not enough data yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={equityData}>
                      <defs>
                        <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${fmt(v, 0)}`} />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                        formatter={(v: number) => [`$${fmt(v)}`, "Equity"]}
                      />
                      <Area type="monotone" dataKey="equity" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#eqGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Signals header + pagination */}
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-baseline gap-2">
              <h2 className="text-xl font-bold text-foreground">Latest Signals</h2>
              <span className="text-xs text-muted-foreground">
                {signals.length} total · auto-refreshes every 30s
              </span>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-[64px] text-center text-sm text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : signals.length === 0 ? (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-12 text-center text-sm text-muted-foreground">
                No signals yet. Check back soon.
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {pageSignals.map((s, i) => (
                  <SignalCard
                    key={s.id}
                    signal={s}
                    index={i}
                    globalIndex={(page - 1) * PAGE_SIZE + i + 1}
                    shine={shineIds.has(s.id)}
                  />
                ))}
              </div>

              {/* Bottom pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => { setPage(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  >
                    First
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                    .reduce<(number | "…")[]>((acc, n, idx, arr) => {
                      if (idx > 0 && (n as number) - (arr[idx - 1] as number) > 1) acc.push("…");
                      acc.push(n);
                      return acc;
                    }, [])
                    .map((n, i) =>
                      n === "…" ? (
                        <span key={`dots-${i}`} className="px-1 text-muted-foreground">…</span>
                      ) : (
                        <Button
                          key={n}
                          size="sm"
                          variant={page === n ? "default" : "outline"}
                          onClick={() => { setPage(n as number); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        >
                          {n}
                        </Button>
                      )
                    )}

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => { setPage(totalPages); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  >
                    Last
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
