import { useState, useMemo, useId } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addDays, subDays, format } from "date-fns";

const VIOLET = "hsl(270 70% 60%)";
const VIOLET_FILL = "hsl(270 70% 60% / 0.25)";

const MOCK_STRATEGIES = [
  { id: "momentum", name: "Momentum Scalper", baseEquity: 1000, change: 0.89 },
  { id: "meanrev", name: "Mean Reversion", baseEquity: 1000, change: 0.34 },
  { id: "breakout", name: "Breakout Hunter", baseEquity: 1000, change: 1.12 },
  { id: "grid", name: "Grid Strategy", baseEquity: 1000, change: -0.21 },
] as const;

const DATE_RANGES = [
  { id: "1W", label: "1W", days: 7 },
  { id: "1M", label: "1M", days: 30 },
  { id: "3M", label: "3M", days: 90 },
  { id: "6M", label: "6M", days: 180 },
  { id: "1Y", label: "1Y", days: 365 },
] as const;

type DataPoint = { date: string; dateLabel: string; equity: number };

function generateMockEquityData(
  startDate: Date,
  endDate: Date,
  baseEquity: number
): DataPoint[] {
  const data: DataPoint[] = [];
  const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  const targetEquity = baseEquity * 0.8; // End at 80% equity

  for (let i = 0; i <= dayCount; i++) {
    const d = addDays(startDate, i);
    if (d > endDate) break;
    const progress = i / Math.max(1, dayCount); // 0 to 1
    const wave = 0.12 * Math.sin(i * 0.4) * Math.sin(i * 0.7) * (1 - progress * 0.5);
    const curve = Math.min(1, Math.max(0, progress + wave));
    const equity = curve * targetEquity;
    data.push({
      date: format(d, "yyyy-MM-dd"),
      dateLabel: format(d, "MMM d"),
      equity: Number(equity.toFixed(2)),
    });
  }
  return data;
}

export default function BotPerformanceChart() {
  const gradientId = useId().replace(/:/g, "");
  const today = new Date();
  const defaultRange = DATE_RANGES.find((r) => r.id === "1M")!;
  const [strategy, setStrategy] = useState<string>(MOCK_STRATEGIES[0].id);
  const [dateRangeId, setDateRangeId] = useState<string>(defaultRange.id);

  const selectedStrategy = MOCK_STRATEGIES.find((s) => s.id === strategy) ?? MOCK_STRATEGIES[0];
  const selectedRange = DATE_RANGES.find((r) => r.id === dateRangeId) ?? defaultRange;

  const { startDate, endDate } = useMemo(() => {
    const end = today;
    const start = subDays(end, selectedRange.days);
    return { startDate: start, endDate: end };
  }, [dateRangeId, selectedRange.days]);

  const chartData = useMemo(
    () =>
      generateMockEquityData(startDate, endDate, selectedStrategy.baseEquity),
    [startDate, endDate, strategy, selectedStrategy.baseEquity]
  );

  const latestEquity = chartData.length > 0 ? chartData[chartData.length - 1].equity : selectedStrategy.baseEquity;

  return (
    <div className="relative bg-secondary/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-2xl overflow-hidden">
      {/* Chart Header - TradingView style */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
            <span className="text-destructive font-bold text-sm">AI</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Nap.AI bot performance</h3>
            <p className="text-2xl font-bold mt-1 tabular-nums">
              {latestEquity.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              <span className="text-muted-foreground font-normal text-base">USD</span>
            </p>
            <p
              className={`text-sm font-medium ${
                selectedStrategy.change >= 0 ? "text-emerald-500" : "text-destructive"
              }`}
            >
              {selectedStrategy.change >= 0 ? "+" : ""}
              {selectedStrategy.change}%
            </p>
          </div>
        </div>

        <Select value={strategy} onValueChange={setStrategy}>
          <SelectTrigger className="w-[180px] h-8 text-xs bg-muted/50 border-border shrink-0 ml-auto">
            <SelectValue placeholder="Select strategy" />
          </SelectTrigger>
          <SelectContent>
            {MOCK_STRATEGIES.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date range filter */}
      <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1 mb-4">
          {DATE_RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setDateRangeId(r.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                dateRangeId === r.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

      {/* Area Chart - X = date, Y = equity */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={VIOLET} stopOpacity={0.4} />
                <stop offset="100%" stopColor={VIOLET} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis
              dataKey="dateLabel"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickFormatter={(v) => v.toLocaleString()}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(var(--muted-foreground))" }}
              labelFormatter={(label) => `Date: ${label}`}
              formatter={(value: number) => [
                value.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) + " USD",
                "Equity",
              ]}
            />
            <Area
              type="monotone"
              dataKey="equity"
              stroke={VIOLET}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Glow overlay */}
      <div
        className="absolute -top-4 -right-4 w-8 h-8 rounded-full blur-sm pointer-events-none"
        style={{ backgroundColor: VIOLET_FILL }}
      />
    </div>
  );
}
