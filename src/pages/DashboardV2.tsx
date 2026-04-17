import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Activity,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Target,
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

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (v: number | string | undefined, d = 2) => {
  if (v === undefined || v === null || v === "") return "0.00";
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (Number.isNaN(n)) return "0.00";
  return n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
};

const DATE_RANGES = ["7D", "30D", "90D", "All"] as const;
type DateRange = (typeof DATE_RANGES)[number];

function filterByRange(positions: BinancePastPosition[], range: DateRange) {
  if (range === "All") return positions;
  const days = range === "7D" ? 7 : range === "30D" ? 30 : 90;
  const cutoff = Date.now() - days * 86_400_000;
  return positions.filter((p) => p.closed_at && new Date(p.closed_at).getTime() >= cutoff);
}

interface EquityPoint { date: string; value: number }

function buildEquityPoints(positions: BinancePastPosition[], range: DateRange): EquityPoint[] {
  const sorted = filterByRange(
    [...positions].filter((p) => p.closed_at),
    range,
  ).sort((a, b) => new Date(a.closed_at!).getTime() - new Date(b.closed_at!).getTime());
  let cum = 0;
  const out: EquityPoint[] = [{ date: "Start", value: 0 }];
  for (const p of sorted) {
    cum += parseFloat(p.realized_pnl || "0") || 0;
    const d = new Date(p.closed_at!);
    out.push({
      date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      value: cum,
    });
  }
  return out;
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
  for (const p of pnls) {
    cum += p;
    peak = Math.max(peak, cum);
    maxDrawdown = Math.max(maxDrawdown, peak - cum);
  }
  return { realized, unrealized, winRate, profitFactor, maxDrawdown, totalTrades: past.length, wins: wins.length };
}

// ─── Area Chart with hover + date X-axis ────────────────────────────────────

