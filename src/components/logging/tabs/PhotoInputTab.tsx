import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";

export function PhotoInputTab() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button variant="outline" className="flex-1 h-24 flex flex-col gap-2">
          <Camera className="w-6 h-6" />
          <span className="text-xs">Take Photo</span>
        </Button>
        
        <label className="flex-1">
          <Button variant="outline" className="w-full h-24 flex flex-col gap-2" asChild>
            <div>
              <Upload className="w-6 h-6" />
              <span className="text-xs">Upload</span>
            </div>
          </Button>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>
      
      {selectedImage && (
        <div className="mt-4">
          <img
            src={selectedImage}
            alt="Selected"
            className="w-full h-32 object-cover rounded-md border"
          />
        </div>
      )}
    </div>
  );
}