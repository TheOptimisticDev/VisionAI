import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Image, Flashlight, FlashlightOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toggle } from '@/components/ui/toggle';

interface CameraComponentProps {
  onCapture: (imageData: string) => void;
  onFileUpload: (file: File) => void;
}

interface CameraComponentRef {
  captureImage: () => void;
}

// Define interface to extend MediaTrackCapabilities with torch property
interface ExtendedCapabilities extends MediaTrackCapabilities {
  torch?: boolean;
  focusMode?: string[];
}

// Define interface to extend MediaTrackConstraintSet with torch property
interface ExtendedConstraintSet extends MediaTrackConstraintSet {
  torch?: boolean;
  focusMode?: string;
}

const CameraComponent = forwardRef<CameraComponentRef, CameraComponentProps>(({ onCapture, onFileUpload }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setIsStarting(true);
      setCameraError(null);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          advanced: [{ focusMode: "continuous" } as ExtendedConstraintSet]
        }
      };

      const timeoutId = setTimeout(() => {
        if (!streamActive) {
          setCameraError("Camera initialization timed out. Try using the upload option instead.");
          setIsStarting(false);
        }
      }, 10000);

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      clearTimeout(timeoutId);

      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        try {
          const capabilities = videoTrack.getCapabilities() as ExtendedCapabilities;
          if (capabilities.focusMode?.includes('continuous')) {
            await videoTrack.applyConstraints({ advanced: [{ focusMode: 'continuous' } as ExtendedConstraintSet] });
            console.log('Auto-focus enabled');
          }
          if (flashlightOn && capabilities.torch) {
            await videoTrack.applyConstraints({ advanced: [{ torch: true } as ExtendedConstraintSet] });
            console.log('Flashlight enabled');
          }
        } catch (settingError) {
          console.warn('Could not apply all camera settings:', settingError);
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                setStreamActive(true);
                setIsStarting(false);
              })
              .catch(error => {
                console.error("Error playing video:", error);
                setCameraError("Error starting video stream. Please try again.");
                setIsStarting(false);
              });
          }
        };
      }
    } catch (err: any) {
      console.error("Error accessing the camera: ", err);
      let errorMessage = "Could not access camera. ";
      if (err.name === "NotAllowedError") errorMessage += "Camera permission was denied.";
      else if (err.name === "NotFoundError") errorMessage += "No camera found on this device.";
      else if (err.name === "AbortError") errorMessage += "Camera access was aborted. Try refreshing.";
      else errorMessage += "Please check your device settings.";
      setCameraError(errorMessage);
      setIsStarting(false);
    }
  };

  const toggleFlashlight = async () => {
    if (!stream) return;
    try {
      const newFlashlightState = !flashlightOn;
      setFlashlightOn(newFlashlightState);
      const videoTrack = stream.getVideoTracks()[0];
      const capabilities = videoTrack?.getCapabilities() as ExtendedCapabilities;
      if (capabilities?.torch) {
        await videoTrack.applyConstraints({ advanced: [{ torch: newFlashlightState } as ExtendedConstraintSet] });
        console.log(newFlashlightState ? "Flashlight enabled" : "Flashlight disabled");
      } else {
        console.log("Torch/flashlight not supported");
      }
    } catch (error) {
      console.error("Error toggling flashlight:", error);
      stopCamera();
      setTimeout(() => startCamera(), 300);
    }
  };

  const triggerFocus = async () => {
    if (!stream) return;
    try {
      const videoTrack = stream.getVideoTracks()[0];
      await videoTrack?.applyConstraints({ advanced: [{ focusMode: "auto" } as ExtendedConstraintSet] });
      console.log("Focus triggered");
      setTimeout(async () => {
        try {
          await videoTrack?.applyConstraints({ advanced: [{ focusMode: "continuous" } as ExtendedConstraintSet] });
        } catch (e) {
          console.log("Could not reset to continuous focus");
        }
      }, 1000);
    } catch (error) {
      console.error("Error triggering focus:", error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      setStreamActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      triggerFocus();
      setTimeout(() => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.95);
        onCapture(imageData);
        stopCamera();
      }, 500);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files?.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  useImperativeHandle(ref, () => ({
    captureImage: captureImage,
  }));

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full max-w-md bg-black rounded-lg overflow-hidden mb-4">
        <video
          ref={videoRef}
          className={cn(
            "w-full h-[600px] object-cover",
            streamActive ? "block" : "hidden"
          )}
          autoPlay
          playsInline
          onClick={triggerFocus}
        />

        {streamActive && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-around items-center">
            <Button onClick={triggerFileUpload} className="bg-blue-500 hover:bg-blue-600 shadow-lg">
              <Image className="mr-2 h-5 w-5" />
              Upload
            </Button>
            <Toggle
              pressed={flashlightOn}
              onPressedChange={toggleFlashlight}
              className="border-blue-500 text-blue-500 data-[state=on]:bg-blue-500 data-[state=on]:text-white shadow-lg"
              aria-label="Toggle flashlight"
            >
              {flashlightOn ? <FlashlightOff className="h-5 w-5" /> : <Flashlight className="h-5 w-5" />}
            </Toggle>
          </div>
        )}

        {streamActive && (
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute left-0 w-full h-1 bg-blue-500/50 animate-scan" />
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-blue-500" />
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-blue-500" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-blue-500" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-blue-500" />
          </div>
        )}

        {streamActive && (
          <div className="absolute top-2 left-0 right-0 text-center pointer-events-none">
            <span className="bg-black/50 text-white text-xs px-2 py-1 rounded">Tap screen to focus</span>
          </div>
        )}

        {!streamActive && !cameraError && !isStarting && (
          <div className="w-full h-[600px] flex items-center justify-center bg-gray-900 rounded-lg">
            <p className="text-gray-400">Camera inactive</p>
          </div>
        )}
        {isStarting && (
          <div className="w-full h-[600px] flex items-center justify-center bg-gray-900 rounded-lg">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-blue-500 mb-2"></div>
              <p className="text-gray-400">Starting camera...</p>
            </div>
          </div>
        )}
        {cameraError && (
          <div className="w-full h-[600px] flex items-center justify-center bg-gray-900 rounded-lg">
            <p className="text-red-400 px-4 text-center">{cameraError}</p>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {!streamActive && (
        <Button onClick={startCamera} disabled={isStarting} className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300">
          <Image className="mr-2 h-4 w-4" />
          {isStarting ? 'Starting...' : 'Start Camera'}
        </Button>
      )}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(504px); }
          100% { transform: translateY(0); }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
});

export default CameraComponent;
