import { useState, useRef } from "react";
import { Copy, Upload, CheckCircle, ExternalLink, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { submitAffiliateVerification } from "@/lib/api";

const BINANCE_REFERRAL = "551477608";
const BINANCE_SIGNUP_URL = `https://accounts.binance.com/register?ref=${BINANCE_REFERRAL}`;

const EXCHANGES = [
  {
    id: "binance" as const,
    name: "Binance",
    logo: "/assets/binance.jpeg",
    enabled: true,
    code: BINANCE_REFERRAL,
    signupUrl: BINANCE_SIGNUP_URL,
  },
  {
    id: "mexc" as const,
    name: "MEXC",
    logo: "/assets/mexc.png",
    enabled: false,
    code: "",
    signupUrl: "",
  },
  {
    id: "bybit" as const,
    name: "Bybit",
    logo: "/assets/bybit.png",
    enabled: false,
    code: "",
    signupUrl: "",
  },
];

interface AffiliateVerificationFormProps {
  onSubmitted?: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
}

export function AffiliateVerificationForm({
  onSubmitted,
  onSkip,
  showSkip = false,
}: AffiliateVerificationFormProps) {
  const [selectedExchange, setSelectedExchange] = useState<string>("binance");
  const [exchangeUid, setExchangeUid] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const activeExchange = EXCHANGES.find((e) => e.id === selectedExchange);

  const copyCode = async () => {
    if (!activeExchange?.code) return;
    await navigator.clipboard.writeText(activeExchange.code);
    toast.success("Referral code copied!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }
    setScreenshot(file);
  };

  const handleSubmit = async () => {
    if (!exchangeUid.trim()) {
      toast.error("Please enter your Exchange UID");
      return;
    }
    if (!screenshot) {
      toast.error("Please upload a screenshot");
      return;
    }
    setIsSubmitting(true);
    try {
      await submitAffiliateVerification({
        exchange: selectedExchange,
        exchange_uid: exchangeUid.trim(),
        screenshot,
      });
      toast.success("Verification submitted! We'll review it shortly.");
      onSubmitted?.();
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Exchange selection */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">
          Select your exchange
        </p>
        <div className="grid grid-cols-3 gap-2">
          {EXCHANGES.map((ex) => (
            <button
              key={ex.id}
              type="button"
              disabled={!ex.enabled}
              onClick={() => ex.enabled && setSelectedExchange(ex.id)}
              className={`relative rounded-xl border px-3 py-3 text-center transition-all ${
                selectedExchange === ex.id
                  ? "border-primary/60 bg-primary/15 shadow-[0_0_12px_hsl(210_100%_50%/0.2)]"
                  : ex.enabled
                    ? "border-border/40 bg-secondary/30 hover:border-border/70"
                    : "border-border/20 bg-secondary/10 opacity-50 cursor-not-allowed"
              }`}
            >
              <img
                src={ex.logo}
                alt={ex.name}
                className="w-8 h-8 rounded-lg mx-auto mb-1.5 object-contain"
              />
              <p className="text-xs font-medium">{ex.name}</p>
              {!ex.enabled && (
                <span className="absolute top-1 right-1 text-[10px] text-muted-foreground bg-secondary/60 rounded px-1">
                  Soon
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Referral code + signup link */}
      {activeExchange?.enabled && activeExchange.code && (
        <div className="rounded-xl border border-border/40 bg-secondary/30 p-3 space-y-2">
          <p className="text-xs text-muted-foreground">
            Our {activeExchange.name} Referral Code
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-base font-mono font-bold text-primary bg-background/60 rounded-xl px-3 py-2 border border-border/40">
              {activeExchange.code}
            </code>
            <button
              type="button"
              onClick={copyCode}
              className="rounded-xl border border-border/40 bg-secondary/40 p-2.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <a
            href={activeExchange.signupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-border/40 bg-secondary/30 hover:bg-secondary/60 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-all"
          >
            Sign up on {activeExchange.name}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Exchange UID */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          Exchange UID
        </label>
        <input
          type="text"
          placeholder="Your account UID from the exchange"
          value={exchangeUid}
          onChange={(e) => setExchangeUid(e.target.value)}
          className="w-full rounded-xl border border-border/50 bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:bg-secondary/60 focus:ring-1 focus:ring-primary/20 transition-all"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Find this in your exchange profile settings
        </p>
      </div>

      {/* Screenshot upload */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          Screenshot proof
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={`w-full rounded-xl border-2 border-dashed px-4 py-6 text-center transition-all ${
            screenshot
              ? "border-primary/40 bg-primary/5"
              : "border-border/40 bg-secondary/20 hover:border-border/60 hover:bg-secondary/30"
          }`}
        >
          {screenshot ? (
            <div className="flex items-center justify-center gap-2 text-sm text-primary">
              <CheckCircle className="w-4 h-4" />
              {screenshot.name}
            </div>
          ) : (
            <div className="space-y-1">
              <Upload className="w-5 h-5 mx-auto text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">
                Click to upload screenshot
              </p>
              <p className="text-xs text-muted-foreground/60">
                PNG, JPG up to 5MB
              </p>
            </div>
          )}
        </button>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 shadow-[0_0_20px_hsl(210_100%_50%/0.2)] hover:shadow-[0_0_28px_hsl(210_100%_50%/0.35)] transition-all"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Submit Verification
            </>
          )}
        </button>
        {showSkip && onSkip && (
          <button
            type="button"
            onClick={() => setShowSkipConfirm(true)}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Skip for now
          </button>
        )}
      </div>

      {/* Skip confirmation dialog */}
      <Dialog open={showSkipConfirm} onOpenChange={setShowSkipConfirm}>
        <DialogContent className="bg-background/95 backdrop-blur-2xl border-border/50 max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Are you sure?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Without affiliate verification, you won't be able to receive live
            trading signals. You can still connect a demo account and explore
            the dashboard.
          </p>
          <p className="text-sm text-muted-foreground">
            You can complete verification later from your dashboard.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              onClick={() => setShowSkipConfirm(false)}
              className="rounded-xl border border-border/40 bg-secondary/40 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Go back
            </button>
            <button
              onClick={() => {
                setShowSkipConfirm(false);
                onSkip?.();
              }}
              className="rounded-xl bg-amber-500/20 border border-amber-500/30 px-4 py-2 text-sm font-medium text-amber-300 hover:bg-amber-500/30 transition-colors"
            >
              Skip anyway
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
