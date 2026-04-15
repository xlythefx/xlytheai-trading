import { Search, Cpu, Bell, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Market Scanning",
    description: "Our AI continuously scans multiple markets 24/7, analyzing thousands of data points per second."
  },
  {
    icon: Cpu,
    title: "AI Analysis",
    description: "Advanced algorithms process market data, identifying high-probability trading opportunities."
  },
  {
    icon: Bell,
    title: "Instant Alerts",
    description: "Receive real-time notifications with detailed entry, exit, and stop-loss recommendations."
  },
  {
    icon: TrendingUp,
    title: "Execute & Profit",
    description: "Execute trades manually or enable auto-trading to capitalize on opportunities instantly."
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="relative py-24 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to automated trading success
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}
              
              {/* Step number */}
              <div className="relative inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm border border-primary/30 mb-6 mx-auto group hover:scale-110 transition-transform">
                <div className="absolute inset-2 rounded-full bg-background/50" />
                <step.icon className="w-12 h-12 text-primary relative z-10" />
                <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-[0_0_20px_hsl(var(--primary)/0.5)]">
                  {index + 1}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {step.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
