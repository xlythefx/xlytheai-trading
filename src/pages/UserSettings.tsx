import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Shield,
  Mail,
  Lock,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  Copy,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { changePassword, getUser, setAuth, updateProfile } from "@/lib/api";
import { V2TopNav } from "@/components/V2TopNav";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const UserSettings = () => {
  const user = getUser();

  const [profile, setProfile] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
  });
  const [passwords, setPasswords] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await updateProfile(profile);
      setAuth(localStorage.getItem("auth_token")!, res.user);
      toast.success("Profile updated");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update failed";
      toast.error(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.password !== passwords.password_confirmation) {
      toast.error("Passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await changePassword(passwords);
      toast.success(res.message);
      setPasswords({ current_password: "", password: "", password_confirmation: "" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Password change failed";
      toast.error(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  const copyReferral = async () => {
    if (!user?.referral_code) return;
    await navigator.clipboard.writeText(user.referral_code);
    toast.success("Referral code copied");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[160px]" />
        <div className="absolute -right-20 top-1/3 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[180px]" />
        <div className="absolute bottom-[-20%] left-1/2 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-primary/6 blur-[140px]" />
      </div>

      <V2TopNav active="settings" brandTo="/dashboard-v2" />

      <main className="relative z-10 mx-auto max-w-[960px] px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold tracking-tight">Account settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Profile, security, and account details</p>
        </motion.div>

        <div className="space-y-6">
          {/* Account overview */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
            <Card className="relative overflow-hidden border-border/40 bg-gradient-to-br from-card/90 via-card/50 to-card/30 backdrop-blur-xl">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25">
                      <User className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-bold tracking-tight truncate">{user?.name ?? "—"}</p>
                      <p className="text-sm text-muted-foreground truncate">{user?.email ?? "—"}</p>
                    </div>
                  </div>
                  {user?.referral_code && (
                    <div className="sm:ml-auto sm:text-right">
                      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">
                        Referral code
                      </p>
                      <div className="flex items-center gap-2 sm:justify-end">
                        <code className="rounded-lg bg-primary/10 px-3 py-1.5 font-mono text-sm font-bold text-primary ring-1 ring-primary/20">
                          {user.referral_code}
                        </code>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-9 w-9 shrink-0 rounded-full border-border/40"
                          onClick={copyReferral}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Profile */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
            <Card className="group relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-xl transition-colors hover:border-primary/30">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-60" />
              <CardHeader className="pb-2 pt-6">
                <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                    <User className="h-4 w-4 text-primary" />
                  </span>
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-muted-foreground">
                      Display name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Your name"
                        className="h-11 rounded-xl border-border/40 bg-background/50 pl-10 backdrop-blur-sm"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-muted-foreground">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                        placeholder="you@email.com"
                        className="h-11 rounded-xl border-border/40 bg-background/50 pl-10 backdrop-blur-sm"
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={savingProfile}
                    className="h-10 rounded-full bg-gradient-to-r from-primary to-accent px-6 shadow-lg shadow-primary/20"
                  >
                    {savingProfile ? (
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save profile
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Password */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
            <Card className="group relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-xl transition-colors hover:border-primary/30">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-60" />
              <CardHeader className="pb-2 pt-6">
                <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                    <Shield className="h-4 w-4 text-primary" />
                  </span>
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <form onSubmit={handlePasswordSave} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-muted-foreground">
                      Current password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="currentPassword"
                        type={showCurrent ? "text" : "password"}
                        value={passwords.current_password}
                        onChange={(e) => setPasswords((p) => ({ ...p, current_password: e.target.value }))}
                        placeholder="••••••••"
                        className="h-11 rounded-xl border-border/40 bg-background/50 pl-10 pr-10 backdrop-blur-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-muted-foreground">
                        New password
                      </Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="newPassword"
                          type={showNew ? "text" : "password"}
                          value={passwords.password}
                          onChange={(e) => setPasswords((p) => ({ ...p, password: e.target.value }))}
                          placeholder="Min. 6 characters"
                          className="h-11 rounded-xl border-border/40 bg-background/50 pl-10 pr-10 backdrop-blur-sm"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew((s) => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-muted-foreground">
                        Confirm new password
                      </Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showConfirm ? "text" : "password"}
                          value={passwords.password_confirmation}
                          onChange={(e) => setPasswords((p) => ({ ...p, password_confirmation: e.target.value }))}
                          placeholder="Repeat password"
                          className="h-11 rounded-xl border-border/40 bg-background/50 pl-10 pr-10 backdrop-blur-sm"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((s) => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {passwords.password && passwords.password_confirmation && (
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        passwords.password === passwords.password_confirmation ? "text-primary" : "text-destructive"
                      }`}
                    >
                      <CheckCircle className="h-4 w-4 shrink-0" />
                      {passwords.password === passwords.password_confirmation
                        ? "Passwords match"
                        : "Passwords do not match"}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={savingPassword || passwords.password !== passwords.password_confirmation}
                    variant="outline"
                    className="h-10 rounded-full border-border/40 bg-card/40 hover:bg-card/60"
                  >
                    {savingPassword ? (
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
                    ) : (
                      <Shield className="mr-2 h-4 w-4" />
                    )}
                    Update password
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Account details */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}>
            <Card className="relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-xl">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-50" />
              <CardHeader className="pb-2 pt-6">
                <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                    <KeyRound className="h-4 w-4 text-primary" />
                  </span>
                  Account details
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="divide-y divide-border/30 rounded-xl border border-border/30 bg-background/30">
                  <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                    <span className="text-sm text-muted-foreground">User ID</span>
                    <code className="rounded-md bg-muted/80 px-2 py-1 font-mono text-xs">{user?.uni_id ?? "—"}</code>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                    <span className="text-sm text-muted-foreground">Referral code</span>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-sm font-semibold text-primary">{user?.referral_code ?? "—"}</code>
                      {user?.referral_code && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={copyReferral}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant="outline" className="gap-1 border-primary/35 text-primary">
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default UserSettings;
