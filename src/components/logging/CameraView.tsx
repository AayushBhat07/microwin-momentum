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
      className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center font-mono"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="relative w-full max-w-lg aspect-video bg-black p-2"
        style={{
          border: '4px solid #422C22',
          boxShadow: 'inset 0 0 0 4px #AFDDFF, 0 0 0 4px #AFDDFF',
        }}
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <div className="relative w-full h-full overflow-hidden bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover transform -scale-x-100"
            style={{ imageRendering: 'pixelated' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1/2 h-1/2 border-2 border-dashed border-white/50"></div>
          </div>
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-bold tracking-widest animate-pulse">
            REC
          </div>
          <div className="absolute bottom-2 right-2 text-white/80 text-xs">
            CAM_V2.0
          </div>
          <div className="absolute bottom-2 left-2 text-white/80 text-xs">
            STATUS: <span className="text-green-400">ONLINE</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-5 -right-5 text-white bg-destructive hover:bg-destructive/80 rounded-none border-2 border-white"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
      </motion.div>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
        className="mt-8"
      >
        <Button
          size="lg"
          className="h-20 w-40 bg-primary hover:bg-primary/90 rounded-none border-4 border-secondary"
          onClick={handleTakePhoto}
          aria-label="Take Photo"
        >
          <div className="flex flex-col items-center">
            <Camera className="h-8 w-8" />
            <span className="text-sm font-bold mt-1">CAPTURE</span>
          </div>
        </Button>
      </motion.div>
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
}