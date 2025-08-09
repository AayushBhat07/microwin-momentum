import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface CameraViewProps {
  onPhotoTaken: (file: File) => void;
  onClose: () => void;
}

export function CameraView({ onPhotoTaken, onClose }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let mediaStream: MediaStream;
    const startCamera = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
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
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
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
      if (context) {
        context.translate(video.videoWidth, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      }
      
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
    <motion.div 
      className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="relative w-full max-w-lg aspect-video overflow-hidden rounded-2xl border-4 border-primary/50 shadow-2xl shadow-primary/20"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover transform -scale-x-100"
        />
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
      </motion.div>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
      >
        <Button
          size="lg"
          className="mt-8 rounded-full h-20 w-20 bg-primary hover:bg-primary/90 ring-4 ring-primary/30"
          onClick={handleTakePhoto}
          aria-label="Take Photo"
        >
          <Camera className="h-10 w-10" />
        </Button>
      </motion.div>
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
}