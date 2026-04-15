import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingUp, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import AOS from "aos";
import BotPerformanceChart from "@/components/BotPerformanceChart";

const Hero = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true, offset: 100 });
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  const titleVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 1,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  const gradientVariants = {
    hidden: { backgroundPosition: "0% 50%" },
    visible: {
      backgroundPosition: "100% 50%",
      transition: {
        duration: 3,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
        repeat: Infinity,
        repeatType: "reverse" as const,
      },
    },
  };

  const floatingVariants = {
    float: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
        repeat: Infinity,
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Simplified Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-40 h-40 rounded-full bg-accent/10 blur-2xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className="container max-w-7xl mx-auto z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 mb-4"
            >
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">AI-Powered Trading Signals</span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              variants={titleVariants}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[0.9] tracking-tight"
            >
              <motion.span
                className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_200%]"
                variants={gradientVariants}
                initial="hidden"
                animate="visible"
              >
                Inner Circle
              </motion.span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-muted-foreground mb-4 leading-relaxed font-light"
            >
              Real-time trading signals powered by{" "}
              <span className="text-primary font-semibold">advanced AI algorithms</span>
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="text-lg text-muted-foreground/80 mb-8 leading-relaxed"
            >
              Stay ahead of the market with precision alerts and automated strategies
            </motion.p>

            {/* Feature Pills */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-3 mb-8"
            >
              {[
                { icon: TrendingUp, text: "Real-time Signals" },
                { icon: Shield, text: "Secure & Reliable" },
                { icon: Zap, text: "Lightning Fast" },
              ].map((feature, index) => (
                <motion.div
                  key={feature.text}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm border border-border/50"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-2xl shadow-[0_0_40px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_60px_hsl(var(--primary)/0.6)] transition-all duration-300"
                >
                  Start Trading Now
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5 backdrop-blur-sm px-8 py-6 text-lg rounded-2xl transition-all duration-300"
                >
                  View Demo
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-6 pt-8 border-t border-border/20"
            >
              {[
                { number: "10K+", label: "Active Traders" },
                { number: "99.9%", label: "Uptime" },
                { number: "0.1s", label: "Signal Speed" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                    {stat.number}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Nap.AI Bot Performance Chart */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative w-full lg:w-[600px] xl:w-[700px]"
          >
            <BotPerformanceChart />
          </motion.div>
        </div>
      </div>

      {/* Simplified Floating Elements */}
      <motion.div
        className="absolute top-1/4 left-10 w-2 h-2 rounded-full bg-primary/40"
        animate={{
          y: [0, -10, 0],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/3 right-16 w-1 h-1 rounded-full bg-accent/40"
        animate={{
          y: [0, -8, 0],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </section>
  );
};

export default Hero;
