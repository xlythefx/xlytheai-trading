import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bell,
  LogOut,
  RefreshCcw,
  UserCircle,
  LayoutDashboard,
  Briefcase,
  BarChart2,
  TrendingUp,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUser, logout } from "@/lib/api";
import { ADMIN_CODE, isAdminEmail } from "@/lib/admin";

/** Which main nav link shows the active pill */
export type V2NavActiveKey =
  | "dashboard"
  | "positions"
  | "portfolio"
  | "asset-performance"
  /** User settings (no main-nav pill; access via profile) */
  | "settings";

const NAV_ITEMS: {
  key: V2NavActiveKey;
  label: string;
  icon: typeof LayoutDashboard;
  to: string;
}[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/dashboard-v2" },
  { key: "positions", label: "Positions Overview", icon: TrendingUp, to: "/positions" },
  { key: "portfolio", label: "Portfolio", icon: Briefcase, to: "/dashboard/portfolio" },
  { key: "asset-performance", label: "Asset Performance", icon: BarChart2, to: "/asset-performance" },
];

export interface V2TopNavProps {
  active: V2NavActiveKey;
  /** Logo + title link target (dashboard v2 uses `/dashboard`) */
  brandTo?: string;
  onRefresh?: () => void;
  loading?: boolean;
  /** Extra controls before bell (e.g. Asset Performance context chip) */
  endSlot?: ReactNode;
}

export function V2TopNav({
  active,
  brandTo = "/dashboard-v2",
  onRefresh,
  loading = false,
  endSlot,
}: V2TopNavProps) {
  const navigate = useNavigate();
  const user = getUser();
  const showAdmin = isAdminEmail(user?.email);

  const handleLogout = () => {
    void logout().finally(() => {
      navigate("/login", { replace: true });
    });
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 border-b border-border/40 bg-background/60 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-6 py-4">
        <div className="flex items-center gap-8">
          <Link
            to={brandTo}
            className="flex items-center gap-2 transition hover:opacity-80"
          >
            <img src="/logo.png" alt="" className="h-9 w-9 rounded-xl object-contain" />
            <span className="text-lg font-bold tracking-tight text-foreground">Flowehn</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = item.key === active;
              return (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`group relative rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="v2-nav-pill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 ring-1 ring-primary/30"
                      transition={{ type: "spring", stiffness: 260, damping: 24 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {endSlot}
          {showAdmin && (
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full text-primary hover:bg-primary/10"
              aria-label="Admin panel"
              title="Admin"
              onClick={() =>
                navigate("/loading", {
                  state: {
                    next: `/admin/${ADMIN_CODE}/dashboard`,
                    label: "Entering admin panel…",
                  },
                })
              }
            >
              <Shield className="h-4 w-4" />
            </Button>
          )}
          <Button size="icon" variant="ghost" className="rounded-full hover:bg-primary/10" asChild>
            <Link to="/dashboard/user-settings" aria-label="User settings">
              <UserCircle className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="icon" variant="ghost" className="rounded-full hover:bg-primary/10">
            <Bell className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full hover:bg-primary/10"
            onClick={onRefresh}
            disabled={loading || !onRefresh}
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label="Log out"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
