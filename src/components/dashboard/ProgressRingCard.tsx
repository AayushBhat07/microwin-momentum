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
    <div className="bg-black/50 backdrop-blur-sm border border-blue-500/50 rounded-lg p-4 flex flex-col items-center text-center h-full font-pixel">
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="p-2 bg-blue-500/20 rounded-full mb-2 text-blue-300">
          <Sun className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-semibold tracking-tight text-white text-shadow-pixel">{name}</h3>
        <p className="text-xs text-blue-300 mt-1">{description}</p>
      </div>
      <div className="w-full text-center mt-3">
        <p className="text-sm font-bold text-white mb-2">{`${current.toLocaleString()} / ${target.toLocaleString()}`}</p>
        <div className="w-full bg-blue-900/50 rounded-full h-6 border-2 border-blue-500/80 overflow-hidden relative">
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white mix-blend-difference">
              {percentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}