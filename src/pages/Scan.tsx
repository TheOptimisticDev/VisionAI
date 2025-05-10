import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Camera } from '@/components/scanner/Camera';
import { ScanResult } from '@/components/scanner/ScanResult';
import { ItemDetailsModal } from '@/components/scanner/ItemDetailsModal';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { 
  PredictionResult, 
  EmotionResult,
  PoseResult,
  ItemDetails, 
  classifyImage, 
  getItemDetails, 
  loadModelWithProgress, 
  trainModelWithNewData
} from '@/services/aiService';
import { getImageFromDataUrl } from '@/utils/cameraUtils';
import { saveToHistory } from '@/services/historyService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ParticleBackground } from '@/components/effects/ParticleBackground';
import { TrainingDialog } from '@/components/scanner/TrainingDialog';
import { EmotionVisualization } from '@/components/scanner/EmotionVisualization'; // Ensure this file exists or update the path
import { PoseVisualization } from '@/components/scanner/PoseVisualization';

const Scan = () => {
  const { currentUser } = useAuth();
  const { 
    subscriptionStatus, 
    remainingScans, 
    decrementScans, 
    shouldShowSubscription, 
    setShouldShowSubscription 
  } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [emotions, setEmotions] = useState<EmotionResult[]>([]);
  const [poses, setPoses] = useState<PoseResult[]>([]);
  const [selectedItem, setSelectedItem] = useState<ItemDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showTrainingDialog, setShowTrainingDialog] = useState(false);
  const [trainingClassName, setTrainingClassName] = useState('');
  const [analysisMode, setAnalysisMode] = useState<'object' | 'emotion' | 'pose'>('object');

  useEffect(() => {
    if (shouldShowSubscription) {
      navigate('/subscription');
    }
  }, [shouldShowSubscription, navigate]);

  useEffect(() => {
    const initModel = async () => {
      try {
        await loadModelWithProgress((progress) => {
          setLoadingProgress(progress);
        });
        setIsModelLoading(false);
      } catch (error) {
        console.error('Failed to load AI model:', error);
        toast({
          title: "AI Model Failed to Load",
          description: "There was a problem loading the AI model. Please try refreshing the page.",
          variant: "destructive",
        });
      }
    };
    
    initModel();
  }, []);

  const handleCapture = async (imageDataUrl: string) => {
    if (!currentUser && remainingScans <= 0) {
      toast({
        title: "Scan Limit Reached",
        description: "Sign in to continue scanning or subscribe for unlimited scans.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    } else if (subscriptionStatus === 'none' && remainingScans <= 0) {
      setShouldShowSubscription(true);
      return;
    }
    
    setCapturedImage(imageDataUrl);
    setIsAnalyzing(true);
    
    try {
      const imageElement = await getImageFromDataUrl(imageDataUrl);
      const { objects, emotions, poses } = await classifyImage(imageElement);
      
      setPredictions(objects);
      setEmotions(emotions);
      setPoses(poses);
      
      if (subscriptionStatus === 'none') {
        decrementScans();
      }
      
      if (objects.length > 0 && objects[0].probability > 0.7) {
        handleSelectItem(objects[0].className, imageDataUrl);
      }
    } catch (error) {
      console.error('Failed to analyze image:', error);
      toast({
        title: "Analysis Failed",
        description: "There was a problem analyzing your image. Please try again.",
        variant: "destructive",
      });
      setPredictions([]);
      setEmotions([]);
      setPoses([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectItem = async (className: string, imageDataUrl?: string) => {
    try {
      const details = await getItemDetails(
        className, 
        imageDataUrl || capturedImage || undefined
      );
      setSelectedItem(details);
      setIsModalOpen(true);
      
      if (currentUser && capturedImage) {
        const selectedPrediction = predictions.find(p => p.className === className);
        if (selectedPrediction) {
          await saveToHistory(
            currentUser.uid,
            capturedImage,
            details.name,
            selectedPrediction.probability,
            emotions,
            poses
          );
        }
      }
    } catch (error) {
      console.error('Failed to get item details:', error);
      toast({
        title: "Error",
        description: "Failed to retrieve item details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTrainModel = async (className: string, isCorrect: boolean) => {
    if (!capturedImage) return;
    
    try {
      const imageElement = await getImageFromDataUrl(capturedImage);
      await trainModelWithNewData(imageElement, className, isCorrect);
      
      toast({
        title: "Model Updated",
        description: `The AI has been ${isCorrect ? 'trained' : 'corrected'} with this example.`,
      });
      
      if (!isCorrect) {
        setIsAnalyzing(true);
        const { objects } = await classifyImage(imageElement);
        setPredictions(objects);
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error('Training failed:', error);
      toast({
        title: "Training Failed",
        description: "There was a problem updating the AI model.",
        variant: "destructive",
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleStartOver = () => {
    setCapturedImage(null);
    setPredictions([]);
    setEmotions([]);
    setPoses([]);
    setSelectedItem(null);
  };

  const renderContent = () => {
    if (!currentUser && remainingScans <= 0) {
      return (
        <div className="text-center my-12 max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm animate-fade-in">
          <h2 className="text-xl font-semibold mb-3">Scan Limit Reached</h2>
          <p className="text-muted-foreground mb-6">
            Sign in to continue scanning or subscribe for unlimited scans.
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/auth')}
              className="transition-all duration-200 transform hover:scale-105"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigate('/subscription')}
              className="transition-all duration-200 transform hover:scale-105 bg-brand-600 hover:bg-brand-700"
            >
              Subscribe
            </Button>
          </div>
        </div>
      );
    }
  
    return (
      <div className="space-y-8 mt-8 animate-fade-in">
        {subscriptionStatus === 'none' && (
          <div className="bg-brand-50 border border-brand-200 rounded-lg p-4 mb-4 animate-fade-in">
            <p className="text-center">
              <span className="font-small text-black">Remaining free scans: {remainingScans}</span>
              {remainingScans <= 1 && (
                <Button 
                  variant="link" 
                  onClick={() => navigate('/subscription')}
                  className="ml-2 text-brand-600 p-0 h-auto transition-all duration-200"
                >
                  Upgrade now
                </Button>
              )}
            </p>
          </div>
        )}
        
        {capturedImage ? (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-center space-x-4">
              <Button 
                variant={analysisMode === 'object' ? 'default' : 'outline'}
                onClick={() => setAnalysisMode('object')}
              >
                Objects
              </Button>
              <Button 
                variant={analysisMode === 'emotion' ? 'default' : 'outline'}
                onClick={() => setAnalysisMode('emotion')}
                disabled={emotions.length === 0}
              >
                Emotions ({emotions.length})
              </Button>
              <Button 
                variant={analysisMode === 'pose' ? 'default' : 'outline'}
                onClick={() => setAnalysisMode('pose')}
                disabled={poses.length === 0}
              >
                Poses ({poses.length})
              </Button>
            </div>

            {analysisMode === 'object' && (
              <ScanResult 
                predictions={predictions} 
                onSelectItem={(className) => handleSelectItem(className, capturedImage)} 
                isLoading={isAnalyzing}
              />
            )}

            {analysisMode === 'emotion' && emotions.length > 0 && (
              <EmotionVisualization 
                image={capturedImage}
                emotions={emotions}
              />
            )}

            {analysisMode === 'pose' && poses.length > 0 && (
              <PoseVisualization 
                image={capturedImage}
                poses={poses}
              />
            )}

            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                onClick={handleStartOver}
                className="transition-all duration-200 transform hover:scale-105"
              >
                Scan Another Item
              </Button>
              {predictions.length > 0 && (
                <Button 
                  variant="secondary"
                  onClick={() => {
                    setTrainingClassName(predictions[0].className);
                    setShowTrainingDialog(true);
                  }}
                >
                  Improve Recognition
                </Button>
              )}
            </div>
          </div>
        ) : (
          <Camera onCapture={handleCapture} />
        )}
        
        <ItemDetailsModal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          itemDetails={selectedItem}
          scannedImage={capturedImage}
          onTrainModel={(className, isCorrect) => {
            handleTrainModel(className, isCorrect);
            handleCloseModal();
          }}
        />
        
        <TrainingDialog
          isOpen={showTrainingDialog}
          onClose={() => setShowTrainingDialog(false)}
          className={trainingClassName}
          onConfirm={(className, isCorrect) => {
            handleTrainModel(className, isCorrect);
            setShowTrainingDialog(false);
          }}
        />
      </div>
    );
  };

  return (
    <MainLayout>
      <ParticleBackground />
      <div className="max-w-4xl mx-auto">
        {isModelLoading ? (
          <div className="text-center my-12">
            <h2 className="text-xl font-semibold mb-4">Loading AI Model</h2>
            <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-md mx-auto">
              <div 
                className="bg-brand-600 h-2.5 rounded-full" 
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-muted-foreground mt-2">
              {Math.floor(loadingProgress)}% complete
            </p>
          </div>
        ) : renderContent()}
      </div>
    </MainLayout>
  );
};

export default Scan;
