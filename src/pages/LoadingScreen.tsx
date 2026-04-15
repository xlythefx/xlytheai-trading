import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";

const LoadingScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate("/dashboard", { replace: true }), 2200);
    return () => clearTimeout(t);
  }, [navigate]);

  const bars = Array.from({ length: 5 });

  return (
    <motion.div
      className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-8 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo pulse */}
      <motion.div
        className="relative"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <motion.div
          className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl"
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
          <Brain className="w-10 h-10 text-white" />
        </div>
      </motion.div>

      {/* Text */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-1">
          Inner Circle
        </h2>
        <p className="text-sm text-muted-foreground">Loading your dashboard…</p>
      </motion.div>

      {/* Animated bars */}
      <div className="flex items-end gap-1.5 h-10">
        {bars.map((_, i) => (
          <motion.div
            key={i}
            className="w-2 rounded-full bg-primary"
            animate={{ height: ["8px", "32px", "8px"] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.12,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
