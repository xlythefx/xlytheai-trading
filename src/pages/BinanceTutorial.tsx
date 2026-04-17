import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Copy, ExternalLink, Shield } from "lucide-react";
import { toast } from "sonner";

const BINANCE_REFERRAL = "551477608";
const BINANCE_SIGNUP_URL = `https://accounts.binance.com/register?ref=${BINANCE_REFERRAL}`;

// ─── Screenshot placeholder ──────────────────────────────────────────────────
const ScreenshotPlaceholder = ({
  label,
  hint,
  step,
}: {
  label: string;
  hint?: string;
  step?: number;
}) => (
  <div className="w-full rounded-xl border border-dashed border-border/60 bg-secondary/20 flex flex-col items-center justify-center py-12 px-6 gap-3 select-none">
    <div className="h-10 w-10 rounded-full border border-border/40 bg-secondary/40 flex items-center justify-center text-sm font-bold text-muted-foreground">
      {step ?? "?"}
    </div>
    <p className="text-sm font-medium text-muted-foreground text-center">{label}</p>
    {hint && <p className="text-xs text-muted-foreground/60 text-center max-w-xs">{hint}</p>}
    <span className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground/40 border border-border/30 rounded px-2 py-0.5">
      Screenshot placeholder
    </span>
  </div>
);

const WarningBox = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
    <span>{children}</span>
  </div>
);

