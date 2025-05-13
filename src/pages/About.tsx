import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ParticleBackground } from '@/components/effects/ParticleBackground';
import Scanner from '@/components/scanner/Scanner';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { initializeObjectDetection } from '@/utils/objectDetection';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Info, Camera as CameraIcon } from 'lucide-react';

const Scan = () => {
  const { toast } = useToast();
  const [modelError, setModelError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const isMobile = useIsMobile();

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
        });
      } catch (error: any) {
        console.error('Initialization error:', error);
        setModelError(error.message || 'Failed to load model.');
        toast({
          title: 'Initialization Failed',
          description: 'Try a different browser or device.',
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

  const handleRetry = () => setAttemptCount((prev) => prev + 1);

  return (
    <MainLayout>
      <div className="relative w-full min-h-screen overflow-hidden bg-gray-900">
        <ParticleBackground />

        <motion.main
          className="container mx-auto px-4 py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {modelError && (
            <Alert className="mb-6 bg-gray-800 border border-gray-700">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <AlertTitle className="text-white">Detection Error</AlertTitle>
              <AlertDescription className="text-gray-300">
                {modelError}
                <div className="mt-3 space-y-2 text-sm text-gray-400">
                  <p>This application requires WebGPU or WebGL support. Try:</p>
                  <ul className="list-disc pl-5">
                    <li>Using a modern browser (Chrome 113+, Edge, Safari)</li>
                    <li>Using a device with hardware acceleration</li>
                    <li>Enabling hardware acceleration in settings</li>
                  </ul>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleRetry}
                      onMouseEnter={() => setIsHovering(true)}
                      onMouseLeave={() => setIsHovering(false)}
                      className="relative px-4 py-2 bg-gradient-to-r from-brand-500 to-purple-500 text-white rounded-md shadow-lg hover:from-brand-600 hover:to-purple-600"
                    >
                      <span className="relative z-10 flex items-center">
                        <CameraIcon size={18} className="mr-2" />
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
          )}

          {!modelError && !isInitializing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Alert className="mb-6 bg-gray-800 border border-gray-700">
                <Info className="w-4 h-4 text-blue-400" />
                <AlertTitle className="text-white">Ready to Scan</AlertTitle>
                <AlertDescription className="text-gray-300">
                  {isMobile
                    ? 'Your device is ready. Point your camera at an object.'
                    : 'Ensure the object is visible and well-lit during scanning.'}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          <motion.div
            className="rounded-lg border border-gray-700 bg-gray-800/50 p-6 shadow-lg backdrop-blur-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            {isInitializing ? (
              <div className="text-center py-12">
                {loadingProgress > 0 ? (
                  <>
                    <Progress value={loadingProgress} className="mb-4 h-2 bg-gray-700" />
                    <p className="text-gray-300">Initializing... {loadingProgress}%</p>
                  </>
                ) : (
                  <>
                    <motion.div
                      className="mb-4 flex justify-center"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    >
                      <div className="h-8 w-8 rounded-full border-b-2 border-brand-400"></div>
                    </motion.div>
                    <p className="text-gray-300">Preparing object detection...</p>
                  </>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  This may take a moment depending on your device
                </p>
              </div>
            ) : (
              <Scanner />
            )}
          </motion.div>

          <motion.div
            className="mt-8 text-center text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p>
              This app uses AI to identify objects. Just scan or upload an image to begin.
            </p>
          </motion.div>
        </motion.main>
      </div>
    </MainLayout>
  );
};

export default Scan;

