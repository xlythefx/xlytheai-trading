import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Target,
  Trophy,
  TrendingDown,
  Activity,
  Loader2,
  ChevronDown,
  Layers,
  BarChart2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  getPositions,
  getPastPositions,
  getAssets,
  getToken,
  type BinancePosition,
  type BinancePastPosition,
  type Asset,
} from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { V2TopNav } from "@/components/V2TopNav";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (v: number | string | undefined, d = 2) => {
  if (v === undefined || v === null || v === "") return "0.00";
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (Number.isNaN(n)) return "0.00";
  return n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
};

interface AssetStats {
  symbol: string;
  totalPnl: number;
  winRate: number;
  tradeCount: number;
  wins: number;
  losses: number;
  avgPnl: number;
  bestTrade: number;
  worstTrade: number;
  profitFactor: number;
  maxDrawdown: number;
  equityCurve: number[];
  trades: BinancePastPosition[];
}

function computeAssetStats(symbol: string, trades: BinancePastPosition[]): AssetStats {
  const sorted = [...trades]
    .filter((p) => p.closed_at)
    .sort((a, b) => new Date(a.closed_at!).getTime() - new Date(b.closed_at!).getTime());

  const pnls = sorted.map((p) => parseFloat(p.realized_pnl || "0") || 0);
  const wins = pnls.filter((x) => x > 0);
  const losses = pnls.filter((x) => x < 0);
  const nonzero = pnls.filter((x) => x !== 0);
  const totalPnl = pnls.reduce((a, b) => a + b, 0);
  const grossProfit = wins.reduce((a, b) => a + b, 0);
  const grossLoss = Math.abs(losses.reduce((a, b) => a + b, 0));
  const winRate = nonzero.length > 0 ? (wins.length / nonzero.length) * 100 : 0;
  const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? Infinity : 0) : grossProfit / grossLoss;
  let peak = 0, cum = 0, maxDrawdown = 0;
  const equityCurve: number[] = [0];
  for (const p of pnls) {
    cum += p;
    equityCurve.push(cum);
    peak = Math.max(peak, cum);
    maxDrawdown = Math.max(maxDrawdown, peak - cum);
  }

  return {
    symbol,
    totalPnl,
    winRate,
    tradeCount: pnls.length,
    wins: wins.length,
    losses: losses.length,
    avgPnl: pnls.length > 0 ? totalPnl / pnls.length : 0,
    bestTrade: pnls.length > 0 ? Math.max(...pnls) : 0,
    worstTrade: pnls.length > 0 ? Math.min(...pnls) : 0,
    profitFactor,
    maxDrawdown,
    equityCurve,
    trades: sorted,
  };
}

// ─── Equity Chart ─────────────────────────────────────────────────────────────

