import { motion } from "framer-motion";
import { Award, Edit, TrendingUp } from "lucide-react";
import React from "react";

const features = [
  {
    icon: Edit,
    title: "Log a Win",
    description: "Easily record any achievement, big or small. Takes less than 30 seconds.",
  },
  {
    icon: TrendingUp,
    title: "Grow Streaks",
    description: "Build momentum by maintaining daily and weekly streaks for your habits.",
  },
  {
    icon: Award,
    title: "Earn Badges",
    description: "Unlock fun, retro-themed badges and join community challenges.",
  },
];

const FeatureCard = ({ icon: Icon, title, description, index }: any) => (
  <motion.div
    className="bg-card p-8 rounded-2xl border text-left h-full"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    viewport={{ once: true }}
  >
    <Icon className="w-10 h-10 text-secondary mb-4" />
    <h3 className="text-2xl font-bold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </motion.div>
);

export function HowItWorks() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold tracking-tight mb-4">How It Works</h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-16">
          A simple, three-step process to build positive momentum.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} {...feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
