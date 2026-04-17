import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Radio, Store, Gift, Menu, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Lightning WebGL Background ──────────────────────────────────────────────

interface LightningProps {
  hue?: number;
  xOffset?: number;
  speed?: number;
  intensity?: number;
  size?: number;
}

const Lightning = ({
  hue = 210,
  xOffset = 0,
  speed = 1,
  intensity = 1,
  size = 1,
}: LightningProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const vertexShaderSource = `
      attribute vec2 aPosition;
      void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform float uHue;
      uniform float uXOffset;
      uniform float uSpeed;
      uniform float uIntensity;
      uniform float uSize;

      #define OCTAVE_COUNT 10

      vec3 hsv2rgb(vec3 c) {
        vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
        return c.z * mix(vec3(1.0), rgb, c.y);
      }

      float hash12(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * .1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
      }

      float hash11(float p) {
        p = fract(p * .1031);
        p *= p + 33.33;
        p *= p + p;
        return fract(p);
      }

      mat2 rotate2d(float theta) {
        float c = cos(theta); float s = sin(theta);
        return mat2(c, -s, s, c);
      }

      float noise(vec2 p) {
        vec2 ip = floor(p); vec2 fp = fract(p);
        float a = hash12(ip);
        float b = hash12(ip + vec2(1.0, 0.0));
        float c = hash12(ip + vec2(0.0, 1.0));
        float d = hash12(ip + vec2(1.0, 1.0));
        vec2 t = smoothstep(0.0, 1.0, fp);
        return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
      }

      float fbm(vec2 p) {
        float value = 0.0; float amplitude = 0.5;
        for (int i = 0; i < OCTAVE_COUNT; ++i) {
          value += amplitude * noise(p);
          p *= rotate2d(0.45); p *= 2.0; amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / iResolution.xy;
        uv = 2.0 * uv - 1.0;
        uv.x *= iResolution.x / iResolution.y;
        uv.x += uXOffset;
        uv += 2.0 * fbm(uv * uSize + 0.8 * iTime * uSpeed) - 1.0;
        float dist = abs(uv.x);
        vec3 baseColor = hsv2rgb(vec3(uHue / 360.0, 0.7, 0.8));
        vec3 col = baseColor * pow(mix(0.0, 0.07, hash11(iTime * uSpeed)) / dist, 1.0) * uIntensity;
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const compile = (src: string, type: number) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; }
      return s;
    };

    const vs = compile(vertexShaderSource, gl.VERTEX_SHADER);
    const fs = compile(fragmentShaderSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPosition");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const loc = {
      res: gl.getUniformLocation(prog, "iResolution"),
      time: gl.getUniformLocation(prog, "iTime"),
      hue: gl.getUniformLocation(prog, "uHue"),
      xOff: gl.getUniformLocation(prog, "uXOffset"),
      spd: gl.getUniformLocation(prog, "uSpeed"),
      int: gl.getUniformLocation(prog, "uIntensity"),
      sz: gl.getUniformLocation(prog, "uSize"),
    };

    const t0 = performance.now();
    let raf: number;
    const render = () => {
      resizeCanvas();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(loc.res, canvas.width, canvas.height);
      gl.uniform1f(loc.time, (performance.now() - t0) / 1000);
      gl.uniform1f(loc.hue, hue);
      gl.uniform1f(loc.xOff, xOffset);
      gl.uniform1f(loc.spd, speed);
      gl.uniform1f(loc.int, intensity);
      gl.uniform1f(loc.sz, size);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [hue, xOffset, speed, intensity, size]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

// ─── Floating Feature Items ──────────────────────────────────────────────────

const FeatureItem = ({ name, value, position }: { name: string; value: string; position?: string }) => (
  <div className={`${position ?? ""} group transition-all duration-300 hover:scale-110`}>
    <div className="flex items-center gap-2.5 relative">
      <div className="relative shrink-0">
        <div className="w-2 h-2 bg-white rounded-full group-hover:animate-pulse" />
        <div className="absolute -inset-1 bg-white/20 rounded-full blur-sm opacity-70 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="text-white relative">
        <div className="font-semibold text-sm leading-tight">{name}</div>
        <div className="text-white/50 text-xs mt-0.5">{value}</div>
        <div className="absolute -inset-2 bg-white/5 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
      </div>
    </div>
  </div>
);

// ─── Floating Navbar ─────────────────────────────────────────────────────────

const NAV_LINKS = [
  { to: "/signals", label: "Live Signals", icon: Radio },
  { to: "/marketplace", label: "Marketplace", icon: Store },
  { to: "/about", label: "About" },
  { to: "/pricing", label: "Pricing" },
  { to: "/how-it-works", label: "How it works" },
];

const FloatingNav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-4 inset-x-0 mx-auto z-50 w-[92%] max-w-5xl"
      >
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/50 backdrop-blur-2xl px-5 py-3">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5">
            <motion.img
              src="/logo.png"
              alt="Inner Circle"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="h-8 w-8 rounded-lg object-contain shadow-[0_0_18px_hsl(210_100%_50%/0.35)]"
            />
            <span className="text-lg font-bold tracking-tight text-white">Inner Circle</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Link to="/register" className="hidden md:block">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-full gap-2 text-sm shadow-[0_0_20px_hsl(210_100%_50%/0.3)]">
                  <Gift className="w-3.5 h-3.5" />
                  Referral Program
                </Button>
              </motion.div>
            </Link>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <button
              className="absolute top-6 right-6 p-2 text-white/70 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center gap-5">
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className="text-lg text-white/80 hover:text-white transition-colors"
                >
                  {label}
                </Link>
              ))}
              <Link to="/register" onClick={() => setMobileOpen(false)}>
                <Button className="bg-primary hover:bg-primary/90 rounded-full px-8 gap-2 mt-2">
                  <Gift className="w-4 h-4" /> Referral Program
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── Main HeroSection ────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export const HeroSection = () => {
  return (
    <div className="relative w-full bg-black text-white overflow-hidden">
      <FloatingNav />

      {/* Full-screen container — hero text centered, feature labels on the sides */}
      <div className="relative z-20 min-h-screen flex items-center justify-center px-4">

        {/* Feature labels — absolutely placed left side */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="hidden lg:flex flex-col gap-16 absolute left-[16%] xl:left-[22%] top-1/2 -translate-y-1/2 z-30"
        >
          <motion.div variants={itemVariants}>
            <FeatureItem name="AI Signals" value="real-time alerts" position="" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <FeatureItem name="Multi-Exchange" value="Binance & more" position="" />
          </motion.div>
        </motion.div>

        {/* Feature labels — absolutely placed right side */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="hidden lg:flex flex-col gap-16 absolute right-[16%] xl:right-[22%] top-1/2 -translate-y-1/2 z-30"
        >
          <motion.div variants={itemVariants}>
            <FeatureItem name="Auto Execution" value="hands-free" position="" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <FeatureItem name="Risk Control" value="built-in" position="" />
          </motion.div>
        </motion.div>

        {/* Hero content — centered */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-30 flex flex-col items-center text-center max-w-2xl mx-auto"
        >
          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="text-6xl sm:text-7xl md:text-8xl font-bold leading-[0.95] tracking-tight"
          >
            Xlythe
          </motion.h1>

          {/* Subtitle */}
          <motion.h2
            variants={itemVariants}
            className="mt-4 text-2xl sm:text-3xl font-light bg-gradient-to-r from-[hsl(210,100%,65%)] via-[hsl(260,80%,70%)] to-[hsl(280,80%,65%)] bg-clip-text text-transparent"
          >
            Smarter Trading, Automated
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="mt-5 text-base text-white/40 max-w-md leading-relaxed"
          >
            Real-time signals powered by advanced AI. Connect your exchange, set your strategy, and let automation handle the rest.
          </motion.p>

          {/* CTA */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Link to="/register">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-full px-8 py-6 text-base gap-2 shadow-[0_0_40px_hsl(210_100%_50%/0.4)] hover:shadow-[0_0_60px_hsl(210_100%_50%/0.6)] transition-all">
                  <Zap className="w-4 h-4" />
                  Start Trading Now
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </Link>
            <Link to="/login">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-base border-white/20 hover:border-white/40 hover:bg-white/5 text-white transition-all">
                  Sign In
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Background layers ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0 z-0"
      >
        {/* Base dark — minimal overlay so lightning reads clearly */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/1" />

        {/* Glow orb — boosted for stronger center light */}
        <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[980px] h-[980px] rounded-full bg-gradient-to-b from-[hsl(210,100%,55%,0.35)] via-[hsl(220,95%,45%,0.24)] to-[hsl(280,80%,60%,0.16)] blur-3xl" />

        {/* Lightning beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full mix-blend-screen opacity-95">
          <Lightning hue={210} xOffset={0} speed={1.5} intensity={2.1} size={2.2} />
        </div>

        {/* Planet / sphere — positioned so its top edge peeks into the content area */}
        <div className="z-10 absolute top-[48%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-full backdrop-blur-3xl bg-[radial-gradient(circle_at_30%_82%,_hsl(210,95%,42%)_8%,_hsl(218,80%,20%)_38%,_rgba(0,0,0,0.88)_72%,_rgba(0,0,0,0.95)_100%)] shadow-[0_-30px_120px_hsl(210_100%_55%/0.35)]" />
      </motion.div>
    </div>
  );
};

export default HeroSection;
