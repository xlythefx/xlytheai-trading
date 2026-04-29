import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTA = () => {
  return (
    <section className="relative py-24 px-4">
      <div className="container max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 mb-6">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-foreground font-medium">Limited Time Offer</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Start Your Trading Journey
          </span>
        </h2>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Join 10,000+ traders who are already profiting with Flowehn. 
          Get started today with our 7-day free trial - no credit card required.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="group bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-7 text-lg rounded-xl shadow-[0_0_30px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_50px_hsl(var(--primary)/0.5)] transition-all"
          >
            Get Started Free
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            size="lg" 
            variant="outline"
            className="border-border hover:bg-secondary/50 backdrop-blur-sm px-10 py-7 text-lg rounded-xl"
          >
            Schedule Demo
          </Button>
        </div>

        <div className="mt-10 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>7-day free trial</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
