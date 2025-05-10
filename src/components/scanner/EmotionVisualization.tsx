import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { EmotionResult } from '@/services/aiService';

interface EmotionVisualizationProps {
  image: string;
  emotions: EmotionResult[];
}

export function EmotionVisualization({ image, emotions }: EmotionVisualizationProps) {
  return (
    <Card className="w-full max-w-xl mx-auto animate-fade-in">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Emotion Analysis</h3>
        
        <div className="relative">
          <img 
            src={image} 
            alt="Analyzed" 
            className="w-full rounded-lg border border-gray-200"
          />
          
          {emotions.map((emotion, index) => (
            <div 
              key={index}
              className="absolute bg-white bg-opacity-80 rounded-full px-3 py-1 text-sm font-medium shadow-sm"
              style={{
                left: `${emotion.facialLandmarks?.[0]?.[0] || 0}px`,
                top: `${(emotion.facialLandmarks?.[0]?.[1] || 0) - 40}px`
              }}
            >
              {emotion.emotion} ({Math.round(emotion.probability * 100)}%)
            </div>
          ))}
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          {emotions.map((emotion, index) => (
            <div key={index} className="bg-muted p-3 rounded-lg">
              <h4 className="font-medium capitalize">{emotion.emotion}</h4>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${emotion.probability * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Confidence: {Math.round(emotion.probability * 100)}%
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
