import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Layers,
  Search,
  RefreshCcw,
  Loader2,
  CheckCircle2,
  MinusCircle,
  Coins,
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  getAssets,
  updateAssetStatus,
  createAsset,
  updateAsset,
  deleteAsset,
  type Asset,
  type AssetPayload,
} from "@/lib/api";
import { toast } from "sonner";

const TYPE_STYLES: Record<string, { badge: string; glow: string; icon: string }> = {
  Cryptocurrency: {
    badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    glow: "from-yellow-500/20 to-orange-500/10",
    icon: "text-yellow-400",
  },
  Stocks: {
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    glow: "from-blue-500/20 to-cyan-500/10",
    icon: "text-blue-400",
  },
  Forex: {
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    glow: "from-purple-500/20 to-pink-500/10",
    icon: "text-purple-400",
  },
  Commodity: {
    badge: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    glow: "from-orange-500/20 to-amber-500/10",
    icon: "text-orange-400",
  },
};

const fallbackStyle = {
  badge: "bg-muted/30 text-muted-foreground border-border/50",
  glow: "from-muted/20 to-muted/5",
  icon: "text-muted-foreground",
};

const BROKERS = ["Binance", "Bybit", "MEXC"];
const TYPES = ["Cryptocurrency", "Stocks", "Forex", "Commodity"];

const emptyForm = (): AssetPayload => ({
  ticker: "",
  type: "Cryptocurrency",
  broker: "Binance",
  max_increments: 5,
  base_size: 1,
  enabled: true,
});

