import { Footer } from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { Sparkles, Users, Zap, CheckCircle, BarChart } from "lucide-react";
import { Link } from "react-router";
import React from "react";
import BlurText from "@/components/ui/BlurText";

const FeatureCard = ({ icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <div className="bg-background/10 backdrop-blur-md border-2 border-white/20 p-6 shadow-[4px_4px_0px_#00000060] transition-all duration-150 h-full flex flex-col">
        <div className="flex items-center gap-4 mb-4">
            <div className="bg-primary/20 p-3 border-2 border-primary/30 shrink-0">
                {React.createElement(icon, { className: "w-8 h-8 text-primary" })}
            </div>
            <h3 className="text-xl font-bold uppercase font-pixel text-white break-words">{title}</h3>
        </div>
        <p className="text-white/80 font-pixel break-words flex-grow">{children}</p>
    </div>
);

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground font-mono overflow-x-hidden">
       <div
        className="scroll-bg"
        style={{ backgroundImage: "url('/assets/t2.png')" }}
      ></div>

      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent border-b-2 border-foreground/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold tracking-tighter font-mono uppercase">MicroWin</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/about" className="text-lg font-medium hover:text-primary transition-colors">About</Link>
          </nav>
        </div>
      </header>

      <main className="pt-24 relative z-10">
        <section className="py-20 text-center">
            <BlurText
                text="About MicroWin"
                className="text-5xl md:text-7xl font-bold tracking-tighter uppercase font-mono text-shadow-pixel text-white justify-center"
                animateBy="words"
            />
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-6 text-xl text-white/80 max-w-3xl mx-auto font-pixel"
            >
                We believe that massive change is the result of small, consistent actions.
            </motion.p>
        </section>

        <section className="py-20 border-y-2 border-foreground bg-black/50">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <motion.div
                         initial={{ opacity: 0, x: -30 }}
                         whileInView={{ opacity: 1, x: 0 }}
                         transition={{ duration: 0.6 }}
                         viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter font-pixel uppercase text-white">Our Mission</h2>
                        <p className="mt-6 text-lg text-white/80 font-pixel">
                            Our mission is to empower you to achieve your biggest goals by celebrating the small victories along the way. We provide a simple, fun, and effective tool to track your daily progress, build powerful habits, and turn your ambitions into reality. We fight against the overwhelm that often comes with big dreams by focusing on the power of "one day at a time."
                        </p>
                    </motion.div>
                    <motion.div
                        className="h-80 bg-cover bg-center border-2 border-foreground"
                        style={{ backgroundImage: "url('/assets/onboarding1.png')" }}
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    />
                </div>
            </div>
        </section>

        <section className="py-20">
            <div className="container mx-auto px-6">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-center font-pixel uppercase text-white">Why We Built This</h2>
                 <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-center mt-4 mb-12 font-pixel text-white/80">
                    MicroWin was born from a simple realization: the path to success isn't a giant leap, but a series of small, consistent steps.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FeatureCard icon={Zap} title="Fight Procrastination">
                        Big goals can be intimidating. By breaking them down into micro-wins, we make it easy to start and keep going.
                    </FeatureCard>
                    <FeatureCard icon={BarChart} title="Build Momentum">
                        Every win you track builds momentum. See your progress visually and feel the motivation to continue your streak.
                    </FeatureCard>
                    <FeatureCard icon={Users} title="Create Lasting Habits">
                        Consistency is key. Our platform is designed to help you build positive habits that stick for the long term.
                    </FeatureCard>
                    <FeatureCard icon={CheckCircle} title="Celebrate Progress">
                        We believe every step forward, no matter how small, deserves to be celebrated. Acknowledge your effort and stay positive.
                    </FeatureCard>
                </div>
            </div>
        </section>
        
        <section className="py-20 border-t-2 border-foreground bg-black/50">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                     <motion.div
                        className="h-80 bg-cover bg-center border-2 border-foreground order-last md:order-first"
                        style={{ backgroundImage: "url('/assets/onboarding2.png')" }}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    />
                    <motion.div
                         initial={{ opacity: 0, x: 30 }}
                         whileInView={{ opacity: 1, x: 0 }}
                         transition={{ duration: 0.6 }}
                         viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter font-pixel uppercase text-white">The Philosophy</h2>
                        <p className="mt-6 text-lg text-white/80 font-pixel">
                           We're not about hustle culture or unrealistic expectations. We're about sustainable growth and personal well-being. MicroWin is your personal companion for building a better, more accomplished life, one small, joyful step at a time. Join us and start turning your small wins into big victories.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}