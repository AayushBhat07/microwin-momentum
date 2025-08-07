import { Award, Zap, Heart, CheckCircle, Star, Sun } from "lucide-react";
import { Badge } from "./Badge";
import { PillCTA } from "./PillCTA";
import { AuthButton } from "@/components/auth/AuthButton";
import { ArrowRight } from "lucide-react";

const badgeExamples = [
  { name: "First Win", icon: Award, color: "var(--color-gold)" },
  { name: "7-Day Streak", icon: Zap, color: "var(--color-tangerine)" },
  { name: "Community High-Five", icon: Heart, color: "var(--color-magenta)" },
  { name: "Goal Getter", icon: CheckCircle, color: "var(--color-teal)" },
  { name: "Perfect Week", icon: Star, color: "var(--color-gold)" },
  { name: "Early Bird", icon: Sun, color: "var(--color-tangerine)" },
];

export function BadgeWall() {
  return (
    <section className="py-24 bg-primary/5">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold tracking-tight mb-4">Earn Badges, Celebrate Milestones</h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-16">
          Unlock a collection of retro-inspired badges for your achievements.
        </p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-8 mb-16">
          {badgeExamples.map((badge, i) => (
            <Badge key={badge.name} {...badge} delay={i * 0.05} />
          ))}
        </div>
        <AuthButton trigger={<PillCTA>Unlock Your First Badge <ArrowRight className="ml-2 w-5 h-5" /></PillCTA>} />
      </div>
    </section>
  );
}
