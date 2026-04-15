import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Loader2,
  ChevronLeft,
  ChevronRight,
  History,
  Search,
  Filter,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getPositions,
  getPastPositions,
  getToken,
  type BinancePosition,
  type BinancePastPosition,
} from "@/lib/api";
import { V2TopNav } from "@/components/V2TopNav";

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (v: number | string | undefined, d = 2) => {
  if (v === undefined || v === null || v === "") return "0.00";
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (Number.isNaN(n)) return "0.00";
  return n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
};

function pastQty(p: BinancePastPosition) {
  return parseFloat(String(p.position_amt ?? p.qty ?? "0")) || 0;
}

function computeStats(past: BinancePastPosition[], open: BinancePosition[]) {
  const pnls = past.map((p) => parseFloat(p.realized_pnl || "0") || 0);
  const wins = pnls.filter((x) => x > 0);
  const losses = pnls.filter((x) => x < 0);
  const nonzero = pnls.filter((x) => x !== 0);
  const realized = pnls.reduce((a, b) => a + b, 0);
  const unrealized = open.reduce((s, p) => s + (parseFloat(p.unrealized_profit || "0") || 0), 0);
  const grossProfit = wins.reduce((a, b) => a + b, 0);
  const grossLoss = Math.abs(losses.reduce((a, b) => a + b, 0));
  const winRate = nonzero.length > 0 ? (wins.length / nonzero.length) * 100 : 0;
  const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? Infinity : 0) : grossProfit / grossLoss;
  let peak = 0, cum = 0, maxDrawdown = 0;
  let winStreak = 0, loseStreak = 0, maxWinStreak = 0, maxLoseStreak = 0;
  for (const p of pnls) {
    cum += p;
    peak = Math.max(peak, cum);
    maxDrawdown = Math.max(maxDrawdown, peak - cum);
    if (p > 0) { winStreak++; loseStreak = 0; maxWinStreak = Math.max(maxWinStreak, winStreak); }
    else if (p < 0) { loseStreak++; winStreak = 0; maxLoseStreak = Math.max(maxLoseStreak, loseStreak); }
    else { winStreak = 0; loseStreak = 0; }
  }
  return { realized, unrealized, winRate, profitFactor, maxDrawdown, maxWinStreak, maxLoseStreak, totalTrades: past.length, wins: wins.length, openCount: open.length };
}

// ─── Equity Curve ───────────────────────────────────────────────────────────

