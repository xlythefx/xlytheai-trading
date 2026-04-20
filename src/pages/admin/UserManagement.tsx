import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  Trash2,
  Edit,
  User as UserIcon,
  ShieldOff,
  ShieldCheck,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdminUsers,
  updateAdminUser,
  updateAdminUserStatus,
  deleteAdminUser,
  type AdminUser,
} from "@/lib/api";

const statusBadge = (status: string) => {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-medium text-green-400 ring-1 ring-green-500/25">
        <ShieldCheck className="w-3 h-3" /> Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-400 ring-1 ring-red-500/25">
      <ShieldOff className="w-3 h-3" /> Suspended
    </span>
  );
};

const affiliateBadge = (status: AdminUser["affiliate_status"]) => {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400 ring-1 ring-emerald-500/30">
        <CheckCircle className="w-2.5 h-2.5" /> Affiliate
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400 ring-1 ring-amber-500/30">
        <Clock className="w-2.5 h-2.5" /> Pending
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-400 ring-1 ring-red-500/30">
        <XCircle className="w-2.5 h-2.5" /> Rejected
      </span>
    );
  }
  return null;
};

const rowAccent = (status: AdminUser["affiliate_status"]) => {
  if (status === "approved")
    return "border-emerald-500/40 bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08]";
  if (status === "pending")
    return "border-amber-500/40 bg-amber-500/[0.04] hover:bg-amber-500/[0.08]";
  if (status === "rejected")
    return "border-red-500/30 bg-red-500/[0.03] hover:bg-red-500/[0.07]";
  return "border-border/50 bg-background/50 hover:bg-background/80";
};

const UserManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [affiliateFilter, setAffiliateFilter] = useState<
    "all" | "none" | "pending" | "approved" | "rejected"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState<AdminUser | null>(null);
  const [removing, setRemoving] = useState(false);

  const [statusBusyId, setStatusBusyId] = useState<number | null>(null);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getAdminUsers({
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        affiliate_status: affiliateFilter !== "all" ? affiliateFilter : undefined,
        page,
        per_page: 25,
      });
      setUsers(res.data);
      setCurrentPage(res.current_page);
      setLastPage(res.last_page);
      setTotal(res.total);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [searchTerm, statusFilter, affiliateFilter]);

  const openEdit = (u: AdminUser) => {
    setEditing(u);
    setEditForm({ name: u.name, email: u.email, password: "" });
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const payload: { name?: string; email?: string; password?: string } = {};
      if (editForm.name !== editing.name) payload.name = editForm.name;
      if (editForm.email !== editing.email) payload.email = editForm.email;
      if (editForm.password) payload.password = editForm.password;

      await updateAdminUser(editing.id, payload);
      toast.success("User updated");
      setEditing(null);
      fetchData(currentPage);
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (u: AdminUser) => {
    const next = u.status === "active" ? "suspended" : "active";
    setStatusBusyId(u.id);
    try {
      await updateAdminUserStatus(u.id, next);
      toast.success(next === "suspended" ? "User suspended" : "User activated");
      setUsers((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, status: next } : x)),
      );
    } catch (err: any) {
      toast.error(err.message || "Status change failed");
    } finally {
      setStatusBusyId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    setRemoving(true);
    try {
      await deleteAdminUser(deleting.id);
      toast.success("User deleted");
      setDeleting(null);
      fetchData(currentPage);
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setRemoving(false);
    }
  };

  const pendingCount = users.filter((u) => u.affiliate_status === "pending").length;
  const approvedCount = users.filter((u) => u.affiliate_status === "approved").length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full bg-primary/12 blur-[160px]" />
        <div className="absolute -right-20 top-1/3 h-[600px] w-[600px] rounded-full bg-accent/10 blur-[180px]" />
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
              <Users className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">User Management</h1>
              <p className="text-xs text-muted-foreground">
                {total} users · {approvedCount} approved affiliates · {pendingCount} pending
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1600px] px-6 py-8 space-y-6">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-border/40 bg-card/50 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by name, email, uni ID, referral code..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-border/50 bg-background/60 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Account
                  </span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="rounded-lg border border-border/50 bg-background/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Affiliate
                  </span>
                  <select
                    value={affiliateFilter}
                    onChange={(e) => setAffiliateFilter(e.target.value as any)}
                    className="rounded-lg border border-border/50 bg-background/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All</option>
                    <option value="none">No submission</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <span className="text-xs text-muted-foreground ml-auto">
                  {total} total
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Users list */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <Card className="border-border/40 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserCheck className="w-4 h-4 text-primary" />
                All Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-16 text-center text-muted-foreground text-sm">
                  <Loader2 className="inline w-5 h-5 animate-spin mr-2" />
                  Loading...
                </div>
              ) : users.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground text-sm">
                  No users found.
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-colors ${rowAccent(
                        user.affiliate_status,
                      )}`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                          <UserIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-foreground truncate">
                              {user.name}
                            </span>
                            {affiliateBadge(user.affiliate_status)}
                            {user.affiliate_exchange && (
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                · {user.affiliate_exchange}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {user.email}
                          </div>
                          <div className="text-[11px] text-muted-foreground/70 font-mono mt-0.5 truncate">
                            {user.uni_id}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 shrink-0">
                        <div>{statusBadge(user.status)}</div>

                        <div className="text-right hidden md:block">
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Joined
                          </div>
                          <div className="text-sm font-medium">
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Edit"
                            onClick={() => openEdit(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title={user.status === "active" ? "Suspend" : "Activate"}
                            disabled={statusBusyId === user.id}
                            onClick={() => handleToggleStatus(user)}
                          >
                            {statusBusyId === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : user.status === "active" ? (
                              <ShieldOff className="w-4 h-4 text-amber-400" />
                            ) : (
                              <ShieldCheck className="w-4 h-4 text-green-400" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Delete"
                            onClick={() => setDeleting(user)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
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

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="bg-background border-border/50 sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-primary" />
              Edit User
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>New Password</Label>
                <Input
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={editForm.password}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditing(null)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleSaveEdit} disabled={saving}>
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent className="bg-background border-border/50 sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Delete User
            </DialogTitle>
          </DialogHeader>
          {deleting && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This will permanently delete{" "}
                <span className="text-foreground font-medium">{deleting.name}</span> (
                {deleting.email}). This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeleting(null)}
                  disabled={removing}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleConfirmDelete}
                  disabled={removing}
                >
                  {removing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
