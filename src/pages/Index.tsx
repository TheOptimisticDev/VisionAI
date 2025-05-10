import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Sparkles, Camera as CameraIcon } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { ParticleBackground } from '@/components/effects/ParticleBackground';

const Index = () => {
  const { currentUser } = useAuth();
  const { remainingScans } = useSubscription();
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);

  return (
    <MainLayout>
      <div className="relative w-full overflow-hidden flex items-center justify-center">
        <ParticleBackground />

        <div className="flex justify-center items-center flex-col text-center max-w-full h-full px-2 sm:px-4 lg:px-6">
          <motion.img
            src="/icons/index.png"
            alt="VisionAI App Icon"
            className="w-48 h-48 object-contain drop-shadow-lg mb-4"
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
          />

          <section className="space-y-16 w-full">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-6"
            >
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-brand-100 text-brand-600 text-sm font-medium mb-3">
                <Sparkles className="mr-2" size={16} />
                AI-Powered Visual Discovery
              </div>
              <motion.h1
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-purple-600"
              >
                See the World Differently
              </motion.h1>
              <motion.p
                className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto"
              >
                Point your camera at anything and unlock instant knowledge about the world around you.
              </motion.p>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
              <Button
                onClick={() => {
                  if (currentUser || remainingScans > 0) {
                    navigate('/scan');
                  } else {
                    navigate('/subscription');
                  }
                }}
                size="lg"
                className="relative overflow-hidden group text-lg py-6 px-7 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white shadow-lg transition-all duration-300 transform hover:scale-105"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <span className="relative z-10 flex items-center">
                  <CameraIcon className="mr-3" size={24} />
                  Start Scanning
                </span>
                <AnimatePresence>
                  {isHovering && (
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-brand-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </Button>
            </motion.div>

            {!currentUser && (
              <motion.p
                className="mt-4 text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {remainingScans} free scans remaining today
              </motion.p>
            )}
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;

