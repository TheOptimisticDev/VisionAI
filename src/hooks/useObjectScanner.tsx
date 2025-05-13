
import { useState } from 'react';
import { detectObject, getObjectInfo, ObjectDetectionResult } from '../utils/objectDetection';

interface ScanResult {
  detections: ObjectDetectionResult[];
  imageUrl: string;
  info: string | null;
  selectedObject: string | null;
}

interface ObjectScannerHook {
  isScanning: boolean;
  scanResult: ScanResult | null;
  error: string | null;
  scanImage: (imageData: string) => Promise<void>;
  resetScan: () => void;
  selectObject: (label: string) => Promise<void>;
}

export const useObjectScanner = (): ObjectScannerHook => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scanImage = async (imageData: string): Promise<void> => {
    try {
      setIsScanning(true);
      setError(null);
      
      console.log('Starting image scan...');
      const detections = await detectObject(imageData);
      
      if (detections.length === 0) {
        throw new Error('No objects detected in the image. Try with a clearer image or better lighting.');
      }

      console.log('Objects detected:', detections);
      
      // Get information about the top detected object
      const topDetection = detections[0];
      const info = await getObjectInfo(topDetection.label);
      
      setScanResult({
        detections,
        imageUrl: imageData,
        info,
        selectedObject: topDetection.label
      });
    } catch (err: any) {
      console.error('Error during object scanning:', err);
      setError(err.message || 'Failed to scan image. Please try again with a different image.');
      setScanResult(null);
    } finally {
      setIsScanning(false);
    }
  };

  const selectObject = async (label: string): Promise<void> => {
    if (!scanResult) return;

    try {
      setIsScanning(true);
      const info = await getObjectInfo(label);
      
      setScanResult({
        ...scanResult,
        info,
        selectedObject: label
      });
    } catch (err: any) {
      console.error('Error getting object information:', err);
      setError(err.message || 'Failed to get object information. Please try selecting another object.');
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = (): void => {
    setScanResult(null);
    setError(null);
  };

  return {
    isScanning,
    scanResult,
    error,
    scanImage,
    resetScan,
    selectObject,
  };
};
