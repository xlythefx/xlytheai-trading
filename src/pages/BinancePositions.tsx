import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  History,
  RefreshCcw,
  TrendingUp,
  DollarSign,
  Activity,
  Target,
  BarChart3,
  TrendingDown,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  getPastPositions,
  getPositions,
  type BinancePastPosition,
  type BinancePosition,
} from "@/lib/api";

const PAGE_SIZE = 10;

const fmtNum = (v: string | number | undefined, digits = 2) => {
  if (v === undefined || v === null || v === "") return "-";
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (Number.isNaN(n)) return "-";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

function pastQty(p: BinancePastPosition) {
  const raw = p.position_amt ?? p.qty ?? "0";
  return parseFloat(String(raw)) || 0;
}

function computeStatsFromClosed(closed: BinancePastPosition[]) {
  const sorted = [...closed]
    .filter((p) => p.closed_at)
    .sort((a, b) => new Date(a.closed_at!).getTime() - new Date(b.closed_at!).getTime());

  const pnls = sorted.map((p) => parseFloat(p.realized_pnl || "0") || 0);

  const wins = pnls.filter((x) => x > 0);
  const losses = pnls.filter((x) => x < 0);
  const grossProfit = wins.reduce((a, b) => a + b, 0);
  const grossLoss = Math.abs(losses.reduce((a, b) => a + b, 0));

  let profitFactor: number | null = null;
  if (pnls.length === 0) profitFactor = null;
  else if (grossLoss === 0 && grossProfit > 0) profitFactor = Infinity;
  else if (grossLoss === 0) profitFactor = 0;
  else profitFactor = grossProfit / grossLoss;

  let cum = 0;
  let peak = 0;
  let maxDrawdown = 0;
  for (const p of pnls) {
    cum += p;
    peak = Math.max(peak, cum);
    maxDrawdown = Math.max(maxDrawdown, peak - cum);
  }

  let loseStreak = 0;
  let winStreak = 0;
  let maxLoseStreak = 0;
  let maxWinStreak = 0;
  for (const p of pnls) {
    if (p < 0) {
      loseStreak++;
      winStreak = 0;
      maxLoseStreak = Math.max(maxLoseStreak, loseStreak);
    } else if (p > 0) {
      winStreak++;
      loseStreak = 0;
      maxWinStreak = Math.max(maxWinStreak, winStreak);
    } else {
      loseStreak = 0;
      winStreak = 0;
    }
  }

  const nonzero = pnls.filter((x) => x !== 0);
  const winRate = nonzero.length > 0 ? (wins.length / nonzero.length) * 100 : 0;

  return {
    profitFactor,
    maxDrawdown,
    maxLoseStreak,
    maxWinStreak,
    winRate,
    closedCount: pnls.length,
  };
}

function Pagination({
  page,
  total,
  pageSize,
  onChange,
}: {
  page: number;
  total: number;
  pageSize: number;
  onChange: (p: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-border/50 pt-4">
      <span className="text-sm text-muted-foreground">
        Page {page} of {pages} &middot; {total} records
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {Array.from({ length: pages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1)
          .reduce<(number | "…")[]>((acc, p, idx, arr) => {
            if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === "…" ? (
              <span key={`ellipsis-${i}`} className="px-1 text-sm text-muted-foreground">
                …
              </span>
            ) : (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="sm"
                onClick={() => onChange(p as number)}
                className="h-8 w-8 p-0 text-xs"
              >
                {p}
              </Button>
            ),
          )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(page + 1)}
          disabled={page === pages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

const BinancePositions = () => {
  const [open, setOpen] = useState<BinancePosition[]>([]);
  const [past, setPast] = useState<BinancePastPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [openPage, setOpenPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const [o, p] = await Promise.all([getPositions(), getPastPositions()]);
      setOpen(o.data);
      setPast(p.data);
      setOpenPage(1);
      setPastPage(1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load positions";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalUnrealized = open.reduce(
    (sum, p) => sum + (parseFloat(p.unrealized_profit || "0") || 0),
    0,
  );
  const totalRealized = past.reduce(
    (sum, p) => sum + (parseFloat(p.realized_pnl || "0") || 0),
    0,
  );

  const closedStats = useMemo(() => computeStatsFromClosed(past), [past]);

  const openSlice = open.slice((openPage - 1) * PAGE_SIZE, openPage * PAGE_SIZE);
  const pastSlice = past.slice((pastPage - 1) * PAGE_SIZE, pastPage * PAGE_SIZE);

  const formatUpdateTime = (t?: number) => {
    if (t === undefined || t === null) return "—";
    const ms = t < 1e12 ? t * 1000 : t;
    return new Date(ms).toLocaleString();
  };

  return (
    <div className="flex min-h-min flex-col">
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">Binance Positions</h1>
            <p className="text-muted-foreground">Live and historical positions from your Binance accounts</p>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </nav>

      <main className="p-6">
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unrealized P&amp;L</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalUnrealized >= 0 ? "text-primary" : "text-destructive"}`}>
                {totalUnrealized >= 0 ? "+" : ""}${fmtNum(totalUnrealized)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{open.length} open positions</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Realized P&amp;L</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalRealized >= 0 ? "text-primary" : "text-destructive"}`}>
                {totalRealized >= 0 ? "+" : ""}${fmtNum(totalRealized)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{past.length} closed trades</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Open positions</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{open.length}</div>
              <p className="mt-1 text-xs text-muted-foreground">Currently open</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Win rate (closed)</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {closedStats.closedCount === 0 ? "—" : `${Math.round(closedStats.winRate)}%`}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">From realized trades</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Profit factor</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {closedStats.profitFactor === null
                  ? "—"
                  : closedStats.profitFactor === Infinity
                    ? "∞"
                    : closedStats.profitFactor.toFixed(2)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Gross profit / gross loss</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Max drawdown</CardTitle>
              <TrendingDown className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                ${fmtNum(closedStats.maxDrawdown)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">On cumulative realized P&amp;L curve</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Max lose streak</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{closedStats.maxLoseStreak}</div>
              <p className="mt-1 text-xs text-muted-foreground">Consecutive losing closes</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Max win streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{closedStats.maxWinStreak}</div>
              <p className="mt-1 text-xs text-muted-foreground">Consecutive winning closes</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="open">
          <TabsList className="mb-4">
            <TabsTrigger value="open" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Open Positions
              {open.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {open.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="closed" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Closed Positions
              {past.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {past.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Open Positions ({open.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-12 text-center text-muted-foreground">Loading…</div>
                ) : open.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">No open positions</div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {openSlice.map((p) => {
                        const amt = parseFloat(p.position_amt || "0");
                        const isLong = amt >= 0;
                        const color = isLong ? "bg-primary/10 text-primary" : "bg-orange-500/10 text-orange-500";
                        const pnl = parseFloat(p.unrealized_profit || "0");
                        const entry = parseFloat(p.entry_price || "0");
                        const mark = parseFloat(p.mark_price || "0");
                        const notional = Math.abs(amt) * (mark || entry);
                        const pnlPct =
                          entry && amt
                            ? ((mark - entry) / entry) * (amt >= 0 ? 1 : -1) * 100
                            : 0;
                        return (
                          <div
                            key={p.id}
                            className="overflow-x-auto rounded-lg border border-border/50 bg-background/50 p-4 transition-colors hover:bg-background/80 sm:p-6"
                          >
                            <div className="grid min-w-0 grid-cols-1 items-center gap-3 md:gap-4 lg:grid-cols-12">
                              <div className="lg:col-span-2">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-full ${color}`}
                                  >
                                    {isLong ? (
                                      <ArrowUpRight className="h-6 w-6" />
                                    ) : (
                                      <ArrowDownRight className="h-6 w-6" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-lg font-bold">{p.symbol}</div>
                                    <div className="text-sm text-muted-foreground">{isLong ? "LONG" : "SHORT"}</div>
                                  </div>
                                </div>
                              </div>

                              <div className="lg:col-span-2">
                                <div className="mb-1 text-sm text-muted-foreground">Entry Price</div>
                                <div className="font-medium">${fmtNum(p.entry_price, 4)}</div>
                                <div className="mt-1 text-sm text-muted-foreground">
                                  Mark: ${fmtNum(p.mark_price, 4)}
                                </div>
                              </div>

                              <div className="lg:col-span-2">
                                <div className="mb-1 text-sm text-muted-foreground">Size</div>
                                <div className="font-medium">{fmtNum(Math.abs(amt), 4)}</div>
                                <div className="mt-1 text-sm text-muted-foreground">
                                  Notional: ${fmtNum(notional, 2)}
                                </div>
                              </div>

                              <div className="lg:col-span-2">
                                <div className="mb-1 text-sm text-muted-foreground">Profit/Loss</div>
                                <div
                                  className={`text-lg font-bold ${pnl >= 0 ? "text-primary" : "text-destructive"}`}
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

                              <div className="lg:col-span-2">
                                <div className="flex flex-col gap-2 text-xs">
                                  <div>
                                    <div className="text-muted-foreground">Stop Loss</div>
                                    <div className="font-medium text-red-500">—</div>
                                  </div>
                                  <div>
                                    <div className="text-muted-foreground">Take Profit</div>
                                    <div className="font-medium text-green-500">—</div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2 lg:col-span-2">
                                <div className="mb-2 text-xs text-muted-foreground">
                                  <div>Binance Futures</div>
                                  <div>
                                    {p.leverage ? `${p.leverage}x` : "—"} · Updated{" "}
                                    {formatUpdateTime(p.update_time)}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" className="flex-1" disabled>
                                    <X className="mr-1 h-4 w-4" />
                                    Cancel
                                  </Button>
                                  <Button variant="default" size="sm" className="flex-1" disabled>
                                    <Plus className="mr-1 h-4 w-4" />
                                    Add
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <Pagination page={openPage} total={open.length} pageSize={PAGE_SIZE} onChange={setOpenPage} />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="closed">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Closed Positions ({past.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-12 text-center text-muted-foreground">Loading…</div>
                ) : past.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">No closed positions</div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {pastSlice.map((p) => {
                        const sideRaw = (p.position_side || "").toUpperCase();
                        const q = pastQty(p);
                        const isLong =
                          sideRaw === "LONG" || (sideRaw !== "SHORT" && q >= 0);
                        const color = isLong ? "bg-primary/10 text-primary" : "bg-orange-500/10 text-orange-500";
                        const pnl = parseFloat(p.realized_pnl || "0");
                        const entry = parseFloat(p.entry_price || "0");
                        const exitPx = parseFloat(p.exit_price || "0");
                        const pnlPct =
                          entry && q ? ((exitPx - entry) / entry) * (isLong ? 1 : -1) * 100 : 0;
                        return (
                          <div
                            key={p.id}
                            className="overflow-x-auto rounded-lg border border-border/50 bg-background/50 p-4 transition-colors hover:bg-background/80 sm:p-6"
                          >
                            <div className="grid min-w-0 grid-cols-1 items-center gap-3 md:gap-4 lg:grid-cols-12">
                              <div className="lg:col-span-2">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-full ${color}`}
                                  >
                                    {isLong ? (
                                      <ArrowUpRight className="h-6 w-6" />
                                    ) : (
                                      <ArrowDownRight className="h-6 w-6" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-lg font-bold">{p.symbol}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {sideRaw || (isLong ? "LONG" : "SHORT")}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="lg:col-span-2">
                                <div className="mb-1 text-sm text-muted-foreground">Entry Price</div>
                                <div className="font-medium">${fmtNum(p.entry_price, 4)}</div>
                                <div className="mt-1 text-sm text-muted-foreground">
                                  Exit: ${fmtNum(p.exit_price, 4)}
                                </div>
                              </div>

                              <div className="lg:col-span-2">
                                <div className="mb-1 text-sm text-muted-foreground">Size</div>
                                <div className="font-medium">{fmtNum(Math.abs(q), 4)}</div>
                                <div className="mt-1 text-sm text-muted-foreground">
                                  {p.strategy ? `Strategy: ${p.strategy}` : "Closed trade"}
                                </div>
                              </div>

                              <div className="lg:col-span-2">
                                <div className="mb-1 text-sm text-muted-foreground">Realized P&amp;L</div>
                                <div
                                  className={`text-lg font-bold ${pnl >= 0 ? "text-primary" : "text-destructive"}`}
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

                              <div className="lg:col-span-2">
                                <div className="flex flex-col gap-2 text-xs">
                                  <div>
                                    <div className="text-muted-foreground">Closed at</div>
                                    <div className="font-medium text-foreground">
                                      {p.closed_at ? new Date(p.closed_at).toLocaleString() : "—"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-muted-foreground">Order</div>
                                    <div className="truncate font-mono text-[11px] text-muted-foreground">
                                      {p.order_id || "—"}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2 lg:col-span-2">
                                <div className="mb-2 text-xs text-muted-foreground">
                                  <div>Binance Futures</div>
                                  <div>Historical close</div>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" className="flex-1" disabled>
                                    <X className="mr-1 h-4 w-4" />
                                    Cancel
                                  </Button>
                                  <Button variant="default" size="sm" className="flex-1" disabled>
                                    <Plus className="mr-1 h-4 w-4" />
                                    Add
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <Pagination page={pastPage} total={past.length} pageSize={PAGE_SIZE} onChange={setPastPage} />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default BinancePositions;