const AssetEquityChart = ({ series, positive }: { series: number[]; positive: boolean }) => {
  const W = 700, H = 240, PL = 4, PR = 4, PT = 16, PB = 16;
  if (series.length < 2) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Not enough trade history
      </div>
    );
  }
  const chartW = W - PL - PR;
  const chartH = H - PT - PB;
  const min = Math.min(...series), max = Math.max(...series), span = max - min || 1;
  const toX = (i: number) => PL + (i / (series.length - 1)) * chartW;
  const toY = (v: number) => PT + chartH * (1 - (v - min) / span);
  const pts = series.map((v, i) => [toX(i), toY(v)] as const);
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${pts[pts.length - 1][0].toFixed(1)},${H - PB} L${pts[0][0].toFixed(1)},${H - PB} Z`;
  const color = positive ? "hsl(var(--primary))" : "hsl(var(--destructive))";
  const color2 = positive ? "hsl(var(--accent))" : "hsl(var(--destructive))";
  const yLabels = Array.from({ length: 4 }, (_, i) => {
    const frac = i / 3;
    return { val: min + span * frac, y: toY(min + span * frac) };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full overflow-hidden">
      <defs>
        <linearGradient id={`af-${positive}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`al-${positive}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
        <filter id="aglow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Y grid + floating labels */}
      {yLabels.map(({ val, y }, i) => {
        const label = `${val >= 0 ? "+" : ""}${fmt(val, 0)}`;
        const lw = label.length * 5.5 + 8;
        return (
          <g key={i}>
            <line x1={PL} x2={W - PR} y1={y} y2={y}
              stroke="hsl(var(--border))" strokeOpacity={0.18} strokeDasharray="2 5" />
            <rect x={PL + 4} y={y - 9} width={lw} height={14} rx={3}
              fill="hsl(var(--background))" fillOpacity={0.7} />
            <text x={PL + 8} y={y + 3} textAnchor="start" fontSize={9}
              fill="hsl(var(--muted-foreground))" opacity={0.75}>{label}</text>
          </g>
        );
      })}
      <motion.path d={areaPath} fill={`url(#af-${positive})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} />
      <motion.path d={linePath} fill="none" stroke={`url(#al-${positive})`} strokeWidth={2.5}
        strokeLinecap="round" strokeLinejoin="round" filter="url(#aglow)"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: "easeInOut" }} />
      <motion.circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={5} fill={color}
        filter="url(#aglow)"
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.0, type: "spring" }} />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={10} fill={color} fillOpacity={0.2} />
    </svg>
  );
};

// ─── Mini Bar Chart ──────────────────────────────────────────────────────────

