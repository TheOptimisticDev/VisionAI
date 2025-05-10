import React, { useEffect, useState } from 'react';
import { Scan } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ParticleBackground } from '@/components/effects/ParticleBackground';

const LoaderPage = () => {
  const [loadingText, setLoadingText] = useState('Initializing Object Scanner');
  const [dots, setDots] = useState('');
  const [theme, setTheme] = useState('dark'); // Default dark theme
  const navigate = useNavigate();
  
  const loadingPhrases = [
    'Loading AI models',
    'Calibrating scanner',
    'Preparing recognition system',
    'Optimizing algorithms',
    'Almost ready'
  ];
  
  // Skip button handler
  const handleSkip = () => {
    navigate('/');
  };

  useEffect(() => {
    // Set theme based on user preference or system setting
    const userTheme = localStorage.getItem('theme') || 'dark';
    setTheme(userTheme);

    // Animate the dots
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    
    // Change the loading text every 2 seconds
    const textInterval = setInterval(() => {
      const randomPhrase = loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)];
      setLoadingText(randomPhrase);
    }, 3000);
    
    return () => {
      clearInterval(dotsInterval);
      clearInterval(textInterval);
    };
  }, []);

  // Define the background gradient based on theme
  const backgroundClass = theme === 'dark'
    ? 'bg-gradient-to-b from-gray-900 to-black' // Dark theme gradient
    : 'bg-gradient-to-b from-white to-brand-50'; // Light theme gradient

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${backgroundClass}`}>
      <div className="w-full max-w-md px-4">
        {/* Loader animation */}
        <div className="text-center">
          <div className="relative mb-10">
            {/* Rotating animation */}
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-brand-100 opacity-25"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-brand-600 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Scan size={28} className="text-brand-600" />
              </div>
            </div>
          </div>
          
          <div className="h-6">
            <p className="text-muted-foreground">
              {loadingText}<span className="animate-pulse">{dots}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoaderPage;

