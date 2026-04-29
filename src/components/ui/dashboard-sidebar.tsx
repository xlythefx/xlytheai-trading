"use client";

import { useState } from "react";
import { getUser } from "@/lib/api";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  BarChart3,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Brain,
  PieChart,
  Calendar,
  HelpCircle,
  LineChart,
  BarChart2,
  Layers,
  Lock,
  LayoutDashboard,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  className?: string;
}

type MenuItem = {
  title: string;
  icon: LucideIcon;
  description?: string;
  hidden?: boolean;
  locked?: boolean;
  href?: string;
};

export function DashboardSidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const location = useLocation();
  const user = getUser();

  const menuItems: MenuItem[] = [
    {
      title: "Overview",
      icon: Home,
      href: "/dashboard",
      description: "Dashboard overview",
    },
    {
      title: "Dashboard V2",
      icon: LayoutDashboard,
      href: "/dashboard-v2",
      description: "New dashboard experience",
    },
    {
      title: "Asset Performance",
      icon: BarChart2,
      href: "/asset-performance",
      description: "Per-asset analytics & equity curves",
    },
    {
      title: "Trading",
      icon: BarChart3,
      href: "/dashboard/trading",
      description: "Trading signals",
      hidden: true,
    },
    {
      title: "Portfolio",
      icon: PieChart,
      href: "/dashboard/portfolio",
      description: "Portfolio management",
    },
    {
      title: "Binance Positions",
      icon: TrendingUp,
      href: "/dashboard/binance-positions",
      description: "Open and past Binance positions",
    },
    {
      title: "MEXC Positions",
      icon: LineChart,
      locked: true,
      description: "Coming soon",
    },
    {
      title: "Bybit Positions",
      icon: BarChart2,
      locked: true,
      description: "Coming soon",
    },
    {
      title: "Supported Assets",
      icon: Layers,
      href: "/dashboard/supported-assets",
      description: "Tradable instruments",
    },
    {
      title: "Calendar",
      icon: Calendar,
      href: "/dashboard/calendar",
      description: "Trading calendar",
      hidden: true,
    },
    {
      title: "User Settings",
      icon: Settings,
      href: "/dashboard/user-settings",
      description: "Account & app preferences",
    },
    {
      title: "Help",
      icon: HelpCircle,
      href: "/dashboard/help",
      description: "Support center",
      hidden: true,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(href);
  };

  const visibleItems = menuItems.filter((item) => !item.hidden);

  return (
    <motion.div
      initial={{ width: 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`sticky top-0 z-40 flex h-screen shrink-0 flex-col border-r border-border/50 bg-background/95 backdrop-blur-sm ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: isCollapsed ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Flowehn</h2>
                <p className="text-xs text-muted-foreground">Trading Dashboard</p>
              </div>
            </motion.div>
          )}
          
          {isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto"
            >
              <Brain className="w-5 h-5 text-white" />
            </motion.div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0 hover:bg-primary/10"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {visibleItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.06 }}
            >
              {item.locked ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full">
                      <Button
                        type="button"
                        variant="ghost"
                        disabled
                        className="h-10 w-full cursor-not-allowed justify-start px-3 text-muted-foreground opacity-70 hover:bg-transparent"
                      >
                        <item.icon className={`h-4 w-4 shrink-0 ${isCollapsed ? "mx-auto" : "mr-3"}`} />
                        {!isCollapsed && (
                          <span className="min-w-0 flex-1 truncate text-left">{item.title}</span>
                        )}
                        {!isCollapsed && (
                          <Lock className="ml-auto h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
                        )}
                        {isCollapsed && (
                          <Lock className="sr-only" />
                        )}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.description ?? "Coming soon"}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link to={item.href!}>
                  <Button
                    variant={isActive(item.href!) ? "default" : "ghost"}
                    className={`h-10 w-full justify-start px-3 ${
                      isCollapsed ? "px-2" : ""
                    } ${
                      isActive(item.href!)
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-primary/10"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${isCollapsed ? "mx-auto" : "mr-3"}`} />
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 1 }}
                        animate={{ opacity: isCollapsed ? 0 : 1 }}
                        transition={{ duration: 0.2 }}
                        className="truncate"
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </Button>
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: isCollapsed ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              className="flex-1 min-w-0"
            >
              <p className="text-sm font-medium text-foreground truncate">{user?.name ?? "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</p>
            </motion.div>
          )}
        </div>

        <Link to="/">
          <Button
            variant="ghost"
            className={`w-full justify-start h-10 px-3 ${
              isCollapsed ? "px-2" : ""
            } hover:bg-destructive/10 hover:text-destructive`}
          >
            <LogOut className={`w-4 h-4 ${isCollapsed ? "mx-auto" : "mr-3"}`} />
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 1 }}
                animate={{ opacity: isCollapsed ? 0 : 1 }}
                transition={{ duration: 0.2 }}
              >
                Sign Out
              </motion.span>
            )}
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
