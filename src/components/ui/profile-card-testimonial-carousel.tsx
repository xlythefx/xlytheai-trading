"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  Twitter,
  Youtube,
  Linkedin,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Testimonial {
  name: string;
  title: string;
  description: string;
  imageUrl: string;
  rating: number;
  githubUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Michael Chen",
    title: "Senior Software Engineer, Cloud Infrastructure",
    description:
      "Flowehn has completely transformed my trading approach. The AI-powered signals are incredibly accurate and the real-time alerts have helped me make profitable decisions consistently. The platform is intuitive and the support team is exceptional.",
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1689977807477-a579eda91fa2?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 5,
    githubUrl: "#",
    twitterUrl: "#",
    youtubeUrl: "#",
    linkedinUrl: "#",
  },
  {
    name: "Jessica Roberts",
    title: "Lead Data Scientist, InsightX",
    description:
      "The precision of Flowehn' signals is remarkable. As a data scientist, I appreciate the sophisticated algorithms behind the platform. It's helped me achieve consistent returns while managing risk effectively. Highly recommended for serious traders.",
    imageUrl:
      "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=600&q=80",
    rating: 5,
    githubUrl: "#",
    twitterUrl: "#",
    youtubeUrl: "#",
    linkedinUrl: "#",
  },
  {
    name: "William Carter",
    title: "VP Product, NovaLabs",
    description:
      "Flowehn has been a game-changer for our trading operations. The AI analysis is incredibly sophisticated and the execution speed is unmatched. We've seen significant improvements in our trading performance since implementing their signals.",
    imageUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80",
    rating: 5,
    githubUrl: "#",
    twitterUrl: "#",
    youtubeUrl: "#",
    linkedinUrl: "#",
  },
  {
    name: "Sarah Johnson",
    title: "Independent Trader",
    description:
      "I've tried many trading signal services, but Flowehn stands out. The accuracy of their predictions and the quality of their analysis is outstanding. The platform is user-friendly and the customer support is top-notch. Worth every penny!",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=600&q=80",
    rating: 5,
    githubUrl: "#",
    twitterUrl: "#",
    youtubeUrl: "#",
    linkedinUrl: "#",
  },
  {
    name: "David Kim",
    title: "Hedge Fund Manager",
    description:
      "Flowehn provides institutional-grade trading signals at an accessible price point. The AI technology is cutting-edge and the results speak for themselves. Our fund has seen a 40% improvement in trading performance since using their platform.",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    rating: 5,
    githubUrl: "#",
    twitterUrl: "#",
    youtubeUrl: "#",
    linkedinUrl: "#",
  },
];

export interface TestimonialCarouselProps {
  className?: string;
}

export function TestimonialCarousel({ className }: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () =>
    setCurrentIndex((index) => (index + 1) % testimonials.length);
  const handlePrevious = () =>
    setCurrentIndex(
      (index) => (index - 1 + testimonials.length) % testimonials.length
    );

  const currentTestimonial = testimonials[currentIndex];

  const socialIcons = [
    { icon: Github, url: currentTestimonial.githubUrl, label: "GitHub" },
    { icon: Twitter, url: currentTestimonial.twitterUrl, label: "Twitter" },
    { icon: Youtube, url: currentTestimonial.youtubeUrl, label: "YouTube" },
    { icon: Linkedin, url: currentTestimonial.linkedinUrl, label: "LinkedIn" },
  ];

  return (
    <section className={cn("w-full py-24 px-4", className)}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 mb-6"
          >
            <Star className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Client Testimonials</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              What Our Traders Say
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Join thousands of successful traders who trust Flowehn for their trading decisions
          </motion.p>
        </div>

        {/* Desktop layout */}
        <div className='hidden md:flex relative items-center justify-center'>
          {/* Avatar */}
          <div className='w-[400px] h-[400px] rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm border border-primary/20 flex-shrink-0 shadow-2xl'>
            <AnimatePresence mode='wait'>
              <motion.div
                key={currentTestimonial.imageUrl}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                className='w-full h-full'
              >
                <img
                  src={currentTestimonial.imageUrl}
                  alt={currentTestimonial.name}
                  className='w-full h-full object-cover'
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Card */}
          <div className='bg-background/80 backdrop-blur-sm border border-border/50 rounded-3xl shadow-2xl p-8 ml-[-60px] z-10 max-w-xl flex-1'>
            <AnimatePresence mode='wait'>
              <motion.div
                key={currentTestimonial.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }}
              >
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < currentTestimonial.rating
                          ? "text-yellow-400 fill-current"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>

                <div className='mb-6'>
                  <h3 className='text-2xl font-bold text-foreground mb-2'>
                    {currentTestimonial.name}
                  </h3>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {currentTestimonial.title}
                  </p>
                </div>

                <p className='text-foreground text-base leading-relaxed mb-8'>
                  "{currentTestimonial.description}"
                </p>

                <div className='flex space-x-4'>
                  {socialIcons.map(({ icon: IconComponent, url, label }) => (
                    <a
                      key={label}
                      href={url || "#"}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='w-12 h-12 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 cursor-pointer'
                      aria-label={label}
                    >
                      <IconComponent className='w-5 h-5 text-primary' />
                    </a>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile layout */}
        <div className='md:hidden max-w-sm mx-auto text-center'>
          {/* Avatar */}
          <div className='w-full aspect-square bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm border border-primary/20 rounded-3xl overflow-hidden mb-6 shadow-xl'>
            <AnimatePresence mode='wait'>
              <motion.div
                key={currentTestimonial.imageUrl}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                className='w-full h-full'
              >
                <img
                  src={currentTestimonial.imageUrl}
                  alt={currentTestimonial.name}
                  className='w-full h-full object-cover'
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Card content */}
          <div className='px-4'>
            <AnimatePresence mode='wait'>
              <motion.div
                key={currentTestimonial.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }}
              >
                {/* Rating */}
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < currentTestimonial.rating
                          ? "text-yellow-400 fill-current"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>

                <h3 className='text-xl font-bold text-foreground mb-2'>
                  {currentTestimonial.name}
                </h3>
                
                <p className='text-sm font-medium text-muted-foreground mb-4'>
                  {currentTestimonial.title}
                </p>
                
                <p className='text-foreground text-sm leading-relaxed mb-6'>
                  "{currentTestimonial.description}"
                </p>
                
                <div className='flex justify-center space-x-4'>
                  {socialIcons.map(({ icon: IconComponent, url, label }) => (
                    <a
                      key={label}
                      href={url || "#"}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='w-12 h-12 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 cursor-pointer'
                      aria-label={label}
                    >
                      <IconComponent className='w-5 h-5 text-primary' />
                    </a>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom navigation */}
        <div className='flex justify-center items-center gap-6 mt-12'>
          {/* Previous */}
          <motion.button
            onClick={handlePrevious}
            aria-label='Previous testimonial'
            className='w-12 h-12 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 shadow-lg flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 cursor-pointer'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className='w-6 h-6 text-foreground' />
          </motion.button>

          {/* Dots */}
          <div className='flex gap-2'>
            {testimonials.map((_, testimonialIndex) => (
              <button
                key={testimonialIndex}
                onClick={() => setCurrentIndex(testimonialIndex)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300 cursor-pointer",
                  testimonialIndex === currentIndex
                    ? "bg-primary scale-125"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to testimonial ${testimonialIndex + 1}`}
              />
            ))}
          </div>

          {/* Next */}
          <motion.button
            onClick={handleNext}
            aria-label='Next testimonial'
            className='w-12 h-12 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 shadow-lg flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 cursor-pointer'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight className='w-6 h-6 text-foreground' />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
