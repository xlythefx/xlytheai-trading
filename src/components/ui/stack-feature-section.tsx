"use client";

import { Button } from "@/components/ui/button";
import { getToken } from "@/lib/api";
import { Link } from "react-router-dom";
import {
  Brain,
  Target,
  Zap,
  TrendingUp,
  BarChart3,
  Shield,
  Clock,
  DollarSign,
  Activity,
  PieChart,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

const iconConfigs = [
  { Icon: Brain, color: "#3B82F6", label: "AI Analysis" },
  { Icon: Target, color: "#10B981", label: "Precision" },
  { Icon: Zap, color: "#F59E0B", label: "Speed" },
  { Icon: TrendingUp, color: "#EF4444", label: "Growth" },
  { Icon: BarChart3, color: "#8B5CF6", label: "Analytics" },
  { Icon: Shield, color: "#06B6D4", label: "Security" },
  { Icon: Clock, color: "#84CC16", label: "Real-time" },
  { Icon: DollarSign, color: "#F97316", label: "Profit" },
  { Icon: Activity, color: "#EC4899", label: "Activity" },
  { Icon: PieChart, color: "#6366F1", label: "Data" },
  { Icon: Brain, color: "#14B8A6", label: "Smart" },
  { Icon: Target, color: "#F43F5E", label: "Accuracy" },
];

export default function FeatureSection() {
  const orbitCount = 3;
  const orbitGap = 8; // rem between orbits
  const iconsPerOrbit = Math.ceil(iconConfigs.length / orbitCount);
  const startTradingTo = getToken() ? "/dashboard-v2" : "/login";

  return (
    <section className="relative max-w-7xl mx-auto my-24 px-4 flex items-center justify-between min-h-[30rem] overflow-hidden">
      {/* Left side: Heading and Text */}
      <div className="w-1/2 z-10 pr-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Powered by Innovation
            </span>
          </h2>
          
          <p className="text-muted-foreground mb-8 max-w-lg text-lg leading-relaxed">
            Our cutting-edge AI technology combines machine learning, real-time data analysis, 
            and advanced algorithms to deliver unparalleled trading insights and opportunities.
          </p>
          
          <div className="flex items-center gap-4">
            <Link to={startTradingTo}>
              <Button size="lg" className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-2xl shadow-[0_0_40px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_60px_hsl(var(--primary)/0.6)] transition-all duration-300">
                Start Trading Now
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5 backdrop-blur-sm px-8 py-6 text-lg rounded-2xl transition-all duration-300">
                Learn More
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right side: Orbit animation */}
      <div className="relative w-1/2 h-full flex items-center justify-center overflow-hidden">
        <motion.div 
          className="relative w-[40rem] h-[40rem] flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          viewport={{ once: true }}
        >
          {/* Center Circle */}
          <motion.div 
            className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm border border-primary/30 shadow-2xl flex items-center justify-center"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <Brain className="w-12 h-12 text-primary" />
          </motion.div>

          {/* Generate Orbits */}
          {[...Array(orbitCount)].map((_, orbitIdx) => {
            const size = `${12 + orbitGap * (orbitIdx + 1)}rem`;
            const angleStep = (2 * Math.PI) / iconsPerOrbit;
            const speed = 12 + orbitIdx * 6;

            return (
              <motion.div
                key={orbitIdx}
                className="absolute rounded-full border-2 border-dotted border-primary/20"
                style={{
                  width: size,
                  height: size,
                }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: speed,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                {iconConfigs
                  .slice(orbitIdx * iconsPerOrbit, orbitIdx * iconsPerOrbit + iconsPerOrbit)
                  .map((cfg, iconIdx) => {
                    const angle = iconIdx * angleStep;
                    const x = 50 + 50 * Math.cos(angle);
                    const y = 50 + 50 * Math.sin(angle);

                    return (
                      <motion.div
                        key={iconIdx}
                        className="absolute bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-lg border border-primary/20"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                        whileHover={{ 
                          scale: 1.2, 
                          rotate: [0, -10, 10, 0],
                          transition: { duration: 0.3 }
                        }}
                        animate={{
                          y: [0, -5, 0],
                        }}
                        transition={{
                          y: { duration: 2 + iconIdx * 0.2, repeat: Infinity, ease: "easeInOut" }
                        }}
                      >
                        <cfg.Icon 
                          className="w-6 h-6" 
                          style={{ color: cfg.color }} 
                        />
                      </motion.div>
                    );
                  })}
              </motion.div>
            );
          })}

          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary/30"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Simplified background decorative elements */}
      <motion.div
        className="absolute top-10 right-10 w-24 h-24 rounded-full bg-primary/5 blur-2xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </section>
  );
}
