import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Radio, Store } from "lucide-react";
import { ReferralProgramButton } from "@/components/ReferralProgramButton";

const NAV_LINKS = [
  { to: "/signals", label: "Live Signals", icon: Radio },
  { to: "/marketplace", label: "Marketplace", icon: Store },
  { to: "/about", label: "About", icon: null },
  { to: "/pricing", label: "Pricing", icon: null },
  { to: "/how-it-works", label: "How it works", icon: null },
];

export function PublicNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/75 backdrop-blur-xl shadow-[0_8px_32px_-12px_rgba(0,0,0,0.55)]">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.img
              src="/logo.png"
              alt="Flowehn"
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
              Flowehn
            </motion.span>
          </Link>

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

          <div className="flex items-center gap-2 sm:gap-3">
            <ReferralProgramButton compact />
          </div>
        </div>
      </div>
    </nav>
  );
}
