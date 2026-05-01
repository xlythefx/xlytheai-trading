import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Plus,
  Trash2,
  Wallet,
  TestTube,
  Radio,
  Link2,
  TrendingUp,
  Pencil,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  getBrokerAccounts,
  getMexcAccounts,
  getBybitAccounts,
  deleteBrokerAccount,
  deleteMexcAccount,
  deleteBybitAccount,
  updateBrokerAccount,
  updateMexcAccount,
  updateBybitAccount,
  type BinanceAccountData,
} from "@/lib/api";
import { V2TopNav } from "@/components/V2TopNav";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Exchange = "binance" | "mexc" | "bybit";

interface AccountRow extends BinanceAccountData {
  exchange: Exchange;
}

const EXCHANGE_META: Record<Exchange, { logo: string; label: string; accent: string }> = {
  binance: {
    logo: "/assets/binance.jpeg",
    label: "Binance",
    accent: "from-yellow-400 to-yellow-600",
  },
  mexc: {
    logo: "/assets/mexc.png",
    label: "MEXC",
    accent: "from-sky-400 to-blue-600",
  },
  bybit: {
    logo: "/assets/bybit.png",
    label: "Bybit",
    accent: "from-amber-400 to-orange-500",
  },
};

const fmt = (v: number | string | undefined, d = 2) => {
  if (v === undefined || v === null || v === "") return "0.00";
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (Number.isNaN(n)) return "0.00";
  return n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
};

