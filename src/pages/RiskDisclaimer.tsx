import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const SECTIONS = [
  {
    title: "No Guaranteed Profits",
    body: `Flowehn provides AI-generated trading signals and automation tools. We do not guarantee profits, specific returns, or any particular outcome from using our platform. Any signals, predictions, or performance data shown on the platform are for informational purposes only and do not constitute a promise or assurance of future results. Your actual results may differ materially from any projected or historical performance displayed.`,
  },
  {
    title: "Trading Involves Substantial Risk",
    body: `Cryptocurrency trading and derivatives trading carry a high level of risk and may not be suitable for all investors. The value of cryptocurrencies can fluctuate significantly in a very short time. You may lose all or more of your initial investment. Only trade with capital you can afford to lose entirely. Before trading, carefully consider your investment objectives, experience level, and risk tolerance.`,
  },
  {
    title: "Not Financial Advice",
    body: `Nothing on the Flowehn platform, including signals, market analysis, strategy descriptions, educational content, or any other material, constitutes financial, investment, legal, or tax advice. Flowehn is not a licensed financial advisor, broker, dealer, or investment company. We strongly recommend consulting a qualified financial professional before making any investment decisions.`,
  },
  {
    title: "Past Performance Does Not Predict Future Results",
    body: `Any historical performance data, backtested results, win rates, or signal accuracy statistics presented on Flowehn reflect past performance under specific market conditions. Past performance is not indicative of future results. Market conditions change constantly and strategies that worked in the past may not work in the future.`,
  },
  {
    title: "Automated Trading Risks",
    body: `Automated trading systems, including those facilitated by Flowehn, carry additional risks such as software bugs, connectivity failures, exchange outages, and unexpected market behavior. Orders may be executed at prices different from expected, may fail to execute, or may execute at a loss. You are solely responsible for monitoring your connected accounts and for any trades executed through automated systems.`,
  },
  {
    title: "Exchange & Third-Party Risk",
    body: `Flowehn connects to third-party cryptocurrency exchanges via API. We are not responsible for the actions, decisions, outages, security breaches, or insolvency of any exchange or third-party service. Funds held on exchanges are subject to the risks associated with those platforms, including but not limited to hacks, regulatory action, and insolvency.`,
  },
  {
    title: "Regulatory Risk",
    body: `Cryptocurrency trading and related services are subject to varying regulations across different jurisdictions. It is your responsibility to ensure that your use of Flowehn complies with the laws and regulations applicable in your country or region. Flowehn does not represent that its services are appropriate or available for use in all jurisdictions.`,
  },
  {
    title: "Assumption of Risk",
    body: `By using Flowehn, you acknowledge that you have read and understood this Risk Disclaimer, that you accept all risks associated with cryptocurrency trading and automated trading systems, and that you will not hold Flowehn, its founders, employees, affiliates, or partners liable for any financial losses, damages, or claims arising from your use of the platform.`,
  },
];

const RiskDisclaimer = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <div className="pt-28 pb-10 px-4">
        <div className="container max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-400 mb-6">
              <AlertTriangle className="w-3.5 h-3.5" />
              Important Notice
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
              Risk Disclaimer
            </h1>
            <p className="text-muted-foreground text-base">
              Last updated: April 29, 2026
            </p>
            <p className="mt-4 text-sm text-muted-foreground max-w-xl mx-auto">
              Please read this disclaimer carefully. Cryptocurrency and automated trading carry significant financial risk. No profit is guaranteed.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="pb-20 px-4">
        <div className="container max-w-3xl mx-auto">
          {/* Warning banner */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-4"
          >
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-300/80 leading-relaxed">
              <strong className="text-amber-300">Trading is not suitable for everyone.</strong> You may lose some or all of your invested capital. Never invest money you cannot afford to lose. Flowehn provides tools and signals — not a guarantee of income or profit.
            </p>
          </motion.div>

          <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm divide-y divide-border/30">
            {SECTIONS.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                className="px-6 py-6"
              >
                <h2 className="text-base font-semibold text-foreground mb-2">{section.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{section.body}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-4 items-center justify-center text-sm text-muted-foreground">
            <span>Questions?</span>
            <a href="mailto:support@innercircle.com" className="text-primary hover:underline">
              support@innercircle.com
            </a>
            <span className="hidden md:inline">·</span>
            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
            <span className="hidden md:inline">·</span>
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            <span className="hidden md:inline">·</span>
            <Link to="/" className="hover:text-foreground transition-colors">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskDisclaimer;
