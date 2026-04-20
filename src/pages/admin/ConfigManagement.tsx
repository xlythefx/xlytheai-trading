import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Wrench,
  AlertCircle,
  Send,
  Webhook,
  Link2,
  Tag,
  Loader2,
  Save,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  getAdminSystemConfig,
  updateAdminSystemConfig,
  type SystemConfig,
  type SystemConfigUpdate,
} from "@/lib/api";

type FormState = {
  telegram_token: string;
  telegram_chat_id: string;
  authorized_user_id: string;
  binance_affiliatelink: string;
  mexc_affiliatelink: string;
  bybit_affiliate_link: string;
  binance_referral_code: string;
  mexc_referral_code: string;
  bybit_referral_code: string;
  binance_webhook: string;
  mexc_webhook: string;
  bybit_webhook: string;
  is_maintenance: boolean;
};

const EMPTY: FormState = {
  telegram_token: "",
  telegram_chat_id: "",
  authorized_user_id: "",
  binance_affiliatelink: "",
  mexc_affiliatelink: "",
  bybit_affiliate_link: "",
  binance_referral_code: "",
  mexc_referral_code: "",
  bybit_referral_code: "",
  binance_webhook: "",
  mexc_webhook: "",
  bybit_webhook: "",
  is_maintenance: false,
};

function toForm(c: SystemConfig | null): FormState {
  if (!c) return { ...EMPTY };
  return {
    telegram_token: c.telegram_token ?? "",
    telegram_chat_id: c.telegram_chat_id ?? "",
    authorized_user_id: c.authorized_user_id ?? "",
    binance_affiliatelink: c.binance_affiliatelink ?? "",
    mexc_affiliatelink: c.mexc_affiliatelink ?? "",
    bybit_affiliate_link: c.bybit_affiliate_link ?? "",
    binance_referral_code: c.binance_referral_code ?? "",
    mexc_referral_code: c.mexc_referral_code ?? "",
    bybit_referral_code: c.bybit_referral_code ?? "",
    binance_webhook: c.binance_webhook ?? "",
    mexc_webhook: c.mexc_webhook ?? "",
    bybit_webhook: c.bybit_webhook ?? "",
    is_maintenance: Boolean(c.is_maintenance),
  };
}

