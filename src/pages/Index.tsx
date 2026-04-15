import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedBackground from "@/components/AnimatedBackground";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import BrokersCarousel from "@/components/BrokersCarousel";
import { FeatureSteps } from "@/components/blocks/feature-section";
import FeatureSection from "@/components/ui/stack-feature-section";
import { TestimonialCarousel } from "@/components/ui/profile-card-testimonial-carousel";
import { Mail, MessageCircle, Twitter } from "lucide-react";

const features = [
  { 
    step: 'Step 1', 
    title: 'Connect Your Broker',
    content: 'Seamlessly integrate with your preferred trading platform - IBKR, Binance, eToro, and more.', 
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
      <Navigation />
      <AnimatedBackground />
      
      <main className="relative z-10">
        <Hero />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand Section */}
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                Inner Circle
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                AI-powered trading signals for smarter investments. Get real-time alerts and make informed decisions.
              </p>
              <div className="flex gap-4">
                <a 
                  href="https://t.me/innercircle" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                  aria-label="Telegram"
                >
                  <MessageCircle className="w-5 h-5 text-primary group-hover:text-primary" />
                </a>
                <a 
                  href="https://twitter.com/innercircle" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5 text-primary group-hover:text-primary" />
                </a>
                <a 
                  href="mailto:support@innercircle.com" 
                  className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5 text-primary group-hover:text-primary" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold mb-4">Quick Links</h3>
              <div className="flex flex-col gap-3">
                <a href="/how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  How It Works
                </a>
                <a href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </a>
                <a href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </a>
                <a href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </a>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold mb-4">Legal</h3>
              <div className="flex flex-col gap-3">
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Cookie Policy
                </a>
                <a href="mailto:support@innercircle.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact Support
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border/50 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-muted-foreground text-sm text-center md:text-left">
                © 2025 Inner Circle. All rights reserved.
              </p>
              <p className="text-muted-foreground text-sm text-center md:text-right">
                Built with 💙 for traders worldwide
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
