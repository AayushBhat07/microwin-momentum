import { Award, Edit, TrendingUp } from "lucide-react";
import ScrollStack, { ScrollStackItem } from "./ScrollStack";
import "./ScrollStack.css";
import { Squares } from "@/components/ui/squares-background";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative isolate howitworks-stack">
      <div className="absolute inset-0 -z-10">
        <Squares direction="diagonal" speed={0.2} />
      </div>
      <div className="howitworks-header">
        <h2 className="text-4xl font-bold tracking-tight heading">
          How It Works
        </h2>
        <p className="text-xl subheading">
          Capture small wins, build momentum, earn playful badges.
        </p>
      </div>
      <ScrollStack
        className="howitworks-stack-body"
        stackPosition="25%"
        scaleEndPosition="15%"
      >
        <ScrollStackItem itemClassName="bg-card">
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Edit className="w-12 h-12 text-secondary mb-4" />
            <h3 className="text-3xl font-bold mb-2">Log a Micro Win</h3>
            <p className="text-muted-foreground text-lg max-w-sm">
              Capture a tiny victory in seconds with one tap or voice.
            </p>
          </div>
        </ScrollStackItem>
        <ScrollStackItem itemClassName="bg-card">
          <div className="flex flex-col items-center justify-center h-full text-center">
            <TrendingUp className="w-12 h-12 text-secondary mb-4" />
            <h3 className="text-3xl font-bold mb-2">Grow Your Streak</h3>
            <p className="text-muted-foreground text-lg max-w-sm">
              Watch your momentum build with gentle, judgment‑free streaks.
            </p>
          </div>
        </ScrollStackItem>
        <ScrollStackItem itemClassName="bg-card">
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Award className="w-12 h-12 text-secondary mb-4" />
            <h3 className="text-3xl font-bold mb-2">Earn Badges & Cheers</h3>
            <p className="text-muted-foreground text-lg max-w-sm">
              Unlock playful badges and get high‑fives from the community.
            </p>
          </div>
        </ScrollStackItem>
      </ScrollStack>
    </section>
  );
}