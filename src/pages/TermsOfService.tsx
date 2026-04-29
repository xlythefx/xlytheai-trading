import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { motion } from "framer-motion";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using the Flowehn platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not access or use the Service. These Terms apply to all visitors, users, and others who access the Service.`,
  },
  {
    title: "2. Description of Service",
    body: `Flowehn provides AI-powered trading signal automation and portfolio analytics tools that connect to third-party exchange accounts (e.g., Binance). The Service is provided for informational and automation purposes only. Flowehn does not manage funds, provide investment advice, or act as a licensed financial advisor.`,
  },
  {
    title: "3. Eligibility",
    body: `You must be at least 18 years of age to use the Service. By creating an account, you represent and warrant that you are 18 or older and have the legal capacity to enter into these Terms. The Service is not available in jurisdictions where such services are prohibited by law.`,
  },
  {
    title: "4. Account Registration",
    body: `You must register an account to access most features of the Service. You agree to provide accurate, current, and complete information during registration and to keep your account credentials confidential. You are solely responsible for all activity that occurs under your account. Notify us immediately at support@innercircle.com if you suspect unauthorized use.`,
  },
  {
    title: "5. API Key & Exchange Connection",
    body: `The Service requires you to provide API keys from supported exchanges (e.g., Binance). You are solely responsible for managing and securing your API keys. Flowehn stores API keys using industry-standard encryption but cannot guarantee absolute security. We strongly recommend using API keys with trading-only permissions and no withdrawal permissions. You may revoke API access at any time from your exchange settings.`,
  },
  {
    title: "6. Trading Risk Disclosure",
    body: `Cryptocurrency and derivatives trading involves substantial risk of loss. Past performance of signals or strategies is not indicative of future results. The Service provides signals and automation tools but does not guarantee profits. You are solely responsible for all trades executed through your connected exchange accounts. Never trade with funds you cannot afford to lose. Flowehn shall not be liable for any financial losses, whether direct or indirect, arising from your use of the Service.`,
  },
  {
    title: "7. Subscription & Payments",
    body: `Certain features of the Service are available on a paid subscription basis. Subscription fees are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law or as expressly stated in our refund policy. We reserve the right to change pricing with 30 days' notice. Failure to pay may result in suspension or termination of your account.`,
  },
  {
    title: "8. Prohibited Conduct",
    body: `You agree not to: (a) reverse-engineer, decompile, or disassemble any part of the Service; (b) use the Service for unlawful purposes or in violation of any applicable law; (c) share, resell, or sublicense access to the Service; (d) attempt to gain unauthorized access to any systems or networks related to the Service; (e) transmit any viruses, malware, or harmful code; (f) scrape, crawl, or systematically extract data from the Service without written permission.`,
  },
  {
    title: "9. Intellectual Property",
    body: `The Service and its original content, features, and functionality are and will remain the exclusive property of Flowehn and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without prior written consent. You are granted a limited, non-exclusive, non-transferable license to access and use the Service for personal, non-commercial purposes.`,
  },
  {
    title: "10. Privacy",
    body: `Your use of the Service is also governed by our Privacy Policy, incorporated herein by reference. By using the Service, you consent to the collection and use of your information as described in the Privacy Policy.`,
  },
  {
    title: "11. Termination",
    body: `We reserve the right to suspend or terminate your account and access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, third parties, or the integrity of the Service. Upon termination, your right to use the Service will immediately cease.`,
  },
  {
    title: "12. Disclaimer of Warranties",
    body: `The Service is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components.`,
  },
  {
    title: "13. Limitation of Liability",
    body: `To the maximum extent permitted by applicable law, Flowehn shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of (or inability to access or use) the Service.`,
  },
  {
    title: "14. Governing Law",
    body: `These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Flowehn is incorporated, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved through binding arbitration or in the courts of competent jurisdiction.`,
  },
  {
    title: "15. Changes to Terms",
    body: `We reserve the right to modify these Terms at any time. We will notify users of material changes via email or a prominent notice on the Service. Your continued use of the Service after such changes constitutes your acceptance of the new Terms. It is your responsibility to review these Terms periodically.`,
  },
  {
    title: "16. Contact",
    body: `If you have any questions about these Terms, please contact us at support@innercircle.com.`,
  },
];

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* Hero */}
      <div className="pt-28 pb-10 px-4">
        <div className="container max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6">
              Legal
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
              Terms of Service
            </h1>
            <p className="text-muted-foreground text-base">
              Last updated: April 15, 2025 &nbsp;·&nbsp; Effective immediately
            </p>
            <p className="mt-4 text-sm text-muted-foreground max-w-xl mx-auto">
              Please read these Terms carefully before using Flowehn. They govern your use of the platform and the services we provide.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="pb-20 px-4">
        <div className="container max-w-3xl mx-auto">
          <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm divide-y divide-border/30">
            {SECTIONS.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.03 }}
                className="px-6 py-6"
              >
                <h2 className="text-base font-semibold text-foreground mb-2">{section.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{section.body}</p>
              </motion.div>
            ))}
          </div>

          {/* Footer links */}
          <div className="mt-10 flex flex-wrap gap-4 items-center justify-center text-sm text-muted-foreground">
            <span>Have questions?</span>
            <a href="mailto:support@innercircle.com" className="text-primary hover:underline">
              support@innercircle.com
            </a>
            <span className="hidden md:inline">·</span>
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            <span className="hidden md:inline">·</span>
            <Link to="/" className="hover:text-foreground transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
