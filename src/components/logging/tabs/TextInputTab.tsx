import { Textarea } from "@/components/ui/textarea";

interface TextInputTabProps {
  value: string;
  onChange: (value: string) => void;
}

export function TextInputTab({ value, onChange }: TextInputTabProps) {
  return (
    <div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="I finished my report ahead of schedule..."
        maxLength={200}
        className="h-24"
      />
      <p className="text-right text-xs text-gray-500 mt-1">{value.length}/200</p>
    </div>
  );
}
