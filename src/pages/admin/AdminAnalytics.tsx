import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Flame,
  Snowflake,
  Trophy,
  PieChart as PieIcon,
  Sparkles,
} from "lucide-react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const equityCurve = [
  { day: "Apr 1", equity: 100000 },
  { day: "Apr 3", equity: 101200 },
  { day: "Apr 5", equity: 99800 },
  { day: "Apr 7", equity: 103500 },
  { day: "Apr 9", equity: 104800 },
  { day: "Apr 11", equity: 107200 },
  { day: "Apr 13", equity: 106100 },
  { day: "Apr 15", equity: 109400 },
  { day: "Apr 17", equity: 112800 },
  { day: "Apr 19", equity: 115100 },
  { day: "Apr 21", equity: 113400 },
  { day: "Apr 23", equity: 118200 },
  { day: "Apr 25", equity: 121500 },
  { day: "Apr 27", equity: 124300 },
  { day: "Apr 29", equity: 128100 },
  { day: "May 1", equity: 132400 },
];

const assetDistribution = [
  { name: "BTC",  value: 38, color: "#f7931a" },
  { name: "ETH",  value: 24, color: "#627eea" },
  { name: "SOL",  value: 14, color: "#14f195" },
  { name: "BNB",  value: 9,  color: "#f3ba2f" },
  { name: "XRP",  value: 7,  color: "#0093e9" },
  { name: "Other", value: 8, color: "#8884d8" },
];

const timeRangeStats = [
  { range: "00-02 UTC", wins: 42, losses: 18 },
  { range: "02-04 UTC", wins: 31, losses: 22 },
  { range: "04-06 UTC", wins: 28, losses: 35 },
  { range: "06-08 UTC", wins: 24, losses: 41 },
  { range: "08-10 UTC", wins: 55, losses: 27 },
  { range: "10-12 UTC", wins: 67, losses: 24 },
  { range: "12-14 UTC", wins: 72, losses: 31 },
  { range: "14-16 UTC", wins: 85, losses: 29 },
  { range: "16-18 UTC", wins: 78, losses: 34 },
  { range: "18-20 UTC", wins: 49, losses: 38 },
  { range: "20-22 UTC", wins: 38, losses: 42 },
  { range: "22-24 UTC", wins: 33, losses: 47 },
];

const topWinnersByTime = [...timeRangeStats]
  .sort((a, b) => b.wins - a.wins)
  .slice(0, 10);

const topLosersByTime = [...timeRangeStats]
  .sort((a, b) => b.losses - a.losses)
  .slice(0, 10);

const topAssets = [
  { ticker: "BTC/USDT", trades: 412, pnl: 18420 },
  { ticker: "ETH/USDT", trades: 308, pnl: 11280 },
  { ticker: "SOL/USDT", trades: 221, pnl: 7940 },
  { ticker: "BNB/USDT", trades: 152, pnl: 4120 },
  { ticker: "XRP/USDT", trades: 124, pnl: 2860 },
];

const topStrategies = [
  { name: "Momentum Scalper v2", trades: 284, pnl: 14850, winRate: 72.4 },
  { name: "Trend Rider Pro",      trades: 198, pnl: 11240, winRate: 68.1 },
  { name: "Mean Reversion Alpha", trades: 156, pnl: 8320,  winRate: 64.8 },
  { name: "Breakout Hunter",      trades: 132, pnl: 6410,  winRate: 61.2 },
  { name: "Smart Grid Bot",       trades: 101, pnl: 3780,  winRate: 58.7 },
];