const AreaChart = ({ points, positive = true }: { points: EquityPoint[]; positive?: boolean }) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 1100, H = 320;
  /** Y-axis labels flush left / flush right; plot uses full width between them */
  const AXIS_L = 40;
  const AXIS_R = 40;
  const PT = 20;
  const PB = 44;
  const chartW = W - AXIS_L - AXIS_R;
  const chartH = H - PT - PB;

  if (points.length < 2) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm text-muted-foreground">No trade history yet</p>
        <p className="max-w-sm text-xs text-muted-foreground/80">
          Connect an exchange to sync positions and build your equity curve.
        </p>
        <Link
          to="/dashboard/add-broker?connect=1"
          className="text-sm font-medium text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline"
        >
          Connect a broker
        </Link>
      </div>
    );
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const toX = (i: number) => AXIS_L + (i / (points.length - 1)) * chartW;
  const toY = (v: number) => PT + chartH * (1 - (v - min) / span);

  const pts = points.map((p, i) => ({ x: toX(i), y: toY(p.value), date: p.date, value: p.value }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${pts[pts.length - 1].x.toFixed(1)},${H - PB} L${pts[0].x.toFixed(1)},${H - PB} Z`;

  const yLabels = Array.from({ length: 5 }, (_, i) => {
    const frac = i / 4;
    const val = min + span * frac;
    return { val, y: toY(val) };
  });

  const xCount = Math.min(7, points.length);
  const xIndices = xCount <= 1
    ? [0]
    : Array.from({ length: xCount }, (_, i) => Math.round((i * (points.length - 1)) / (xCount - 1)));

  const color = positive ? "hsl(var(--primary))" : "hsl(var(--destructive))";
  const color2 = positive ? "hsl(var(--accent))" : "hsl(var(--destructive))";
  const hovered = hoverIdx !== null ? pts[hoverIdx] : null;

  const handleMouseMove = (e: React.MouseEvent<SVGRectElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.round(((relX - AXIS_L) / chartW) * (points.length - 1));
    setHoverIdx(Math.max(0, Math.min(points.length - 1, idx)));
  };

  const tooltipW = 110, tooltipH = 46;
  const tipX = hovered
    ? Math.min(Math.max(hovered.x - tooltipW / 2, AXIS_L), W - AXIS_R - tooltipW)
    : 0;
  const tipY = hovered ? Math.max(PT, hovered.y - tooltipH - 14) : 0;

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="h-full w-full overflow-visible"
      onMouseLeave={() => setHoverIdx(null)}>
      <defs>
        <linearGradient id="ec2areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ec2lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
        <filter id="ec2glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Y grid spans plot only; labels on far left + mirrored far right */}
      {yLabels.map(({ val, y }, i) => {
        const label = `${val >= 0 ? "+" : ""}${fmt(val, 0)}`;
        return (
          <g key={i}>
            <line x1={AXIS_L} x2={W - AXIS_R} y1={y} y2={y}
              stroke="hsl(var(--border))" strokeOpacity={0.15} strokeDasharray="2 5" />
            <text x={4} y={y + 3} textAnchor="start" fontSize={9}
              fill="hsl(var(--muted-foreground))" opacity={0.8}>
              {label}
            </text>
            <text x={W - 4} y={y + 3} textAnchor="end" fontSize={9}
              fill="hsl(var(--muted-foreground))" opacity={0.8}>
              {label}
            </text>
          </g>
        );
      })}

      {/* X axis baseline */}
      <line x1={AXIS_L} x2={W - AXIS_R} y1={H - PB} y2={H - PB}
        stroke="hsl(var(--border))" strokeOpacity={0.2} />

      {/* X date labels — skip consecutive duplicates */}
      {xIndices.map((idx, j, arr) => {
        const prevIdx = j > 0 ? arr[j - 1] : -1;
        if (prevIdx >= 0 && points[idx].date === points[prevIdx].date) return null;
        return (
          <text key={idx} x={pts[idx].x} y={H - PB + 16} textAnchor="middle" fontSize={9}
            fill="hsl(var(--muted-foreground))" opacity={0.7}>
            {points[idx].date}
          </text>
        );
      })}

      {/* Area fill */}
      <motion.path d={areaPath} fill="url(#ec2areaFill)"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} />

      {/* Line */}
      <motion.path
        d={linePath}
        fill="none"
        stroke="url(#ec2lineGrad)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#ec2glow)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />

      {/* Endpoint — strong pulse rings + core dot (origin at last point via transform) */}
      <g transform={`translate(${pts[pts.length - 1].x},${pts[pts.length - 1].y})`}>
        <motion.circle cx={0} cy={0} r={20} fill={color} fillOpacity={0.15}
          animate={{ scale: [1, 1.5, 1], opacity: [0.55, 0.12, 0.55] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }} />
        <motion.circle cx={0} cy={0} r={12} fill={color} fillOpacity={0.3}
          animate={{ scale: [1, 1.4, 1], opacity: [0.75, 0.3, 0.75] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }} />
        <motion.circle cx={0} cy={0} r={6} fill={color} filter="url(#ec2glow)"
          animate={{ scale: [1, 1.24, 1] }}
          transition={{ duration: 1.35, repeat: Infinity, ease: "easeInOut" }}
        />
      </g>

      {/* Hover crosshair + tooltip */}
      {hovered && (
        <>
          <line x1={hovered.x} x2={hovered.x} y1={PT} y2={H - PB}
            stroke={color} strokeOpacity={0.45} strokeWidth={1} strokeDasharray="3 4" />
          <circle cx={hovered.x} cy={hovered.y} r={5}
            fill={color} stroke="hsl(var(--background))" strokeWidth={2.5} />
          <rect x={tipX} y={tipY} width={tooltipW} height={tooltipH} rx={7}
            fill="hsl(var(--card))" fillOpacity={0.96}
            stroke={color} strokeOpacity={0.35} strokeWidth={1} />
          <text x={tipX + 10} y={tipY + 16} fontSize={9}
            fill="hsl(var(--muted-foreground))">{hovered.date}</text>
          <text x={tipX + 10} y={tipY + 33} fontSize={12} fontWeight="700" fill={color}>
            {hovered.value >= 0 ? "+" : ""}${fmt(hovered.value)}
          </text>
        </>
      )}

      {/* Invisible mouse-tracking overlay */}
      <rect x={AXIS_L} y={PT} width={chartW} height={chartH + PB - 4}
        fill="transparent" style={{ cursor: "crosshair" }}
        onMouseMove={handleMouseMove} />
    </svg>
  );
};

// ─── Mini Calendar with PnL ──────────────────────────────────────────────────

const MiniCalendar = ({ pnlMap }: { pnlMap: Map<string, number> }) => {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [showPnl, setShowPnl] = useState(false);
  const monthName = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });
  const firstDay = cursor.getDay();
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold">{monthName}</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPnl((p) => !p)}
            className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition ${showPnl
              ? "bg-primary/20 text-primary ring-1 ring-primary/30"
              : "bg-card/60 text-muted-foreground ring-1 ring-border/40 hover:text-foreground"}`}>
            {showPnl ? "Show Days" : "Show PnL"}
          </button>
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="rounded-md p-1 text-muted-foreground hover:bg-primary/10 hover:text-foreground transition">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="rounded-md p-1 text-muted-foreground hover:bg-primary/10 hover:text-foreground transition">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] text-muted-foreground">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="py-0.5 font-medium">{d}</div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const yy = cursor.getFullYear();
          const mm = String(cursor.getMonth() + 1).padStart(2, "0");
          const dd = String(d).padStart(2, "0");
          const key = `${yy}-${mm}-${dd}`;
          const pnl = pnlMap.get(key);
          const isToday = d === today.getDate() && cursor.getMonth() === today.getMonth() && cursor.getFullYear() === today.getFullYear();
          const hasPos = pnl !== undefined && pnl > 0;
          const hasNeg = pnl !== undefined && pnl < 0;
          const pnlShort = pnl !== undefined
            ? `${pnl >= 0 ? "+" : ""}${Math.abs(pnl) >= 1000 ? `${(pnl / 1000).toFixed(1)}k` : pnl.toFixed(0)}`
            : "";
          const hoverText = showPnl
            ? `Day ${d}`
            : pnl !== undefined ? `PnL: ${pnl >= 0 ? "+" : ""}$${fmt(pnl)}` : undefined;

          return (
            <div key={i} title={hoverText}
              className={`group relative flex h-7 items-center justify-center rounded text-[10px] transition cursor-default
                ${isToday ? "bg-gradient-to-br from-primary to-accent font-bold text-primary-foreground shadow-md shadow-primary/25" : ""}
                ${!isToday && hasPos ? "bg-primary/15 text-primary font-medium" : ""}
                ${!isToday && hasNeg ? "bg-destructive/15 text-destructive font-medium" : ""}
                ${!isToday && !hasPos && !hasNeg ? "text-foreground/50 hover:bg-primary/10" : ""}
              `}
            >
              <span className="transition-opacity duration-150">
                {showPnl ? (pnl !== undefined ? pnlShort : d) : d}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Open Order Card ─────────────────────────────────────────────────────────

const OpenOrderCard = ({ p }: { p: BinancePosition }) => {
  const amt = parseFloat(p.position_amt || "0");
  const isLong = amt >= 0;
  const pnl = parseFloat(p.unrealized_profit || "0") || 0;
  const entry = parseFloat(p.entry_price || "0");
  const mark = parseFloat(p.mark_price || "0");
  const notional = Math.abs(amt) * (mark || entry);
  const pnlPct = entry && amt ? ((mark - entry) / entry) * (amt >= 0 ? 1 : -1) * 100 : 0;

  return (
    <div className="rounded-xl border border-border/30 bg-background/40 p-4 transition hover:border-primary/40 hover:bg-background/60">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex items-center gap-3 min-w-[120px]">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isLong ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
            {isLong ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          </div>
          <div>
            <p className="text-sm font-bold">{p.symbol}</p>
            <span className={`text-[10px] font-semibold uppercase tracking-wide ${isLong ? "text-primary" : "text-destructive"}`}>
              {isLong ? "Long" : "Short"}
            </span>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-2 text-xs sm:grid-cols-4">
          <div>
            <p className="text-muted-foreground">Entry</p>
            <p className="font-semibold">${fmt(entry, 4)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Mark</p>
            <p className="font-semibold">${fmt(mark, 4)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Size</p>
            <p className="font-semibold">{fmt(Math.abs(amt), 4)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Notional</p>
            <p className="font-semibold">${fmt(notional)}</p>
          </div>
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
      </div>
      {p.update_time && (
        <p className="mt-2 text-[10px] text-muted-foreground/60">
          Updated {new Date(p.update_time < 1e12 ? p.update_time * 1000 : p.update_time).toLocaleString()}
        </p>
      )}
    </div>
  );
};

// ─── Page ────────────────────────────────────────────────────────────────────

const DashboardV2 = () => {
  const [range, setRange] = useState<DateRange>("All");
  const [accounts, setAccounts] = useState<BinanceAccountData[]>([]);
  const [openPositions, setOpenPositions] = useState<BinancePosition[]>([]);
  const [pastPositions, setPastPositions] = useState<BinancePastPosition[]>([]);
  const [loading, setLoading] = useState(true);

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

      <V2TopNav active="dashboard" brandTo="/dashboard" onRefresh={load} loading={loading} />

      {/* Affiliate banner */}
      <div className="relative z-10 mx-auto max-w-[1600px] px-6 pt-4">
        <AffiliateVerificationBanner />
      </div>

      {/* Main */}
      <main className="relative z-10 mx-auto max-w-[1600px] px-6 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">

          {/* ── LEFT ─────────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-6">

            {/* Wallet + Equity Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
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
                          <AreaChart points={equityPoints} positive={equityPositive} />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Stat cards */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {statCards.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.12 + i * 0.06 }}>
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

            {/* Open Orders */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
              <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
                <CardContent className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold">Current Open Orders</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary ring-1 ring-primary/20">
                        {openPositions.length} active
                      </span>
                      <Link to="/positions"
                        className="text-[11px] font-medium text-muted-foreground transition hover:text-primary">
                        Full view →
                      </Link>
                    </div>
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
            <Card className="relative overflow-hidden border-border/40 bg-gradient-to-br from-card/80 to-card/30 backdrop-blur-xl">
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
                {stats.profitFactor !== null && (
                  <div className="mt-3 flex items-center justify-between rounded-lg bg-background/40 px-3 py-2">
                    <span className="text-[11px] text-muted-foreground">Profit Factor</span>
                    <span className={`text-sm font-bold ${stats.profitFactor >= 1 ? "text-primary" : "text-destructive"}`}>
                      {stats.profitFactor === Infinity ? "∞" : fmt(stats.profitFactor)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Calendar */}
            <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">PnL Calendar</h3>
                </div>
                <MiniCalendar pnlMap={pnlMap} />
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
