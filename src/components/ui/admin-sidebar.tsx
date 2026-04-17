import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  FileText,
  Wrench,
  Layers,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { adminCode } = useParams();
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: `/admin/${adminCode}/dashboard`,
      description: "Overview"
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: `/admin/${adminCode}/analytics`,
      description: "Analytics"
    },
    {
      title: "User Management",
      icon: Users,
      href: `/admin/${adminCode}/users`,
      description: "Manage users"
    },
    {
      title: "Settings",
      icon: Settings,
      href: `/admin/${adminCode}/settings`,
      description: "Admin settings"
    },
    {
      title: "Config",
      icon: Wrench,
      href: `/admin/${adminCode}/config`,
      description: "Configuration"
    },
    {
      title: "Assets",
      icon: Layers,
      href: `/admin/${adminCode}/assets`,
      description: "Trading instruments"
    },
    {
      title: "Affiliates",
      icon: UserCheck,
      href: `/admin/${adminCode}/affiliates`,
      description: "Affiliate verifications"
    },
    {
      title: "Audit Logs",
      icon: FileText,
      href: `/admin/${adminCode}/logs`,
      description: "System logs"
    }
  ];

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href);
  };

  return (
    <motion.div
      initial={{ width: 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-background/95 backdrop-blur-sm border-r border-border/50 h-screen flex flex-col"
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
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">Inner Circle</p>
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
              <Shield className="w-5 h-5 text-white" />
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
          {menuItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link to={item.href}>
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  className={`w-full justify-start h-10 px-3 ${
                    isCollapsed ? "px-2" : ""
                  } ${
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-primary/10"
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isCollapsed ? "mx-auto" : "mr-3"}`} />
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
            </motion.div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-border/50">
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