const AssetsManagement = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [brokerFilter, setBrokerFilter] = useState("all");
  const [enabledFilter, setEnabledFilter] = useState<"all" | "enabled" | "disabled">("all");
  const [toggleBusyId, setToggleBusyId] = useState<number | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [form, setForm] = useState<AssetPayload>(emptyForm());
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async (s = search, t = typeFilter, b = brokerFilter) => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (s) params.search = s;
      if (t !== "all") params.type = t;
      if (b !== "all") params.broker = b;
      const res = await getAssets(params);
      setAssets(res.assets);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (val: string) => {
    setSearch(val);
    load(val, typeFilter, brokerFilter);
  };

  const handleType = (val: string) => {
    setTypeFilter(val);
    load(search, val, brokerFilter);
  };

  const handleBroker = (val: string) => {
    setBrokerFilter(val);
    load(search, typeFilter, val);
  };

  const handleToggle = async (asset: Asset) => {
    const next = asset.enabled === 1 ? false : true;
    setToggleBusyId(asset.id);
    setAssets((prev) =>
      prev.map((a) => (a.id === asset.id ? { ...a, enabled: next ? 1 : 0 } : a)),
    );
    try {
      await updateAssetStatus(asset.id, next);
      toast.success(next ? `${asset.ticker} enabled` : `${asset.ticker} disabled`);
    } catch (e: any) {
      setAssets((prev) =>
        prev.map((a) => (a.id === asset.id ? { ...a, enabled: asset.enabled } : a)),
      );
      toast.error(e.message ?? "Failed to update asset");
    } finally {
      setToggleBusyId(null);
    }
  };

  const openAdd = () => {
    setEditingAsset(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setForm({
      ticker: asset.ticker,
      type: asset.type,
      broker: asset.broker,
      max_increments: asset.max_increments,
      base_size: parseFloat(asset.base_size),
      enabled: asset.enabled === 1,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.ticker.trim()) {
      toast.error("Ticker is required");
      return;
    }
    setSaving(true);
    try {
      if (editingAsset) {
        const res = await updateAsset(editingAsset.id, form);
        setAssets((prev) =>
          prev.map((a) => (a.id === editingAsset.id ? res.asset : a)),
        );
        toast.success(`${form.ticker} updated`);
      } else {
        const res = await createAsset(form);
        setAssets((prev) => [...prev, res.asset]);
        toast.success(`${form.ticker} added`);
      }
      setModalOpen(false);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save asset");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAsset(deleteTarget.id);
      setAssets((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      toast.success(`${deleteTarget.ticker} deleted`);
      setDeleteTarget(null);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to delete asset");
    } finally {
      setDeleting(false);
    }
  };

  const types = Array.from(new Set(assets.map((a) => a.type))).sort();
  const enabledCount = assets.filter((a) => a.enabled === 1).length;
  const disabledCount = assets.length - enabledCount;

  const visibleAssets = assets.filter((a) => {
    if (enabledFilter === "enabled") return a.enabled === 1;
    if (enabledFilter === "disabled") return a.enabled !== 1;
    return true;
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full bg-primary/12 blur-[160px]" />
        <div className="absolute -right-20 top-1/3 h-[600px] w-[600px] rounded-full bg-accent/10 blur-[180px]" />
        <div className="absolute bottom-[-15%] left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/8 blur-[140px]" />
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
              <Layers className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Assets</h1>
              <p className="text-xs text-muted-foreground">
                Trading instruments across all brokers · enable or disable per asset
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => load()}
              disabled={loading}
              className="rounded-full border-border/50 bg-card/60"
            >
              <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={openAdd}
              className="rounded-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1600px] px-6 py-8 space-y-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <StatCard
            icon={<Coins className="w-4 h-4" />}
            label="Total Assets"
            value={assets.length}
            accent="text-foreground"
          />
          <StatCard
            icon={<CheckCircle2 className="w-4 h-4" />}
            label="Enabled"
            value={enabledCount}
            accent="text-emerald-400"
          />
          <StatCard
            icon={<MinusCircle className="w-4 h-4" />}
            label="Disabled"
            value={disabledCount}
            accent="text-muted-foreground"
          />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <Card className="border-border/40 bg-card/50 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search ticker, type, broker…"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 h-10 bg-background/60 border-border/50"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Type
                  </span>
                  <Select value={typeFilter} onValueChange={handleType}>
                    <SelectTrigger className="h-10 w-40 bg-background/60 border-border/50">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {types.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Broker
                  </span>
                  <Select value={brokerFilter} onValueChange={handleBroker}>
                    <SelectTrigger className="h-10 w-36 bg-background/60 border-border/50">
                      <SelectValue placeholder="All brokers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All brokers</SelectItem>
                      {BROKERS.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Status
                  </span>
                  <Select
                    value={enabledFilter}
                    onValueChange={(v) => setEnabledFilter(v as any)}
                  >
                    <SelectTrigger className="h-10 w-36 bg-background/60 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="enabled">Enabled</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <span className="text-xs text-muted-foreground ml-auto">
                  {visibleAssets.length} shown
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Assets grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {loading ? (
            <div className="py-20 text-center text-muted-foreground text-sm">
              <Loader2 className="inline w-5 h-5 animate-spin mr-2" />
              Loading…
            </div>
          ) : visibleAssets.length === 0 ? (
            <Card className="border-border/40 bg-card/50 backdrop-blur-xl">
              <CardContent className="py-20 text-center text-muted-foreground text-sm">
                No assets found.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {visibleAssets.map((asset, i) => {
                const style = TYPE_STYLES[asset.type] ?? fallbackStyle;
                const enabled = asset.enabled === 1;
                const busy = toggleBusyId === asset.id;

                return (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.3) }}
                  >
                    <Card
                      className={`group relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-xl transition-all duration-300 hover:scale-[1.015] hover:shadow-xl hover:shadow-primary/10 ${
                        !enabled ? "opacity-75" : ""
                      }`}
                    >
                      <div
                        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent ${
                          enabled ? "opacity-100" : "opacity-30"
                        }`}
                      />
                      <div
                        className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl bg-gradient-to-br ${style.glow}`}
                      />

                      <CardContent className="relative p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/60 ring-1 ring-border/40 ${style.icon}`}
                            >
                              <TrendingUp className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-mono font-bold text-base truncate">
                                {asset.ticker}
                              </div>
                              <div className="text-[11px] text-muted-foreground truncate">
                                {asset.broker}
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] uppercase tracking-wider ${style.badge}`}
                          >
                            {asset.type}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="rounded-lg border border-border/30 bg-background/40 p-2.5">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/80">
                              Base size
                            </div>
                            <div className="font-mono text-sm font-semibold mt-0.5 truncate">
                              {parseFloat(asset.base_size).toLocaleString(undefined, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 8,
                              })}
                            </div>
                          </div>
                          <div className="rounded-lg border border-border/30 bg-background/40 p-2.5">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/80">
                              Max incr.
                            </div>
                            <div className="font-mono text-sm font-semibold mt-0.5">
                              {asset.max_increments}
                            </div>
                          </div>
                        </div>

                        <div
                          className={`flex items-center justify-between rounded-lg border p-3 transition-colors mb-3 ${
                            enabled
                              ? "border-emerald-500/30 bg-emerald-500/5"
                              : "border-border/40 bg-muted/10"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {busy ? (
                              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />
                            ) : enabled ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <MinusCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div
                                className={`text-xs font-semibold ${
                                  enabled ? "text-emerald-400" : "text-muted-foreground"
                                }`}
                              >
                                {enabled ? "Enabled" : "Disabled"}
                              </div>
                              <div className="text-[10px] text-muted-foreground/70">
                                {enabled ? "Active for trading" : "Hidden from bots"}
                              </div>
                            </div>
                          </div>
                          <Switch
                            checked={enabled}
                            onCheckedChange={() => handleToggle(asset)}
                            disabled={busy}
                            aria-label={`Toggle ${asset.ticker}`}
                          />
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs border-border/40 bg-background/40 hover:bg-primary/10 hover:border-primary/40"
                            onClick={() => openEdit(asset)}
                          >
                            <Pencil className="w-3 h-3 mr-1.5" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs border-border/40 bg-background/40 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400"
                            onClick={() => setDeleteTarget(asset)}
                          >
                            <Trash2 className="w-3 h-3 mr-1.5" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>

      {/* Add / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border/50">
          <DialogHeader>
            <DialogTitle>{editingAsset ? "Edit Asset" : "Add Asset"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="ticker">Ticker</Label>
              <Input
                id="ticker"
                placeholder="e.g. BTCUSDT"
                value={form.ticker}
                onChange={(e) => setForm((f) => ({ ...f, ticker: e.target.value.toUpperCase() }))}
                className="bg-background/60 border-border/50 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Broker</Label>
                <Select
                  value={form.broker}
                  onValueChange={(v) => setForm((f) => ({ ...f, broker: v }))}
                >
                  <SelectTrigger className="bg-background/60 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BROKERS.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
                >
                  <SelectTrigger className="bg-background/60 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="base_size">Base Size</Label>
                <Input
                  id="base_size"
                  type="number"
                  step="any"
                  min="0"
                  value={form.base_size}
                  onChange={(e) => setForm((f) => ({ ...f, base_size: parseFloat(e.target.value) || 0 }))}
                  className="bg-background/60 border-border/50 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="max_inc">Max Increments</Label>
                <Input
                  id="max_inc"
                  type="number"
                  min="1"
                  step="1"
                  value={form.max_increments}
                  onChange={(e) => setForm((f) => ({ ...f, max_increments: parseInt(e.target.value) || 1 }))}
                  className="bg-background/60 border-border/50 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/40 bg-background/40 p-3">
              <div>
                <div className="text-sm font-medium">Enabled</div>
                <div className="text-[11px] text-muted-foreground">Active for trading</div>
              </div>
              <Switch
                checked={form.enabled}
                onCheckedChange={(v) => setForm((f) => ({ ...f, enabled: v }))}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingAsset ? "Save Changes" : "Add Asset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.ticker}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the asset from the system. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
}) => (
  <Card className="border-border/40 bg-card/50 backdrop-blur-xl overflow-hidden">
    <CardContent className="pt-5 pb-5 relative">
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl bg-primary/15" />
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground/80 mb-2">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <p className={`text-3xl font-bold tracking-tight ${accent}`}>{value}</p>
    </CardContent>
  </Card>
);

export default AssetsManagement;