const PnlBars = ({ trades }: { trades: BinancePastPosition[] }) => {
  const pnls = trades.slice(-30).map((p) => parseFloat(p.realized_pnl || "0") || 0);
  if (pnls.length === 0) return null;
  const max = Math.max(...pnls.map(Math.abs)) || 1;
  return (
    <div className="flex h-16 items-end gap-0.5">
      {pnls.map((v, i) => {
        const h = Math.max(4, (Math.abs(v) / max) * 60);
        return (
          <motion.div key={i} title={`${v >= 0 ? "+" : ""}$${fmt(v)}`}
            initial={{ height: 0 }} animate={{ height: h }}
            transition={{ duration: 0.4, delay: i * 0.02 }}
            className={`flex-1 rounded-sm ${v >= 0 ? "bg-primary/60" : "bg-destructive/60"}`} />
        );
      })}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const TYPE_STYLES: Record<string, string> = {
  Cryptocurrency: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Stocks: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Forex: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Commodity: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

const AssetPerformance = () => {
  const [openPositions, setOpenPositions] = useState<BinancePosition[]>([]);
  const [pastPositions, setPastPositions] = useState<BinancePastPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Supported assets sidebar state
  const [supportedAssets, setSupportedAssets] = useState<Asset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [assetSearch, setAssetSearch] = useState("");

  const load = useCallback(async () => {
    if (!getToken()) { setLoading(false); return; }
    setLoading(true);
    try {
      const [openRes, pastRes] = await Promise.all([getPositions(), getPastPositions()]);
      setOpenPositions(openRes.data);
      setPastPositions(pastRes.data);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  const loadAssets = useCallback(async () => {
    setAssetsLoading(true);
    try {
      const res = await getAssets();
      setSupportedAssets(res.assets ?? []);
    } catch { /* silent */ } finally {
      setAssetsLoading(false);
    }
  }, []);

  useEffect(() => { load(); loadAssets(); }, [load, loadAssets]);

  // Group past positions by symbol
  const assetMap = useMemo(() => {
    const map = new Map<string, BinancePastPosition[]>();
    pastPositions.forEach((p) => {
      const s = p.symbol || "UNKNOWN";
      if (!map.has(s)) map.set(s, []);
      map.get(s)!.push(p);
    });
    return map;
  }, [pastPositions]);

  const assetStatsList = useMemo(
    () =>
      [...assetMap.entries()]
        .map(([sym, trades]) => computeAssetStats(sym, trades))
        .sort((a, b) => Math.abs(b.totalPnl) - Math.abs(a.totalPnl)),
    [assetMap],
  );

  // Auto-select top asset
  useEffect(() => {
    if (assetStatsList.length > 0 && !selectedSymbol) {
      setSelectedSymbol(assetStatsList[0].symbol);
    }
  }, [assetStatsList, selectedSymbol]);

  const selectedStats = useMemo(
    () => assetStatsList.find((a) => a.symbol === selectedSymbol) ?? null,
    [assetStatsList, selectedSymbol],
  );

  // Open positions for selected symbol
  const openForSymbol = useMemo(
    () => openPositions.filter((p) => p.symbol === selectedSymbol),
    [openPositions, selectedSymbol],
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[160px]" />
        <div className="absolute -right-20 top-1/3 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[180px]" />
      </div>

      <V2TopNav
        active="asset-performance"
        onRefresh={load}
        loading={loading}
        endSlot={
          <div className="hidden items-center gap-2 rounded-full border border-border/40 bg-card/40 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur md:flex">
            <Search className="h-3.5 w-3.5" />
            <span>Asset Performance</span>
          </div>
        }
      />

      <main className="relative z-10 mx-auto max-w-[1600px] px-6 py-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr_300px]">

            {/* ── Asset List ─────────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
              className="flex flex-col gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Assets ({assetStatsList.length})
              </h2>
              {loading && (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
              {!loading && assetStatsList.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <BarChart2 className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">No trade history</p>
                  <Link to="/positions" className="text-xs text-primary hover:underline">View positions →</Link>
                </div>
              )}
              <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 180px)" }}>
                {assetStatsList.map((a, i) => {
                  const isSelected = a.symbol === selectedSymbol;
                  const pos = a.totalPnl >= 0;
                  return (
                    <motion.button
                      key={a.symbol}
                      onClick={() => setSelectedSymbol(a.symbol)}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                      className={`relative overflow-hidden rounded-xl border px-4 py-3 text-left transition ${
                        isSelected
                          ? "border-primary/60 bg-gradient-to-r from-primary/15 to-accent/10"
                          : "border-border/30 bg-card/30 hover:border-primary/30 hover:bg-card/50"
                      }`}
                    >
                      {isSelected && (
                        <motion.div layoutId="assetsel"
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-accent/5"
                          transition={{ type: "spring", stiffness: 260, damping: 22 }} />
                      )}
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold ${pos ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"}`}>
                            {a.symbol.replace("USDT", "").replace("BUSD", "").slice(0, 3)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold">{a.symbol.replace("USDT", "").replace("BUSD", "")}</p>
                            <p className="text-[10px] text-muted-foreground">{a.tradeCount} trades</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs font-bold ${pos ? "text-primary" : "text-destructive"}`}>
                            {pos ? "+" : ""}${fmt(a.totalPnl)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{fmt(a.winRate, 0)}% WR</p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* ── Asset Detail ────────────────────────────────────────── */}
            <div className="flex min-w-0 flex-col gap-5">
              <AnimatePresence mode="wait">
                {selectedStats && (
                  <motion.div key={selectedStats.symbol} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }} className="flex flex-col gap-5">

                    {/* Header + equity chart */}
                    <Card className="overflow-hidden border-border/40 bg-gradient-to-br from-card/80 via-card/40 to-card/20 backdrop-blur-xl">
                      <CardContent className="p-0">
                        {/* Header */}
                        <div className="flex flex-wrap items-start justify-between gap-4 px-6 pt-6">
                          <div>
                            {/* Symbol dropdown */}
                            <div className="relative inline-block">
                              <button
                                onClick={() => setDropdownOpen((p) => !p)}
                                className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary ring-1 ring-primary/30 transition hover:bg-primary/20"
                              >
                                {selectedStats.symbol}
                                <ChevronDown className="h-3.5 w-3.5" />
                              </button>
                              {dropdownOpen && (
                                <div className="absolute left-0 top-full z-20 mt-1 max-h-48 w-48 overflow-y-auto rounded-xl border border-border/40 bg-card/95 shadow-2xl backdrop-blur-xl">
                                  {assetStatsList.map((a) => (
                                    <button key={a.symbol} onClick={() => { setSelectedSymbol(a.symbol); setDropdownOpen(false); }}
                                      className={`flex w-full items-center justify-between px-4 py-2.5 text-xs transition hover:bg-primary/10 ${a.symbol === selectedSymbol ? "text-primary font-semibold" : "text-foreground"}`}>
                                      <span>{a.symbol}</span>
                                      <span className={a.totalPnl >= 0 ? "text-primary" : "text-destructive"}>
                                        {a.totalPnl >= 0 ? "+" : ""}${fmt(a.totalPnl)}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className={`mt-2 text-4xl font-bold ${selectedStats.totalPnl >= 0 ? "text-primary" : "text-destructive"}`}>
                              {selectedStats.totalPnl >= 0 ? "+" : ""}${fmt(selectedStats.totalPnl)}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">Total realized PnL · {selectedStats.tradeCount} closed trades</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 text-right">
                            <span className={`text-2xl font-bold ${selectedStats.winRate >= 50 ? "text-primary" : "text-destructive"}`}>
                              {fmt(selectedStats.winRate, 1)}%
                            </span>
                            <span className="text-xs text-muted-foreground">Win Rate · {selectedStats.wins}W/{selectedStats.losses}L</span>
                          </div>
                        </div>

                        {/* Equity Chart — full bleed */}
                        <div className="mt-4 h-[240px] w-full">
                          <AssetEquityChart series={selectedStats.equityCurve} positive={selectedStats.totalPnl >= 0} />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Stat grid */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      {[
                        { label: "Avg Trade", value: selectedStats.avgPnl, icon: Activity, isUsd: true },
                        { label: "Best Trade", value: selectedStats.bestTrade, icon: Trophy, isUsd: true, positive: true },
                        { label: "Worst Trade", value: selectedStats.worstTrade, icon: TrendingDown, isUsd: true, positive: false },
                        { label: "Profit Factor", value: selectedStats.profitFactor, icon: Target, isUsd: false },
                      ].map((s) => {
                        const pos = typeof s.positive !== "undefined" ? s.positive : s.value >= 0;
                        return (
                          <Card key={s.label} className="border-border/40 bg-card/40 backdrop-blur-xl">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">{s.label}</p>
                                <s.icon className="h-3.5 w-3.5 text-muted-foreground/60" />
                              </div>
                              <p className={`mt-2 text-lg font-bold ${pos ? "text-primary" : "text-destructive"}`}>
                                {s.isUsd
                                  ? `${s.value >= 0 ? "+" : ""}$${fmt(Math.abs(s.value))}`
                                  : s.value === Infinity ? "∞" : fmt(s.value)}
                              </p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {/* PnL bar chart + trade list */}
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1fr]">
                      <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
                        <CardContent className="p-5">
                          <div className="mb-3 flex items-center gap-2">
                            <BarChart2 className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-semibold">Per-Trade PnL (last 30)</h3>
                          </div>
                          <PnlBars trades={selectedStats.trades} />
                          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary/60 inline-block" /> Win</span>
                            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-destructive/60 inline-block" /> Loss</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Open position for this asset if any */}
                      <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
                        <CardContent className="p-5">
                          <div className="mb-3 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-semibold">Current Position</h3>
                          </div>
                          {openForSymbol.length === 0 ? (
                            <p className="py-6 text-center text-xs text-muted-foreground">No open position for {selectedStats.symbol}</p>
                          ) : (
                            openForSymbol.map((p, i) => {
                              const amt = parseFloat(p.position_amt || "0");
                              const isLong = amt >= 0;
                              const pnl = parseFloat(p.unrealized_profit || "0") || 0;
                              const entry = parseFloat(p.entry_price || "0");
                              const mark = parseFloat(p.mark_price || "0");
                              const pnlPct = entry && amt ? ((mark - entry) / entry) * (amt >= 0 ? 1 : -1) * 100 : 0;
                              return (
                                <div key={i} className="space-y-3">
                                  <div className="flex items-center gap-3">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isLong ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
                                      {isLong ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                                    </div>
                                    <div>
                                      <p className="font-semibold">{p.symbol}</p>
                                      <p className={`text-xs font-medium ${isLong ? "text-primary" : "text-destructive"}`}>{isLong ? "LONG" : "SHORT"}</p>
                                    </div>
                                    <div className="ml-auto text-right">
                                      <p className={`text-lg font-bold ${pnl >= 0 ? "text-primary" : "text-destructive"}`}>
                                        {pnl >= 0 ? "+" : ""}${fmt(pnl)}
                                      </p>
                                      <p className={`text-xs ${pnlPct >= 0 ? "text-primary" : "text-destructive"}`}>
                                        {pnlPct >= 0 ? "+" : ""}{fmt(pnlPct, 2)}%
                                      </p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 rounded-lg bg-background/40 p-3 text-xs">
                                    <div><p className="text-muted-foreground">Entry</p><p className="font-semibold">${fmt(entry, 4)}</p></div>
                                    <div><p className="text-muted-foreground">Mark</p><p className="font-semibold">${fmt(mark, 4)}</p></div>
                                    <div><p className="text-muted-foreground">Size</p><p className="font-semibold">{fmt(Math.abs(amt), 4)}</p></div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recent trades for this asset */}
                    <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
                      <CardContent className="p-5">
                        <h3 className="mb-3 text-sm font-semibold">Recent Trades · {selectedStats.symbol}</h3>
                        {selectedStats.trades.length === 0 ? (
                          <p className="py-6 text-center text-xs text-muted-foreground">No trades</p>
                        ) : (
                          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 320 }}>
                            {[...selectedStats.trades].reverse().slice(0, 20).map((p, i) => {
                              const sideRaw = (p.position_side || "").toUpperCase();
                              const q = parseFloat(String(p.position_amt ?? p.qty ?? "0")) || 0;
                              const isLong = sideRaw === "LONG" || (sideRaw !== "SHORT" && q >= 0);
                              const pnl = parseFloat(p.realized_pnl || "0") || 0;
                              const entry = parseFloat(p.entry_price || "0");
                              const exit = parseFloat(p.exit_price || "0");
                              const pnlPct = entry && q ? ((exit - entry) / entry) * (isLong ? 1 : -1) * 100 : 0;
                              return (
                                <div key={p.id ?? i}
                                  className="flex items-center justify-between rounded-xl border border-border/20 bg-background/40 px-4 py-3 text-xs transition hover:border-primary/30">
                                  <div className="flex items-center gap-3">
                                    <div className={`flex h-7 w-7 items-center justify-center rounded-full ${isLong ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
                                      {isLong ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                                    </div>
                                    <div>
                                      <p className="font-medium">{isLong ? "Long" : "Short"} · {fmt(Math.abs(q), 4)}</p>
                                      <p className="text-muted-foreground">{p.closed_at ? new Date(p.closed_at).toLocaleString() : "—"}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-6">
                                    <div className="text-right">
                                      <p className="text-muted-foreground">Entry / Exit</p>
                                      <p className="font-medium">${fmt(entry, 4)} → ${fmt(exit, 4)}</p>
                                    </div>
                                    <div className="min-w-[70px] text-right">
                                      <p className={`font-bold ${pnl >= 0 ? "text-primary" : "text-destructive"}`}>
                                        {pnl >= 0 ? "+" : ""}${fmt(pnl)}
                                      </p>
                                      <p className={pnlPct >= 0 ? "text-primary" : "text-destructive"}>
                                        {pnlPct >= 0 ? "+" : ""}{fmt(pnlPct, 2)}%
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Supported Assets Sidebar ────────────────────────────── */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-col gap-4"
            >
              <Card className="flex flex-col overflow-hidden border-border/40 bg-card/40 backdrop-blur-xl"
                style={{ maxHeight: "calc(100vh - 120px)" }}>
                <div className="flex shrink-0 items-center justify-between border-b border-border/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                      <Layers className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Supported Assets</p>
                      <p className="text-[10px] text-muted-foreground">
                        {supportedAssets.filter((a) => a.enabled === 1).length} enabled
                      </p>
                    </div>
                  </div>
                  <button onClick={loadAssets} disabled={assetsLoading}
                    className="rounded-md p-1.5 text-muted-foreground transition hover:bg-primary/10 hover:text-foreground">
                    <BarChart2 className={`h-3.5 w-3.5 ${assetsLoading ? "animate-pulse" : ""}`} />
                  </button>
                </div>

                {/* Search */}
                <div className="shrink-0 px-3 py-2.5">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search assets…"
                      value={assetSearch}
                      onChange={(e) => setAssetSearch(e.target.value)}
                      className="h-8 rounded-lg border-border/40 bg-background/40 pl-8 text-xs placeholder:text-muted-foreground/60 focus-visible:ring-primary/40"
                    />
                  </div>
                </div>

                {/* Asset list */}
                <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
                  {assetsLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    (() => {
                      const q = assetSearch.toLowerCase().trim();
                      const filtered = supportedAssets.filter((a) =>
                        !q ||
                        a.ticker.toLowerCase().includes(q) ||
                        a.type.toLowerCase().includes(q) ||
                        a.broker.toLowerCase().includes(q),
                      );
                      const enabled = filtered.filter((a) => a.enabled === 1);
                      const disabled = filtered.filter((a) => a.enabled !== 1);

                      if (filtered.length === 0) {
                        return (
                          <p className="py-8 text-center text-xs text-muted-foreground">No assets found</p>
                        );
                      }

                      const renderRow = (a: Asset) => (
                        <div key={a.id}
                          className={`group flex items-center justify-between rounded-lg px-3 py-2.5 transition
                            ${a.ticker.replace("USDT","").replace("BUSD","") === selectedSymbol?.replace("USDT","").replace("BUSD","")
                              ? "bg-primary/15 ring-1 ring-primary/30"
                              : "hover:bg-primary/8"}`}
                          onClick={() => {
                            const match = assetStatsList.find(
                              (s) => s.symbol.replace("USDT","").replace("BUSD","") === a.ticker.replace("USDT","").replace("BUSD","")
                                || s.symbol === a.ticker,
                            );
                            if (match) setSelectedSymbol(match.symbol);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[9px] font-bold
                              ${a.enabled === 1 ? "bg-primary/20 text-primary" : "bg-muted/40 text-muted-foreground"}`}>
                              {a.ticker.replace("USDT","").replace("BUSD","").slice(0,3)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-[11px] font-semibold">{a.ticker}</p>
                              <p className="text-[9px] text-muted-foreground">{a.broker}</p>
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <Badge variant="outline"
                              className={`h-4 px-1.5 text-[9px] ${TYPE_STYLES[a.type] ?? "border-border/60"}`}>
                              {a.type.slice(0,6)}
                            </Badge>
                            {a.enabled === 1 ? (
                              <span className="text-[9px] font-medium text-primary">Active</span>
                            ) : (
                              <span className="text-[9px] text-muted-foreground/60">Off</span>
                            )}
                          </div>
                        </div>
                      );

                      return (
                        <div className="space-y-0.5">
                          {enabled.length > 0 && (
                            <>
                              <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                                Enabled ({enabled.length})
                              </p>
                              {enabled.map(renderRow)}
                            </>
                          )}
                          {disabled.length > 0 && (
                            <>
                              <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                                Disabled ({disabled.length})
                              </p>
                              {disabled.map(renderRow)}
                            </>
                          )}
                        </div>
                      );
                    })()
                  )}
                </div>
              </Card>
            </motion.aside>

          </div>
      </main>
    </div>
  );
};

export default AssetPerformance;
