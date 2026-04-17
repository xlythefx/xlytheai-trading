import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Radio, Store } from "lucide-react";

const NAV_LINKS = [
  { to: "/signals",     label: "Live Signals",  icon: Radio },
  { to: "/marketplace", label: "Marketplace",   icon: Store },
  { to: "/about",       label: "About",         icon: null  },
  { to: "/pricing",     label: "Pricing",       icon: null  },
  { to: "/how-it-works",label: "How it works",  icon: null  },
];

export function PublicNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/75 backdrop-blur-xl shadow-[0_8px_32px_-12px_rgba(0,0,0,0.55)]">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.img
              src="/logo.png"
              alt="Inner Circle"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="h-8 w-8 rounded-lg object-contain shadow-[0_0_18px_hsl(210_100%_50%/0.35)]"
            />
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xl font-bold tracking-tight text-white"
            >
              Inner Circle
            </motion.span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => {
              const isActive = pathname === to;
              return (
                <motion.div key={to} whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                  <Link
                    to={to}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      isActive ? "text-primary font-medium" : "text-foreground hover:text-primary"
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {label}
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* CTA — Referral placeholder (no action yet) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
              <button
                type="button"
                aria-disabled="true"
                className="group relative inline-flex cursor-not-allowed items-center justify-center rounded-xl p-[1px] opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                onClick={(e) => e.preventDefault()}
              >
                <span
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/70 via-accent/60 to-primary/70 opacity-80 blur-[10px] transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden
                />
                <span className="relative flex items-center gap-1.5 rounded-[11px] bg-background/95 px-3.5 py-2 text-xs font-semibold tracking-wide text-foreground/95 shadow-inner ring-1 ring-white/10 sm:px-4 sm:text-sm">
                  Referral Program
                </span>
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </nav>
  );
}