const Portfolio = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AccountRow | null>(null);

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [binRes, mexcRes, bybitRes] = await Promise.all([
        getBrokerAccounts(),
        getMexcAccounts(),
        getBybitAccounts(),
      ]);
      const rows: AccountRow[] = [
        ...binRes.data.map((a) => ({ ...a, exchange: "binance" as Exchange })),
        ...mexcRes.data.map((a) => ({ ...a, exchange: "mexc" as Exchange })),
        ...bybitRes.data.map((a) => ({ ...a, exchange: "bybit" as Exchange })),
      ];
      setAccounts(rows);
    } catch (err: any) {
      toast.error(err.message || "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (account: AccountRow) => {
    setConfirmDelete(null);
    setDeletingKey(account.api_key);
    try {
      if (account.exchange === "mexc") await deleteMexcAccount(account.api_key);
      else if (account.exchange === "bybit") await deleteBybitAccount(account.api_key);
      else await deleteBrokerAccount(account.api_key);
      setAccounts((prev) => prev.filter((a) => a.api_key !== account.api_key));
      toast.success("Account removed");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove account");
    } finally {
      setDeletingKey(null);
    }
  };

  const startEdit = (account: AccountRow) => {
    setEditingKey(account.api_key);
    setEditName(account.name);
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditName("");
  };

  const saveEdit = async (account: AccountRow) => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setSavingEdit(true);
    try {
      if (account.exchange === "mexc") await updateMexcAccount(account.api_key, { name: editName.trim() });
      else if (account.exchange === "bybit") await updateBybitAccount(account.api_key, { name: editName.trim() });
      else await updateBrokerAccount(account.api_key, { name: editName.trim() });
      setAccounts((prev) =>
        prev.map((a) =>
          a.api_key === account.api_key ? { ...a, name: editName.trim() } : a,
        ),
      );
      toast.success("Account renamed");
      setEditingKey(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to rename account");
    } finally {
      setSavingEdit(false);
    }
  };

  const totalBalance = accounts.reduce((s, a) => s + (parseFloat(a.balance) || 0), 0);
  const totalDeposit = accounts.reduce((s, a) => s + (parseFloat(a.initial_deposit || "0") || 0), 0);
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
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full bg-primary/12 blur-[160px]" />
        <div className="absolute -right-20 top-1/3 h-[600px] w-[600px] rounded-full bg-accent/10 blur-[180px]" />
        <div className="absolute bottom-[-15%] left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/8 blur-[140px]" />
      </div>

      <V2TopNav active="portfolio" brandTo="/dashboard-v2" onRefresh={load} loading={loading} />

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
              Manage your broker connections across Binance and MEXC. Bybit is coming soon.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-medium">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary ring-1 ring-primary/20">
                Binance available
              </span>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary ring-1 ring-primary/20">
                MEXC available
              </span>
              <span className="rounded-full bg-muted/70 px-2.5 py-1 text-muted-foreground ring-1 ring-border/40">
                Bybit coming soon
              </span>
            </div>
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
                <div
                  className={`absolute inset-x-0 top-0 h-px ${
                    s.positive
                      ? "bg-gradient-to-r from-transparent via-primary to-transparent"
                      : "bg-gradient-to-r from-transparent via-destructive to-transparent"
                  }`}
                />
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
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

        {/* Combined balance card */}
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
                <div className="flex flex-wrap items-center gap-3">
                  {(["binance", "mexc", "bybit"] as Exchange[]).map((ex) => {
                    const count = accounts.filter((a) => a.exchange === ex).length;
                    if (!count) return null;
                    const meta = EXCHANGE_META[ex];
                    return (
                      <span key={ex} className="flex items-center gap-1.5 rounded-full bg-card/60 px-3 py-1 text-[11px] font-semibold ring-1 ring-border/40">
                        <img src={meta.logo} alt={meta.label} className="h-4 w-4 rounded-sm object-contain" />
                        {count} {meta.label}
                      </span>
                    );
                  })}
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary ring-1 ring-primary/20">
                    {liveCount} live
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Accounts grid */}
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
                  Connect a Binance or MEXC account to start tracking your portfolio. Bybit is coming soon.
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
                const meta = EXCHANGE_META[account.exchange];
                const balance = parseFloat(account.balance) || 0;
                const deposit = parseFloat(account.initial_deposit || "0") || 0;
                const pnl = balance - deposit;
                const pct = deposit > 0 ? (pnl / deposit) * 100 : 0;
                const isDemo = account.demo === 1;
                const pos = pnl >= 0;
                const isEditing = editingKey === account.api_key;
                const isDeleting = deletingKey === account.api_key;

                return (
                  <motion.div
                    key={account.api_key}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.06 }}
                    layout
                  >
                    <Card className="group relative h-full overflow-hidden border-border/40 bg-card/50 backdrop-blur-xl transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
                      <div
                        className={`absolute inset-x-0 top-0 h-px ${
                          pos
                            ? "bg-gradient-to-r from-transparent via-primary to-transparent"
                            : "bg-gradient-to-r from-transparent via-destructive to-transparent"
                        }`}
                      />
                      <div
                        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl ${
                          pos ? "bg-primary/15" : "bg-destructive/15"
                        }`}
                      />
                      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />

                      <CardContent className="relative p-5">
                        {/* Header */}
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${meta.accent} p-1.5 shadow-lg`}>
                              <img src={meta.logo} alt={meta.label} className="h-full w-full object-contain" />
                              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
                            </div>
                            <div className="min-w-0">
                              <AnimatePresence mode="wait">
                                {isEditing ? (
                                  <motion.div
                                    key="editing"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2"
                                  >
                                    <Input
                                      value={editName}
                                      onChange={(e) => setEditName(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") saveEdit(account);
                                        if (e.key === "Escape") cancelEdit();
                                      }}
                                      className="h-7 border-primary/40 bg-background/50 py-0 text-sm font-bold"
                                      autoFocus
                                    />
                                    <button
                                      type="button"
                                      disabled={savingEdit}
                                      onClick={() => saveEdit(account)}
                                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary hover:bg-primary/30"
                                    >
                                      {savingEdit ? (
                                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary/40 border-t-primary" />
                                      ) : (
                                        <Check className="h-3.5 w-3.5" />
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={cancelEdit}
                                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </motion.div>
                                ) : (
                                  <motion.p
                                    key="display"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="truncate text-base font-bold leading-tight"
                                  >
                                    {account.name}
                                  </motion.p>
                                )}
                              </AnimatePresence>
                              <div className="mt-1 flex items-center gap-1.5">
                                <span className="text-[11px] text-muted-foreground">{meta.label}</span>
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

                          {/* Action buttons */}
                          {!isEditing && (
                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                onClick={() => startEdit(account)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/60 transition hover:bg-primary/10 hover:text-primary"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setConfirmDelete(account)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/60 transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                              >
                                {isDeleting ? (
                                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          )}
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
                            className={`mt-1 text-xs font-semibold ${pos ? "text-primary" : "text-destructive"}`}
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

      {/* Delete confirmation dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent className="max-w-sm border-border/50 bg-background/95 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Remove account?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will disconnect{" "}
            <span className="font-semibold text-foreground">{confirmDelete?.name}</span> (
            {confirmDelete ? EXCHANGE_META[confirmDelete.exchange].label : ""}). Positions and
            history already synced will be kept, but no new signals will be sent to this account.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              onClick={() => setConfirmDelete(null)}
              className="rounded-xl border border-border/40 bg-secondary/40 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
              className="rounded-xl bg-destructive/20 border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/30 transition-colors"
            >
              Remove
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Portfolio;
