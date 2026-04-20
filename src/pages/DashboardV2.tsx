import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Activity,
  Calendar as CalendarIcon,
  Loader2,
  Target,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  getBrokerAccounts,
  getPositions,
  getPastPositions,
  getToken,
  type BinanceAccountData,
  type BinancePosition,
  type BinancePastPosition,
} from "@/lib/api";
import { V2TopNav } from "@/components/V2TopNav";
import { AffiliateVerificationBanner } from "@/components/AffiliateVerificationBanner";
import {
  fmt,
  DATE_RANGES,
  type DateRange,
  filterByRange,
  buildEquityPoints,
  computeStats,
  TradingEquityAreaChart,
  TradingPnlMiniCalendar,
  OpenOrderCard,
} from "@/components/trading/TradingDashboardWidgets";

const MOCK_STRATEGIES = [
  "Momentum Scalper v2",
  "Trend Rider Pro",
  "Mean Reversion Alpha",
  "Breakout Hunter",
  "Smart Grid Bot",
] as const;

// ─── Page ────────────────────────────────────────────────────────────────────

const DashboardV2 = () => {
  const [range, setRange] = useState<DateRange>("All");
  const [accounts, setAccounts] = useState<BinanceAccountData[]>([]);
  const [openPositions, setOpenPositions] = useState<BinancePosition[]>([]);
  const [pastPositions, setPastPositions] = useState<BinancePastPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [strategy, setStrategy] = useState<string>(MOCK_STRATEGIES[0]);
  const [strategyOpen, setStrategyOpen] = useState(false);

  const load = useCallback(async () => {
    if (!getToken()) { setLoading(false); return; }
    setLoading(true);
    try {
      const [accs, openRes, pastRes] = await Promise.all([
        getBrokerAccounts(), getPositions(), getPastPositions(),
      ]);
      setAccounts(accs.data);
      setOpenPositions(openRes.data);
      setPastPositions(pastRes.data);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const firstAccount = accounts[0];
  const balance = firstAccount ? parseFloat(firstAccount.balance || "0") : 0;

  const stats = useMemo(() => computeStats(pastPositions, openPositions), [pastPositions, openPositions]);

  const equityPoints = useMemo(() => buildEquityPoints(pastPositions, range), [pastPositions, range]);
  const equityPositive = equityPoints[equityPoints.length - 1]?.value >= 0;

  const pnlMap = useMemo(() => {
    const map = new Map<string, number>();
    pastPositions.forEach((p) => {
      if (!p.closed_at) return;
      const key = p.closed_at.slice(0, 10);
      map.set(key, (map.get(key) || 0) + (parseFloat(p.realized_pnl || "0") || 0));
    });
    return map;
  }, [pastPositions]);

  const pastPreview = useMemo(() => {
    return [...pastPositions]
      .filter((p) => p.closed_at)
      .sort((a, b) => new Date(b.closed_at!).getTime() - new Date(a.closed_at!).getTime())
      .slice(0, 4);
  }, [pastPositions]);

  const statCards = [
    { label: "Realized P/L", value: stats.realized, hint: `${stats.totalTrades} trades`, positive: stats.realized >= 0 },
    { label: "Unrealized P/L", value: stats.unrealized, hint: `${openPositions.length} open`, positive: stats.unrealized >= 0 },
    { label: "Win Rate", value: stats.winRate, isPercent: true, hint: `${stats.wins}W / ${stats.totalTrades - stats.wins}L`, positive: stats.winRate >= 50 },
    { label: "Max Drawdown", value: -stats.maxDrawdown, hint: "Cumulative peak→trough", positive: stats.maxDrawdown === 0 },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full bg-primary/12 blur-[160px]" />
        <div className="absolute -right-20 top-1/3 h-[600px] w-[600px] rounded-full bg-accent/10 blur-[180px]" />
        <div className="absolute bottom-[-15%] left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/8 blur-[140px]" />
      </div>

      <V2TopNav active="dashboard" brandTo="/" onRefresh={load} loading={loading} />

      {/* Affiliate banner */}
      <div className="relative z-10 mx-auto max-w-[1600px] px-6 pt-4">
        <AffiliateVerificationBanner />
      </div>

      {/* Main */}
      <main className="relative z-10 mx-auto max-w-[1600px] px-6 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">

          {/* ── LEFT ─────────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-6">

            {/* Stat cards */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {statCards.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.02 + i * 0.06 }}>
                  <Card className="group relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10">
                    {/* Top glow border */}
                    <div className={`absolute inset-x-0 top-0 h-px ${s.positive
                      ? "bg-gradient-to-r from-transparent via-primary to-transparent"
                      : "bg-gradient-to-r from-transparent via-destructive to-transparent"}`} />
                    {/* Hover shine */}
                    <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
                    {/* Auto shine every ~5s (stagger per card) */}
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent animate-v2-stat-shine-sweep"
                      style={{ animationDelay: `${i * 0.45}s` }}
                      aria-hidden
                    />
                    {/* Corner glow */}
                    <div className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl ${s.positive ? "bg-primary/20" : "bg-destructive/20"}`} />
                    <CardContent className="relative p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">{s.label}</p>
                      <p className={`mt-2.5 text-2xl font-bold tracking-tight ${s.positive ? "text-primary" : "text-destructive"}`}>
                        {s.isPercent
                          ? `${fmt(s.value, 1)}%`
                          : `${s.value >= 0 ? "+" : ""}$${fmt(Math.abs(s.value))}`}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground/60">{s.hint}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Wallet + Equity Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Card className="overflow-hidden border-border/40 bg-gradient-to-br from-card/80 via-card/40 to-card/20 backdrop-blur-xl">
                <CardContent className="p-0">
                  <div className="flex flex-wrap items-start justify-between gap-4 px-6 pt-6">
                    <div>
                      <p className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Wallet className="h-4 w-4" /> Wallet Value
                      </p>
                      {loading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      ) : (
                        <motion.p key={balance} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-5xl font-bold tracking-tight text-transparent">
                          ${fmt(balance)}
                        </motion.p>
                      )}
                      <p className={`mt-2 flex items-center gap-1 text-sm font-medium ${equityPositive ? "text-primary" : "text-destructive"}`}>
                        {equityPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        {stats.realized >= 0 ? "+" : ""}${fmt(stats.realized)} realized
                      </p>
                    </div>

                    {/* Date range filter */}
                    <div className="flex items-center gap-1 rounded-full border border-border/40 bg-card/40 p-1">
                      {DATE_RANGES.map((r) => (
                        <button key={r} onClick={() => setRange(r)}
                          className={`relative rounded-full px-3 py-1.5 text-xs font-medium transition ${range === r ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                          {range === r && (
                            <motion.span layoutId="drangepill"
                              className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent"
                              transition={{ type: "spring", stiffness: 260, damping: 22 }} />
                          )}
                          <span className="relative">{r}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Equity Curve: header inset with wallet row; chart row full-bleed (no horizontal padding) */}
                  <div className="mt-4 w-full min-w-0">
                    <div className="mb-3 flex items-center justify-between px-6">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary ring-1 ring-primary/30">
                          Equity Curve
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {filterByRange(pastPositions, range).length} trades · cumulative realized PnL
                        </span>
                      </div>
                      <p className={`shrink-0 pl-2 text-sm font-semibold ${equityPositive ? "text-primary" : "text-destructive"}`}>
                        {(equityPoints[equityPoints.length - 1]?.value ?? 0) >= 0 ? "+" : ""}${fmt(equityPoints[equityPoints.length - 1]?.value ?? 0)}
                      </p>
                    </div>
                    <div className="w-full min-w-0 border-t border-border/25 bg-background/10">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={range}
                          className="h-[320px] w-full min-w-0 [&>svg]:block [&>svg]:max-h-[320px]"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <TradingEquityAreaChart points={equityPoints} positive={equityPositive} />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Open Orders */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
              <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
                <CardContent className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold">Current Open Orders</h3>
                    </div>
                    <Link to="/positions"
                      className="text-[11px] font-medium text-muted-foreground transition hover:text-primary">
                      Check all running positions →
                    </Link>
                  </div>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : openPositions.length === 0 ? (
                    <p className="py-8 text-center text-xs text-muted-foreground">No open orders</p>
                  ) : (
                    <div className="space-y-2">
                      {openPositions.slice(0, 5).map((p, i) => <OpenOrderCard key={i} p={p} />)}
                      {openPositions.length > 5 && (
                        <p className="pt-1 text-center text-xs text-muted-foreground">
                          +{openPositions.length - 5} more ·{" "}
                          <Link to="/positions" className="text-primary hover:underline">view all</Link>
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
          <motion.aside initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-5">

            {/* Overall Win Rate */}
            <Card className={`relative border-border/40 bg-gradient-to-br from-card/80 to-card/30 backdrop-blur-xl ${strategyOpen ? "z-30" : ""}`}>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Overall</p>
                      <p className="text-base font-bold leading-tight">Win Rate</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${stats.winRate >= 50 ? "text-primary" : "text-destructive"}`}>
                      {stats.totalTrades === 0 ? "—" : `${fmt(stats.winRate, 1)}%`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{stats.wins}W · {stats.totalTrades - stats.wins}L</p>
                  </div>
                </div>
                <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-background/60">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, stats.winRate)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${stats.winRate >= 50
                      ? "bg-gradient-to-r from-primary to-accent shadow-[0_0_16px_hsl(var(--primary)/0.5)]"
                      : "bg-gradient-to-r from-destructive/70 to-destructive"}`} />
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                  <span>0%</span><span>50%</span><span>100%</span>
                </div>
                <div className="relative mt-3">
                  <button
                    type="button"
                    onClick={() => setStrategyOpen((o) => !o)}
                    className="flex w-full items-center justify-between rounded-lg bg-background/40 px-3 py-2 ring-1 ring-border/40 transition hover:bg-background/60 hover:ring-primary/40"
                  >
                    <span className="text-[11px] text-muted-foreground">My Strategies</span>
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      {strategy}
                      <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${strategyOpen ? "rotate-180" : ""}`} />
                    </span>
                  </button>
                  {strategyOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setStrategyOpen(false)} aria-hidden />
                      <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-border/40 bg-card/95 shadow-2xl backdrop-blur-xl">
                        {MOCK_STRATEGIES.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => { setStrategy(s); setStrategyOpen(false); }}
                            className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition hover:bg-primary/10 ${s === strategy ? "text-primary" : "text-foreground"}`}
                          >
                            <span>{s}</span>
                            {s === strategy && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Calendar */}
            <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">PnL Calendar</h3>
                </div>
                <TradingPnlMiniCalendar pnlMap={pnlMap} />
                <div className="mt-2 flex items-center gap-4 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" /> Profit</span>
                  <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-1.5 rounded-full bg-destructive" /> Loss</span>
                </div>
              </CardContent>
            </Card>

            {/* Past Positions */}
            <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Past Positions</h3>
                  <Link to="/positions" className="text-[11px] font-medium text-primary hover:underline">View All</Link>
                </div>
                {pastPreview.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">No closed positions</p>
                ) : (
                  <div className="space-y-2">
                    {pastPreview.map((p, i) => {
                      const pnl = parseFloat(p.realized_pnl || "0") || 0;
                      const pos = pnl >= 0;
                      return (
                        <div key={p.id ?? i} className="flex items-center justify-between rounded-xl bg-background/40 px-3 py-2.5 transition hover:bg-background/60">
                          <div className="flex items-center gap-2.5">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold ${pos ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
                              {p.symbol?.replace("USDT", "").replace("BUSD", "").slice(0, 3)}
                            </div>
                            <div>
                              <p className="text-xs font-semibold">{p.symbol}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {p.closed_at ? new Date(p.closed_at).toLocaleDateString() : "—"}
                              </p>
                            </div>
                          </div>
                          <div className={`text-xs font-semibold ${pos ? "text-primary" : "text-destructive"}`}>
                            {pos ? "+" : ""}${fmt(pnl)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

          </motion.aside>
        </div>
      </main>
    </div>
  );
};

export default DashboardV2;
