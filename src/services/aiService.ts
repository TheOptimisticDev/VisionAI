import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as facemesh from '@tensorflow-models/facemesh';
import * as posenet from '@tensorflow-models/posenet';
import axios from 'axios';

// Type definitions
export interface PredictionResult {
  className: string;
  probability: number;
  boundingBox?: { left: number; top: number; width: number; height: number };
}

export interface EmotionResult {
  emotion: string;
  probability: number;
  facialLandmarks?: number[][];
}

export interface PoseResult {
  keypoints: {
    position: [number, number];
    part: string;
    score: number;
  }[];
  score: number;
}

export interface Property {
  name: string;
  value: string;
}

export interface ItemDetails {
  name: string;
  description: string;
  properties: Property[];
  additionalInfo?: string;
  isUserTrained?: boolean;
}

// Model instances and configuration
let objectModel: mobilenet.MobileNet | null = null;
let faceModel: facemesh.FaceMesh | null = null;
let poseModel: posenet.PoseNet | null = null;
let customModel: tf.LayersModel | null = null;

const confidenceThreshold = 0.5;
const emotionLabels = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral'];
const KNOWN_ITEMS: Record<string, ItemDetails> = {
  'apple': {
    name: 'Apple',
    description: 'A sweet, edible fruit produced by an apple tree.',
    properties: [
      { name: 'Type', value: 'Fruit' },
      { name: 'Color', value: 'Red/Green' }
    ]
  },
  'person': {
    name: 'Person',
    description: 'A human being.',
    properties: [
      { name: 'Type', value: 'Human' }
    ]
  },
  // Add more known items as needed
};

// Model initialization
export async function loadModelWithProgress(
  progressCallback?: (progress: number) => void
): Promise<void> {
  try {
    const totalModels = 3; // Object, Face, Pose
    let loadedModels = 0;

    const updateProgress = () => {
      loadedModels++;
      if (progressCallback) {
        progressCallback(Math.floor((loadedModels / totalModels) * 100));
      }
    };

    // Load models in parallel
    await Promise.all([
      loadObjectModel().then(updateProgress),
      loadFaceModel().then(updateProgress),
      loadPoseModel().then(updateProgress)
    ]);

    // Load custom model
    await loadCustomModel();

    if (progressCallback) progressCallback(100);
  } catch (error) {
    console.error('Model loading failed:', error);
    throw new Error('Failed to load AI models');
  }
}

async function loadObjectModel(): Promise<void> {
  objectModel = await mobilenet.load({
    version: 2,
    alpha: 0.5
  });
}

async function loadFaceModel(): Promise<void> {
  faceModel = await facemesh.load({
    maxFaces: 5,
    detectionConfidence: 0.8
  });
}

async function loadPoseModel(): Promise<void> {
  poseModel = await posenet.load({
    architecture: 'MobileNetV1',
    outputStride: 16,
    inputResolution: 257,
    multiplier: 0.75
  });
}

async function loadCustomModel(): Promise<void> {
  try {
    const models = await tf.io.listModels();
    if (models['custom-scanner-model']) {
      customModel = await tf.loadLayersModel('indexeddb://custom-scanner-model');
      return;
    }
    createNewCustomModel();
  } catch (error) {
    console.error('Custom model loading failed:', error);
    createNewCustomModel();
  }
}

function createNewCustomModel(): void {
  const model = tf.sequential();
  model.add(tf.layers.dense({
    units: 128,
    activation: 'relu',
    inputShape: [1024]
  }));
  model.add(tf.layers.dense({
    units: 1,
    activation: 'sigmoid'
  }));
  customModel = model;
}

// Core detection functions
export async function classifyImage(
  image: HTMLImageElement | HTMLCanvasElement
): Promise<{
  objects: PredictionResult[];
  emotions: EmotionResult[];
  poses: PoseResult[];
}> {
  if (!objectModel || !faceModel || !poseModel) {
    throw new Error('Models not loaded');
  }

  // Run all detections in parallel
  const [objectPredictions, facePredictions, posePredictions] = await Promise.all([
    detectObjects(image),
    detectEmotions(image),
    detectPoses(image)
  ]);

  return {
    objects: objectPredictions,
    emotions: facePredictions,
    poses: posePredictions
  };
}

