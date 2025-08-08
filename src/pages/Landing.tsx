import { AuthButton } from "@/components/auth/AuthButton";
import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import { ArrowRight, BarChart, CheckCircle, Heart, Sparkles, Users, Zap, Award } from "lucide-react";
import { useNavigate } from "react-router";
import React, { useEffect, useRef, useState } from "react";
import { useConvexAuth } from "convex/react";
import { PillCTA } from "@/components/landing/PillCTA";
import { Squares } from "@/components/ui/squares-background";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { BadgeWall } from "@/components/landing/BadgeWall";
import { CommunityAndSafety } from "@/components/landing/CommunityAndSafety";
import { Testimonials } from "@/components/landing/Testimonials";
import Folder from "@/components/landing/Folder";
import TextType from "@/components/landing/TextType";
import {
  LinesPatternCard,
  LinesPatternCardBody,
} from "@/components/ui/card-with-lines-pattern";
import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";

// --- Configuration for colors and badges ---
const brandColors = {
  primary: "var(--color-primary)",
  secondary: "var(--color-secondary)",
  accent: "var(--color-accent)",
  destructive: "var(--color-destructive)",
  background: "var(--color-background)",
  foreground: "var(--color-foreground)",
};

// --- Reusable Components ---

const AnimatedStat = ({ value, label }: { value: number, label: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / 2000, 1); // 2 second duration
        setCount(Math.floor(progress * value));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-5xl font-bold text-primary">{count.toLocaleString()}</p>
      <p className="text-lg text-muted-foreground mt-1">{label}</p>
    </div>
  );
};

// --- Main Landing Page Component ---

export default function Landing() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If auth is done loading and the user is logged in,
    // redirect them from the landing page to the dashboard.
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  // This page should only be for unauthenticated users.
  // The Protected component will handle routing for authenticated users.
  if (isLoading || isAuthenticated) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-background">
        <Spinner className="h-12 w-12" />
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-muted-foreground mt-4"
        >
          Signing you in...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground font-sans overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold tracking-tighter">MicroWin</span>
          </div>
          <AuthButton
            useModal={false}
            trigger={<PillCTA>Start Free</PillCTA>}
            dashboardTrigger={<PillCTA>Dashboard</PillCTA>}
          />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative isolate min-h-screen flex items-center pt-24 md:pt-0">
        <div className="absolute inset-0 -z-10">
          <Squares direction="diagonal" speed={0.2} />
        </div>
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <motion.h1
              className="text-5xl md:text-7xl font-bold tracking-tighter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <TextType 
                text={["Celebrate Small<br />Wins.<br />Build Big Momentum."]}
                typingSpeed={70}
                pauseDuration={10000}
                showCursor={true}
                cursorCharacter="|"
                className=""
              />
            </motion.h1>
            <motion.p
              className="mt-6 text-xl text-muted-foreground max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Based on positive psychology, MicroWin helps you build motivation and combat perfectionism by celebrating daily achievements.
            </motion.p>
            <motion.div
              className="mt-8 flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <AuthButton useModal={false} trigger={<PillCTA>Start Free Today <ArrowRight className="ml-2 w-5 h-5" /></PillCTA>} />
              <Button variant="outline" size="lg" className="rounded-full font-bold text-lg px-8 py-6">See How It Works</Button>
            </motion.div>
          </div>
          <div className="relative h-96 hidden md:flex items-center justify-center -translate-y-8">
            <Folder size={2} items={[
              <div className="text-center text-xs">
                <p className="font-bold whitespace-normal leading-tight">Morning Workout</p>
                <p className="font-semibold text-green-600">+25</p>
              </div>,
              <div className="text-center text-xs">
                <p className="font-bold whitespace-normal leading-tight">Cleared Inbox</p>
                <p className="font-semibold text-blue-600">+15</p>
              </div>,
              <div className="text-center text-xs">
                <p className="font-bold whitespace-normal leading-tight">Called a Friend</p>
                <p className="font-semibold text-purple-600">+20</p>
              </div>
            ]} />
          </div>
        </div>
      </section>

      {/* Live Momentum Preview */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <AnimatedStat value={124589} label="Wins Logged Today" />
            <AnimatedStat value={18345} label="Badges Earned" />
            <AnimatedStat value={3291} label="Challenges Completed" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Benefits Grid */}
      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-4">Build Habits That Last</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-16">Focus on small, consistent actions to create lasting positive change.</p>
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
                className="h-full"
              >
                <LinesPatternCard className="bg-primary/5 text-left">
                  <LinesPatternCardBody>
                    <item.icon className="w-10 h-10 text-secondary mb-4" />
                    <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </LinesPatternCardBody>
                </LinesPatternCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Badge Wall */}
      <BadgeWall />

      {/* Testimonials */}
      <Testimonials />

      {/* Community & Safety */}
      <CommunityAndSafety />

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            className="text-5xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready to build your momentum?
          </motion.h2>
          <motion.p
            className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
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
            <AuthButton trigger={<PillCTA>Claim Your First Win <Sparkles className="ml-2 w-5 h-5" /></PillCTA>} />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card/50">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground">© {new Date().getFullYear()} MicroWin Momentum. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}