const AdminAnalytics = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="border-b border-border/50 backdrop-blur-md bg-background/80 px-6 py-4">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-primary" />
          Admin Analytics
        </h1>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Target className="w-4 h-4" />}
              label="Sharpe Ratio"
              value="2.85"
              trend="+0.32"
              trendPositive
            />
            <StatCard
              icon={<Flame className="w-4 h-4" />}
              label="Largest Win Streak"
              value="14"
              trend="trades"
              accent="text-green-400"
            />
            <StatCard
              icon={<Snowflake className="w-4 h-4" />}
              label="Largest Loss Streak"
              value="6"
              trend="trades"
              accent="text-red-400"
            />
            <StatCard
              icon={<TrendingUp className="w-4 h-4" />}
              label="Total P&L"
              value="$48,200"
              trend="+142.3% ROI"
              trendPositive
            />
          </div>

          {/* Equity curve */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Equity Curve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={equityCurve}>
                    <defs>
                      <linearGradient id="equityGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [`$${v.toLocaleString()}`, "Equity"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="equity"
                      stroke="url(#equityGradient)"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Averages row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Average Win
                </div>
                <div className="text-3xl font-bold text-green-400">+$1,845</div>
                <div className="text-xs text-muted-foreground mt-2">
                  across 1,268 winning trades
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Average Loss
                </div>
                <div className="text-3xl font-bold text-red-400">-$842</div>
                <div className="text-xs text-muted-foreground mt-2">
                  across 579 losing trades
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Risk / Reward
                </div>
                <div className="text-3xl font-bold text-primary">1 : 2.4</div>
                <div className="text-xs text-muted-foreground mt-2">
                  avg win ≈ 2.4× avg loss
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Distribution + Time range winners */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieIcon className="w-5 h-5 text-primary" />
                  Asset Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={95}
                        paddingAngle={3}
                      >
                        {assetDistribution.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        formatter={(v: number, name) => [`${v}%`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {assetDistribution.map((a) => (
                    <div key={a.name} className="flex items-center gap-2 text-xs">
                      <span
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ background: a.color }}
                      />
                      <span className="text-muted-foreground">{a.name}</span>
                      <span className="text-foreground font-medium ml-auto">
                        {a.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Wins by UTC Time Range
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeRangeStats}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="range"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={10}
                        interval={1}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="wins" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="losses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top 10 winners / losers time ranges */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Top 10 Winning Time Ranges (UTC)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {topWinnersByTime.map((r, i) => (
                  <RankRow
                    key={r.range}
                    rank={i + 1}
                    label={r.range}
                    value={`${r.wins} wins`}
                    sub={`${r.losses} losses`}
                    accent="text-green-400"
                  />
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  Top 10 Losing Time Ranges (UTC)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {topLosersByTime.map((r, i) => (
                  <RankRow
                    key={r.range}
                    rank={i + 1}
                    label={r.range}
                    value={`${r.losses} losses`}
                    sub={`${r.wins} wins`}
                    accent="text-red-400"
                  />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Top assets / top strategies */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Top Assets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {topAssets.map((a, i) => (
                  <div
                    key={a.ticker}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div>
                        <div className="font-mono text-sm font-semibold">
                          {a.ticker}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {a.trades} trades
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-400">
                        +${a.pnl.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  Top Strategies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {topStrategies.map((s, i) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-accent/10 text-accent text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div>
                        <div className="text-sm font-semibold">{s.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {s.trades} trades • {s.winRate}% win rate
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-400">
                        +${s.pnl.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  trend,
  trendPositive,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  trendPositive?: boolean;
  accent?: string;
}) => (
  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
    <CardContent className="pt-6">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <div className={`text-3xl font-bold ${accent ?? "text-foreground"}`}>
        {value}
      </div>
      {trend && (
        <div
          className={`text-xs mt-2 ${
            trendPositive ? "text-green-400" : "text-muted-foreground"
          }`}
        >
          {trend}
        </div>
      )}
    </CardContent>
  </Card>
);

const RankRow = ({
  rank,
  label,
  value,
  sub,
  accent,
}: {
  rank: number;
  label: string;
  value: string;
  sub: string;
  accent: string;
}) => (
  <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background/50">
    <div className="flex items-center gap-3">
      <span className="w-6 h-6 rounded-md bg-muted text-foreground text-xs font-bold flex items-center justify-center">
        {rank}
      </span>
      <div className="font-mono text-sm">{label}</div>
    </div>
    <div className="text-right">
      <div className={`text-sm font-bold ${accent}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  </div>
);

export default AdminAnalytics;
