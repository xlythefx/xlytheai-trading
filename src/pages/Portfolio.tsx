import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  RefreshCw,
  Plus,
  Trash2,
  Wallet,
  TestTube,
  Radio,
  Link2,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  getBrokerAccounts,
  deleteBrokerAccount,
  type BinanceAccountData,
} from "@/lib/api";
import { V2TopNav } from "@/components/V2TopNav";

const fmt = (v: number | string | undefined, d = 2) => {
  if (v === undefined || v === null || v === "") return "0.00";
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (Number.isNaN(n)) return "0.00";
  return n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
};

const Portfolio = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<BinanceAccountData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getBrokerAccounts();
      setAccounts(res.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (apiKey: string) => {
    setDeleting(apiKey);
    try {
      await deleteBrokerAccount(apiKey);
      setAccounts((prev) => prev.filter((a) => a.api_key !== apiKey));
      toast.success("Account removed");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove account");
    } finally {
      setDeleting(null);
    }
  };

  const totalBalance = accounts.reduce(
    (sum, a) => sum + (parseFloat(a.balance) || 0),
    0,
  );
  const totalDeposit = accounts.reduce(
    (sum, a) => sum + (parseFloat(a.initial_deposit || "0") || 0),
    0,
  );
  const totalPnl = totalBalance - totalDeposit;
  const pnlPct = totalDeposit > 0 ? (totalPnl / totalDeposit) * 100 : 0;
  const activeCount = accounts.filter((a) => a.enabled).length;
  const liveCount = accounts.filter((a) => a.demo !== 1).length;

  const summaryCards = [
    {
      label: "Total Balance",
      value: `$${fmt(totalBalance)}`,
      hint: `${accounts.length} ${accounts.length === 1 ? "account" : "accounts"}`,
      positive: true,
    },
    {
      label: "Total P/L",
      value: `${totalPnl >= 0 ? "+" : ""}$${fmt(Math.abs(totalPnl))}`,
      hint: `${pnlPct >= 0 ? "+" : ""}${fmt(pnlPct, 2)}% all-time`,
      positive: totalPnl >= 0,
    },
    {
      label: "Active",
      value: `${activeCount}`,
      hint: `${accounts.length - activeCount} paused`,
      positive: activeCount > 0,
    },
    {
      label: "Live Accounts",
      value: `${liveCount}`,
      hint: `${accounts.length - liveCount} demo`,
      positive: liveCount > 0,
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full bg-primary/12 blur-[160px]" />
        <div className="absolute -right-20 top-1/3 h-[600px] w-[600px] rounded-full bg-accent/10 blur-[180px]" />
        <div className="absolute bottom-[-15%] left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/8 blur-[140px]" />
      </div>

      <V2TopNav active="portfolio" brandTo="/dashboard" onRefresh={load} loading={loading} />

      <main className="relative z-10 mx-auto max-w-[1600px] px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
              <Link2 className="h-3.5 w-3.5" /> Broker Connections
            </p>
            <h1 className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
              Portfolio
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your broker connections and track balances
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={load}
              disabled={loading}
              className="border-border/40 bg-card/40 backdrop-blur-xl hover:bg-card/60"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/dashboard/add-broker")}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_0_24px_hsl(210_100%_50%/0.25)] hover:opacity-90 hover:shadow-[0_0_32px_hsl(210_100%_50%/0.4)]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Broker
            </Button>
          </div>
        </motion.div>

        {/* Summary stat cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          {summaryCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12 + i * 0.06 }}
            >
              <Card className="group relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10">
                {/* Top glow border */}
                <div
                  className={`absolute inset-x-0 top-0 h-px ${
                    s.positive
                      ? "bg-gradient-to-r from-transparent via-primary to-transparent"
                      : "bg-gradient-to-r from-transparent via-destructive to-transparent"
                  }`}
                />
                {/* Hover shine */}
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
                {/* Corner glow */}
                <div
                  className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl ${
                    s.positive ? "bg-primary/20" : "bg-destructive/20"
                  }`}
                />
                <CardContent className="relative p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                    {s.label}
                  </p>
                  <p
                    className={`mt-2.5 text-2xl font-bold tracking-tight ${
                      s.positive ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {s.value}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground/60">{s.hint}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Featured total balance card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="mb-6"
        >
          <Card className="overflow-hidden border-border/40 bg-gradient-to-br from-card/80 via-card/40 to-card/20 backdrop-blur-xl">
            <CardContent className="relative p-6">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

              <div className="relative flex flex-wrap items-center justify-between gap-6">
                <div>
                  <p className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Wallet className="h-4 w-4" /> Combined Wallet Value
                  </p>
                  <motion.p
                    key={totalBalance}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-5xl font-bold tracking-tight text-transparent"
                  >
                    ${fmt(totalBalance)}
                  </motion.p>
                  <p
                    className={`mt-2 flex items-center gap-1 text-sm font-medium ${
                      totalPnl >= 0 ? "text-primary" : "text-destructive"
                    }`}
                  >
                    <TrendingUp className="h-4 w-4" />
                    {totalPnl >= 0 ? "+" : ""}${fmt(Math.abs(totalPnl))} ({pnlPct >= 0 ? "+" : ""}
                    {fmt(pnlPct, 2)}%) since inception
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary ring-1 ring-primary/20">
                    {activeCount} active
                  </span>
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold text-accent ring-1 ring-accent/20">
                    {liveCount} live
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Accounts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">Connected Accounts</h2>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary ring-1 ring-primary/20">
              {accounts.length} total
            </span>
          </div>

          {loading ? (
            <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
              <CardContent className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                <div className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                Loading accounts…
              </CardContent>
            </Card>
          ) : accounts.length === 0 ? (
            <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
              <CardContent className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                  <Wallet className="h-8 w-8 text-primary" />
                </div>
                <p className="mb-2 text-lg font-semibold">No broker accounts yet</p>
                <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
                  Connect a Binance account to start tracking your portfolio in real time.
                </p>
                <Button
                  onClick={() => navigate("/dashboard/add-broker")}
                  className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_0_24px_hsl(210_100%_50%/0.25)] hover:opacity-90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Broker
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {accounts.map((account, index) => {
                const balance = parseFloat(account.balance) || 0;
                const deposit = parseFloat(account.initial_deposit || "0") || 0;
                const pnl = balance - deposit;
                const pct = deposit > 0 ? (pnl / deposit) * 100 : 0;
                const isDemo = account.demo === 1;
                const pos = pnl >= 0;
                return (
                  <motion.div
                    key={account.api_key}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.06 }}
                  >
                    <Card className="group relative h-full overflow-hidden border-border/40 bg-card/50 backdrop-blur-xl transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
                      {/* Top glow */}
                      <div
                        className={`absolute inset-x-0 top-0 h-px ${
                          pos
                            ? "bg-gradient-to-r from-transparent via-primary to-transparent"
                            : "bg-gradient-to-r from-transparent via-destructive to-transparent"
                        }`}
                      />
                      {/* Corner glow */}
                      <div
                        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl ${
                          pos ? "bg-primary/15" : "bg-destructive/15"
                        }`}
                      />
                      {/* Hover shine */}
                      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />

                      <CardContent className="relative p-5">
                        {/* Header */}
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 p-1.5 shadow-lg shadow-yellow-500/20">
                              <img
                                src="/assets/binance.jpeg"
                                alt="Binance"
                                className="h-full w-full object-contain"
                              />
                              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
                            </div>
                            <div>
                              <p className="text-base font-bold leading-tight">{account.name}</p>
                              <div className="mt-1 flex items-center gap-1.5">
                                <span className="text-[11px] text-muted-foreground">Binance</span>
                                <span className="text-muted-foreground/40">·</span>
                                {isDemo ? (
                                  <span className="flex items-center gap-1 rounded-md bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-500 ring-1 ring-yellow-500/30">
                                    <TestTube className="h-2.5 w-2.5" /> Demo
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary ring-1 ring-primary/30">
                                    <Radio className="h-2.5 w-2.5" /> Live
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={deleting === account.api_key}
                            onClick={() => handleDelete(account.api_key)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/60 transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                          >
                            {deleting === account.api_key ? (
                              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Balance */}
                        <div className="mb-4 rounded-xl border border-border/30 bg-background/40 p-4">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                            Balance
                          </p>
                          <p className="mt-1 text-3xl font-bold tracking-tight">
                            ${fmt(balance)}
                            <span className="ml-1 text-sm font-medium text-muted-foreground">
                              {account.currency_type}
                            </span>
                          </p>
                          <p
                            className={`mt-1 text-xs font-semibold ${
                              pos ? "text-primary" : "text-destructive"
                            }`}
                          >
                            {pos ? "+" : ""}${fmt(Math.abs(pnl))}{" "}
                            <span className="text-muted-foreground/60">
                              ({pos ? "+" : ""}
                              {fmt(pct, 2)}%)
                            </span>
                          </p>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="rounded-lg bg-background/40 px-3 py-2">
                            <p className="text-[10px] text-muted-foreground">Initial Deposit</p>
                            <p className="mt-0.5 font-semibold">${fmt(deposit)}</p>
                          </div>
                          <div className="rounded-lg bg-background/40 px-3 py-2">
                            <p className="text-[10px] text-muted-foreground">API Key</p>
                            <p className="mt-0.5 font-mono text-[11px] font-semibold">
                              {account.api_key.slice(0, 6)}…{account.api_key.slice(-4)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}

              {/* Add more card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + accounts.length * 0.06 }}
              >
                <Card
                  className="group relative flex h-full min-h-[240px] cursor-pointer items-center justify-center overflow-hidden border border-dashed border-border/40 bg-card/20 backdrop-blur-xl transition-all duration-300 hover:border-primary/40 hover:bg-card/40"
                  onClick={() => navigate("/dashboard/add-broker")}
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 transition-all duration-300 group-hover:from-primary/5 group-hover:to-accent/5" />
                  <div className="relative text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20 transition-transform duration-300 group-hover:scale-110">
                      <Plus className="h-7 w-7 text-primary" />
                    </div>
                    <p className="text-sm font-semibold">Add Broker</p>
                    <p className="mt-1 text-xs text-muted-foreground">Connect another account</p>
                  </div>
                </Card>
              </motion.div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Portfolio;
