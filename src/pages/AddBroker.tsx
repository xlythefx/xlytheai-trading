import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Key,
  Lock,
  Radio,
  Sparkles,
  Tag,
  TestTube,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { V2TopNav } from "@/components/V2TopNav";
import { addBrokerAccount, addMexcAccount, addBybitAccount } from "@/lib/api";

const BROKERS = [
  {
    id: "binance",
    name: "Binance",
    description: "World's largest crypto exchange",
    logoSrc: "/assets/binance.jpeg",
    accent: "from-yellow-400 to-amber-500",
    available: true,
  },
  {
    id: "bybit",
    name: "Bybit",
    description: "Leading derivatives exchange",
    logoSrc: "/assets/bybit.png",
    accent: "from-amber-500 to-orange-500",
    available: false,
  },
  {
    id: "mexc",
    name: "MEXC",
    description: "Global spot & futures exchange",
    logoSrc: "/assets/mexc.png",
    accent: "from-sky-400 to-blue-500",
    available: true,
  },
] as const;

const AddBroker = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accountSectionRef = useRef<HTMLDivElement>(null);
  const [selectedBroker, setSelectedBroker] = useState("binance");
  const [showSecret, setShowSecret] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ api_key: "", secret_key: "", name: "" });

  useEffect(() => {
    if (searchParams.get("connect") !== "1") return;
    const t = window.setTimeout(() => {
      accountSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      const el = document.getElementById("name");
      el?.focus();
    }, 150);
    return () => window.clearTimeout(t);
  }, [searchParams]);

  const update = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.api_key.trim() || !form.secret_key.trim() || !form.name.trim()) {
      toast.error("All fields are required");
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        api_key: form.api_key.trim(),
        secret_key: form.secret_key.trim(),
        name: form.name.trim(),
        demo: isDemo,
      };
      if (selectedBroker === "mexc") {
        await addMexcAccount(payload);
      } else if (selectedBroker === "bybit") {
        await addBybitAccount(payload);
      } else {
        await addBrokerAccount(payload);
      }
      toast.success(`${selected.name} account added!`);
      navigate("/dashboard/portfolio");
    } catch (err: any) {
      toast.error(err.message || "Failed to add account");
    } finally {
      setIsLoading(false);
    }
  };

  const selected = BROKERS.find((b) => b.id === selectedBroker) ?? BROKERS[0];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Animated ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full bg-primary/12 blur-[160px]"
          animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-20 top-1/3 h-[600px] w-[600px] rounded-full bg-accent/10 blur-[180px]"
          animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-15%] left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/8 blur-[140px]"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <V2TopNav active="portfolio" brandTo="/dashboard-v2" />

      <main className="relative z-10 mx-auto max-w-[1200px] px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-wrap items-end justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard/portfolio")}
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-border/40 bg-card/40 backdrop-blur-xl transition hover:border-primary/40 hover:bg-card/60"
            >
              <ArrowLeft className="h-4 w-4 text-muted-foreground transition group-hover:-translate-x-0.5 group-hover:text-foreground" />
            </button>
            <div>
              <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Connect a new broker
              </p>
              <h1 className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                Add Broker
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Link an exchange to unlock automated signals and portfolio tracking
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary backdrop-blur-xl">
              <ShieldCheck className="h-3.5 w-3.5" />
              AES-256 encrypted
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          {/* Main column */}
          <div className="flex flex-col gap-6">
            {/* Step 1 — Select broker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-[11px] font-bold text-primary-foreground shadow-[0_0_16px_hsl(210_100%_50%/0.4)]">
                  1
                </span>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Select Exchange
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {BROKERS.map((broker, i) => {
                  const isSelected = selectedBroker === broker.id;
                  return (
                    <motion.button
                      key={broker.id}
                      type="button"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.15 + i * 0.06 }}
                      whileHover={broker.available ? { y: -4 } : {}}
                      whileTap={broker.available ? { scale: 0.98 } : {}}
                      disabled={!broker.available}
                      onClick={() => broker.available && setSelectedBroker(broker.id)}
                      className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all backdrop-blur-xl ${
                        broker.available ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                      } ${
                        isSelected
                          ? "border-primary/60 bg-gradient-to-br from-primary/15 via-card/50 to-accent/10 shadow-[0_0_32px_hsl(210_100%_50%/0.25)]"
                          : "border-border/40 bg-card/40 hover:border-border"
                      }`}
                    >
                      {/* Top glow line */}
                      <div
                        className={`absolute inset-x-0 top-0 h-px transition-opacity ${
                          isSelected
                            ? "bg-gradient-to-r from-transparent via-primary to-transparent opacity-100"
                            : "bg-gradient-to-r from-transparent via-border to-transparent opacity-50"
                        }`}
                      />
                      {/* Corner glow */}
                      <div
                        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl transition-opacity ${
                          isSelected ? "bg-primary/30 opacity-100" : "bg-primary/10 opacity-0 group-hover:opacity-60"
                        }`}
                      />
                      {/* Hover shine */}
                      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />

                      <div className="relative">
                        <div
                          className={`mb-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl p-2 shadow-lg ring-1 ring-border/40 bg-gradient-to-br ${broker.accent}`}
                        >
                          <img
                            src={broker.logoSrc}
                            alt={broker.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <p className="text-base font-bold">{broker.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {broker.available ? broker.description : `${broker.description} · Coming Soon`}
                        </p>
                      </div>

                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 260, damping: 18 }}
                          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-[0_0_16px_hsl(210_100%_50%/0.5)]"
                        >
                          <CheckCircle className="h-3.5 w-3.5 text-primary-foreground" />
                        </motion.div>
                      )}
                      {!broker.available && (
                        <span className="absolute right-3 top-3 rounded-full bg-muted/80 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground ring-1 ring-border/40">
                          Coming Soon
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Step 2 — Account details */}
            <motion.div
              ref={accountSectionRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-[11px] font-bold text-primary-foreground shadow-[0_0_16px_hsl(210_100%_50%/0.4)]">
                  2
                </span>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Account Details
                </p>
              </div>

              <Card className="relative overflow-hidden border-border/40 bg-gradient-to-br from-card/80 via-card/40 to-card/20 backdrop-blur-xl">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

                <CardContent className="relative p-6">
                  <AnimatePresence mode="wait">
                    <motion.form
                      key={selected.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      onSubmit={handleSubmit}
                      className="space-y-5"
                    >
                      {/* Account name */}
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                          Account Name
                        </Label>
                        <div className="group relative">
                          <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/0 to-accent/0 opacity-0 transition-opacity duration-300 group-focus-within:from-primary/20 group-focus-within:via-primary/10 group-focus-within:to-accent/20 group-focus-within:opacity-100" />
                          <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition group-focus-within:text-primary" />
                          <Input
                            id="name"
                            value={form.name}
                            onChange={(e) => update("name", e.target.value)}
                            placeholder={`e.g. My ${selected.name} Main`}
                            className="relative border-border/40 bg-background/40 pl-10 backdrop-blur-xl transition focus:border-primary/60"
                            required
                          />
                        </div>
                      </div>

                      {/* API Key */}
                      <div className="space-y-2">
                        <Label htmlFor="api_key" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                          API Key
                        </Label>
                        <div className="group relative">
                          <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition group-focus-within:text-primary" />
                          <Input
                            id="api_key"
                            value={form.api_key}
                            onChange={(e) => update("api_key", e.target.value)}
                            placeholder="Paste your API key"
                            className="border-border/40 bg-background/40 pl-10 font-mono text-sm backdrop-blur-xl transition focus:border-primary/60"
                            required
                          />
                        </div>
                      </div>

                      {/* Secret Key */}
                      <div className="space-y-2">
                        <Label htmlFor="secret_key" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                          Secret Key
                        </Label>
                        <div className="group relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition group-focus-within:text-primary" />
                          <Input
                            id="secret_key"
                            type={showSecret ? "text" : "password"}
                            value={form.secret_key}
                            onChange={(e) => update("secret_key", e.target.value)}
                            placeholder="Paste your secret key"
                            className="border-border/40 bg-background/40 pl-10 pr-10 font-mono text-sm backdrop-blur-xl transition focus:border-primary/60"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowSecret((s) => !s)}
                            className="absolute right-3 top-3 h-4 w-4 text-muted-foreground transition hover:text-foreground"
                          >
                            {showSecret ? <EyeOff /> : <Eye />}
                          </button>
                        </div>
                      </div>

                      {/* Demo / Live toggle */}
                      <div className="pt-1">
                        <Label className="mb-3 block text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                          Account Type
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          <motion.button
                            type="button"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsDemo(false)}
                            className={`group relative flex items-center gap-3 overflow-hidden rounded-xl border p-4 text-left transition-all ${
                              !isDemo
                                ? "border-primary/60 bg-gradient-to-br from-primary/15 to-accent/10 shadow-[0_0_20px_hsl(210_100%_50%/0.2)]"
                                : "border-border/40 bg-background/40 hover:border-border/70"
                            }`}
                          >
                            {!isDemo && (
                              <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary/20 blur-2xl" />
                            )}
                            <div
                              className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition ${
                                !isDemo
                                  ? "bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30"
                                  : "bg-muted/50"
                              }`}
                            >
                              <Radio className={`h-4 w-4 ${!isDemo ? "text-primary-foreground" : "text-muted-foreground"}`} />
                            </div>
                            <div className="relative">
                              <p className="text-sm font-bold">Live</p>
                              <p className="text-xs text-muted-foreground">Real funds</p>
                            </div>
                            {!isDemo && (
                              <CheckCircle className="relative ml-auto h-4 w-4 text-primary" />
                            )}
                          </motion.button>

                          <motion.button
                            type="button"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsDemo(true)}
                            className={`group relative flex items-center gap-3 overflow-hidden rounded-xl border p-4 text-left transition-all ${
                              isDemo
                                ? "border-yellow-500/60 bg-gradient-to-br from-yellow-500/15 to-amber-500/10 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                                : "border-border/40 bg-background/40 hover:border-border/70"
                            }`}
                          >
                            {isDemo && (
                              <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-yellow-500/20 blur-2xl" />
                            )}
                            <div
                              className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition ${
                                isDemo
                                  ? "bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/30"
                                  : "bg-muted/50"
                              }`}
                            >
                              <TestTube className={`h-4 w-4 ${isDemo ? "text-white" : "text-muted-foreground"}`} />
                            </div>
                            <div className="relative">
                              <p className="text-sm font-bold">Demo</p>
                              <p className="text-xs text-muted-foreground">Paper trading</p>
                            </div>
                            {isDemo && (
                              <CheckCircle className="relative ml-auto h-4 w-4 text-yellow-500" />
                            )}
                          </motion.button>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 border-border/40 bg-card/40 backdrop-blur-xl hover:bg-card/60"
                          onClick={() => navigate("/dashboard/portfolio")}
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_0_24px_hsl(210_100%_50%/0.25)] transition hover:opacity-90 hover:shadow-[0_0_32px_hsl(210_100%_50%/0.45)]"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                          ) : (
                            <CheckCircle className="mr-2 h-4 w-4" />
                          )}
                          Connect Account
                        </Button>
                      </div>
                    </motion.form>
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Side preview / info panel */}
          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-5"
          >
            {/* Selected broker preview */}
            <Card className="relative overflow-hidden border-border/40 bg-gradient-to-br from-card/80 to-card/20 backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
              <motion.div
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/15 blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <CardContent className="relative p-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  Connecting
                </p>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selected.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="mt-3 flex items-center gap-4"
                  >
                    <div
                      className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl p-2 shadow-lg ring-1 ring-border/40 bg-gradient-to-br ${selected.accent}`}
                    >
                      <img
                        src={selected.logoSrc}
                        alt={selected.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{selected.name}</p>
                      <p className="text-xs text-muted-foreground">{selected.description}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
              <CardContent className="p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                  Why connect?
                </p>
                <div className="space-y-3">
                  {[
                    {
                      icon: Zap,
                      title: "Auto-execute signals",
                      desc: "Strategies trade for you the moment they fire.",
                    },
                    {
                      icon: ShieldCheck,
                      title: "Read-only option",
                      desc: "Track performance without trade permissions.",
                    },
                    {
                      icon: Sparkles,
                      title: "Real-time portfolio",
                      desc: "Balances, PnL, and positions synced instantly.",
                    },
                  ].map((b, i) => (
                    <motion.div
                      key={b.title}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.35 + i * 0.08 }}
                      className="flex items-start gap-3 rounded-xl bg-background/40 p-3 ring-1 ring-border/30 transition hover:ring-primary/30"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-primary/30">
                        <b.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{b.title}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{b.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Security note */}
            <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-card/40 to-accent/5 backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(210_100%_50%/0.15),transparent_60%)]" />
              <CardContent className="relative p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
                    <ShieldCheck className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Your keys stay safe</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                      Credentials are AES-256 encrypted at rest. We only need
                      trading permissions — never withdrawals.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.aside>
        </div>
      </main>
    </div>
  );
};

export default AddBroker;
