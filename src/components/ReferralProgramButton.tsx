import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

type ReferralProgramButtonProps = {
  className?: string;
  compact?: boolean;
  onClick?: () => void;
};

export function ReferralProgramButton({
  className,
  compact = false,
  onClick,
}: ReferralProgramButtonProps) {
  return (
    <Link to="/register" onClick={onClick} className={cn("inline-flex", className)}>
      <motion.span
        whileHover={{ y: -1, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group relative inline-flex rounded-full"
      >
        <span
          aria-hidden
          className="absolute inset-[-4px] rounded-full bg-[radial-gradient(circle,_rgba(168,85,247,0.7)_0%,_rgba(139,92,246,0.55)_35%,_rgba(59,130,246,0.28)_65%,_transparent_82%)] blur-xl animate-pulse"
        />
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-500 to-indigo-500 shadow-[0_0_34px_rgba(168,85,247,0.4)]"
        />
        <span
          className={cn(
            "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border border-white/15 bg-[linear-gradient(135deg,rgba(35,17,68,0.98),rgba(55,25,96,0.95)_45%,rgba(28,20,65,0.98))] font-semibold text-white ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_10px_30px_rgba(139,92,246,0.28)] transition-transform duration-300 isolate",
            compact ? "px-4 py-2 text-sm" : "px-5 py-2.5 text-sm",
          )}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/4 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/75 to-transparent opacity-0 blur-[1px] transition-opacity duration-200 group-hover:opacity-100 group-hover:animate-[shimmer_1.2s_ease-out_1]"
          />
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-300 via-fuchsia-400 to-indigo-400 text-slate-950 shadow-[0_0_14px_rgba(216,180,254,0.6)]">
            <Gift className="h-3.5 w-3.5" />
          </span>
          <span>Referral Program</span>
        </span>
      </motion.span>
    </Link>
  );
}
