import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  UserCheck,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdminAffiliateVerifications,
  updateAdminAffiliateVerification,
  type AffiliateVerification,
  API_URL,
} from "@/lib/api";

const STORAGE_BASE = API_URL.replace("/api", "/storage");

const statusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-400 ring-1 ring-amber-500/30">
          <Clock className="w-3 h-3" /> Pending
        </span>
      );
    case "approved":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/30">
          <CheckCircle className="w-3 h-3" /> Approved
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-400 ring-1 ring-red-500/30">
          <XCircle className="w-3 h-3" /> Rejected
        </span>
      );
    default:
      return null;
  }
};

const rowAccent = (status: string) => {
  if (status === "approved")
    return "border-emerald-500/40 bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08]";
  if (status === "pending")
    return "border-amber-500/40 bg-amber-500/[0.05] hover:bg-amber-500/[0.09]";
  if (status === "rejected")
    return "border-red-500/30 bg-red-500/[0.03] hover:bg-red-500/[0.07]";
  return "border-border/40 bg-background/40 hover:bg-background/60";
};

const AffiliateVerifications = () => {
  const [verifications, setVerifications] = useState<AffiliateVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Detail dialog
  const [selected, setSelected] = useState<AffiliateVerification | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  // Confirmation dialog
  const [confirmAction, setConfirmAction] = useState<"approved" | "rejected" | null>(null);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getAdminAffiliateVerifications({
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchTerm || undefined,
        page,
      });
      setVerifications(res.data);
      setCurrentPage(res.current_page);
      setLastPage(res.last_page);
      setTotal(res.total);
    } catch {
      toast.error("Failed to load verifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [statusFilter, searchTerm]);

  const openDetail = (v: AffiliateVerification) => {
    setSelected(v);
    setAdminNotes(v.admin_notes || "");
  };

  const confirmedAction = async () => {
    if (!selected || !confirmAction) return;
    setUpdating(true);
    try {
      await updateAdminAffiliateVerification(selected.id, {
        status: confirmAction,
        admin_notes: adminNotes || undefined,
      });
      toast.success(`Verification ${confirmAction}`);
      setConfirmAction(null);
      setSelected(null);
      fetchData(currentPage);
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const copyUid = async (uid: string) => {
    await navigator.clipboard.writeText(uid);
    toast.success("UID copied!");
  };

  const pendingCount = verifications.filter((v) => v.status === "pending").length;
  const approvedCount = verifications.filter((v) => v.status === "approved").length;
  const rejectedCount = verifications.filter((v) => v.status === "rejected").length;

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
              <UserCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Affiliate Verifications</h1>
              <p className="text-xs text-muted-foreground">
                {total} submissions · review and approve exchange affiliate IDs
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1600px] px-6 py-8 space-y-6">
        {/* Stat cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <StatCard label="Total" value={total} accent="text-foreground" />
          <StatCard label="Pending" value={pendingCount} accent="text-amber-400" />
          <StatCard label="Approved" value={approvedCount} accent="text-emerald-400" />
          <StatCard label="Rejected" value={rejectedCount} accent="text-red-400" />
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
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-border/50 bg-background/60 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-border/50 bg-background/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <span className="text-xs text-muted-foreground ml-auto">
                  {total} total
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Verification list */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="border-border/40 bg-card/50 backdrop-blur-xl">
            <CardContent className="p-6">
              {loading ? (
                <div className="py-16 text-center text-muted-foreground text-sm">
                  <Loader2 className="inline w-5 h-5 animate-spin mr-2" />
                  Loading...
                </div>
              ) : verifications.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground text-sm">
                  No verifications found.
                </div>
              ) : (
                <div className="space-y-2">
                  {verifications.map((v) => (
                    <motion.div
                      key={v.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      onClick={() => openDetail(v)}
                      className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${rowAccent(
                        v.status,
                      )}`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                          <UserCheck className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-foreground truncate">
                            {v.user?.name || "—"}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {v.user?.email || "—"}
                          </div>
                          <div className="text-[11px] text-muted-foreground/70 font-mono mt-0.5 truncate">
                            {v.exchange_uid}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <span className="inline-flex items-center gap-1 rounded-full bg-background/70 px-2.5 py-0.5 text-xs font-medium text-foreground ring-1 ring-border/50 capitalize">
                          {v.exchange}
                        </span>
                        {statusBadge(v.status)}
                        <div className="text-right hidden md:block">
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Submitted
                          </div>
                          <div className="text-sm font-medium">
                            {new Date(v.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(v);
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {lastPage > 1 && (
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    Page {currentPage} of {lastPage}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => fetchData(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= lastPage}
                      onClick={() => fetchData(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="bg-background border-border/50 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <UserCheck className="w-4 h-4 text-white" />
              </div>
              Verification Details
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              {/* User info */}
              <div className="rounded-xl border border-border/40 bg-secondary/20 p-3 space-y-1">
                <p className="text-sm font-medium">{selected.user?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selected.user?.email}
                </p>
              </div>

              {/* Exchange + UID */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/40 bg-background/40 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    Exchange
                  </p>
                  <p className="text-sm font-semibold capitalize">
                    {selected.exchange}
                  </p>
                </div>
                <div className="rounded-xl border border-border/40 bg-background/40 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    Exchange UID
                  </p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-mono truncate">
                      {selected.exchange_uid}
                    </p>
                    <button
                      onClick={() => copyUid(selected.exchange_uid)}
                      className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Current Status
                </p>
                {statusBadge(selected.status)}
              </div>

              {/* Screenshot */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                  Screenshot
                </p>
                <div className="rounded-xl border border-border/40 overflow-hidden bg-black/20">
                  <img
                    src={`${STORAGE_BASE}/${selected.screenshot_path}`}
                    alt="Verification screenshot"
                    className="w-full max-h-[300px] object-contain"
                  />
                </div>
              </div>

              {/* Admin notes */}
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Optional notes..."
                  rows={2}
                  className="w-full rounded-lg border border-border/50 bg-background/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Actions */}
              {selected.status === "pending" && (
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => setConfirmAction("approved")}
                    disabled={updating}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => setConfirmAction("rejected")}
                    disabled={updating}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-1.5" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && !updating && setConfirmAction(null)}
      >
        <DialogContent className="bg-background border-border/50 sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle
              className={`flex items-center gap-2 ${
                confirmAction === "approved" ? "text-emerald-400" : "text-red-400"
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
              {confirmAction === "approved" ? "Approve" : "Reject"} verification?
            </DialogTitle>
          </DialogHeader>
          <AnimatePresence mode="wait">
            {selected && confirmAction && (
              <motion.div
                key={confirmAction}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  You are about to{" "}
                  <span
                    className={`font-semibold ${
                      confirmAction === "approved"
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {confirmAction === "approved" ? "approve" : "reject"}
                  </span>{" "}
                  the submission from{" "}
                  <span className="text-foreground font-medium">
                    {selected.user?.name}
                  </span>{" "}
                  ({selected.exchange} · {selected.exchange_uid}).
                  {confirmAction === "approved"
                    ? " They will be marked as a verified affiliate."
                    : " They will need to submit a new screenshot to retry."}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setConfirmAction(null)}
                    disabled={updating}
                  >
                    No, cancel
                  </Button>
                  <Button
                    className={`flex-1 text-white ${
                      confirmAction === "approved"
                        ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-lg shadow-emerald-500/20"
                        : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-lg shadow-red-500/20"
                    }`}
                    onClick={confirmedAction}
                    disabled={updating}
                  >
                    {updating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : confirmAction === "approved" ? (
                      <CheckCircle className="w-4 h-4 mr-1.5" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-1.5" />
                    )}
                    Yes, {confirmAction === "approved" ? "approve" : "reject"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) => (
  <Card className="border-border/40 bg-card/50 backdrop-blur-xl overflow-hidden">
    <CardContent className="pt-5 pb-5 relative">
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl bg-primary/15" />
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-bold tracking-tight ${accent}`}>{value}</p>
    </CardContent>
  </Card>
);

export default AffiliateVerifications;
