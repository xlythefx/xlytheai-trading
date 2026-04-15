import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Plus,
  Trash2,
  Shield,
  Wallet,
  TestTube,
  Radio,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  getBrokerAccounts,
  deleteBrokerAccount,
  type BinanceAccountData,
} from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const BROKER_LOGO: Record<string, { label: string; color: string }> = {
  binance: { label: "BNB", color: "bg-yellow-500" },
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

  return (
    <div className="flex min-h-min flex-col">
      <motion.nav
        className="border-b border-border/50 bg-background/80 backdrop-blur-md"
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0}
      >
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Portfolio</h1>
            <p className="text-muted-foreground">Manage your broker connections and balances</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => navigate("/dashboard/add-broker")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Broker
            </Button>
          </div>
        </div>
      </motion.nav>

      <main className="p-6 space-y-6">
        {/* Summary */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
          <Card className="border-border/50 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">Total Balance (Binance)</p>
                  <p className="text-4xl font-bold">
                    ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Connected Accounts</p>
                  <p className="text-2xl font-bold">{accounts.filter(a => a.enabled).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Accounts grid */}
        {loading ? (
          <div className="py-16 text-center text-muted-foreground">Loading accounts…</div>
        ) : accounts.length === 0 ? (
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="py-16 text-center">
                <Wallet className="mx-auto mb-4 h-14 w-14 text-muted-foreground/40" />
                <p className="text-lg font-medium mb-2">No broker accounts yet</p>
                <p className="text-sm text-muted-foreground mb-6">Connect a Binance account to start tracking your portfolio.</p>
                <Button onClick={() => navigate("/dashboard/add-broker")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Broker
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {accounts.map((account, index) => {
              const balance = parseFloat(account.balance) || 0;
              const isDemo = account.demo === 1;
              return (
                <motion.div
                  key={account.api_key}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  custom={2 + index}
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500 font-bold text-sm text-white shadow-sm">
                            BNB
                          </div>
                          <div>
                            <CardTitle className="text-base">{account.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="h-2 w-2 rounded-full bg-green-500" />
                              <span className="text-xs text-muted-foreground">Binance</span>
                              {isDemo ? (
                                <Badge variant="outline" className="h-5 text-xs border-yellow-500/50 text-yellow-500 gap-1">
                                  <TestTube className="w-3 h-3" /> Demo
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="h-5 text-xs border-primary/50 text-primary gap-1">
                                  <Radio className="w-3 h-3" /> Live
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                          disabled={deleting === account.api_key}
                          onClick={() => handleDelete(account.api_key)}
                        >
                          {deleting === account.api_key ? (
                            <div className="w-3.5 h-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Balance</span>
                        <span className="text-2xl font-bold">
                          ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {account.currency_type}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Initial Deposit</span>
                        <span className="text-sm font-medium">
                          ${parseFloat(account.initial_deposit || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">API Key</span>
                        <code className="text-xs font-mono text-muted-foreground">
                          {account.api_key.slice(0, 8)}…{account.api_key.slice(-4)}
                        </code>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {/* Add more card */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2 + accounts.length}>
              <Card
                className="border-border/50 border-dashed bg-card/20 backdrop-blur-sm h-full min-h-[180px] flex items-center justify-center cursor-pointer hover:bg-card/40 transition-colors"
                onClick={() => navigate("/dashboard/add-broker")}
              >
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Add Broker</p>
                  <p className="text-xs text-muted-foreground mt-1">Connect another account</p>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Portfolio;
