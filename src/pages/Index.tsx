import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedBackground from "@/components/AnimatedBackground";
import { HeroSection } from "@/components/HeroSection";
import BrokersCarousel from "@/components/BrokersCarousel";
import { FeatureSteps } from "@/components/blocks/feature-section";
import FeatureSection from "@/components/ui/stack-feature-section";
import { TestimonialCarousel } from "@/components/ui/profile-card-testimonial-carousel";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    step: 'Step 1',
    title: 'Connect Your Broker',
    content: 'Seamlessly integrate with your preferred exchange — Binance, MEXC, Bybit, and more.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop'
  },
  { 
    step: 'Step 2',
    title: 'Set Your Parameters',
    content: 'Configure your trading signals, risk tolerance, and preferred trading pairs with our intuitive interface.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop'
  },
  { 
    step: 'Step 3',
    title: 'Start Trading',
    content: 'Receive real-time alerts and execute trades automatically with our AI-powered signal system.',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop'
  },
];

const Index = () => {
  const navigate = useNavigate();
  const ADMIN_CODE = "abc123xyz789def"; // 15-character admin code
  
  useEffect(() => {
    let keySequence = "";
    
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only track alphanumeric keys
      if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
        keySequence = (keySequence + e.key).slice(-9); // Keep last 8 chars to match "sudoadmin"
        
        if (keySequence === "sudoadmin") {
          navigate(`/admin/${ADMIN_CODE}/login`);
          keySequence = ""; // Reset after navigation
        }
      }
    };

    // Add listener to window for global context
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [navigate]);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <HeroSection />
      <AnimatedBackground />

      <main className="relative z-10">
        <FeatureSteps 
          features={features}
          title="Your Journey Starts Here"
          autoPlayInterval={4000}
          imageHeight="h-[500px]"
        />
        <FeatureSection />
        <BrokersCarousel />
        <TestimonialCarousel />
      </main>

      <footer className="relative z-10 border-t border-border/50 backdrop-blur-sm bg-gradient-to-r from-background via-background/95 to-background">
        <div className="container max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                Flowehn
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                AI-powered trading signals for smarter investments. Get real-time alerts and make informed decisions.
              </p>
              <div className="flex gap-3 flex-wrap">
                {/* Discord */}
                <a href="https://discord.gg/flowehn" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="Discord">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                  </svg>
                </a>
                {/* Instagram */}
                <a href="https://instagram.com/flowehn" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="Instagram">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                {/* Facebook */}
                <a href="https://facebook.com/flowehn" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="Facebook">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                {/* TikTok */}
                <a href="https://tiktok.com/@flowehn" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="TikTok">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
                  </svg>
                </a>
                {/* Gmail */}
                <a href="mailto:support@flowehn.com"
                  className="w-9 h-9 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="Email">
                  <Mail className="w-4 h-4 text-primary" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold mb-4">Quick Links</h3>
              <div className="flex flex-col gap-3">
                <a href="/how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors">How It Works</a>
                <a href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</a>
                <a href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</a>
                <a href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">Dashboard</a>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold mb-4">Legal</h3>
              <div className="flex flex-col gap-3">
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
                <Link to="/disclaimer" className="text-sm text-muted-foreground hover:text-primary transition-colors">Risk Disclaimer</Link>
                <a href="mailto:support@flowehn.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Support</a>
              </div>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-semibold mb-4">Company</h3>
              <div className="flex flex-col gap-3">
                <a
                  href="https://nap-ai.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Nap.AI Digital Solutions
                </a>
                <a href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">Our Team</a>
                <a href="/signals" className="text-sm text-muted-foreground hover:text-primary transition-colors">Live Signals</a>
                <a href="/marketplace" className="text-sm text-muted-foreground hover:text-primary transition-colors">Marketplace</a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border/50 pt-6">
            <p className="text-muted-foreground text-sm text-center">
              © 2025 Flowehn · Nap.AI Digital Solutions. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
