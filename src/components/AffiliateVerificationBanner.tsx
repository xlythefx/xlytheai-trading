import { useEffect, useState } from "react";
import { AlertTriangle, Clock, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getAffiliateVerificationStatus,
  type AffiliateVerificationStatus,
} from "@/lib/api";
import { AffiliateVerificationForm } from "@/components/AffiliateVerificationForm";

export function AffiliateVerificationBanner() {
  const [status, setStatus] = useState<AffiliateVerificationStatus | null>(
    null,
  );
  const [showDialog, setShowDialog] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const fetchStatus = () => {
    getAffiliateVerificationStatus()
      .then(setStatus)
      .catch(() => {});
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (!status || status.has_approved || dismissed) return null;

  const hasPending = status.data.some((v) => v.status === "pending");
  const hasRejected =
    !hasPending && status.data.some((v) => v.status === "rejected");
  const noVerification = status.data.length === 0;

  if (!hasPending && !hasRejected && !noVerification) return null;

  return (
    <>
      {hasPending ? (
        <div className="relative flex items-center gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
          <Clock className="w-4 h-4 shrink-0" />
          <span>
            Your affiliate verification is pending review. You'll receive trades
            once approved.
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="ml-auto text-blue-300/60 hover:text-blue-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            {hasRejected
              ? "Your verification was rejected. Please resubmit to start receiving trades."
              : "Complete affiliate verification to start receiving trades."}
          </span>
          <button
            onClick={() => setShowDialog(true)}
            className="ml-auto shrink-0 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1 text-xs font-medium text-amber-200 transition-colors"
          >
            Verify Now
          </button>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-background/95 backdrop-blur-2xl border-border/50 max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Affiliate Verification</DialogTitle>
          </DialogHeader>
          <AffiliateVerificationForm
            onSubmitted={() => {
              setShowDialog(false);
              fetchStatus();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
