import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { motion } from "framer-motion";

type PolicySection = {
  title: string;
  body?: string;
  subsections?: { label: string; text: string }[];
  list?: string[];
  after?: string;
};

const SECTIONS: PolicySection[] = [
  {
    title: "1. Introduction",
    body: `Inner Circle ("we", "our", or "us") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. By using the Service, you consent to the practices described in this Policy.`,
  },
  {
    title: "2. Information We Collect",
    subsections: [
      {
        label: "Account Information",
        text: "When you register, we collect your name, email address, and password (stored as a hashed value). We never store your plain-text password.",
      },
      {
        label: "Exchange API Keys",
        text: "If you connect a cryptocurrency exchange, we store your API keys using AES-256 encryption at rest. We only request the minimum permissions needed to read balances and execute trades on your behalf.",
      },
      {
        label: "Usage Data",
        text: "We automatically collect information about how you interact with the Service, including IP address, browser type, pages visited, time spent, and referring URLs.",
      },
      {
        label: "Device Information",
        text: "We may collect device identifiers, operating system version, and mobile network information to improve compatibility and security.",
      },
      {
        label: "Communications",
        text: "If you contact support, we retain the content of those communications to resolve your inquiry and improve our services.",
      },
    ],
  },
  {
    title: "3. How We Use Your Information",
    list: [
      "Provide, operate, and maintain the Service",
      "Process transactions and send related information",
      "Authenticate and authorize access to your account",
      "Execute automated trading strategies on your behalf",
      "Send administrative emails, updates, and security alerts",
      "Respond to support requests and troubleshoot issues",
      "Analyze usage trends to improve the Service",
      "Comply with legal obligations and enforce our Terms",
    ],
  },
  {
    title: "4. Sharing of Information",
    body: `We do not sell, trade, or rent your personal information to third parties. We may share information with:`,
    list: [
      "Service providers who assist in operating the Service (e.g., cloud hosting, analytics) — bound by confidentiality agreements",
      "Cryptocurrency exchanges (e.g., Binance) only to the extent necessary to execute your configured strategies",
      "Law enforcement or government agencies when required by applicable law or valid legal process",
      "Successors in the event of a merger, acquisition, or sale of assets — you will be notified via email",
    ],
  },
  {
    title: "5. Data Retention",
    body: `We retain your personal data for as long as your account is active or as needed to provide the Service. If you delete your account, we will delete or anonymize your personal data within 30 days, except where retention is required by law. API keys are deleted immediately upon account termination or disconnection of an exchange.`,
  },
  {
    title: "6. Security",
    body: `We implement industry-standard security measures including TLS encryption in transit, AES-256 encryption at rest for sensitive fields, hashed passwords using bcrypt, and regular security audits. However, no method of transmission over the Internet is 100% secure. You are responsible for maintaining the confidentiality of your login credentials.`,
  },
  {
    title: "7. Cookies & Tracking Technologies",
    body: `We use cookies and similar tracking technologies to maintain your session, remember your preferences, and collect analytics. You can control cookies through your browser settings. Disabling cookies may affect certain features of the Service. We use first-party analytics only and do not use advertising cookies.`,
  },
  {
    title: "8. Your Rights",
    body: `Depending on your jurisdiction, you may have the following rights regarding your personal data:`,
    list: [
      "Access: Request a copy of the personal data we hold about you",
      "Correction: Request correction of inaccurate or incomplete data",
      "Deletion: Request deletion of your personal data (\"right to be forgotten\")",
      "Portability: Request your data in a machine-readable format",
      "Restriction: Request that we limit how we process your data",
      "Objection: Object to processing based on legitimate interests",
    ],
    after: `To exercise any of these rights, contact us at support@innercircle.com. We will respond within 30 days.`,
  },
  {
    title: "9. Children's Privacy",
    body: `The Service is not directed to individuals under 18 years of age. We do not knowingly collect personal information from children. If we learn that we have collected information from a child under 18, we will promptly delete it. If you believe we have inadvertently collected such information, please contact us immediately.`,
  },
  {
    title: "10. International Data Transfers",
    body: `Your information may be transferred to and processed in countries other than your own. We ensure that any cross-border transfers comply with applicable data protection laws and implement appropriate safeguards such as standard contractual clauses.`,
  },
  {
    title: "11. Third-Party Links",
    body: `The Service may contain links to third-party websites. We are not responsible for the privacy practices of those websites. We encourage you to review the privacy policies of any third-party sites you visit.`,
  },
  {
    title: "12. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of the Service after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: "13. Contact Us",
    body: `If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our privacy team at: support@innercircle.com`,
  },
];

const PrivacyPolicy = () => {
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
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-base">
              Last updated: April 15, 2025 &nbsp;·&nbsp; Effective immediately
            </p>
            <p className="mt-4 text-sm text-muted-foreground max-w-xl mx-auto">
              We take your privacy seriously. This policy explains exactly what data we collect, how we use it, and how you can control it.
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
                <h2 className="text-base font-semibold text-foreground mb-3">{section.title}</h2>

                {section.body && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{section.body}</p>
                )}

                {section.subsections && (
                  <div className="space-y-3 mt-2">
                    {section.subsections.map((sub) => (
                      <div key={sub.label} className="rounded-xl border border-border/30 bg-secondary/20 px-4 py-3">
                        <p className="text-xs font-semibold text-foreground mb-1">{sub.label}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{sub.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {section.list && (
                  <ul className="mt-2 space-y-1.5">
                    {section.list.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {section.after && (
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{section.after}</p>
                )}
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
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
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

export default PrivacyPolicy;
