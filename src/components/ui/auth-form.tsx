"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { login as apiLogin, setAuth } from "@/lib/api";
import { toast } from "sonner";
import { SmokeBackground } from "@/components/ui/spooky-smoke-animation";

// ─── Onload animation variants ───────────────────────────────────────────────

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_STD = [0.25, 0.46, 0.45, 0.94] as const;

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: EASE_OUT },
  },
} as const;

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.25 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_STD },
  },
} as const;

interface AuthFormProps {
  className?: string;
}

// ─── Social icons ────────────────────────────────────────────────────────────

const DiscordIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.056a19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const AppleIcon = () => (
  <svg className="w-4 h-4 text-foreground" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

export function AuthForm({ className }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname || "/dashboard-v2";

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    try {
      const res = await apiLogin(email, password);
      setAuth(res.token, res.user);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-background ${className ?? ""}`}>

      {/* Smoke background */}
      <div className="absolute inset-0 opacity-40">
        <SmokeBackground smokeColor="#0080FF" />
      </div>

      {/* Glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, delay: 0, ease: EASE_OUT }}
          className="absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full bg-primary/12 blur-[160px]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, delay: 0.15, ease: EASE_OUT }}
          className="absolute -right-20 top-1/3 h-[600px] w-[600px] rounded-full bg-accent/10 blur-[180px]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, delay: 0.3, ease: EASE_OUT }}
          className="absolute bottom-[-15%] left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/8 blur-[140px]"
        />
      </div>

      {/* Card */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-[400px]"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="rounded-2xl border border-border/40 bg-background/60 backdrop-blur-2xl shadow-[0_8px_40px_hsl(0_0%_0%/0.5)] px-8 pt-9 pb-8"
        >

          {/* Logo — links back to home */}
          <div className="flex flex-col items-center mb-7">
            <motion.div variants={itemVariants}>
              <Link to="/" className="mb-5 block transition-opacity hover:opacity-80">
                <motion.img
                  src="/logo.png"
                  alt="logo"
                  className="h-14 w-14 rounded-2xl object-contain shadow-[0_0_32px_hsl(210_100%_50%/0.35)]"
                  initial={{ rotate: -12, scale: 0.7, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.3, ease: EASE_OUT }}
                />
              </Link>
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-1.5"
            >
              Welcome back
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-sm text-muted-foreground text-center leading-relaxed"
            >
              Sign in to your trading dashboard
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <motion.div variants={itemVariants} className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  defaultValue="napaychristianpaolo@gmail.com"
                  required
                  className="w-full rounded-xl border border-border/50 bg-secondary/40 pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:bg-secondary/60 focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  defaultValue="qweqwe"
                  required
                  className="w-full rounded-xl border border-border/50 bg-secondary/40 pl-10 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:bg-secondary/60 focus:ring-1 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div variants={itemVariants} className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden rounded-xl py-3 text-sm font-semibold text-primary-foreground transition-all disabled:opacity-60 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-[0_0_24px_hsl(210_100%_50%/0.25)] hover:shadow-[0_0_32px_hsl(210_100%_50%/0.4)]"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  "Let's go →"
                )}
              </button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div variants={itemVariants} className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-[11px] text-muted-foreground/60 uppercase tracking-wider">or sign in with</span>
            <div className="flex-1 h-px bg-border/40" />
          </motion.div>

          {/* Social buttons */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-2">
            <button className="flex items-center justify-center gap-2 rounded-xl border border-border/40 bg-secondary/30 hover:bg-[#5865F2]/15 hover:border-[#5865F2]/40 py-2.5 text-xs font-medium text-muted-foreground hover:text-[#5865F2] transition-all">
              <DiscordIcon />
              Discord
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl border border-border/40 bg-secondary/30 hover:bg-secondary/60 hover:border-border/70 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-all">
              <GoogleIcon />
              Google
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl border border-border/40 bg-secondary/30 hover:bg-secondary/60 hover:border-border/70 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-all">
              <AppleIcon />
              Apple
            </button>
          </motion.div>

          {/* Register */}
          <motion.p
            variants={itemVariants}
            className="text-center text-xs text-muted-foreground mt-6"
          >
            New here?{" "}
            <Link to="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Create an account
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
