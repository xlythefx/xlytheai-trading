import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Activity,
  Calendar as CalendarIcon,
  Loader2,
  Target,
  BarChart3,
  LineChart,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  getAdminDashboard,
  getAdminAnalytics,
  type AdminDashboardStats,
  type AdminDashboardRecentTrade,
  type AdminTradeMetrics,
  type AdminOpenPositionPreview,
} from "@/lib/api";
import type { BinancePosition } from "@/lib/api";
import {
  fmt,
  DATE_RANGES,
  type DateRange,
  TradingEquityAreaChart,
  TradingPnlMiniCalendar,
  OpenOrderCard,
  type EquityPoint,
} from "@/components/trading/TradingDashboardWidgets";

function previewToBinancePosition(r: AdminOpenPositionPreview): BinancePosition {
  return {
    id: r.id,
    api_key: "",
    symbol: r.symbol,
    position_amt: r.position_amt,
    entry_price: r.entry_price,
    mark_price: r.mark_price,
    unrealized_profit: r.unrealized_profit,
    update_time: r.update_time,
  };
}

const AdminDashboard = () => {
  const { adminCode } = useParams();
  const positionsHref = `/admin/${adminCode}/positions`;

  const [range, setRange] = useState<DateRange>("All");
  const now = useMemo(() => new Date(), []);
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth() + 1);

  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentTrades, setRecentTrades] = useState<AdminDashboardRecentTrade[]>([]);
  const [dashLoading, setDashLoading] = useState(true);

  const [equityPoints, setEquityPoints] = useState<EquityPoint[]>([{ date: "Start", value: 0 }]);
  const [equityTradeCount, setEquityTradeCount] = useState(0);
  const [calendarPnlRaw, setCalendarPnlRaw] = useState<Record<string, string>>({});
  const [tradeMetrics, setTradeMetrics] = useState<AdminTradeMetrics | null>(null);
  const [openPreview, setOpenPreview] = useState<AdminOpenPositionPreview[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setDashLoading(true);
    try {
      const res = await getAdminDashboard();
      setStats(res.stats);
      setRecentTrades(res.recent_trades);
    } catch {
      toast.error("Failed to load dashboard");
      setStats(null);
    } finally {
      setDashLoading(false);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const res = await getAdminAnalytics({
        equity_range: range,
        cal_year: calYear,
        cal_month: calMonth,
      });
      const pts: EquityPoint[] = (res.equity_points as EquityPoint[]).map((p) => ({
        date: p.date,
        value: typeof p.value === "number" ? p.value : parseFloat(String(p.value)) || 0,
      }));
      setEquityPoints(pts.length ? pts : [{ date: "Start", value: 0 }]);
      setEquityTradeCount(res.equity_trade_count);
      setCalendarPnlRaw(res.calendar_pnl);
      setTradeMetrics(res.trade_metrics);
      setOpenPreview(res.open_positions_preview);
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  }, [range, calYear, calMonth]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const pnlMap = useMemo(() => {
    const m = new Map<string, number>();
    Object.entries(calendarPnlRaw).forEach(([k, v]) => {
      m.set(k, parseFloat(v) || 0);
    });
    return m;
  }, [calendarPnlRaw]);

  const equityPositive = (equityPoints[equityPoints.length - 1]?.value ?? 0) >= 0;
  const loading = dashLoading || analyticsLoading;

  const balance = stats ? parseFloat(stats.total_funds || "0") : 0;

  const statCards = useMemo(() => {
    if (!stats || !tradeMetrics) return [];
    const realized = parseFloat(stats.total_realized || "0");
    const unrealized = parseFloat(stats.total_unrealized || "0");
    return [
      {
        label: "Realized P/L",
        value: realized,
        isPercent: false,
        hint: `${tradeMetrics.total_trades} closed · platform`,
        positive: realized >= 0,
      },
      {
        label: "Unrealized P/L",
        value: unrealized,
        isPercent: false,
        hint: `${stats.positions_open} open positions`,
        positive: unrealized >= 0,
      },
      {
        label: "Win rate",
        value: tradeMetrics.win_rate,
        isPercent: true,
        hint: `${tradeMetrics.wins}W / ${tradeMetrics.losses}L (non-zero)`,
        positive: tradeMetrics.win_rate >= 50,
      },
      {
        label: "Profit factor",
        value: Math.min(tradeMetrics.profit_factor, 999),
        isPercent: false,
        hint: `Max DD $${fmt(tradeMetrics.max_drawdown)}`,
        positive: tradeMetrics.profit_factor >= 1,
      },
    ];
  }, [stats, tradeMetrics]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full bg-primary/12 blur-[160px]" />
        <div className="absolute -right-20 top-1/3 h-[600px] w-[600px] rounded-full bg-accent/10 blur-[180px]" />
        <div className="absolute bottom-[-15%] left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/8 blur-[140px]" />
      </div>

      {/* Admin top bar — V2-inspired */}
      <header className="relative z-20 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Platform analytics</h1>
              <p className="text-xs text-muted-foreground">
                Aggregated brokers · {stats?.users_count ?? "—"} users ·{" "}
                {stats?.broker_accounts_connected ?? "—"} connections
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={positionsHref}
              className="rounded-full border border-border/50 bg-card/60 px-4 py-2 text-xs font-medium text-foreground transition hover:bg-primary/10 hover:text-primary"
            >
              All positions
            </Link>
            <button
              type="button"
              onClick={() => {
                loadDashboard();
                loadAnalytics();
              }}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-2 text-xs font-medium text-primary ring-1 ring-primary/25 transition hover:bg-primary/25 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1600px] px-6 py-8">
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
          <LineChart className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span>
            Admin view: cumulative metrics across <strong className="text-foreground">all</strong> linked accounts.
            Recent activity shows the last 10 closes; full history is on{" "}
            <Link to={positionsHref} className="font-medium text-primary hover:underline">
              Positions
            </Link>
            .
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-2 gap-4 md:grid-cols-4"
            >
              {statCards.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.02 + i * 0.06 }}
                >
                  <Card className="group relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10">
                    <div
                      className={`absolute inset-x-0 top-0 h-px ${
                        s.positive
                          ? "bg-gradient-to-r from-transparent via-primary to-transparent"
                          : "bg-gradient-to-r from-transparent via-destructive to-transparent"
                      }`}
                    />
                    <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl bg-primary/15" />
                    <CardContent className="relative p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                        {s.label}
                      </p>
                      <p
                        className={`mt-2.5 text-2xl font-bold tracking-tight ${
                          s.positive ? "text-primary" : "text-destructive"
                        }`}
                      >
                        {s.label === "Profit factor"
                          ? tradeMetrics && tradeMetrics.profit_factor >= 999
                            ? "∞"
                            : fmt(s.value, 2)
                          : s.isPercent
                            ? `${fmt(s.value, 1)}%`
                            : `${s.value >= 0 ? "+" : ""}$${fmt(Math.abs(s.value))}`}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground/60">{s.hint}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="overflow-hidden border-border/40 bg-gradient-to-br from-card/80 via-card/40 to-card/20 backdrop-blur-xl">
                <CardContent className="p-0">
                  <div className="flex flex-wrap items-start justify-between gap-4 px-6 pt-6">
                    <div>
                      <p className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Wallet className="h-4 w-4" /> Total funds (sum of balances)
                      </p>
                      {dashLoading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      ) : (
                        <motion.p
                          key={balance}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-5xl font-bold tracking-tight text-transparent"
                        >
                          ${fmt(balance)}
                        </motion.p>
                      )}
                      <p
                        className={`mt-2 flex items-center gap-1 text-sm font-medium ${
                          parseFloat(stats?.total_realized || "0") >= 0 ? "text-primary" : "text-destructive"
                        }`}
                      >
                        {parseFloat(stats?.total_realized || "0") >= 0 ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                        {stats ? `${parseFloat(stats.total_realized) >= 0 ? "+" : ""}$${fmt(stats.total_realized)}` : "—"}{" "}
                        realized (all time)
                      </p>
                    </div>

                    <div className="flex items-center gap-1 rounded-full border border-border/40 bg-card/40 p-1">
                      {DATE_RANGES.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRange(r)}
                          className={`relative rounded-full px-3 py-1.5 text-xs font-medium transition ${
                            range === r ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {range === r && (
                            <motion.span
                              layoutId="admin-range-pill"
                              className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent"
                              transition={{ type: "spring", stiffness: 260, damping: 22 }}
                            />
                          )}
                          <span className="relative">{r}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 w-full min-w-0">
                    <div className="mb-3 flex items-center justify-between px-6">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary ring-1 ring-primary/30">
                          Cumulative realized P/L
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {equityTradeCount} trades in range · platform-wide
                        </span>
                      </div>
                      <p
                        className={`shrink-0 pl-2 text-sm font-semibold ${
                          equityPositive ? "text-primary" : "text-destructive"
                        }`}
                      >
                        {(equityPoints[equityPoints.length - 1]?.value ?? 0) >= 0 ? "+" : ""}$
                        {fmt(equityPoints[equityPoints.length - 1]?.value ?? 0)}
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
                          <TradingEquityAreaChart
                            points={equityPoints}
                            positive={equityPositive}
                            emptyTitle="No closed trades in this range"
                            emptySubtitle="When users close positions, the platform equity curve appears here."
                            emptyCtaHref=""
                            emptyCtaLabel=""
                          />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
                <CardContent className="p-5">
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold">Open positions (preview)</h3>
                    </div>
                    <Link
                      to={positionsHref}
                      className="text-[11px] font-medium text-muted-foreground transition hover:text-primary"
                    >
                      View all →
                    </Link>
                  </div>
                  {analyticsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : openPreview.length === 0 ? (
                    <p className="py-8 text-center text-xs text-muted-foreground">No open positions</p>
                  ) : (
                    <div className="space-y-3">
                      {openPreview.map((r) => (
                        <div key={r.id}>
                          <p className="mb-1 text-[10px] text-muted-foreground">
                            {(r.user_name || "User") + (r.account_name ? ` · ${r.account_name}` : "")}
                          </p>
                          <OpenOrderCard p={previewToBinancePosition(r)} />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-5"
          >
            <Card className="border-border/40 bg-gradient-to-br from-card/80 to-card/30 backdrop-blur-xl">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Platform</p>
                      <p className="text-base font-bold leading-tight">Win rate</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-2xl font-bold ${
                        (tradeMetrics?.win_rate ?? 0) >= 50 ? "text-primary" : "text-destructive"
                      }`}
                    >
                      {!tradeMetrics ? "—" : `${fmt(tradeMetrics.win_rate, 1)}%`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {tradeMetrics
                        ? `${tradeMetrics.wins}W · ${tradeMetrics.losses}L`
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-background/60">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, tradeMetrics?.win_rate ?? 0)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      (tradeMetrics?.win_rate ?? 0) >= 50
                        ? "bg-gradient-to-r from-primary to-accent shadow-[0_0_16px_hsl(var(--primary)/0.5)]"
                        : "bg-gradient-to-r from-destructive/70 to-destructive"
                    }`}
                  />
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                  Profit factor{" "}
                  <span className="font-semibold text-foreground">
                    {tradeMetrics && tradeMetrics.profit_factor >= 999 ? "∞" : tradeMetrics ? fmt(tradeMetrics.profit_factor, 2) : "—"}
                  </span>
                  {" · "}
                  PnL today{" "}
                  <span
                    className={
                      parseFloat(stats?.pnl_daily || "0") >= 0 ? "text-primary" : "text-destructive"
                    }
                  >
                    {stats ? `${parseFloat(stats.pnl_daily) >= 0 ? "+" : ""}$${fmt(stats.pnl_daily)}` : "—"}
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">PnL calendar</h3>
                </div>
                <TradingPnlMiniCalendar
                  pnlMap={pnlMap}
                  onMonthChange={(y, m) => {
                    setCalYear(y);
                    setCalMonth(m);
                  }}
                />
                <div className="mt-2 flex items-center gap-4 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" /> Profit
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-destructive" /> Loss
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Recent closed (10)</h3>
                  <Link to={positionsHref} className="text-[11px] font-medium text-primary hover:underline">
                    View all
                  </Link>
                </div>
                {recentTrades.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">No closed positions</p>
                ) : (
                  <div className="space-y-2">
                    {recentTrades.map((p, i) => {
                      const pnl = parseFloat(p.realized_pnl || "0") || 0;
                      const pos = pnl >= 0;
                      return (
                        <div
                          key={p.id ?? i}
                          className="flex items-center justify-between rounded-xl bg-background/40 px-3 py-2.5 transition hover:bg-background/60"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                pos ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
                              }`}
                            >
                              {p.symbol?.replace("USDT", "").replace("BUSD", "").slice(0, 3)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold">{p.symbol}</p>
                              <p className="truncate text-[10px] text-muted-foreground">
                                {p.user_name || "—"}{" "}
                                {p.closed_at ? new Date(p.closed_at).toLocaleDateString() : "—"}
                              </p>
                            </div>
                          </div>
                          <div className={`shrink-0 text-xs font-semibold ${pos ? "text-primary" : "text-destructive"}`}>
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

export default AdminDashboard;
