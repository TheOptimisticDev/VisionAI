
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ObjectDetectionResult } from '@/utils/objectDetection';

interface ScanResultProps {
  result: {
    detections: ObjectDetectionResult[];
    imageUrl: string;
    info: string | null;
    selectedObject: string | null;
  };
  onSelectObject: (label: string) => Promise<void>;
}

const ScanResult: React.FC<ScanResultProps> = ({ result, onSelectObject }) => {
  const { detections, imageUrl, info, selectedObject } = result;

  const formatConfidence = (score: number): string => {
    return `${(score * 100).toFixed(1)}%`;
  };

  const formatLabel = (label: string): string => {
    return label.split(',')[0].trim();
  };

  return (
    <Card className="overflow-hidden">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-black flex items-center justify-center p-2">
          <img 
            src={imageUrl} 
            alt="Scanned object" 
            className="max-h-96 object-contain"
          />
        </div>
        
        <CardContent className="p-6">
          <h3 className="text-2xl font-bold mb-4">
            {selectedObject ? formatLabel(selectedObject) : 'Object Detected'}
          </h3>
          
          <div className="mb-6">
            <h4 className="text-sm text-gray-500 uppercase tracking-wide mb-2">Detected Objects</h4>
            <div className="flex flex-wrap gap-2">
              {detections.map((detection, index) => (
                <Button 
                  key={index}
                  variant={detection.label === selectedObject ? "default" : "outline"} 
                  size="sm"
                  onClick={() => onSelectObject(detection.label)}
                  className="flex items-center gap-2"
                >
                  {formatLabel(detection.label)}
                  <Badge variant="secondary" className="text-xs">
                    {formatConfidence(detection.score)}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
          
          {info && (
            <div>
              <h4 className="text-sm text-gray-500 uppercase tracking-wide mb-2">Information</h4>
              <p className="text-gray-700">{info}</p>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
};

export default ScanResult;
