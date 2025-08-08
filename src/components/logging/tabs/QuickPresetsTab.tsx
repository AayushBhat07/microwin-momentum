import { Button } from "@/components/ui/button";
import { Coffee, BookOpen, Dumbbell } from "lucide-react";

// TODO: Fetch from API
const presets = [
  { text: "5-min walk", icon: Dumbbell },
  { text: "Completed a task", icon: BookOpen },
  { text: "Texted a friend", icon: Coffee },
];

interface QuickPresetsTabProps {
  onSelect: (text: string) => void;
}

export function QuickPresetsTab({ onSelect }: QuickPresetsTabProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {presets.map((preset) => (
        <Button
          key={preset.text}
          variant="outline"
          className="h-24 flex flex-col gap-2"
          onClick={() => onSelect(preset.text)}
        >
          <preset.icon className="w-6 h-6" />
          <span className="text-center text-xs">{preset.text}</span>
        </Button>
      ))}
    </div>
  );
}
