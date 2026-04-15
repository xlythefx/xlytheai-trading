import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Zap } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex items-center gap-1">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Inner Circle
                </span>
              </motion.div>
            </div>
            
            <motion.div
              className="ml-1"
              animate={{ 
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
          </Link>
          
          <div className="flex items-center gap-8">
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <Link to="/about" className="text-sm text-foreground hover:text-primary transition-colors">
                About
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <Link to="/pricing" className="text-sm text-foreground hover:text-primary transition-colors">
                Pricing
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <Link to="/how-it-works" className="text-sm text-foreground hover:text-primary transition-colors">
                How it works
              </Link>
            </motion.div>
            <Link to="/login">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="sm" className="bg-primary hover:bg-primary/90 gap-2">
                  <Zap className="w-4 h-4" />
                  Start Trading
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
