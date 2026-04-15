import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverviewCalendar } from "@/components/ui/overview-calendar";
import {
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  TrendingUp,
  DollarSign,
  BarChart3,
  Target,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  getBrokerAccounts,
  getPositions,
  getPastPositions,
  type BinanceAccountData,
  type BinancePosition,
  type BinancePastPosition,
  getToken,
} from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const fmtNum = (v: string | number | undefined, digits = 2) => {
  if (v === undefined || v === null || v === "") return "0.00";
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (Number.isNaN(n)) return "0.00";
  return n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
};

function computeStats(past: BinancePastPosition[], openPositions: BinancePosition[]) {
  const pnls = past.map((p) => parseFloat(p.realized_pnl || "0") || 0);
  const wins = pnls.filter((x) => x > 0).length;
  const nonzero = pnls.filter((x) => x !== 0).length;
  const winRate = nonzero > 0 ? (wins / nonzero) * 100 : 0;
  const totalRealized = pnls.reduce((a, b) => a + b, 0);
  const totalUnrealized = openPositions.reduce(
    (s, p) => s + (parseFloat(p.unrealized_profit || "0") || 0),
    0,
  );
  return {
    totalPnl: totalRealized + totalUnrealized,
    openCount: openPositions.length,
    winRate,
    totalTrades: past.length,
  };
}

const Dashboard = () => {
  const [accounts, setAccounts] = useState<BinanceAccountData[]>([]);
  const [openPositions, setOpenPositions] = useState<BinancePosition[]>([]);
  const [pastPositions, setPastPositions] = useState<BinancePastPosition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const [accs, openRes, pastRes] = await Promise.all([
          getBrokerAccounts(),
          getPositions(),
          getPastPositions(),
        ]);
        setAccounts(accs.data);
        setOpenPositions(openRes.data);
        setPastPositions(pastRes.data);
      } catch {
        /* silent – user might not have accounts yet */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const firstAccount = accounts[0];
  const balance = firstAccount ? parseFloat(firstAccount.balance || "0") : 0;
  const brokerName = firstAccount?.name ?? "Binance";
  const currency = firstAccount?.currency_type ?? "USDT";

  const stats = useMemo(
    () => computeStats(pastPositions, openPositions),
    [pastPositions, openPositions],
  );

  const recentClosed = useMemo(() => {
    return [...pastPositions]
      .filter((p) => p.closed_at)
      .sort((a, b) => new Date(b.closed_at!).getTime() - new Date(a.closed_at!).getTime())
      .slice(0, 5);
  }, [pastPositions]);

  return (
    <div className="flex min-h-min flex-col">
      <nav className="shrink-0 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">Trading Dashboard</h1>
            <p className="text-muted-foreground">Monitor your trades and signals in real-time</p>
          </div>
        </div>
      </nav>

      <main className="p-6">
        {/* Balance Card */}
        <motion.div className="mb-8" variants={fadeUp} initial="hidden" animate="show" custom={0}>
          <Card className="border-border/50 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">
                    {brokerName} Balance
                  </p>
                  {loading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <p className="text-4xl font-bold text-foreground">
                        ${fmtNum(balance)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{currency}</p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stat cards */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total P&amp;L</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.totalPnl >= 0 ? "text-primary" : "text-destructive"}`}>
                {stats.totalPnl >= 0 ? "+" : ""}${fmtNum(stats.totalPnl)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Realized + unrealized</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Open positions</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.openCount}</div>
              <p className="mt-1 text-xs text-muted-foreground">Currently trading</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Win rate</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.totalTrades === 0 ? "—" : `${Math.round(stats.winRate)}%`}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Closed trades</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total trades</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.totalTrades.toLocaleString()}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Closed positions (history)</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent closed + calendar */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="flex flex-col gap-6 lg:min-h-[min(72vh,560px)] lg:flex-row lg:items-stretch"
        >
          <Card className="flex min-h-0 w-full shrink-0 flex-col border-border/50 bg-card/50 backdrop-blur-sm lg:w-[35%]">
            <CardHeader>
              <CardTitle>Recent Closed Positions ({recentClosed.length})</CardTitle>
            </CardHeader>
            <CardContent className="min-h-0 flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentClosed.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No closed positions yet
                </p>
              ) : (
                <div className="space-y-4">
                  {recentClosed.map((pos) => {
                    const pnl = parseFloat(pos.realized_pnl || "0");
                    const entry = parseFloat(pos.entry_price || "0");
                    const exit = parseFloat(pos.exit_price || "0");
                    const sideRaw = (pos.position_side || "").toUpperCase();
                    const q = parseFloat(String(pos.position_amt ?? pos.qty ?? "0")) || 0;
                    const isLong = sideRaw === "LONG" || (sideRaw !== "SHORT" && q >= 0);
                    const pnlPct =
                      entry && q ? ((exit - entry) / entry) * (isLong ? 1 : -1) * 100 : 0;
                    const timeAgo = pos.closed_at
                      ? new Date(pos.closed_at).toLocaleString()
                      : "—";

                    return (
                      <div
                        key={pos.id}
                        className="flex flex-col gap-3 rounded-lg border border-border/50 bg-background/50 p-4 transition-colors hover:bg-background/80 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                              isLong ? "bg-primary/10" : "bg-orange-500/10"
                            }`}
                          >
                            {isLong ? (
                              <ArrowUpRight className="h-5 w-5 text-primary" />
                            ) : (
                              <ArrowDownRight className="h-5 w-5 text-orange-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-foreground">{pos.symbol}</div>
                            <div className="truncate text-sm text-muted-foreground">{timeAgo}</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 sm:justify-end">
                          <div className="text-right">
                            <div className="font-medium text-foreground">
                              ${fmtNum(pos.exit_price, 4)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Entry: ${fmtNum(pos.entry_price, 4)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`font-medium ${pnl >= 0 ? "text-primary" : "text-destructive"}`}
                            >
                              {pnl >= 0 ? "+" : ""}${fmtNum(pnl)}
                            </div>
                            <div
                              className={`text-sm ${pnlPct >= 0 ? "text-primary" : "text-destructive"}`}
                            >
                              {pnlPct >= 0 ? "+" : ""}
                              {fmtNum(pnlPct, 2)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex w-full min-w-0 flex-1 flex-col lg:min-h-0 lg:w-[65%]">
            <OverviewCalendar className="h-full min-h-[28rem] w-full flex-1 lg:min-h-0" />
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
