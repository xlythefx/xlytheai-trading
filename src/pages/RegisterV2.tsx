import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  Gift,
  FileText,
  Shield,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { register as apiRegister, setAuth } from "@/lib/api";
import { SmokeBackground } from "@/components/ui/spooky-smoke-animation";
import { AffiliateVerificationForm } from "@/components/AffiliateVerificationForm";

// ─── Form types & constants ─────────────────────────────────────────────────

type FormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  referralCode: string;
};

const AGE_RANGES = ["Under 18", "18 – 24", "25 – 34", "35 – 44", "45+"] as const;
const EXPERIENCE_LEVELS = [
  { label: "Just starting out", sub: "I'm new to trading", value: "beginner" },
  { label: "Getting the hang of it", sub: "A few months in", value: "intermediate" },
  { label: "Been around a while", sub: "1–3 years of trading", value: "advanced" },
  { label: "Full-on trader", sub: "3+ years, I know my stuff", value: "expert" },
] as const;

const DISCORD_INVITE = "https://discord.gg/tPcKmPbgkb";

const steps = [
  { key: "tos",        title: "Terms of Service",        subtitle: "Please review and accept our terms." },
  { key: "privacy",    title: "Privacy Policy",           subtitle: "Please review and accept our privacy policy." },
  { key: "name",       title: "Hey, what's your name?",   subtitle: "We'll use this to personalise your dashboard." },
  { key: "age",        title: "How old are you?",          subtitle: "Just so we know who we're trading with." },
  { key: "experience", title: "How experienced are you?",  subtitle: "No judgment — everyone starts somewhere." },
  { key: "email",      title: "What's your email?",        subtitle: "You'll use this to sign in." },
  { key: "password",   title: "Create a password",         subtitle: "Make it strong. At least 6 characters." },
  { key: "affiliate",  title: "Affiliate Verification",    subtitle: "Verify your exchange signup to start receiving trades." },
  { key: "discord",    title: "Join our Discord",          subtitle: "Stay updated with the latest signals and announcements." },
] as const;

// ─── Shared classes ─────────────────────────────────────────────────────────

const inputWithIconCls =
  "w-full rounded-xl border border-border/50 bg-secondary/40 pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:bg-secondary/60 focus:ring-1 focus:ring-primary/20 transition-all";

// ─── Icons ──────────────────────────────────────────────────────────────────

const MailIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

// ─── Component ──────────────────────────────────────────────────────────────

