import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TrainingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  className: string;
  onConfirm: (className: string, isCorrect: boolean) => void;
}

export function TrainingDialog({
  isOpen,
  onClose,
  className,
  onConfirm
}: TrainingDialogProps) {
  const [userInput, setUserInput] = useState(className);
  const [isTraining, setIsTraining] = useState(false);

  const handleSubmit = (isCorrect: boolean) => {
    setIsTraining(true);
    onConfirm(userInput, isCorrect);
    setIsTraining(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Improve Object Recognition</DialogTitle>
          <DialogDescription>
            Help the AI learn by confirming or correcting this identification.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">AI identified this as:</p>
            <p className="text-muted-foreground">{className}</p>
          </div>
          
          <div>
            <label htmlFor="correctName" className="text-sm font-medium mb-1 block">
              What is this object really?
            </label>
            <Input
              id="correctName"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Enter the correct name"
            />
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => handleSubmit(false)}
            disabled={isTraining}
          >
            Incorrect Identification
          </Button>
          <Button 
            onClick={() => handleSubmit(true)}
            disabled={isTraining}
          >
            Correct Identification
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
