import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Key,
  Lock,
  Radio,
  Tag,
  TestTube,
} from "lucide-react";
import { toast } from "sonner";
import { addBrokerAccount } from "@/lib/api";

const BROKERS = [
  {
    id: "binance",
    name: "Binance",
    description: "World's largest crypto exchange",
    logo: "BNB",
    color: "bg-yellow-500",
    available: true,
  },
  {
    id: "bybit",
    name: "Bybit",
    description: "Coming soon",
    logo: "BYB",
    color: "bg-orange-500",
    available: false,
  },
  {
    id: "mexc",
    name: "MEXC",
    description: "Coming soon",
    logo: "MX",
    color: "bg-blue-500",
    available: false,
  },
];

const AddBroker = () => {
  const navigate = useNavigate();
  const [selectedBroker, setSelectedBroker] = useState("binance");
  const [showSecret, setShowSecret] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ api_key: "", secret_key: "", name: "" });

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
      await addBrokerAccount({
        api_key: form.api_key.trim(),
        secret_key: form.secret_key.trim(),
        name: form.name.trim(),
        demo: isDemo,
      });
      toast.success("Broker account added!");
      navigate("/dashboard/portfolio");
    } catch (err: any) {
      toast.error(err.message || "Failed to add account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-min flex-col">
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={() => navigate("/dashboard/portfolio")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Add Broker</h1>
            <p className="text-muted-foreground text-sm">Connect a new exchange account</p>
          </div>
        </div>
      </nav>

      <main className="p-6">
        <div className="max-w-2xl mx-auto space-y-8">

          {/* Step 1 — Select broker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Step 1 — Select Exchange
            </p>
            <div className="grid grid-cols-3 gap-3">
              {BROKERS.map((broker) => {
                const selected = selectedBroker === broker.id;
                return (
                  <button
                    key={broker.id}
                    type="button"
                    disabled={!broker.available}
                    onClick={() => broker.available && setSelectedBroker(broker.id)}
                    className={`relative rounded-xl border p-4 text-left transition-all focus:outline-none
                      ${broker.available ? "cursor-pointer" : "cursor-not-allowed opacity-50"}
                      ${selected
                        ? "border-primary bg-primary/10 shadow-sm shadow-primary/20"
                        : "border-border/50 bg-card/50 hover:border-border hover:bg-card/80"}
                    `}
                  >
                    <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${broker.color} text-sm font-bold text-white shadow-sm`}>
                      {broker.logo}
                    </div>
                    <p className="font-semibold text-sm">{broker.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{broker.description}</p>
                    {selected && (
                      <CheckCircle className="absolute top-3 right-3 h-4 w-4 text-primary" />
                    )}
                    {!broker.available && (
                      <span className="absolute top-2 right-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Soon
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Step 2 — Account details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Step 2 — Account Details
            </p>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Account name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Account Name</Label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        placeholder="e.g. My Binance Main"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* API Key */}
                  <div className="space-y-2">
                    <Label htmlFor="api_key">API Key</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="api_key"
                        value={form.api_key}
                        onChange={(e) => update("api_key", e.target.value)}
                        placeholder="Paste your API key"
                        className="pl-10 font-mono text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Secret Key */}
                  <div className="space-y-2">
                    <Label htmlFor="secret_key">Secret Key</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="secret_key"
                        type={showSecret ? "text" : "password"}
                        value={form.secret_key}
                        onChange={(e) => update("secret_key", e.target.value)}
                        placeholder="Paste your secret key"
                        className="pl-10 pr-10 font-mono text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecret((s) => !s)}
                        className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                      >
                        {showSecret ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </div>

                  {/* Demo / Live toggle */}
                  <div className="pt-1">
                    <p className="text-sm font-medium mb-3">Account Type</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setIsDemo(false)}
                        className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all focus:outline-none
                          ${!isDemo
                            ? "border-primary bg-primary/10 shadow-sm shadow-primary/20"
                            : "border-border/50 bg-background/50 hover:border-border"}
                        `}
                      >
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${!isDemo ? "bg-primary" : "bg-muted"}`}>
                          <Radio className={`h-4 w-4 ${!isDemo ? "text-white" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Live</p>
                          <p className="text-xs text-muted-foreground">Real funds</p>
                        </div>
                        {!isDemo && <CheckCircle className="ml-auto h-4 w-4 text-primary" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsDemo(true)}
                        className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all focus:outline-none
                          ${isDemo
                            ? "border-yellow-500 bg-yellow-500/10 shadow-sm shadow-yellow-500/20"
                            : "border-border/50 bg-background/50 hover:border-border"}
                        `}
                      >
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isDemo ? "bg-yellow-500" : "bg-muted"}`}>
                          <TestTube className={`h-4 w-4 ${isDemo ? "text-white" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Demo</p>
                          <p className="text-xs text-muted-foreground">Paper trading</p>
                        </div>
                        {isDemo && <CheckCircle className="ml-auto h-4 w-4 text-yellow-500" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate("/dashboard/portfolio")}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      Connect Account
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default AddBroker;
