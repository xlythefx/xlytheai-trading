import { motion } from "framer-motion";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/api";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BarChart3,
  FileText,
  Wrench,
  Layers,
  ChevronLeft,
  ChevronRight,
  ListTree,
  ArrowLeftToLine,
} from "lucide-react";

export const ADMIN_SIDEBAR_WIDTH = 280;
export const ADMIN_SIDEBAR_COLLAPSED = 80;

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminCode } = useParams();
  const user = getUser();

  const handleSwitchToUser = () => {
    navigate("/loading", {
      state: { next: "/dashboard-v2", label: "Switching to user mode…" },
    });
  };

  const menuItems = [
    { title: "Dashboard",       icon: LayoutDashboard, href: `/admin/${adminCode}/dashboard` },
    { title: "Analytics",       icon: BarChart3,       href: `/admin/${adminCode}/analytics` },
    { title: "Positions",       icon: ListTree,        href: `/admin/${adminCode}/positions` },
    { title: "User Management", icon: Users,           href: `/admin/${adminCode}/users` },
    { title: "Affiliates",      icon: UserCheck,       href: `/admin/${adminCode}/affiliates` },
    { title: "Config",          icon: Wrench,          href: `/admin/${adminCode}/config` },
    { title: "Assets",          icon: Layers,          href: `/admin/${adminCode}/assets` },
    { title: "Audit Logs",      icon: FileText,        href: `/admin/${adminCode}/logs` },
  ];

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href);

  return (
    <motion.aside
      animate={{ width: collapsed ? ADMIN_SIDEBAR_COLLAPSED : ADMIN_SIDEBAR_WIDTH }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border/50 bg-background/95 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-3 ${collapsed ? "mx-auto" : ""}`}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
              <img
                src="/logo.png"
                alt="XlytheAI"
                className="h-6 w-6 rounded-md object-contain"
              />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold tracking-tight">XlytheAI</h2>
                <p className="text-xs text-muted-foreground">Flowehn</p>
              </div>
            )}
          </div>

          {!collapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0 hover:bg-primary/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
        {collapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="mt-3 h-8 w-full p-0 hover:bg-primary/10"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        {!collapsed && (
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Manage
          </p>
        )}
        <div className="space-y-1.5">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.title} to={item.href} title={collapsed ? item.title : undefined}>
                <Button
                  variant={active ? "default" : "ghost"}
                  className={`group relative h-10 w-full justify-start overflow-hidden ${collapsed ? "px-2" : "px-3"} ${
                    active
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/20"
                      : "hover:bg-primary/10"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="admin-nav-indicator"
                      className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary-foreground/80"
                      transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    />
                  )}
                  <item.icon className={`h-4 w-4 ${collapsed ? "mx-auto" : "mr-3"}`} />
                  {!collapsed && <span className="truncate">{item.title}</span>}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer: user info + switch back to user dashboard */}
      <div className="border-t border-border/50 p-3">
        {!collapsed && user && (
          <div className="mb-3 flex items-center gap-2.5 rounded-lg bg-background/40 px-2.5 py-2 ring-1 ring-border/40">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-accent/80 text-xs font-bold text-white">
              {user.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{user.name || "Admin"}</p>
              <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
            </div>
          </div>
        )}
        <Button
          type="button"
          onClick={handleSwitchToUser}
          title={collapsed ? "Switch to User Mode" : undefined}
          className={`group h-10 w-full justify-start border border-primary/30 bg-primary/5 text-foreground hover:bg-primary/10 hover:text-primary ${collapsed ? "px-2" : "px-3"}`}
          variant="ghost"
        >
          <ArrowLeftToLine className={`h-4 w-4 text-primary transition-transform group-hover:-translate-x-0.5 ${collapsed ? "mx-auto" : "mr-3"}`} />
          {!collapsed && <span className="truncate text-xs font-medium">Switch to User Mode</span>}
        </Button>
      </div>

    </motion.aside>
  );
}
