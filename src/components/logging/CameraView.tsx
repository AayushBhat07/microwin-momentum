import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';
import { toast } from 'sonner';

interface CameraViewProps {
  onPhotoTaken: (file: File) => void;
  onClose: () => void;
}

export function CameraView({ onPhotoTaken, onClose }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        toast.error("Could not access camera. Please check permissions.");
        onClose();
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onClose]);

  const handleTakePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          onPhotoTaken(file);
          onClose();
        }
      }, 'image/jpeg');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center">
      <div className="relative w-full max-w-lg aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full rounded-lg"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-white"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
      <Button
        size="lg"
        className="mt-4 rounded-full h-16 w-16"
        onClick={handleTakePhoto}
      >
        <Camera className="h-8 w-8" />
      </Button>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
