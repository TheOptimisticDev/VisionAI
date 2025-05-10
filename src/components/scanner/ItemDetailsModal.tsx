import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ItemDetails } from '@/services/aiService';

interface ItemDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemDetails: ItemDetails | null;
  scannedImage: string | null;
  onTrainModel?: (className: string, isCorrect: boolean) => void;
}

export function ItemDetailsModal({ 
  isOpen, 
  onClose, 
  itemDetails, 
  scannedImage,
  onTrainModel
}: ItemDetailsModalProps) {
  if (!itemDetails) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{itemDetails.name}</DialogTitle>
        </DialogHeader>
        
        {scannedImage && (
          <div className="flex justify-center mb-4">
            <div className="w-32 h-32 overflow-hidden rounded-lg">
              <img src={scannedImage} alt={itemDetails.name} className="w-full h-full object-cover" />
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {itemDetails.description}
          </p>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Properties</h4>
            <div className="grid grid-cols-2 gap-2">
              {itemDetails.properties.map((prop, index) => (
                <div key={index} className="space-y-1">
                  <p className="text-xs text-muted-foreground">{prop.name}</p>
                  <p className="text-sm font-medium">{prop.value}</p>
                </div>
              ))}
            </div>
          </div>
          
          {itemDetails.additionalInfo && (
            <>
              <Separator />
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs text-muted-foreground">{itemDetails.additionalInfo}</p>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          {onTrainModel && (
            <>
              <Button 
                variant="outline" 
                onClick={() => onTrainModel(itemDetails.name, false)}
              >
                Incorrect
              </Button>
              <Button 
                variant="secondary"
                onClick={() => onTrainModel(itemDetails.name, true)}
              >
                Correct
              </Button>
            </>
          )}
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
