import React, { useEffect, useState } from 'react';
import Scanner from '@/components/scanner/Scanner';
import { initializeObjectDetection } from '@/utils/objectDetection';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useIsMobile } from '@/hooks/use-mobile';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Camera as CameraIcon } from "lucide-react";
import { MainLayout } from '@/components/layout/MainLayout';
import { ParticleBackground } from '@/components/effects/ParticleBackground';

const Scan = () => {
  const { toast } = useToast();
  const [modelError, setModelError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const isMobile = useIsMobile();
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const initModel = async () => {
      try {
        setIsInitializing(true);
        setModelError(null);
        setLoadingProgress(0);

        const originalConsoleLog = console.log;
        console.log = (message) => {
          originalConsoleLog(message);
          if (typeof message === 'string' && message.includes('Loading model:')) {
            const match = message.match(/Loading model: (\d+)%/);
            if (match && match[1]) {
              const progress = parseInt(match[1]);
              if (!isNaN(progress) && progress >= 0 && progress <= 100) {
                setLoadingProgress(progress);
              }
            }
          }
        };

        await initializeObjectDetection();
        console.log = originalConsoleLog;

        toast({
          title: 'Ready to scan',
          description: 'Object detection initialized successfully.',
          variant: 'default',
        });
      } catch (error: any) {
        console.error('Failed to initialize object detection model:', error);
        const errorMessage = error.message || 'Failed to load the object detection model.';
        setModelError(errorMessage);
        toast({
          title: 'Initialization Failed',
          description: 'Unable to initialize object detection. You may need to use a different browser or device.',
          variant: 'destructive',
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initModel();

    return () => {
      if (console.log.toString().includes('Loading model:')) {
        console.log = console.log;
      }
    };
  }, [toast, attemptCount]);

  const handleRetry = () => {
    setAttemptCount(prev => prev + 1);
  };

  return (
    <MainLayout>
      <div className="relative w-full min-h-screen bg-gray-900 overflow-hidden">
        <ParticleBackground />

                  <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            {isInitializing ? (
              <div className="text-center py-12">
                {loadingProgress > 0 ? (
                  <>
                    <Progress
                      value={loadingProgress}
                      className="mb-4 h-2 bg-gray-700"
                    />
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-gray-300"
                    >
                      Initializing object detection... {loadingProgress}%
                    </motion.p>
                  </>
                ) : (
                  <>
                    <motion.div
                      className="flex justify-center mb-4"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <div className="rounded-full h-8 w-8 border-b-2 border-brand-400"></div>
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-gray-300"
                    >
                      Preparing object detection...
                    </motion.p>
                  </>
                )}
                <motion.p
                  className="text-sm text-gray-500 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  This may take a moment depending on your device and internet speed
                </motion.p>
              </div>
            ) : (
              <Scanner />
            )}
          </motion.div>

        <motion.main
          className="container mx-auto px-4 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {modelError ? (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertTitle className="text-white">Detection Error</AlertTitle>
              <AlertDescription className="text-gray-300">
                {modelError}
                <div className="mt-3">
                  <p className="text-sm mb-2 text-gray-400">This application requires WebGPU, WebAssembly, or WebGL support. Try:</p>
                  <ul className="list-disc pl-5 text-sm text-gray-400">
                    <li>Using a device with better hardware support</li>
                    <li>Enabling hardware acceleration in your browser settings</li>
                  </ul>
                  <motion.div
                    className="mt-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleRetry}
                      className="px-4 py-2 bg-gradient-to-r from-brand-500 to-purple-500 text-white rounded-md hover:from-brand-600 hover:to-purple-600 transition-colors shadow-lg"
                      onMouseEnter={() => setIsHovering(true)}
                      onMouseLeave={() => setIsHovering(false)}
                    >
                      <span className="relative z-10 flex items-center">
                        <CameraIcon className="mr-2" size={18} />
                        Retry Initialization
                      </span>
                      <AnimatePresence>
                        {isHovering && (
                          <motion.span
                            className="absolute inset-0 bg-gradient-to-r from-brand-600 to-purple-600 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-md"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          />
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                </div>
              </AlertDescription>
            </Alert>
          ) : null}

          {!modelError && !isInitializing && (
            <motion.div>
              <Alert className="mb-6">
                <Info className="h-4 w-4 text-blue-400" />
                <AlertTitle className="text-white">Ready to Scan</AlertTitle>
                <AlertDescription className="text-gray-300">
                  {isMobile
                    ? "Your device is ready for scanning. Point your camera at an object to identify it. Tap the screen to focus."
                    : "For best results, ensure the object is clearly visible and well-lit when scanning. You can tap the video to focus."}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}



          <motion.div
            className="mt-8 text-center text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p>
              This application uses AI to identify objects in images.<br />
              Simply take a photo or upload an image to get started.
            </p>
          </motion.div>
        </motion.main>
      </div>
    </MainLayout>
  );
};

export default Scan;