const ConfigManagement = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [original, setOriginal] = useState<SystemConfig | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminSystemConfig();
      setOriginal(res.data);
      setForm(toForm(res.data));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load config");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = useMemo(() => {
    const base = toForm(original);
    return (Object.keys(base) as (keyof FormState)[]).some((k) => form[k] !== base[k]);
  }, [form, original]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleMaintenanceToggle = (value: boolean) => {
    if (value) {
      const ok = window.confirm(
        "Enable maintenance mode? The platform will be unavailable to users.",
      );
      if (!ok) return;
    }
    update("is_maintenance", value);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload: SystemConfigUpdate = {
        telegram_token: form.telegram_token || null,
        telegram_chat_id: form.telegram_chat_id || null,
        authorized_user_id: form.authorized_user_id || null,
        binance_affiliatelink: form.binance_affiliatelink || null,
        mexc_affiliatelink: form.mexc_affiliatelink || null,
        bybit_affiliate_link: form.bybit_affiliate_link || null,
        binance_referral_code: form.binance_referral_code || null,
        mexc_referral_code: form.mexc_referral_code || null,
        bybit_referral_code: form.bybit_referral_code || null,
        binance_webhook: form.binance_webhook || null,
        mexc_webhook: form.mexc_webhook || null,
        bybit_webhook: form.bybit_webhook || null,
        is_maintenance: form.is_maintenance,
      };
      const res = await updateAdminSystemConfig(payload);
      setOriginal(res.data);
      setForm(toForm(res.data));
      toast.success("Configuration saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save config");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => setForm(toForm(original));

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full bg-primary/12 blur-[160px]" />
        <div className="absolute -right-20 top-1/3 h-[600px] w-[600px] rounded-full bg-accent/10 blur-[180px]" />
        <div className="absolute bottom-[-15%] left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/8 blur-[140px]" />
      </div>

      <header className="relative z-20 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
              <Wrench className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">System configuration</h1>
              <p className="text-xs text-muted-foreground">
                Edit the single <code className="rounded bg-muted/40 px-1 py-0.5">system_config</code> row
                {" · "}platform-wide settings
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={load}
              disabled={loading || saving}
              className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/60 px-4 py-2 text-xs font-medium text-foreground transition hover:bg-primary/10 hover:text-primary disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Reload
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={!dirty || saving}
              className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/60 px-4 py-2 text-xs font-medium text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
            >
              Discard changes
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!dirty || saving || loading}
              className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-2 text-xs font-medium text-primary ring-1 ring-primary/25 transition hover:bg-primary/25 disabled:opacity-40"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save changes
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1600px] px-6 py-8">
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span>
            This page edits the existing <strong className="text-foreground">system_config</strong> row.
            New rows cannot be added. Save persists all fields.
          </span>
        </div>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
            <div className="flex flex-col gap-6">

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="overflow-hidden border-border/40 bg-gradient-to-br from-card/80 via-card/40 to-card/20 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="mb-5 flex items-center gap-2">
                      <Send className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold">Telegram bot</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Field label="Telegram token" full>
                        <Input
                          value={form.telegram_token}
                          onChange={(e) => update("telegram_token", e.target.value)}
                          placeholder="0000000000:AA…"
                          className="font-mono"
                        />
                      </Field>
                      <Field label="Telegram chat ID">
                        <Input
                          value={form.telegram_chat_id}
                          onChange={(e) => update("telegram_chat_id", e.target.value)}
                          placeholder="123456789"
                          className="font-mono"
                        />
                      </Field>
                      <Field label="Authorized user ID">
                        <Input
                          value={form.authorized_user_id}
                          onChange={(e) => update("authorized_user_id", e.target.value)}
                          placeholder="123456789"
                          className="font-mono"
                        />
                      </Field>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
              >
                <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="mb-5 flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold">Affiliate links</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <Field label="Binance affiliate link" full>
                        <Input
                          value={form.binance_affiliatelink}
                          onChange={(e) => update("binance_affiliatelink", e.target.value)}
                          placeholder="https://www.binance.com/en/register?ref=…"
                        />
                      </Field>
                      <Field label="MEXC affiliate link" full>
                        <Input
                          value={form.mexc_affiliatelink}
                          onChange={(e) => update("mexc_affiliatelink", e.target.value)}
                          placeholder="https://www.mexc.com/register?inviteCode=…"
                        />
                      </Field>
                      <Field label="Bybit affiliate link" full>
                        <Input
                          value={form.bybit_affiliate_link}
                          onChange={(e) => update("bybit_affiliate_link", e.target.value)}
                          placeholder="https://www.bybit.com/register?affiliate_id=…"
                        />
                      </Field>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="mb-5 flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold">Referral codes</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <Field label="Binance referral code">
                        <Input
                          value={form.binance_referral_code}
                          onChange={(e) => update("binance_referral_code", e.target.value)}
                          placeholder="SAMPLEBIN"
                          className="font-mono"
                        />
                      </Field>
                      <Field label="MEXC referral code">
                        <Input
                          value={form.mexc_referral_code}
                          onChange={(e) => update("mexc_referral_code", e.target.value)}
                          placeholder="SAMPLEMEXC"
                          className="font-mono"
                        />
                      </Field>
                      <Field label="Bybit referral code">
                        <Input
                          value={form.bybit_referral_code}
                          onChange={(e) => update("bybit_referral_code", e.target.value)}
                          placeholder="SAMPLEBYB"
                          className="font-mono"
                        />
                      </Field>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="mb-5 flex items-center gap-2">
                      <Webhook className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold">Exchange webhooks</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <Field label="Binance webhook" full>
                        <Input
                          value={form.binance_webhook}
                          onChange={(e) => update("binance_webhook", e.target.value)}
                          placeholder="https://…"
                          className="font-mono"
                        />
                      </Field>
                      <Field label="MEXC webhook" full>
                        <Input
                          value={form.mexc_webhook}
                          onChange={(e) => update("mexc_webhook", e.target.value)}
                          placeholder="https://…"
                          className="font-mono"
                        />
                      </Field>
                      <Field label="Bybit webhook" full>
                        <Input
                          value={form.bybit_webhook}
                          onChange={(e) => update("bybit_webhook", e.target.value)}
                          placeholder="https://…"
                          className="font-mono"
                        />
                      </Field>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.aside
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col gap-5"
            >
              <Card className="border-border/40 bg-gradient-to-br from-card/80 to-card/30 backdrop-blur-xl">
                <CardContent className="p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <h3 className="text-sm font-semibold">Maintenance mode</h3>
                  </div>
                  <div className="flex items-start justify-between gap-3 rounded-xl border border-yellow-500/25 bg-yellow-500/5 p-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Platform unavailable</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                        When ON, user-facing routes return a maintenance response.
                      </p>
                    </div>
                    <Switch
                      checked={form.is_maintenance}
                      onCheckedChange={handleMaintenanceToggle}
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Current state</span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-semibold ring-1 ${
                        form.is_maintenance
                          ? "bg-yellow-500/10 text-yellow-500 ring-yellow-500/30"
                          : "bg-primary/10 text-primary ring-primary/30"
                      }`}
                    >
                      {form.is_maintenance ? "Maintenance" : "Online"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40 bg-card/40 backdrop-blur-xl">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold">Record</h3>
                  </div>
                  <dl className="space-y-2 text-[12px]">
                    <Row label="ID" value={original ? `#${original.id}` : "—"} />
                    <Row
                      label="Created"
                      value={
                        original?.created_at
                          ? new Date(original.created_at).toLocaleString()
                          : "—"
                      }
                    />
                    <Row
                      label="Updated"
                      value={
                        original?.updated_at
                          ? new Date(original.updated_at).toLocaleString()
                          : "—"
                      }
                    />
                    <Row
                      label="Unsaved changes"
                      value={dirty ? "Yes" : "None"}
                      valueClass={dirty ? "text-yellow-500" : "text-muted-foreground"}
                    />
                  </dl>
                </CardContent>
              </Card>
            </motion.aside>
          </div>
        )}
      </main>
    </div>
  );
};

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${full ? "md:col-span-full" : ""}`}>
      <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
        {label}
      </Label>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`truncate text-right font-medium ${valueClass ?? "text-foreground"}`}>
        {value}
      </dd>
    </div>
  );
}

export default ConfigManagement;
