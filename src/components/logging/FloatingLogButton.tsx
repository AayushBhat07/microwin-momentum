import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect } from "react";

interface FloatingLogButtonProps {
  onClick: () => void;
}

export function FloatingLogButton({ onClick }: FloatingLogButtonProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'l' && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault();
        onClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClick]);

  return (
    <Button
      onClick={onClick}
      className="fixed bottom-8 right-8 h-20 w-20 rounded-full bg-teal-600 hover:bg-teal-700 shadow-2xl z-50"
      aria-label="Log a Win"
    >
      <Plus className="h-10 w-10 text-white" />
    </Button>
  );
}