const EquityCurve = ({ past }: { past: BinancePastPosition[] }) => {
  const sorted = useMemo(() =>
    [...past].filter((p) => p.closed_at)
      .sort((a, b) => new Date(a.closed_at!).getTime() - new Date(b.closed_at!).getTime()),
    [past]);

  const series = useMemo(() => {
    let cum = 0;
    const pts = [{ date: "Start", value: 0 }];
    for (const p of sorted) {
      cum += parseFloat(p.realized_pnl || "0") || 0;
      pts.push({ date: new Date(p.closed_at!).toLocaleDateString(undefined, { month: "short", day: "numeric" }), value: cum });
    }
    return pts;
  }, [sorted]);

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const W = 800, H = 240, PL = 4, PR = 4, PT = 16, PB = 36;
  const chartW = W - PL - PR, chartH = H - PT - PB;

  if (series.length < 2) {
    return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No trade history yet</div>;
  }

  const values = series.map((p) => p.value);
  const min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
  const toX = (i: number) => PL + (i / (series.length - 1)) * chartW;
  const toY = (v: number) => PT + chartH * (1 - (v - min) / span);

  const pts = series.map((p, i) => ({ x: toX(i), y: toY(p.value), ...p }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${pts[pts.length - 1].x.toFixed(1)},${H - PB} L${pts[0].x.toFixed(1)},${H - PB} Z`;

  const positive = series[series.length - 1].value >= 0;
  const color = positive ? "hsl(var(--primary))" : "hsl(var(--destructive))";
  const color2 = positive ? "hsl(var(--accent))" : "hsl(var(--destructive))";

  const yLabels = Array.from({ length: 5 }, (_, i) => { const frac = i / 4; return { val: min + span * frac, y: toY(min + span * frac) }; });
  const xCount = Math.min(6, series.length);
  const xIndices = xCount <= 1 ? [0] : Array.from({ length: xCount }, (_, i) => Math.round((i * (series.length - 1)) / (xCount - 1)));

  const hovered = hoverIdx !== null ? pts[hoverIdx] : null;
  const handleMouseMove = (e: React.MouseEvent<SVGRectElement>) => {
    const svg = e.currentTarget.closest("svg");
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * W;
    setHoverIdx(Math.max(0, Math.min(series.length - 1, Math.round(((relX - PL) / chartW) * (series.length - 1)))));
  };

  const tipW = 110, tipH = 44;
  const tipX = hovered ? Math.min(Math.max(hovered.x - tipW / 2, PL), W - PR - tipW) : 0;
  const tipY = hovered ? Math.max(PT, hovered.y - tipH - 14) : 0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full overflow-visible" onMouseLeave={() => setHoverIdx(null)}>
      <defs>
        <linearGradient id="pv2af" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient>
        <linearGradient id="pv2lg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={color} /><stop offset="100%" stopColor={color2} /></linearGradient>
        <filter id="pv2gl"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      {yLabels.map(({ val, y }, i) => {
        const label = `${val >= 0 ? "+" : ""}${fmt(val, 0)}`;
        const lw = label.length * 5.5 + 8;
        return (
          <g key={i}>
            <line x1={PL} x2={W - PR} y1={y} y2={y} stroke="hsl(var(--border))" strokeOpacity={0.15} strokeDasharray="2 5" />
            <rect x={PL + 4} y={y - 9} width={lw} height={14} rx={3} fill="hsl(var(--background))" fillOpacity={0.7} />
            <text x={PL + 8} y={y + 3} textAnchor="start" fontSize={9} fill="hsl(var(--muted-foreground))" opacity={0.75}>{label}</text>
          </g>
        );
      })}
      <line x1={PL} x2={W - PR} y1={H - PB} y2={H - PB} stroke="hsl(var(--border))" strokeOpacity={0.2} />
      {xIndices.map((idx) => (
        <text key={idx} x={pts[idx].x} y={H - PB + 14} textAnchor="middle" fontSize={9} fill="hsl(var(--muted-foreground))" opacity={0.7}>{series[idx].date}</text>
      ))}
      <motion.path d={areaPath} fill="url(#pv2af)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} />
      <motion.path d={linePath} fill="none" stroke="url(#pv2lg)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" filter="url(#pv2gl)"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: "easeInOut" }} />
      <motion.circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={4} fill={color} filter="url(#pv2gl)"
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1, type: "spring", stiffness: 260 }} />
      {hovered && (
        <>
          <line x1={hovered.x} x2={hovered.x} y1={PT} y2={H - PB} stroke={color} strokeOpacity={0.4} strokeWidth={1} strokeDasharray="3 4" />
          <circle cx={hovered.x} cy={hovered.y} r={5} fill={color} stroke="hsl(var(--background))" strokeWidth={2.5} />
          <rect x={tipX} y={tipY} width={tipW} height={tipH} rx={7} fill="hsl(var(--card))" fillOpacity={0.96} stroke={color} strokeOpacity={0.35} strokeWidth={1} />
          <text x={tipX + 10} y={tipY + 15} fontSize={9} fill="hsl(var(--muted-foreground))">{hovered.date}</text>
          <text x={tipX + 10} y={tipY + 31} fontSize={12} fontWeight="700" fill={color}>{hovered.value >= 0 ? "+" : ""}${fmt(hovered.value)}</text>
        </>
      )}
      <rect x={PL} y={PT} width={chartW} height={chartH + PB - 4} fill="transparent" style={{ cursor: "crosshair" }} onMouseMove={handleMouseMove} />
    </svg>
  );
};

// ─── Page ────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

type Tab = "open" | "closed";
type SortKey = "date" | "pnl" | "symbol";

const PositionsV2 = () => {
  const [open, setOpen] = useState<BinancePosition[]>([]);
  const [past, setPast] = useState<BinancePastPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("open");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);

  const load = useCallback(async () => {
    if (!getToken()) { setLoading(false); return; }
    setLoading(true);
    try {
      const [o, p] = await Promise.all([getPositions(), getPastPositions()]);
      setOpen(o.data);
      setPast(p.data);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => computeStats(past, open), [past, open]);

  const filteredOpen = useMemo(() => {
    const q = search.toLowerCase();
    return open.filter((p) => !q || (p.symbol || "").toLowerCase().includes(q));
  }, [open, search]);

  const filteredPast = useMemo(() => {
    const q = search.toLowerCase();
    let list = past.filter((p) => !q || (p.symbol || "").toLowerCase().includes(q));
    list = [...list].sort((a, b) => {
      if (sortKey === "date") {
        const da = new Date(a.closed_at || 0).getTime(), db = new Date(b.closed_at || 0).getTime();
        return sortAsc ? da - db : db - da;
      }
      if (sortKey === "pnl") {
        const pa = parseFloat(a.realized_pnl || "0") || 0, pb = parseFloat(b.realized_pnl || "0") || 0;
        return sortAsc ? pa - pb : pb - pa;
      }
      return sortAsc ? (a.symbol || "").localeCompare(b.symbol || "") : (b.symbol || "").localeCompare(a.symbol || "");
    });
    return list;
  }, [past, search, sortKey, sortAsc]);

  const currentList = tab === "open" ? filteredOpen : filteredPast;
  const totalPages = Math.max(1, Math.ceil(currentList.length / PAGE_SIZE));
  const sliced = currentList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [tab, search, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((p) => !p);
    else { setSortKey(key); setSortAsc(false); }
  };

  const statCards = [
    { label: "Unrealized P/L", value: stats.unrealized, hint: `${stats.openCount} open`, positive: stats.unrealized >= 0, icon: Activity },
    { label: "Realized P/L", value: stats.realized, hint: `${stats.totalTrades} trades`, positive: stats.realized >= 0, icon: TrendingUp },
    { label: "Win Rate", value: stats.winRate, isPercent: true, hint: `${stats.wins}W / ${stats.totalTrades - stats.wins}L`, positive: stats.winRate >= 50, icon: Target },
    { label: "Max Drawdown", value: -stats.maxDrawdown, hint: "Peak to trough", positive: stats.maxDrawdown === 0, icon: TrendingDown },
    { label: "Profit Factor", value: stats.profitFactor === Infinity ? 999 : stats.profitFactor, displayStr: stats.profitFactor === Infinity ? "∞" : fmt(stats.profitFactor), hint: "Gross P / Gross L", positive: stats.profitFactor >= 1, icon: BarChart3 },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[160px]" />
        <div className="absolute -right-20 top-1/3 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[180px]" />
      </div>

      <V2TopNav active="positions" onRefresh={load} loading={loading} />

      <main className="relative z-10 mx-auto max-w-[1600px] px-6 py-8">
        {/* Stat cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.06 * i }}>
              <Card className="group relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10">
                <div className={`absolute inset-x-0 top-0 h-px ${s.positive
                  ? "bg-gradient-to-r from-transparent via-primary to-transparent"
                  : "bg-gradient-to-r from-transparent via-destructive to-transparent"}`} />
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
                <div className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl ${s.positive ? "bg-primary/20" : "bg-destructive/20"}`} />
                <CardContent className="relative p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">{s.label}</p>
                    <s.icon className={`h-3.5 w-3.5 ${s.positive ? "text-primary/50" : "text-destructive/50"}`} />
                  </div>
                  <p className={`mt-1.5 text-xl font-bold tracking-tight ${s.positive ? "text-primary" : "text-destructive"}`}>
                    {s.displayStr ?? (s.isPercent ? `${fmt(s.value, 1)}%` : `${s.value >= 0 ? "+" : ""}$${fmt(Math.abs(s.value))}`)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground/60">{s.hint}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Equity Curve */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card className="mb-6 overflow-hidden border-border/40 bg-gradient-to-br from-card/80 via-card/40 to-card/20 backdrop-blur-xl">
            <CardContent className="p-0">
              <div className="mb-3 flex items-center justify-between px-5 pt-5">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary ring-1 ring-primary/30">Equity Curve</span>
                  <span className="text-xs text-muted-foreground">{past.length} trades · cumulative realized PnL</span>
                </div>
                <p className={`text-sm font-semibold ${stats.realized >= 0 ? "text-primary" : "text-destructive"}`}>
                  {stats.realized >= 0 ? "+" : ""}${fmt(stats.realized)}
                </p>
              </div>
              <div className="h-[240px] w-full border-t border-border/20 bg-background/10">
                <EquityCurve past={past} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs + Search + Sort */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border border-border/40 bg-card/40 p-1">
              {(["open", "closed"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`relative rounded-full px-4 py-1.5 text-xs font-medium transition ${tab === t ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {tab === t && (
                    <motion.span layoutId="postab" className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent"
                      transition={{ type: "spring", stiffness: 260, damping: 22 }} />
                  )}
                  <span className="relative flex items-center gap-1.5">
                    {t === "open" ? <Activity className="h-3.5 w-3.5" /> : <History className="h-3.5 w-3.5" />}
                    {t === "open" ? "Open" : "Closed"}
                    <span className="rounded-full bg-background/40 px-1.5 py-0 text-[10px]">{t === "open" ? filteredOpen.length : filteredPast.length}</span>
                  </span>
                </button>
              ))}
            </div>
            {tab === "closed" && (
              <div className="flex items-center gap-1">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                {(["date", "pnl", "symbol"] as const).map((k) => (
                  <button key={k} onClick={() => toggleSort(k)}
                    className={`rounded-md px-2 py-1 text-[10px] font-medium transition ${sortKey === k ? "bg-primary/15 text-primary ring-1 ring-primary/25" : "text-muted-foreground hover:text-foreground"}`}>
                    {k === "date" ? "Date" : k === "pnl" ? "PnL" : "Symbol"}{sortKey === k ? (sortAsc ? " ↑" : " ↓") : ""}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border/40 bg-card/40 px-3 py-1.5 text-xs text-muted-foreground">
            <Search className="h-3.5 w-3.5" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search symbol..." className="w-36 bg-transparent outline-none placeholder:text-muted-foreground/50" />
          </div>
        </motion.div>

        {/* Position cards */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : sliced.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                {search ? "No matching positions" : tab === "open" ? "No open positions" : "No closed positions"}
              </div>
            ) : (
              <div className="space-y-3">
                {tab === "open"
                  ? (sliced as BinancePosition[]).map((p, i) => <OpenCard key={p.id ?? i} p={p} />)
                  : (sliced as BinancePastPosition[]).map((p, i) => <ClosedCard key={p.id ?? i} p={p} />)}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-5 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Page {page} of {totalPages} · {currentList.length} records</span>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}
                className="h-7 w-7 p-0 rounded-full border-border/40">
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? <span key={`e${i}`} className="px-1 text-xs text-muted-foreground">…</span> : (
                    <Button key={p} size="sm" variant={p === page ? "default" : "outline"} onClick={() => setPage(p as number)}
                      className="h-7 w-7 p-0 rounded-full text-[11px] border-border/40">{p}</Button>
                  ))}
              <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}
                className="h-7 w-7 p-0 rounded-full border-border/40">
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// ─── Open Position Card ──────────────────────────────────────────────────────

const OpenCard = ({ p }: { p: BinancePosition }) => {
  const amt = parseFloat(p.position_amt || "0");
  const isLong = amt >= 0;
  const pnl = parseFloat(p.unrealized_profit || "0") || 0;
  const entry = parseFloat(p.entry_price || "0");
  const mark = parseFloat(p.mark_price || "0");
  const notional = Math.abs(amt) * (mark || entry);
  const pnlPct = entry && amt ? ((mark - entry) / entry) * (amt >= 0 ? 1 : -1) * 100 : 0;

  return (
    <Card className="group overflow-hidden border-border/30 bg-card/40 backdrop-blur-xl transition hover:border-primary/40 hover:bg-card/60">
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <CardContent className="relative flex flex-wrap items-center gap-4 p-4 sm:p-5">
        <div className="flex items-center gap-3 min-w-[130px]">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isLong ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
            {isLong ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-sm font-bold">{p.symbol}</p>
            <span className={`text-[10px] font-semibold uppercase tracking-wide ${isLong ? "text-primary" : "text-destructive"}`}>
              {isLong ? "Long" : "Short"}
            </span>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-1.5 text-xs sm:grid-cols-4">
          <div><p className="text-muted-foreground/70">Entry</p><p className="font-semibold">${fmt(entry, 4)}</p></div>
          <div><p className="text-muted-foreground/70">Mark</p><p className="font-semibold">${fmt(mark, 4)}</p></div>
          <div><p className="text-muted-foreground/70">Size</p><p className="font-semibold">{fmt(Math.abs(amt), 4)}</p></div>
          <div><p className="text-muted-foreground/70">Notional</p><p className="font-semibold">${fmt(notional)}</p></div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {p.leverage && (
            <span className="rounded-md bg-card/60 px-2 py-1 text-[11px] font-semibold text-muted-foreground ring-1 ring-border/40">
              {p.leverage}x
            </span>
          )}
          <div className="text-right">
            <p className={`text-sm font-bold ${pnl >= 0 ? "text-primary" : "text-destructive"}`}>
              {pnl >= 0 ? "+" : ""}${fmt(pnl)}
            </p>
            <p className={`text-[11px] font-medium ${pnlPct >= 0 ? "text-primary" : "text-destructive"}`}>
              {pnlPct >= 0 ? "+" : ""}{fmt(pnlPct, 2)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Closed Position Card ────────────────────────────────────────────────────

const ClosedCard = ({ p }: { p: BinancePastPosition }) => {
  const q = pastQty(p);
  const sideRaw = (p.position_side || "").toUpperCase();
  const isLong = sideRaw === "LONG" || (sideRaw !== "SHORT" && q >= 0);
  const pnl = parseFloat(p.realized_pnl || "0") || 0;
  const entry = parseFloat(p.entry_price || "0");
  const exitPx = parseFloat(p.exit_price || "0");
  const pnlPct = entry && q ? ((exitPx - entry) / entry) * (isLong ? 1 : -1) * 100 : 0;

  return (
    <Card className="group overflow-hidden border-border/30 bg-card/40 backdrop-blur-xl transition hover:border-primary/40 hover:bg-card/60">
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <CardContent className="relative flex flex-wrap items-center gap-4 p-4 sm:p-5">
        <div className="flex items-center gap-3 min-w-[130px]">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isLong ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
            {isLong ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-sm font-bold">{p.symbol}</p>
            <span className={`text-[10px] font-semibold uppercase tracking-wide ${isLong ? "text-primary" : "text-destructive"}`}>
              {sideRaw || (isLong ? "Long" : "Short")}
            </span>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-1.5 text-xs sm:grid-cols-4">
          <div><p className="text-muted-foreground/70">Entry</p><p className="font-semibold">${fmt(entry, 4)}</p></div>
          <div><p className="text-muted-foreground/70">Exit</p><p className="font-semibold">${fmt(exitPx, 4)}</p></div>
          <div><p className="text-muted-foreground/70">Size</p><p className="font-semibold">{fmt(Math.abs(q), 4)}</p></div>
          <div>
            <p className="text-muted-foreground/70">Closed</p>
            <p className="font-semibold">{p.closed_at ? new Date(p.closed_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—"}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {p.strategy && (
            <span className="rounded-md bg-accent/10 px-2 py-1 text-[10px] font-semibold text-accent ring-1 ring-accent/20">
              {p.strategy}
            </span>
          )}
          <div className="text-right">
            <p className={`text-sm font-bold ${pnl >= 0 ? "text-primary" : "text-destructive"}`}>
              {pnl >= 0 ? "+" : ""}${fmt(pnl)}
            </p>
            <p className={`text-[11px] font-medium ${pnlPct >= 0 ? "text-primary" : "text-destructive"}`}>
              {pnlPct >= 0 ? "+" : ""}{fmt(pnlPct, 2)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PositionsV2;
