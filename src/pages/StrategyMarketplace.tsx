import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  Search,
  TrendingUp,
  Users,
  Target,
  Shield,
  Flame,
  Activity,
  Star,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AnimatedBackground from "@/components/AnimatedBackground";
import { PublicNav } from "@/components/PublicNav";
import { getPublicStrategies, type StrategyListing } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const fmt = (n: number, d = 2) =>
  n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });

type RiskFilter = "all" | "low" | "medium" | "high";

function riskBadge(risk: string) {
  switch (risk) {
    case "low":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400 ring-1 ring-emerald-500/30">
          <Shield className="h-3 w-3" /> Low risk
        </span>
      );
    case "medium":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-[11px] font-medium text-blue-400 ring-1 ring-blue-500/30">
          <Activity className="h-3 w-3" /> Medium risk
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-2 py-0.5 text-[11px] font-medium text-orange-400 ring-1 ring-orange-500/30">
          <Flame className="h-3 w-3" /> High risk
        </span>
      );
  }
}

function StrategyCard({ strategy, index }: { strategy: StrategyListing; index: number }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" custom={index}>
      <Card
        className={`group relative flex h-full flex-col overflow-hidden border-border/50 bg-gradient-to-br ${strategy.color} backdrop-blur-sm ring-1 ring-border/50 transition hover:ring-primary/40`}
      >
        <CardContent className="flex flex-1 flex-col gap-4 p-6">
          {/* header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">{riskBadge(strategy.risk)}</div>
              <h3 className="truncate text-lg font-bold text-foreground">{strategy.name}</h3>
              <p className="text-xs text-muted-foreground">by {strategy.author}</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">per month</div>
              <div className="text-xl font-bold text-foreground">${fmt(strategy.price)}</div>
            </div>
          </div>

          {/* description */}
          <p className="line-clamp-3 text-sm text-muted-foreground">{strategy.description}</p>

          {/* tags */}
          <div className="flex flex-wrap gap-1.5">
            {strategy.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-full bg-background/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-border/60"
              >
                #{t}
              </span>
            ))}
          </div>

          {/* stats grid */}
          <div className="grid grid-cols-3 gap-2 rounded-lg bg-background/60 p-3 text-center ring-1 ring-border/40">
            <div>
              <div className="flex items-center justify-center gap-1 text-[10px] uppercase text-muted-foreground">
                <Target className="h-3 w-3" /> Win
              </div>
              <div className="mt-0.5 font-mono text-sm font-bold text-foreground">
                {fmt(strategy.win_rate, 1)}%
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-[10px] uppercase text-muted-foreground">
                <TrendingUp className="h-3 w-3" /> ROI
              </div>
              <div
                className={`mt-0.5 font-mono text-sm font-bold ${
                  strategy.roi >= 0 ? "text-primary" : "text-destructive"
                }`}
              >
                {strategy.roi >= 0 ? "+" : ""}
                {fmt(strategy.roi, 1)}%
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-[10px] uppercase text-muted-foreground">
                <Users className="h-3 w-3" /> Subs
              </div>
              <div className="mt-0.5 font-mono text-sm font-bold text-foreground">
                {strategy.subscribers.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <div className="text-xs text-muted-foreground">
              {strategy.total_trades.toLocaleString()} trades
            </div>
            <Button size="sm" className="gap-1">
              <Star className="h-3.5 w-3.5" /> Subscribe
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function StrategyMarketplace() {
  const [strategies, setStrategies] = useState<StrategyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState<RiskFilter>("all");

  useEffect(() => {
    (async () => {
      try {
        const res = await getPublicStrategies();
        setStrategies(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return strategies.filter((s) => {
      if (risk !== "all" && s.risk !== risk) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.author.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [strategies, query, risk]);

  const aggregateSubs = useMemo(
    () => strategies.reduce((a, s) => a + s.subscribers, 0),
    [strategies],
  );
  const avgWin = useMemo(() => {
    if (!strategies.length) return 0;
    return strategies.reduce((a, s) => a + s.win_rate, 0) / strategies.length;
  }, [strategies]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <AnimatedBackground />
      <div className="relative z-10">
        <PublicNav />

        <main className="mx-auto max-w-[1600px] px-6 pt-24 pb-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col gap-2"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Marketplace
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Strategy Marketplace
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Browse vetted algorithmic strategies built by top traders. Subscribe and mirror
              their signals directly to your connected broker account.
            </p>
          </motion.div>

          {/* Top stats */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="text-xs uppercase text-muted-foreground">Strategies</div>
                <div className="mt-1 text-2xl font-bold text-foreground">{strategies.length}</div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="text-xs uppercase text-muted-foreground">Total Subscribers</div>
                <div className="mt-1 text-2xl font-bold text-foreground">
                  {aggregateSubs.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="text-xs uppercase text-muted-foreground">Avg Win Rate</div>
                <div className="mt-1 text-2xl font-bold text-foreground">
                  {fmt(avgWin, 1)}%
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="text-xs uppercase text-muted-foreground">Top Performer</div>
                <div className="mt-1 truncate text-2xl font-bold text-primary">
                  {strategies.length
                    ? [...strategies].sort((a, b) => b.roi - a.roi)[0].name
                    : "—"}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filter bar */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, author or tag..."
                className="pl-9"
              />
            </div>
            <div className="flex gap-1 rounded-full bg-background/60 p-1 ring-1 ring-border/60">
              {(["all", "low", "medium", "high"] as RiskFilter[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRisk(r)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
                    risk === r
                      ? "bg-primary/20 text-foreground ring-1 ring-primary/40"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r === "all" ? "All risks" : r}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-12 text-center text-sm text-muted-foreground">
                No strategies match your filters.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((s, i) => (
                <StrategyCard key={s.id} strategy={s} index={i} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
