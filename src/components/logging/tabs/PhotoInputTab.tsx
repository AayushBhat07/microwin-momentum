import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";

export function PhotoInputTab() {
  // TODO: Implement file upload logic
  return (
    <div className="flex items-center justify-center h-24 gap-4">
      <Button variant="outline" className="h-20 w-1/2 flex flex-col gap-2">
        <Camera className="w-6 h-6" />
        <span>Use Camera</span>
      </Button>
      <Button variant="outline" className="h-20 w-1/2 flex flex-col gap-2">
        <Upload className="w-6 h-6" />
        <span>Upload File</span>
      </Button>
    </div>
  );
}
