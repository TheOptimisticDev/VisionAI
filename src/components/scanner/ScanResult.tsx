
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PredictionResult } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';

interface ScanResultProps {
  predictions: PredictionResult[];
  onSelectItem: (className: string) => void;
  isLoading: boolean;
}

export function ScanResult({ predictions, onSelectItem, isLoading }: ScanResultProps) {
  const { toast } = useToast();

  if (isLoading) {
    return (
      <Card className="w-full max-w-xl mx-auto animate-pulse">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-6 bg-muted rounded w-3/4"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!predictions.length) {
    return (
      <Card className="w-full max-w-xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center py-4">
            <h3 className="text-lg font-medium">No items detected</h3>
            <p className="text-muted-foreground text-sm mt-2">
              Try scanning again with better lighting or a clearer image.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-xl mx-auto animate-fade-in">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">We found these items:</h3>
        <div className="space-y-3">
          {predictions.map((pred, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium">{pred.className.split(',')[0]}</p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(pred.probability * 100)}% confidence
                </p>
              </div>
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => onSelectItem(pred.className)}
              >
                View Details
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
