import { Brain, Zap, Shield, TrendingUp, Bell, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Advanced machine learning algorithms analyze market patterns in real-time for accurate predictions."
  },
  {
    icon: Zap,
    title: "Lightning Fast Alerts",
    description: "Receive instant notifications the moment profitable opportunities arise in the market."
  },
  {
    icon: Shield,
    title: "Risk Management",
    description: "Built-in risk management tools protect your capital with smart stop-loss strategies."
  },
  {
    icon: TrendingUp,
    title: "High Win Rate",
    description: "Proven track record with 98.5% accuracy in signal predictions across multiple markets."
  },
  {
    icon: Bell,
    title: "Multi-Channel Alerts",
    description: "Get notified via Telegram, email, or mobile push notifications - never miss a trade."
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track your trading performance with detailed analytics and insights dashboard."
  }
];

const Features = () => {
  return (
    <section className="relative py-24 px-4">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to succeed in modern trading, powered by cutting-edge technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl bg-gradient-card backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[0_8px_30px_hsl(var(--primary)/0.2)] animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