const RegisterV2 = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Agreement checkboxes
  const [tosAccepted, setTosAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // Interactive-only fields
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [selectedExp, setSelectedExp] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validateStep = (): boolean => {
    if (step === 0 && !tosAccepted) {
      toast.error("Please accept the Terms of Service");
      return false;
    }
    if (step === 1 && !privacyAccepted) {
      toast.error("Please accept the Privacy Policy");
      return false;
    }
    if (step === 2 && form.name.trim().length < 2) {
      toast.error("Please enter your name");
      return false;
    }
    if (step === 5 && !/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error("Please enter a valid email");
      return false;
    }
    if (step === 6) {
      if (form.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return false;
      }
      if (form.password !== form.confirmPassword) {
        toast.error("Passwords do not match");
        return false;
      }
    }
    return true;
  };

  const next = async () => {
    if (!validateStep()) return;

    // After password step (step 6), create the account before moving to affiliate step
    if (step === 6) {
      await createAccount();
      return;
    }

    if (step < steps.length - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const back = () => {
    // Can't go back from affiliate or discord step (account already created)
    if (step >= 7) return;
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const createAccount = async () => {
    setIsLoading(true);
    try {
      const res = await apiRegister({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        referral_code: form.referralCode.trim() || undefined,
      });
      setAuth(res.token, res.user);
      toast.success("Account created!");
      setDirection(1);
      setStep(7);
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const goToDiscord = () => {
    setDirection(1);
    setStep(8);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (step >= 7) return; // Affiliate & discord steps have their own buttons
    if (e.key === "Enter") {
      e.preventDefault();
      next();
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
  };

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden bg-background">
      {/* Smoke */}
      <div className="absolute inset-0 opacity-40">
        <SmokeBackground smokeColor="#0080FF" />
      </div>

      {/* Glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full bg-primary/12 blur-[160px]" />
        <div className="absolute -right-20 top-1/3 h-[600px] w-[600px] rounded-full bg-accent/10 blur-[180px]" />
        <div className="absolute bottom-[-15%] left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/8 blur-[140px]" />
      </div>

      {/* Main card */}
      <div className="relative z-10 w-full max-w-[440px]">
        <div className="rounded-2xl border border-border/40 bg-background/60 backdrop-blur-2xl shadow-[0_8px_40px_hsl(0_0%_0%/0.5)] px-8 pt-8 pb-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Link to="/" className="transition-opacity hover:opacity-80">
              <img
                src="/logo.png"
                alt="logo"
                className="h-12 w-12 rounded-2xl object-contain shadow-[0_0_28px_hsl(210_100%_50%/0.3)]"
              />
            </Link>
          </div>

          {/* Progress */}
          <div className="mb-7">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">
                Step {step + 1} of {steps.length}
              </span>
              <span className="text-xs font-semibold text-primary">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Step content */}
          <div className={step >= 7 ? "min-h-[380px]" : "min-h-[220px]"} onKeyDown={onKeyDown}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={steps[step].key}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <h2 className="text-xl font-bold mb-1 text-foreground">
                  {steps[step].title}
                </h2>
                <p className="text-sm text-muted-foreground mb-5">
                  {steps[step].subtitle}
                </p>

                {/* Step 0 — Terms of Service */}
                {step === 0 && (
                  <div className="space-y-3">
                    <div className="max-h-48 overflow-y-auto rounded-xl border border-border/40 bg-secondary/30 p-3 text-sm text-muted-foreground space-y-3">
                      <p>
                        By creating an account you agree to our Terms of Service.
                        Trading involves substantial risk of loss. You are
                        responsible for any trades executed through connected
                        exchange accounts.
                      </p>
                      <p>
                        The platform provides signals and automation but does not
                        guarantee profits. You agree not to abuse the service,
                        reverse-engineer it, or use it for unlawful activity.
                      </p>
                      <p>
                        The Service is provided "AS IS" without warranties. Inner
                        Circle shall not be liable for any financial losses
                        arising from your use of the Service.
                      </p>
                    </div>
                    <Link
                      to="/terms"
                      target="_blank"
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Read full Terms of Service
                    </Link>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tosAccepted}
                        onChange={(e) => setTosAccepted(e.target.checked)}
                        className="w-4 h-4 rounded border-border/50 text-primary focus:ring-primary/20"
                      />
                      <span className="text-sm text-foreground">
                        I accept the Terms of Service
                      </span>
                    </label>
                  </div>
                )}

                {/* Step 1 — Privacy Policy */}
                {step === 1 && (
                  <div className="space-y-3">
                    <div className="max-h-48 overflow-y-auto rounded-xl border border-border/40 bg-secondary/30 p-3 text-sm text-muted-foreground space-y-3">
                      <p>
                        We collect your name, email, and exchange API keys
                        (encrypted with AES-256). We use this data to operate
                        the Service, authenticate your account, and execute
                        trading strategies.
                      </p>
                      <p>
                        We do not sell your personal information. Data is shared
                        only with service providers bound by confidentiality and
                        exchanges to execute your strategies.
                      </p>
                      <p>
                        You have the right to access, correct, or delete your
                        data at any time. API keys are deleted immediately upon
                        account termination.
                      </p>
                    </div>
                    <Link
                      to="/privacy"
                      target="_blank"
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      Read full Privacy Policy
                    </Link>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacyAccepted}
                        onChange={(e) => setPrivacyAccepted(e.target.checked)}
                        className="w-4 h-4 rounded border-border/50 text-primary focus:ring-primary/20"
                      />
                      <span className="text-sm text-foreground">
                        I accept the Privacy Policy
                      </span>
                    </label>
                  </div>
                )}

                {/* Step 2 — Name */}
                {step === 2 && (
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                      <UserIcon />
                    </span>
                    <input
                      autoFocus
                      type="text"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      className={inputWithIconCls}
                    />
                  </div>
                )}

                {/* Step 3 — Age */}
                {step === 3 && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {AGE_RANGES.map((range) => (
                      <button
                        key={range}
                        type="button"
                        onClick={() => setSelectedAge(range)}
                        className={`rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
                          selectedAge === range
                            ? "border-primary/60 bg-primary/15 text-primary shadow-[0_0_12px_hsl(210_100%_50%/0.2)]"
                            : "border-border/40 bg-secondary/30 text-muted-foreground hover:border-border/70 hover:text-foreground"
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 4 — Experience */}
                {step === 4 && (
                  <div className="space-y-2">
                    {EXPERIENCE_LEVELS.map((lvl) => (
                      <button
                        key={lvl.value}
                        type="button"
                        onClick={() => setSelectedExp(lvl.value)}
                        className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                          selectedExp === lvl.value
                            ? "border-primary/60 bg-primary/15 shadow-[0_0_12px_hsl(210_100%_50%/0.2)]"
                            : "border-border/40 bg-secondary/30 hover:border-border/70"
                        }`}
                      >
                        <div>
                          <p
                            className={`text-sm font-medium ${selectedExp === lvl.value ? "text-primary" : "text-foreground"}`}
                          >
                            {lvl.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {lvl.sub}
                          </p>
                        </div>
                        {selectedExp === lvl.value && (
                          <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 5 — Email */}
                {step === 5 && (
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                      <MailIcon />
                    </span>
                    <input
                      autoFocus
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      className={inputWithIconCls}
                    />
                  </div>
                )}

                {/* Step 6 — Password */}
                {step === 6 && (
                  <div className="space-y-3">
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                        <LockIcon />
                      </span>
                      <input
                        autoFocus
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        value={form.password}
                        onChange={(e) => update("password", e.target.value)}
                        className={`${inputWithIconCls} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                        <LockIcon />
                      </span>
                      <input
                        type={showConfirm ? "text" : "password"}
                        placeholder="Confirm password"
                        value={form.confirmPassword}
                        onChange={(e) =>
                          update("confirmPassword", e.target.value)
                        }
                        className={`${inputWithIconCls} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((s) => !s)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                      >
                        {showConfirm ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 7 — Affiliate Verification */}
                {step === 7 && (
                  <AffiliateVerificationForm
                    showSkip
                    onSkip={goToDiscord}
                    onSubmitted={goToDiscord}
                  />
                )}

                {/* Step 8 — Discord */}
                {step === 8 && (
                  <div className="space-y-5">
                    <div className="flex justify-center">
                      <img
                        src="/assets/discord.png"
                        alt="Discord"
                        className="w-16 h-16 rounded-2xl object-contain"
                      />
                    </div>

                    <div className="rounded-xl border border-border/40 bg-secondary/30 p-4 text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Get real-time signal alerts, strategy updates, and
                        connect with other traders in our community.
                      </p>
                    </div>

                    <a
                      href={DISCORD_INVITE}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#5865F2] hover:bg-[#4752C4] py-3 text-sm font-semibold text-white transition-colors shadow-[0_0_20px_rgba(88,101,242,0.3)]"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Join Discord Server
                    </a>

                    <button
                      type="button"
                      onClick={() => navigate("/dashboard-v2")}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent py-3 text-sm font-semibold text-white hover:opacity-90 shadow-[0_0_20px_hsl(210_100%_50%/0.2)] hover:shadow-[0_0_28px_hsl(210_100%_50%/0.35)] transition-all"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Go to Dashboard
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/dashboard-v2")}
                      className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                    >
                      Skip
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation (hidden on affiliate & discord steps — they have their own buttons) */}
          {step < 7 && (
            <div className="flex items-center justify-between mt-6 gap-3">
              <button
                type="button"
                onClick={back}
                disabled={step === 0 || isLoading}
                className="flex items-center gap-1.5 rounded-xl border border-border/40 bg-secondary/30 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <button
                type="button"
                onClick={next}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 shadow-[0_0_20px_hsl(210_100%_50%/0.2)] hover:shadow-[0_0_28px_hsl(210_100%_50%/0.35)] transition-all"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : step === 6 ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Create my account
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {step < 7 && (
            <p className="text-center text-xs text-muted-foreground mt-5">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterV2;