const TipBox = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
    <Shield className="w-4 h-4 shrink-0 mt-0.5" />
    <span>{children}</span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const BinanceTutorial = () => {
  const copyReferral = async () => {
    await navigator.clipboard.writeText(BINANCE_REFERRAL);
    toast.success("Referral code copied!");
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* Hero */}
      <div className="pt-28 pb-10 px-4">
        <div className="container max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 flex justify-center">
              <img
                src="/assets/binance.jpeg"
                alt="Binance"
                className="h-14 w-auto max-w-[200px] object-contain"
              />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6">
              Setup Guide
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
              How to Connect Binance
            </h1>
            <p className="text-base text-muted-foreground max-w-xl mx-auto">
              Follow this step-by-step guide to generate your Binance API keys and securely link your account to Inner Circle.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="pb-24 px-4">
        <div className="container max-w-3xl mx-auto space-y-10">

          {/* ── STEP 0: Create Binance account ────────────────────────────── */}
          <Section index={1} title="Create a Binance Account">
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you don't have a Binance account yet, sign up using our referral link. It's free and takes under 2 minutes.
            </p>

            <div className="rounded-xl border border-border/40 bg-secondary/20 p-4">
              <p className="text-xs text-muted-foreground mb-3">Our Binance Referral Code</p>
              <div className="flex items-center gap-2 mb-6">
                <code className="flex-1 text-lg font-mono font-bold text-primary bg-background/60 rounded-xl px-3 py-2 border border-border/40">
                  {BINANCE_REFERRAL}
                </code>
                <button
                  onClick={copyReferral}
                  className="rounded-xl border border-border/40 bg-secondary/40 p-2.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <a href={BINANCE_SIGNUP_URL} target="_blank" rel="noopener noreferrer" className="block">
                <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
                  <ExternalLink className="w-4 h-4" />
                  Create Binance Account
                </button>
              </a>
            </div>

            <ScreenshotPlaceholder
              step={1}
              label="Binance registration page"
              hint="Shows the Binance sign-up form with referral code pre-filled"
            />
          </Section>

          {/* ── STEP 2: Log in & navigate to API Management ───────────────── */}
          <Section index={2} title="Navigate to API Management">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Log in to your Binance account. Click on your profile icon in the top-right corner, then select <strong className="text-foreground">My Account</strong> from the dropdown.
            </p>

            <ScreenshotPlaceholder
              step={2}
              label="Binance profile dropdown menu"
              hint="Shows the account avatar menu with 'My Account' highlighted"
            />

            <p className="text-sm text-muted-foreground leading-relaxed">
              On the Account overview page, locate the <strong className="text-foreground">API Management</strong> section in the left sidebar and click it.
            </p>

            <ScreenshotPlaceholder
              step={2}
              label="Binance account dashboard — left sidebar"
              hint="Shows 'API Management' option in the left navigation menu"
            />
          </Section>

          {/* ── STEP 3: Create API key ─────────────────────────────────────── */}
          <Section index={3} title="Create a New API Key">
            <p className="text-sm text-muted-foreground leading-relaxed">
              On the API Management page, click <strong className="text-foreground">+ Create API</strong>. You must choose{" "}
              <strong className="text-foreground">System-generated</strong> — these keys use <strong className="text-foreground">HMAC</strong> signing, which is what Inner Circle expects. Do not use Ed25519 or other key types for this integration.
            </p>

            <ScreenshotPlaceholder
              step={3}
              label="API Management — Create API button"
              hint="Shows the API Management page with the '+ Create API' button highlighted"
            />

            <p className="text-sm text-muted-foreground leading-relaxed">
              Give your key a label — something like <code className="text-primary text-xs bg-primary/10 rounded px-1.5 py-0.5">InnerCircle</code> — so you can identify it later.
            </p>

            <ScreenshotPlaceholder
              step={3}
              label="API key label input dialog"
              hint="Shows the modal asking for a label name with 'InnerCircle' typed in"
            />

            <p className="text-sm text-muted-foreground leading-relaxed">
              Complete the security verification (email code + 2FA/passkey) when prompted.
            </p>

            <ScreenshotPlaceholder
              step={3}
              label="Security verification screen"
              hint="Shows the two-factor authentication / email verification dialog"
            />
          </Section>

          {/* ── STEP 4: Configure permissions ─────────────────────────────── */}
          <Section index={4} title="Configure API Permissions">
            <p className="text-sm text-muted-foreground leading-relaxed">
              After creation, you'll be taken to the API key settings. Enable the permissions below. You do <strong className="text-foreground">not</strong> need Spot &amp; Margin trading for this integration — focus on Futures and account read access.
            </p>

            <div className="space-y-2">
              {[
                { label: "Read Info", required: true, note: "Lets Inner Circle read your balance and positions", warn: false },
                { label: "Enable Futures", required: true, note: "Required for trade signals and positions on Binance Futures", warn: false },
                { label: "Enable Withdrawals", required: false, note: "NEVER enable — Inner Circle does not need withdrawal access", warn: true },
              ].map((perm) => (
                <div
                  key={perm.label}
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
                    perm.warn
                      ? "border-red-500/30 bg-red-500/10"
                      : perm.required
                      ? "border-primary/30 bg-primary/10"
                      : "border-border/30 bg-secondary/20"
                  }`}
                >
                  {perm.required && !perm.warn ? (
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                  ) : perm.warn ? (
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  ) : (
                    <div className="w-4 h-4 shrink-0 mt-0.5 rounded-full border border-border/60" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${perm.warn ? "text-red-400" : perm.required ? "text-primary" : "text-foreground"}`}>
                      {perm.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{perm.note}</p>
                  </div>
                </div>
              ))}
            </div>

            <WarningBox>
              Never enable <strong>withdrawal permissions</strong> for any API key used with third-party platforms. Inner Circle does not require and will never request withdrawal access.
            </WarningBox>

            <div className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-4 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-primary">Whitelist this IP (required)</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Under <strong className="text-foreground">IP Access Restrictions</strong>, restrict the key to trusted IPs only and add the address Inner Circle provides. IP whitelist is mandatory — keys without it may be rejected.
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-border/50 bg-background/60 px-3 py-2.5 font-mono text-sm text-foreground">
                203.0.113.42
                <span className="block text-xs font-sans font-normal text-amber-400/90 mt-2">
                  ↑ Sample only — <strong className="text-foreground">change this</strong> to the exact IP address from Inner Circle (or your approved static IP). Do not use the example value in production.
                </span>
              </div>
            </div>

            <TipBox>
              In Binance Futures, open <strong className="text-foreground">Preferences</strong> and set position mode to{" "}
              <strong className="text-foreground">Hedge mode</strong> (not One-way) for seamless integration with Inner Circle order handling.
            </TipBox>

            <ScreenshotPlaceholder
              step={4}
              label="Binance API permissions panel"
              hint="Shows Read Info + Enable Futures checked, Spot/Margin off, Withdrawals off, and trusted IP whitelist filled in"
            />

            <ScreenshotPlaceholder
              step={4}
              label="IP restriction settings"
              hint="Shows 'Restrict access to trusted IPs only' enabled with your whitelisted IP(s)"
            />

            <p className="text-sm text-muted-foreground">
              Click <strong className="text-foreground">Save</strong> and complete the verification again to apply your permission settings.
            </p>
          </Section>

          {/* ── STEP 5: Copy your keys ────────────────────────────────────── */}
          <Section index={5} title="Copy Your API Key & Secret Key">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Inner Circle only needs these two values — nothing else. Once the key is created, Binance will display your{" "}
              <strong className="text-foreground">API Key</strong> and <strong className="text-foreground">Secret Key</strong> (HMAC system-generated key pair).
            </p>

            <WarningBox>
              The Secret Key is shown <strong>only once</strong>. Copy it immediately and store it somewhere safe. If you lose it, you'll need to delete the key and create a new one.
            </WarningBox>

            <ScreenshotPlaceholder
              step={5}
              label="API Key & Secret Key display screen"
              hint="Shows the generated API Key and Secret Key with copy buttons — blurred for security"
            />

            <div className="space-y-3">
              <div className="rounded-xl border border-border/40 bg-secondary/20 px-4 py-3">
                <p className="text-xs font-semibold text-foreground mb-1">API Key</p>
                <p className="text-xs text-muted-foreground font-mono tracking-wider">
                  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                </p>
                <p className="text-xs text-muted-foreground mt-1">64-character alphanumeric string</p>
              </div>
              <div className="rounded-xl border border-border/40 bg-secondary/20 px-4 py-3">
                <p className="text-xs font-semibold text-foreground mb-1">Secret Key</p>
                <p className="text-xs text-muted-foreground font-mono tracking-wider">
                  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                </p>
                <p className="text-xs text-muted-foreground mt-1">64-character alphanumeric string — shown once only</p>
              </div>
            </div>
          </Section>

          {/* ── STEP 6: Add to Inner Circle ───────────────────────────────── */}
          <Section index={6} title="Add Your Keys to Inner Circle">
            <p className="text-sm text-muted-foreground leading-relaxed">
              In your Inner Circle dashboard, go to <strong className="text-foreground">Add Broker</strong> (or use the button below). Paste only your <strong className="text-foreground">API Key</strong> and <strong className="text-foreground">Secret Key</strong> — no passphrase or other fields — then click <strong className="text-foreground">Connect</strong>.
            </p>

            <ScreenshotPlaceholder
              step={6}
              label="Inner Circle — Add Broker form"
              hint="Shows the 'Add Broker' page in the dashboard with the API Key and Secret Key input fields"
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/dashboard/add-broker"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Go to Add Broker
              </Link>
              <Link
                to="/register"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border/40 bg-secondary/30 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
              >
                Create an account first
              </Link>
            </div>

            <TipBox>
              Inner Circle stores your API keys with AES-256 encryption. Your keys are never exposed in plain text and are only used to communicate with Binance on your behalf.
            </TipBox>
          </Section>

          {/* ── Done ──────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="rounded-2xl border border-primary/30 bg-primary/10 px-6 py-6 text-center"
          >
            <CheckCircle className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground mb-1">You're all set!</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Once your Binance account is connected, Inner Circle will start monitoring signals and can automate trades based on your configured strategy.
            </p>
          </motion.div>

          {/* Footer links */}
          <div className="flex flex-wrap gap-4 items-center justify-center text-sm text-muted-foreground pt-4">
            <Link to="/register" className="text-primary hover:underline">Create Account</Link>
            <span className="hidden md:inline">·</span>
            <Link to="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link>
            <span className="hidden md:inline">·</span>
            <a href="mailto:support@innercircle.com" className="hover:text-foreground transition-colors">Get Support</a>
            <span className="hidden md:inline">·</span>
            <Link to="/" className="hover:text-foreground transition-colors">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.06 }}
    className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm px-6 py-6 space-y-4"
  >
    <div className="flex items-center gap-3 mb-1">
      <div className="h-8 w-8 shrink-0 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-sm font-bold text-primary">
        {index}
      </div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
    </div>
    {children}
  </motion.div>
);

export default BinanceTutorial;
