import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Scan, Check, X } from 'lucide-react';

interface CameraProps {
  onCapture: (imageDataUrl: string) => void;
  onAnalyzeStart?: () => void;
  onAnalyzeComplete?: () => void;
  className?: string;
}

export const Camera: React.FC<CameraProps> = ({
  onCapture,
  onAnalyzeStart,
  onAnalyzeComplete,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    if (!videoRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      // Ensure the video plays
      await videoRef.current.play();
      setCameraActive(true);
    } catch (err) {
      console.error('Failed to start camera:', err);
      alert('Unable to access the camera. Please allow camera permissions and refresh the page.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || !cameraActive) return;

    // Ensure video is ready
    if (videoRef.current.readyState < 2) {
      console.warn('Video not ready');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageDataUrl);
      stopCamera();
      onAnalyzeComplete?.();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className ?? ''}`}>
      <div className="relative w-full max-w-xl aspect-[3/4] bg-black rounded-2xl overflow-hidden">
        {cameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-900">
            <p className="text-white text-center px-4">
              Camera not active. Please allow camera permissions.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-center space-x-4">
        {cameraActive ? (
          <Button
            onClick={handleCapture}
            className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600"
          >
            <Scan className="h-8 w-8" />
          </Button>
        ) : capturedImage ? (
          <>
            <Button onClick={handleRetake} variant="outline" className="h-12 px-6">
              <X className="mr-2 h-4 w-4" /> Retake
            </Button>
            <Button onClick={handleConfirm} className="h-12 px-6">
              <Check className="mr-2 h-4 w-4" /> Confirm
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
};

