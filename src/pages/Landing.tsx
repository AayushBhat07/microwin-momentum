import { AuthButton } from "@/components/auth/AuthButton";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, BarChart, CheckCircle, Sparkles, Users, Zap } from "lucide-react";
import { useNavigate } from "react-router";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useConvexAuth } from "convex/react";
import AnimatedHeroCard from "@/components/landing/AnimatedHeroCard";
import { TypingAnimation } from "@/components/landing/TypingAnimation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// --- Reusable Components ---
const PixelatedCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-muted border-2 border-foreground p-6 h-full shadow-[4px_4px_0px_var(--foreground)] hover:shadow-[2px_2px_0px_var(--foreground)] transition-all duration-150 ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-center font-pixel uppercase">
    {children}
  </h2>
);

const SectionSubtitle = ({ children }: { children: React.ReactNode }) => (
  <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-center mt-4 mb-12 font-pixel">
    {children}
  </p>
);

// --- Main Landing Page Component ---
export default function Landing() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const heroRef = useRef(null);
  const bgRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  useLayoutEffect(() => {
    if (isLoading) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(bgRef.current,
        { scale: 1.2, xPercent: -5 },
        {
          scale: 1,
          xPercent: 0,
          ease: "none",
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          }
        }
      );

      gsap.fromTo(heroRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top top",
            end: "center center",
            scrub: 1,
          }
        }
      );
    }, mainRef);

    return () => ctx.revert();
  }, [isLoading]);

  return (
    <div ref={mainRef} className="text-foreground font-mono overflow-x-hidden">
      <div
        ref={bgRef}
        className="scroll-bg"
        style={{ backgroundImage: "url('/assets/t2.png')" }}
      ></div>

      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent border-b-2 border-foreground/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold tracking-tighter font-mono uppercase">MicroWin</span>
          </div>
          <AuthButton
            useModal={false}
            trigger={<Button variant="secondary">Start</Button>}
            dashboardTrigger={<Button>Dashboard</Button>}
          />
        </div>
      </header>

      <section ref={heroRef} className="hero-content min-h-screen flex items-center justify-center pt-24 md:pt-0">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center z-10">
          <div>
            <TypingAnimation
              text="Turn Small Wins into Big Victories"
              className="text-5xl md:text-7xl font-bold tracking-tighter uppercase font-mono text-shadow-pixel"
            />
            <p
              className="mt-6 text-xl text-white/80 max-w-lg font-pixel"
            >
              Track daily achievements, build motivation, and conquer your goals with a fun, gamified experience.
            </p>
            <div
              className="mt-8 flex flex-col sm:flex-row gap-4"
            >
              <AuthButton useModal={false} trigger={<Button size="lg">Start Free Today <ArrowRight className="ml-2 w-5 h-5" /></Button>} />
            </div>
          </div>
          <div className="relative h-96 hidden md:flex items-center justify-center">
            <AnimatedHeroCard />
          </div>
        </div>
      </section>

      <div ref={contentRef} className="relative z-10 bg-background">
        {/* Benefits Grid */}
        <section className="py-24 border-b-2 border-foreground">
          <div className="container mx-auto px-6">
            <SectionTitle>Build Habits That Last</SectionTitle>
            <SectionSubtitle>Focus on small, consistent actions to create lasting positive change.</SectionSubtitle>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Zap, title: "Reduce Perfectionism", desc: "Focus on progress, not perfection. Every small step is a win." },
                { icon: BarChart, title: "Build Consistency", desc: "Track your streaks and see your daily efforts compound over time." },
                { icon: Users, title: "Feel Supported", desc: "Join a community that cheers for you and celebrates your journey." },
                { icon: CheckCircle, title: "See Your Progress", desc: "Visualize your growth with points, badges, and insightful stats." },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <PixelatedCard>
                    <item.icon className="w-10 h-10 text-secondary mb-4" />
                    <h3 className="text-2xl font-bold mb-2 uppercase font-pixel">{item.title}</h3>
                    <p className="text-muted-foreground font-pixel">{item.desc}</p>
                  </PixelatedCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24">
          <div className="container mx-auto px-6 text-center">
            <motion.h2
              className="text-5xl font-bold tracking-tight font-mono uppercase text-shadow-pixel"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Ready to build your momentum?
            </motion.h2>
            <motion.p
              className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto mb-8 font-pixel"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
            >
              Start for free, no credit card required. Join a community celebrating progress, one small win at a time.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <AuthButton trigger={<Button size="lg">Claim Your First Win <Sparkles className="ml-2 w-5 h-5" /></Button>} />
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-muted border-t-2 border-foreground">
          <div className="container mx-auto px-6 text-center">
            <p className="text-muted-foreground font-pixel">© {new Date().getFullYear()} MicroWin Momentum. All Rights Reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}