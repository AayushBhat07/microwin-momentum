import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X } from "lucide-react";

interface PhotoInputTabProps {
  onPhotoSelected: (file: File | null) => void;
  isUploading: boolean;
}

export function PhotoInputTab({ onPhotoSelected, isUploading }: PhotoInputTabProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      onPhotoSelected(file);
    }
  };

  const clearPhoto = () => {
    setSelectedImage(null);
    onPhotoSelected(null);
    const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  return (
    <div className="space-y-4">
      {!selectedImage ? (
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1 h-24 flex flex-col gap-2" disabled>
            <Camera className="w-6 h-6" />
            <span className="text-xs">Take Photo (soon)</span>
          </Button>
          
          <label className="flex-1 cursor-pointer">
            <div className="w-full h-24 flex flex-col gap-2 items-center justify-center rounded-md border border-input bg-transparent hover:bg-accent hover:text-accent-foreground">
              <Upload className="w-6 h-6" />
              <span className="text-xs">Upload Photo</span>
            </div>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>
      ) : (
        <div className="mt-4 relative">
          <img
            src={selectedImage}
            alt="Selected"
            className="w-full h-40 object-cover rounded-md border"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={clearPhoto}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}