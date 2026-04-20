import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { BinancePosition, BinancePastPosition } from "@/lib/api";

export const fmt = (v: number | string | undefined, d = 2) => {
  if (v === undefined || v === null || v === "") return "0.00";
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (Number.isNaN(n)) return "0.00";
  return n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
};

export const DATE_RANGES = ["7D", "30D", "90D", "All"] as const;
export type DateRange = (typeof DATE_RANGES)[number];

export function filterByRange(positions: BinancePastPosition[], range: DateRange) {
  if (range === "All") return positions;
  const days = range === "7D" ? 7 : range === "30D" ? 30 : 90;
  const cutoff = Date.now() - days * 86_400_000;
  return positions.filter((p) => p.closed_at && new Date(p.closed_at).getTime() >= cutoff);
}

export interface EquityPoint {
  date: string;
  value: number;
}

export function buildEquityPoints(positions: BinancePastPosition[], range: DateRange): EquityPoint[] {
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

export function computeStats(past: BinancePastPosition[], open: BinancePosition[]) {
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
  let peak = 0,
    cum = 0,
    maxDrawdown = 0;
  for (const p of pnls) {
    cum += p;
    peak = Math.max(peak, cum);
    maxDrawdown = Math.max(maxDrawdown, peak - cum);
  }
  return {
    realized,
    unrealized,
    winRate,
    profitFactor,
    maxDrawdown,
    totalTrades: past.length,
    wins: wins.length,
  };
}

export function TradingEquityAreaChart({
  points,
  positive = true,
  emptyTitle = "No trade history yet",
  emptySubtitle = "Connect an exchange to sync positions and build your equity curve.",
  emptyCtaHref = "/dashboard/add-broker?connect=1",
  emptyCtaLabel = "Connect a broker",
}: {
  points: EquityPoint[];
  positive?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
  emptyCtaHref?: string;
  emptyCtaLabel?: string;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 1100,
    H = 320;
  const AXIS_L = 40;
  const AXIS_R = 40;
  const PT = 20;
  const PB = 44;
  const chartW = W - AXIS_L - AXIS_R;
  const chartH = H - PT - PB;

  if (points.length < 2) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm text-muted-foreground">{emptyTitle}</p>
        <p className="max-w-sm text-xs text-muted-foreground/80">{emptySubtitle}</p>
        {emptyCtaHref && emptyCtaLabel ? (
          <Link
            to={emptyCtaHref}
            className="text-sm font-medium text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline"
          >
            {emptyCtaLabel}
          </Link>
        ) : null}
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
  const xIndices =
    xCount <= 1
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

  const tooltipW = 110,
    tooltipH = 46;
  const tipX = hovered
    ? Math.min(Math.max(hovered.x - tooltipW / 2, AXIS_L), W - AXIS_R - tooltipW)
    : 0;
  const tipY = hovered ? Math.max(PT, hovered.y - tooltipH - 14) : 0;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className="h-full w-full overflow-visible"
      onMouseLeave={() => setHoverIdx(null)}
    >
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
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {yLabels.map(({ val, y }, i) => {
        const label = `${val >= 0 ? "+" : ""}${fmt(val, 0)}`;
        return (
          <g key={i}>
            <line
              x1={AXIS_L}
              x2={W - AXIS_R}
              y1={y}
              y2={y}
              stroke="hsl(var(--border))"
              strokeOpacity={0.15}
              strokeDasharray="2 5"
            />
            <text x={4} y={y + 3} textAnchor="start" fontSize={9} fill="hsl(var(--muted-foreground))" opacity={0.8}>
              {label}
            </text>
            <text
              x={W - 4}
              y={y + 3}
              textAnchor="end"
              fontSize={9}
              fill="hsl(var(--muted-foreground))"
              opacity={0.8}
            >
              {label}
            </text>
          </g>
        );
      })}

      <line x1={AXIS_L} x2={W - AXIS_R} y1={H - PB} y2={H - PB} stroke="hsl(var(--border))" strokeOpacity={0.2} />

      {xIndices.map((idx, j, arr) => {
        const prevIdx = j > 0 ? arr[j - 1] : -1;
        if (prevIdx >= 0 && points[idx].date === points[prevIdx].date) return null;
        return (
          <text
            key={idx}
            x={pts[idx].x}
            y={H - PB + 16}
            textAnchor="middle"
            fontSize={9}
            fill="hsl(var(--muted-foreground))"
            opacity={0.7}
          >
            {points[idx].date}
          </text>
        );
      })}

      <motion.path
        d={areaPath}
        fill="url(#ec2areaFill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

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

      <g transform={`translate(${pts[pts.length - 1].x},${pts[pts.length - 1].y})`}>
        <motion.circle
          cx={0}
          cy={0}
          r={20}
          fill={color}
          fillOpacity={0.15}
          animate={{ scale: [1, 1.5, 1], opacity: [0.55, 0.12, 0.55] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx={0}
          cy={0}
          r={12}
          fill={color}
          fillOpacity={0.3}
          animate={{ scale: [1, 1.4, 1], opacity: [0.75, 0.3, 0.75] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx={0}
          cy={0}
          r={6}
          fill={color}
          filter="url(#ec2glow)"
          animate={{ scale: [1, 1.24, 1] }}
          transition={{ duration: 1.35, repeat: Infinity, ease: "easeInOut" }}
        />
      </g>

      {hovered && (
        <>
          <line
            x1={hovered.x}
            x2={hovered.x}
            y1={PT}
            y2={H - PB}
            stroke={color}
            strokeOpacity={0.45}
            strokeWidth={1}
            strokeDasharray="3 4"
          />
          <circle cx={hovered.x} cy={hovered.y} r={5} fill={color} stroke="hsl(var(--background))" strokeWidth={2.5} />
          <rect
            x={tipX}
            y={tipY}
            width={tooltipW}
            height={tooltipH}
            rx={7}
            fill="hsl(var(--card))"
            fillOpacity={0.96}
            stroke={color}
            strokeOpacity={0.35}
            strokeWidth={1}
          />
          <text x={tipX + 10} y={tipY + 16} fontSize={9} fill="hsl(var(--muted-foreground))">
            {hovered.date}
          </text>
          <text x={tipX + 10} y={tipY + 33} fontSize={12} fontWeight="700" fill={color}>
            {hovered.value >= 0 ? "+" : ""}${fmt(hovered.value)}
          </text>
        </>
      )}

      <rect
        x={AXIS_L}
        y={PT}
        width={chartW}
        height={chartH + PB - 4}
        fill="transparent"
        style={{ cursor: "crosshair" }}
        onMouseMove={handleMouseMove}
      />
    </svg>
  );
}

export function TradingPnlMiniCalendar({
  pnlMap,
  onMonthChange,
}: {
  pnlMap: Map<string, number>;
  onMonthChange?: (year: number, month: number) => void;
}) {
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

  const goMonth = (delta: number) => {
    const next = new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1);
    setCursor(next);
    onMonthChange?.(next.getFullYear(), next.getMonth() + 1);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold">{monthName}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPnl((p) => !p)}
            className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition ${
              showPnl
                ? "bg-primary/20 text-primary ring-1 ring-primary/30"
                : "bg-card/60 text-muted-foreground ring-1 ring-border/40 hover:text-foreground"
            }`}
          >
            {showPnl ? "Show Days" : "Show PnL"}
          </button>
          <button
            type="button"
            onClick={() => goMonth(-1)}
            className="rounded-md p-1 text-muted-foreground transition hover:bg-primary/10 hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => goMonth(1)}
            className="rounded-md p-1 text-muted-foreground transition hover:bg-primary/10 hover:text-foreground"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] text-muted-foreground">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="py-0.5 font-medium">
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const yy = cursor.getFullYear();
          const mm = String(cursor.getMonth() + 1).padStart(2, "0");
          const dd = String(d).padStart(2, "0");
          const key = `${yy}-${mm}-${dd}`;
          const pnl = pnlMap.get(key);
          const isToday =
            d === today.getDate() &&
            cursor.getMonth() === today.getMonth() &&
            cursor.getFullYear() === today.getFullYear();
          const hasPos = pnl !== undefined && pnl > 0;
          const hasNeg = pnl !== undefined && pnl < 0;
          const pnlShort =
            pnl !== undefined
              ? `${pnl >= 0 ? "+" : ""}${Math.abs(pnl) >= 1000 ? `${(pnl / 1000).toFixed(1)}k` : pnl.toFixed(0)}`
              : "";
          const hoverText = showPnl
            ? `Day ${d}`
            : pnl !== undefined
              ? `PnL: ${pnl >= 0 ? "+" : ""}$${fmt(pnl)}`
              : undefined;

          return (
            <div
              key={i}
              title={hoverText}
              className={`group relative flex h-7 cursor-default items-center justify-center rounded text-[10px] transition ${
                isToday
                  ? "bg-gradient-to-br from-primary to-accent font-bold text-primary-foreground shadow-md shadow-primary/25"
                  : ""
              } ${!isToday && hasPos ? "bg-primary/15 font-medium text-primary" : ""} ${
                !isToday && hasNeg ? "bg-destructive/15 font-medium text-destructive" : ""
              } ${!isToday && !hasPos && !hasNeg ? "text-foreground/50 hover:bg-primary/10" : ""} `}
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
}

export function OpenOrderCard({ p }: { p: BinancePosition }) {
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
        <div className="flex min-w-[120px] items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              isLong ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
            }`}
          >
            {isLong ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          </div>
          <div>
            <p className="text-sm font-bold">{p.symbol}</p>
            <span
              className={`text-[10px] font-semibold uppercase tracking-wide ${
                isLong ? "text-primary" : "text-destructive"
              }`}
            >
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

        <div className="flex shrink-0 items-center gap-4">
          {"leverage" in p && (p as BinancePosition & { leverage?: string }).leverage ? (
            <span className="rounded-md bg-card/60 px-2 py-1 text-[11px] font-semibold text-muted-foreground ring-1 ring-border/40">
              {(p as BinancePosition & { leverage?: string }).leverage}x
            </span>
          ) : null}
          <div className="text-right">
            <p className={`text-sm font-bold ${pnl >= 0 ? "text-primary" : "text-destructive"}`}>
              {pnl >= 0 ? "+" : ""}${fmt(pnl)}
            </p>
            <p className={`text-[11px] font-medium ${pnlPct >= 0 ? "text-primary" : "text-destructive"}`}>
              {pnlPct >= 0 ? "+" : ""}
              {fmt(pnlPct, 2)}%
            </p>
          </div>
        </div>
      </div>
      {p.update_time ? (
        <p className="mt-2 text-[10px] text-muted-foreground/60">
          Updated{" "}
          {new Date(p.update_time < 1e12 ? p.update_time * 1000 : p.update_time).toLocaleString()}
        </p>
      ) : null}
    </div>
  );
}
