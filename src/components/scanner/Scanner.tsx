
import React from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/scanner/Spinner';
import CameraComponent from './Camera';
import { useObjectScanner } from '@/hooks/useObjectScanner';
import ScanResult from './ScanResult';
import { useToast } from '@/hooks/use-toast';

const Scanner: React.FC = () => {
  const { isScanning, scanResult, error, scanImage, resetScan, selectObject } = useObjectScanner();
  const { toast } = useToast();

  const handleCapture = (imageData: string) => {
    scanImage(imageData);
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        scanImage(e.target.result);
      }
    };
    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to read the image file",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    resetScan();
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {scanResult ? (
        <div className="space-y-4">
          <ScanResult 
            result={scanResult} 
            onSelectObject={selectObject} 
          />
          <div className="flex justify-center">
            <Button 
              onClick={handleReset}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Scan Another Object
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <CameraComponent 
            onCapture={handleCapture} 
            onFileUpload={handleFileUpload} 
          />
          
          {isScanning && (
            <div className="text-center p-4">
              <Spinner />
              <p className="mt-2 text-gray-500">Analyzing image...</p>
            </div>
          )}

          {error && (
            <div className="text-center p-4 text-red-500">
              <p>{error}</p>
              <Button 
                onClick={handleReset}
                variant="outline"
                className="mt-2 border-red-500 text-red-500 hover:bg-red-50"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Scanner;