async function detectObjects(image: HTMLImageElement | HTMLCanvasElement): Promise<PredictionResult[]> {
  if (!objectModel) return [];
  
  const predictions = await objectModel.classify(image);
  const customPredictions = customModel ? await classifyWithCustomModel(image) : [];
  
  return [...predictions, ...customPredictions]
    .filter(p => p.probability >= confidenceThreshold)
    .map(p => ({
      className: p.className,
      probability: p.probability,
      boundingBox: 'boundingBox' in p && p.boundingBox && typeof p.boundingBox === 'object'
        ? {
            left: (p.boundingBox as { left: number; top: number; width: number; height: number }).left,
            top: (p.boundingBox as { left: number; top: number; width: number; height: number }).top,
            width: (p.boundingBox as { left: number; top: number; width: number; height: number }).width,
            height: (p.boundingBox as { left: number; top: number; width: number; height: number }).height
          }
        : undefined
    }));
}

async function detectEmotions(image: HTMLImageElement | HTMLCanvasElement): Promise<EmotionResult[]> {
  if (!faceModel) return [];
  
  const faces = await faceModel.estimateFaces(image);
  return faces.map(face => {
    const emotionProbs = face.faceInViewConfidence 
      ? predictEmotionFromLandmarks(face.scaledMesh as number[][])
      : Array(emotionLabels.length).fill(0);
    
    const maxProbIndex = emotionProbs.indexOf(Math.max(...emotionProbs));
    return {
      emotion: emotionLabels[maxProbIndex],
      probability: emotionProbs[maxProbIndex],
      facialLandmarks: face.scaledMesh as number[][]
    };
  });
}

async function detectPoses(image: HTMLImageElement | HTMLCanvasElement): Promise<PoseResult[]> {
  if (!poseModel) return [];
  
  const poses = await poseModel.estimateMultiplePoses(image, {
    flipHorizontal: false,
    maxDetections: 5,
    scoreThreshold: 0.3,
    nmsRadius: 20
  });
  
  return poses.map(pose => ({
    keypoints: pose.keypoints.map(kp => ({
      position: [kp.position.x, kp.position.y] as [number, number],
      part: kp.part,
      score: kp.score
    })),
    score: pose.score
  }));
}

// Emotion detection helpers
function predictEmotionFromLandmarks(landmarks: number[][]): number[] {
  // Calculate facial features
  const mouthOpenness = calculateMouthOpenness(landmarks);
  const eyebrowRaise = calculateEyebrowRaise(landmarks);
  const eyeOpenness = calculateEyeOpenness(landmarks);
  
  // Simple heuristic-based emotion probabilities
  return [
    // angry
    eyebrowRaise > 0.7 && eyeOpenness > 0.7 ? 0.8 : 0.1,
    // disgust (hard to detect without proper model)
    0.05,
    // fear
    eyeOpenness > 0.8 && mouthOpenness > 0.6 ? 0.7 : 0.1,
    // happy
    mouthOpenness > 0.5 ? 0.9 : 0.3,
    // sad
    eyebrowRaise > 0.7 ? 0.6 : 0.2,
    // surprise
    mouthOpenness > 0.7 && eyeOpenness > 0.9 ? 0.8 : 0.1,
    // neutral
    0.3
  ];
}

function calculateMouthOpenness(landmarks: number[][]): number {
  const upperLip = landmarks[13][1];
  const lowerLip = landmarks[14][1];
  return Math.min(1, Math.max(0, (lowerLip - upperLip) / 30));
}

function calculateEyebrowRaise(landmarks: number[][]): number {
  const leftBrow = landmarks[63][1];
  const rightBrow = landmarks[294][1];
  const eyeLevel = (landmarks[159][1] + landmarks[386][1]) / 2;
  return Math.min(1, Math.max(0, (eyeLevel - (leftBrow + rightBrow) / 2) / 20));
}

