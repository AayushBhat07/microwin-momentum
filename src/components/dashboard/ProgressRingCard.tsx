import { motion } from "framer-motion";
import { Sun } from "lucide-react";

interface ProgressRingCardProps {
  name: string;
  description: string;
  progress: number;
  current: number;
  target: number;
}

export function ProgressRingCard({ name, description, progress, current, target }: ProgressRingCardProps) {
  const percentage = Math.round(progress);

  return (
    <div className="bg-card p-4 rounded-lg border flex flex-col items-center text-center h-full shadow-md">
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="p-2 bg-primary/10 rounded-full mb-2 text-primary">
          <Sun className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-semibold tracking-tight">{name}</h3>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="w-full text-center mt-3">
        <p className="text-sm font-bold text-primary mb-2">{`${current.toLocaleString()} / ${target.toLocaleString()}`}</p>
        <div className="w-full bg-muted rounded-full h-6 border-2 border-foreground/20 overflow-hidden relative">
          <div 
            className="bg-primary h-full rounded-full transition-all duration-500" 
            style={{ width: `${percentage}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground mix-blend-difference">
              {percentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}