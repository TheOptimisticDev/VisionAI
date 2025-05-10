import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PoseResult } from '@/services/aiService';

interface PoseVisualizationProps {
  image: string;
  poses: PoseResult[];
}

export function PoseVisualization({ image, poses }: PoseVisualizationProps) {
  const drawCanvas = (canvas: HTMLCanvasElement | null) => {
    if (!canvas || !image) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Draw keypoints
      poses.forEach(pose => {
        pose.keypoints.forEach(kp => {
          if (kp.score > 0.3) {
            ctx.beginPath();
            ctx.arc(kp.position[0], kp.position[1], 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
            
            // Draw part name
            ctx.fillStyle = 'white';
            ctx.font = '10px Arial';
            ctx.fillText(kp.part, kp.position[0] + 8, kp.position[1] + 3);
          }
        });
        
        // Draw skeleton
        const adjacentKeyPoints = [
          ['leftShoulder', 'leftElbow'],
          ['leftElbow', 'leftWrist'],
          ['rightShoulder', 'rightElbow'],
          ['rightElbow', 'rightWrist'],
          ['leftShoulder', 'rightShoulder'],
          ['leftShoulder', 'leftHip'],
          ['rightShoulder', 'rightHip'],
          ['leftHip', 'rightHip'],
          ['leftHip', 'leftKnee'],
          ['rightHip', 'rightKnee'],
          ['leftKnee', 'leftAnkle'],
          ['rightKnee', 'rightAnkle']
        ];
        
        adjacentKeyPoints.forEach(([part1, part2]) => {
          const kp1 = pose.keypoints.find(kp => kp.part === part1);
          const kp2 = pose.keypoints.find(kp => kp.part === part2);
          
          if (kp1 && kp2 && kp1.score > 0.3 && kp2.score > 0.3) {
            ctx.beginPath();
            ctx.moveTo(kp1.position[0], kp1.position[1]);
            ctx.lineTo(kp2.position[0], kp2.position[1]);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'green';
            ctx.stroke();
          }
        });
      });
    };
    img.src = image;
  };

  return (
    <Card className="w-full max-w-xl mx-auto animate-fade-in">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Body Language Analysis</h3>
        
        <div className="relative">
          <canvas 
            ref={drawCanvas}
            className="w-full rounded-lg border border-gray-200"
          />
        </div>
        
        <div className="mt-4 space-y-3">
          {poses.map((pose, index) => (
            <div key={index} className="bg-muted p-3 rounded-lg">
              <h4 className="font-medium">Person {index + 1}</h4>
              <p className="text-sm text-muted-foreground">
                Confidence: {Math.round(pose.score * 100)}%
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {pose.keypoints
                  .filter(kp => kp.score > 0.5)
                  .map(kp => (
                    <div key={kp.part} className="text-xs">
                      <span className="capitalize">{kp.part}: </span>
                      <span>{Math.round(kp.score * 100)}%</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