function calculateEyeOpenness(landmarks: number[][]): number {
  const leftEyeTop = landmarks[159][1];
  const leftEyeBottom = landmarks[145][1];
  const rightEyeTop = landmarks[386][1];
  const rightEyeBottom = landmarks[374][1];
  
  const leftEyeOpenness = (leftEyeBottom - leftEyeTop) / 10;
  const rightEyeOpenness = (rightEyeBottom - rightEyeTop) / 10;
  
  return Math.min(1, Math.max(0, (leftEyeOpenness + rightEyeOpenness) / 2));
}

// Custom model functions
async function classifyWithCustomModel(
  image: HTMLImageElement | HTMLCanvasElement
): Promise<PredictionResult[]> {
  if (!customModel || !objectModel) return [];
  
  try {
    const features = await extractFeatures(image);
    const prediction = customModel.predict(features) as tf.Tensor;
    const probability = prediction.dataSync()[0];
    
    tf.dispose([features, prediction]);
    
    if (probability >= confidenceThreshold) {
      return [{
        className: 'User-trained object',
        probability
      }];
    }
    
    return [];
  } catch (error) {
    console.error('Custom model prediction failed:', error);
    return [];
  }
}

async function extractFeatures(
  image: HTMLImageElement | HTMLCanvasElement
): Promise<tf.Tensor> {
  if (!objectModel) throw new Error('Object model not loaded');
  
  // Get intermediate activation from MobileNet
  const activation = (objectModel as any).infer(image, 'conv_preds');
  const features = tf.mean(activation, [1, 2]); // Global average pooling
  tf.dispose(activation);
  return features;
}

// Training functions
export async function trainModelWithNewData(
  image: HTMLImageElement | HTMLCanvasElement,
  className: string,
  isPositiveExample: boolean
): Promise<void> {
  if (!customModel || !objectModel) return;
  
  try {
    const features = await extractFeatures(image);
    const label = tf.tensor1d([isPositiveExample ? 1 : 0]);
    
    // Train the model with this single example
    await customModel.fit(features, label, {
      epochs: 5,
      batchSize: 1,
      validationSplit: 0.2
    });
    
    // Save the updated model
    await customModel.save('indexeddb://custom-scanner-model');
    
    // Remember this class
    if (isPositiveExample) {
      KNOWN_ITEMS[className.toLowerCase()] = {
        name: className,
        description: 'User-trained object',
        properties: [
          { name: 'Type', value: 'User-trained' }
        ],
        isUserTrained: true
      };
    }
    
    tf.dispose([features, label]);
  } catch (error) {
    console.error('Model training failed:', error);
    throw error;
  }
}

// Item information functions
export async function getItemDetails(
  className: string,
  imageDataUrl?: string
): Promise<ItemDetails> {
  // Check for user-trained items first
  const normalizedName = className.toLowerCase().split(',')[0].trim();
  if (KNOWN_ITEMS[normalizedName]?.isUserTrained) {
    return KNOWN_ITEMS[normalizedName];
  }
  
  // Check known items
  if (KNOWN_ITEMS[normalizedName]) {
    return KNOWN_ITEMS[normalizedName];
  }
  
  // Try web search if available
  if (imageDataUrl) {
    const webResult = await searchWebForObject(imageDataUrl);
    if (webResult) return webResult;
  }
  
  // Fallback for unknown items
  return {
    name: className.split(',')[0],
    description: 'No detailed information available for this object.',
    properties: [
      { name: 'Status', value: 'Unidentified' }
    ],
    additionalInfo: 'Would you like to help improve the app by identifying this object?'
  };
}

async function searchWebForObject(
  imageDataUrl: string
): Promise<ItemDetails | null> {
  try {
    // In a real app, you would call your backend API here
    // This is a simulation of what the response might look like
    return {
      name: 'Web Result',
      description: 'Information obtained from web search.',
      properties: [
        { name: 'Source', value: 'Web Search' }
      ],
      additionalInfo: 'This information was obtained from an online search.'
    };
  } catch (error) {
    console.error('Web search failed:', error);
    return null;
  }
}

// Utility exports
export {
  KNOWN_ITEMS,
  confidenceThreshold,
  emotionLabels
};
