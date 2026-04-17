import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserCheck, Search, CheckCircle, XCircle, Clock, Copy } from "lucide-react";
import { AdminSidebar } from "@/components/ui/admin-sidebar";
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
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-400">
          <Clock className="w-3 h-3" /> Pending
        </span>
      );
    case "approved":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-medium text-green-400">
          <CheckCircle className="w-3 h-3" /> Approved
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-400">
          <XCircle className="w-3 h-3" /> Rejected
        </span>
      );
    default:
      return null;
  }
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

  const handleAction = async (status: "approved" | "rejected") => {
    if (!selected) return;
    setUpdating(true);
    try {
      await updateAdminAffiliateVerification(selected.id, {
        status,
        admin_notes: adminNotes || undefined,
      });
      toast.success(`Verification ${status}`);
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

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border/50 backdrop-blur-md bg-background/80 px-6 py-4">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <UserCheck className="w-6 h-6 text-primary" />
            Affiliate Verifications
          </h1>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Filters */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <span className="text-sm text-muted-foreground">
                    {total} total
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">User</th>
                      <th className="px-4 py-3 font-medium">Exchange</th>
                      <th className="px-4 py-3 font-medium">Exchange UID</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Submitted</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-muted-foreground"
                        >
                          Loading...
                        </td>
                      </tr>
                    ) : verifications.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-muted-foreground"
                        >
                          No verifications found
                        </td>
                      </tr>
                    ) : (
                      verifications.map((v) => (
                        <tr
                          key={v.id}
                          className="border-b border-border/30 hover:bg-card/80 transition-colors cursor-pointer"
                          onClick={() => openDetail(v)}
                        >
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-foreground">
                                {v.user?.name || "—"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {v.user?.email || "—"}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3 capitalize">{v.exchange}</td>
                          <td className="px-4 py-3 font-mono text-xs">
                            {v.exchange_uid}
                          </td>
                          <td className="px-4 py-3">{statusBadge(v.status)}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {new Date(v.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
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
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {lastPage > 1 && (
                <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
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
            </Card>
          </div>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="bg-background border-border/50 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              Verification Details
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              {/* User info */}
              <div className="rounded-lg border border-border/40 bg-secondary/20 p-3 space-y-1">
                <p className="text-sm font-medium">{selected.user?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selected.user?.email}
                </p>
              </div>

              {/* Exchange + UID */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Exchange</p>
                  <p className="text-sm font-medium capitalize">
                    {selected.exchange}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Exchange UID
                  </p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-mono">{selected.exchange_uid}</p>
                    <button
                      onClick={() => copyUid(selected.exchange_uid)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Current Status
                </p>
                {statusBadge(selected.status)}
              </div>

              {/* Screenshot */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Screenshot</p>
                <div className="rounded-lg border border-border/40 overflow-hidden bg-black/20">
                  <img
                    src={`${STORAGE_BASE}/${selected.screenshot_path}`}
                    alt="Verification screenshot"
                    className="w-full max-h-[300px] object-contain"
                  />
                </div>
              </div>

              {/* Admin notes */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Optional notes..."
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Actions */}
              {selected.status === "pending" && (
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => handleAction("approved")}
                    disabled={updating}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleAction("rejected")}
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
    </div>
  );
};

export default AffiliateVerifications;
