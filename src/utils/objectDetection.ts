
import { pipeline, env } from '@huggingface/transformers';
import * as tf from '@tensorflow/tfjs';

// Configure transformers.js to download models when needed
env.allowLocalModels = false;
env.useBrowserCache = true; // Enable browser cache to improve performance

// Models known to be well-optimized for browser environments - prioritizing smaller models for mobile
const MODELS = [
  'Xenova/mobilevit-small', // Smaller model better for mobile
  'Xenova/vit-base-patch16-224',
];

// TensorFlow.js MobileNet model as fallback
const TENSORFLOW_MODEL = 'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v2_100_224/classification/5/default/1';

let imageClassifier: any = null;
let tfModel: tf.GraphModel | null = null;
let isInitializing: boolean = false;
let lastError: Error | null = null;
let useTensorFlow: boolean = false;

export interface ObjectDetectionResult {
  label: string;
  score: number;
}

export const initializeObjectDetection = async (): Promise<void> => {
  // Prevent multiple simultaneous initialization attempts
  if (isInitializing) {
    console.log('Initialization already in progress, waiting...');
    // Wait for current initialization to complete or fail
    let attempts = 0;
    while (isInitializing && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }
    
    if (imageClassifier || tfModel) return;
    if (lastError) throw lastError;
  }
  
  isInitializing = true;
  lastError = null;
  
  try {
    console.log('Initializing object detection model...');
    
    // First try Hugging Face models
    for (const model of MODELS) {
      try {
        console.log(`Attempting to use model: ${model}`);
        
        // Try with WebGPU first (fastest)
        try {
          console.log('Attempting to initialize with WebGPU...');
          imageClassifier = await pipeline('image-classification', model, {
            device: 'webgpu',
            progress_callback: (progressInfo: any) => {
              if (progressInfo && typeof progressInfo.percentage === 'number') {
                const percentage = Math.round(progressInfo.percentage * 100);
                console.log(`Loading model: ${percentage}%`);
              } else {
                console.log(`Loading model: in progress`);
              }
            }
          });
          console.log(`Object detection model initialized with WebGPU using ${model}`);
          return;
        } catch (webgpuError) {
          console.log('WebGPU not available for this model, trying WASM', webgpuError);
        }
        
        // Try with WASM (second fastest)
        try {
          console.log('Attempting to initialize with WASM...');
          imageClassifier = await pipeline('image-classification', model, {
            device: 'wasm',
            progress_callback: (progressInfo: any) => {
              if (progressInfo && typeof progressInfo.percentage === 'number') {
                const percentage = Math.round(progressInfo.percentage * 100);
                console.log(`Loading model: ${percentage}%`);
              } else {
                console.log(`Loading model: in progress`);
              }
            }
          });
          console.log(`Object detection model initialized with WASM using ${model}`);
          return;
        } catch (wasmError) {
          console.log('WASM not available for this model, trying next model', wasmError);
        }
      } catch (modelError) {
        console.log(`Could not initialize with model ${model}:`, modelError);
      }
    }
    
    // If Hugging Face models failed, try TensorFlow.js
    try {
      console.log('Attempting to use TensorFlow.js model as fallback...');
      await tf.ready();
      
      // Check if we're on a mobile device to optimize memory usage
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Set flags to optimize for mobile
        tf.env().set('WEBGL_FORCE_F16_TEXTURES', true);
        tf.env().set('WEBGL_PACK', false);
      }
      
      // Load and warm up the model
      tfModel = await tf.loadGraphModel(TENSORFLOW_MODEL);
      
      // Warm up the model with a dummy tensor
      const dummyInput = tf.zeros([1, 224, 224, 3]);
      await tfModel.predict(dummyInput);
      dummyInput.dispose();
      
      console.log('TensorFlow.js model initialized successfully');
      useTensorFlow = true;
      return;
    } catch (tfError) {
      console.log('TensorFlow.js model initialization failed:', tfError);
      throw new Error('Could not initialize object detection. Your device may not be compatible. Please try on a different device or browser.');
    }
  } catch (error: any) {
    console.error('Failed to initialize object detection model:', error);
    lastError = error;
    throw error;
  } finally {
    isInitializing = false;
  }
};

export const detectObject = async (image: string | HTMLImageElement): Promise<ObjectDetectionResult[]> => {
  try {
    if (!imageClassifier && !tfModel) {
      await initializeObjectDetection();
    }

    if (!imageClassifier && !tfModel) {
      throw new Error('Object detection model not initialized');
    }

    console.log('Detecting objects in image...');
    
    if (useTensorFlow && tfModel) {
      return detectWithTensorFlow(image);
    } else if (imageClassifier) {
      const results = await imageClassifier(image, {
        topk: 5, // Return top 5 predictions
      });
      console.log('Detection results:', results);
      
      return results.map((result: any) => ({
        label: result.label,
        score: result.score,
      }));
    } else {
      throw new Error('No detection method available');
    }
  } catch (error) {
    console.error('Error detecting objects:', error);
    throw error;
  }
};

const detectWithTensorFlow = async (image: string | HTMLImageElement): Promise<ObjectDetectionResult[]> => {
  if (!tfModel) {
    throw new Error('TensorFlow model not initialized');
  }
  
  try {
    // Create a temporary image element if we got a URL
    let imgElement: HTMLImageElement;
    if (typeof image === 'string') {
      imgElement = new Image();
      imgElement.crossOrigin = 'anonymous';
      
      // Wait for image to load
      await new Promise((resolve, reject) => {
        imgElement.onload = resolve;
        imgElement.onerror = reject;
        imgElement.src = image;
      });
    } else {
      imgElement = image;
    }
    
    // Preprocess the image
    const tensorImg = tf.browser.fromPixels(imgElement)
      .resizeBilinear([224, 224]) // Resize to match MobileNet input
      .toFloat()
      .expandDims(0);
    
    // Normalize to [-1, 1]
    const normalized = tensorImg.div(127.5).sub(1);
    
    // Run prediction
    const predictions = await tfModel.predict(normalized);
    
    // Get top 5 results
    let logits = Array.isArray(predictions) ? predictions[0] : predictions;
    if (typeof logits.data !== 'function') {
      throw new Error('Prediction result is not a tensor');
    }
    const data = await logits.data();
    
    // Clean up tensors
    tensorImg.dispose();
    normalized.dispose();
    if (Array.isArray(predictions)) {
      predictions.forEach(p => p.dispose && p.dispose());
    } else if (predictions && typeof (predictions as any).dispose === 'function') {
      (predictions as any).dispose();
    }
    
    // Get the indices of the top 5 predictions
    const indices = Array.from(data)
      .map((value, index) => ({ value, index }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .map(item => item.index);

    // Map to labels
    const results = indices.map((index) => {
      // Convert index to human-readable label (simplified mapping)
      const label = IMAGENET_CLASSES[index] || `unknown_${index}`;
      return {
        label,
        score: data[index]
      };
    });
    
    console.log('TensorFlow detection results:', results);
    return results;
  } catch (error) {
    console.error('Error in TensorFlow detection:', error);
    throw error;
  }
};

export const getObjectInfo = async (label: string): Promise<string> => {
  const cleanLabel = label.split(',')[0].trim().toLowerCase();
  
  try {
    // For real app, we could use Wikipedia API or similar
    // Basic info structure for commonly detected objects
    const objectInfoMap: Record<string, string> = {
      cup: "A cup is a small container used for drinking. Cups are often made of ceramic, glass, or plastic and come in various shapes and sizes. They may have handles for hot liquids and are used worldwide for beverages like coffee, tea, and water.",
      keyboard: "A keyboard is an input device that allows users to enter characters and functions into a computer by pressing buttons or keys. Modern keyboards typically have 101-104 keys and include function keys, navigation keys, and a numeric keypad along with alphanumeric keys.",
      laptop: "A laptop is a portable personal computer with a clamshell form factor suitable for mobile use. It typically incorporates a screen, keyboard, touchpad, speakers, battery and various ports for connectivity. Laptops range from thin ultrabooks to powerful gaming machines.",
      book: "A book is a medium for recording information in the form of writing or images, typically composed of pages bound together. Books have been in production for over two thousand years and can contain fiction, non-fiction, references, textbooks, and more.",
      phone: "A smartphone is a portable device that combines cellular and mobile computing functions into one unit. Modern smartphones typically feature touchscreens, high-resolution cameras, GPS capabilities, and can run thousands of applications for productivity, entertainment, and communication.",
      chair: "A chair is a piece of furniture with a raised surface supported by legs, commonly used to seat a single person. Chairs can be made from wood, metal, plastic, or upholstered materials and come in various styles including dining chairs, office chairs, recliners, and more.",
      table: "A table is a piece of furniture with a flat top and one or more legs, used as a surface for working at, eating from, or placing items on. Tables come in many shapes (rectangular, round, square), sizes, and materials, and are central pieces in dining rooms, offices, and living spaces.",
      pen: "A pen is a common writing instrument used to apply ink to a surface for writing or drawing. Modern pens come in various types including ballpoint, rollerball, fountain, gel, and felt tip, each with different writing characteristics and ink properties.",
      glasses: "Glasses or eyeglasses are frames bearing lenses worn in front of the eyes to correct vision or protect the eyes. They consist of a pair of lenses mounted in a frame that holds them in front of a person's eyes, typically utilizing temples that extend to the ears.",
      watch: "A watch is a portable timepiece intended to be carried or worn by a person, designed to keep a consistent movement despite the motions caused by the person's activities. Modern watches can be analog or digital, with features ranging from basic timekeeping to complex functions like heart rate monitoring and smart notifications.",
      car: "A car is a wheeled motor vehicle used for transportation. Most definitions of cars say that they run primarily on roads, seat one to eight people, have four wheels, and mainly transport people rather than goods. Modern cars feature sophisticated systems for safety, comfort, and entertainment.",
      bottle: "A bottle is a narrow-necked container made of an impermeable material in various shapes and sizes to store and transport liquids. Materials used for bottles include glass, plastic, and metal. They're used for beverages, medicines, cosmetics, and many other liquids.",
      dog: "Dogs are domesticated mammals, part of the wolf family. They're widely kept as pets and have been bred into many varieties. Dogs have been used for work, hunting, protection, and companionship throughout human history. They're known for their loyalty and ability to be trained.",
      cat: "Cats are small carnivorous mammals and are often kept as pets. They're valued for their companionship and ability to hunt vermin. Domestic cats have been living alongside humans for thousands of years and have developed unique behaviors adapted to living with people.",
      bicycle: "A bicycle is a two-wheeled vehicle propelled by the rider who pushes pedals that rotate wheels via a chain mechanism. Bicycles are used for transportation, recreation, exercise, and sport. They're environmentally friendly, requiring no fuel other than human power.",
      apple: "Apples are pomaceous fruits produced by apple trees. They're one of the most widely cultivated tree fruits and are a popular food in many countries. Apples come in thousands of varieties, varying in color, size, and taste from sweet to tart.",
      banana: "Bananas are elongated, edible fruits produced by several kinds of large herbaceous flowering plants. They're rich in potassium, vitamin C, and dietary fiber. Bananas are one of the most popular fruits worldwide and are available year-round in most grocery stores."
    };
    
    if (objectInfoMap[cleanLabel]) {
      return objectInfoMap[cleanLabel];
    }
    
    // For objects not in our database, use a more generic response based on the label
    return `This appears to be a ${cleanLabel}. ${cleanLabel.charAt(0).toUpperCase() + cleanLabel.slice(1)} is an object that has been identified through computer vision analysis. In a production app, this would connect to a knowledge database to provide detailed specifications and information about this specific item.`;
  } catch (error) {
    console.error('Error fetching object information:', error);
    return `${cleanLabel} - Object information currently unavailable. In production, this would connect to an information database to provide you with detailed information about this item.`;
  }
};

// ImageNet class names for TensorFlow.js MobileNet model
// This is a simplified version with just the most common classes
const IMAGENET_CLASSES: Record<number, string> = {
  0: "background",
  1: "tench, Tinca tinca",
  2: "goldfish, Carassius auratus",
  3: "great white shark, white shark",
  4: "tiger shark, Galeocerdo cuvieri",
  5: "hammerhead, hammerhead shark",
  // ... simplified for brevity, in production we would include all 1000 classes
  // Key classes people might use with a mobile app
  101: "computer keyboard, keypad",
  102: "computer mouse",
  145: "coffee mug",
  199: "backpack",
  218: "clock",
  232: "digital watch",
  233: "wall clock",
  245: "cellular telephone, cellular phone, cellphone",
  248: "notebook, notebook computer",
  249: "monitor",
  276: "sunglasses, dark glasses, shades",
  283: "laptop, laptop computer",
  296: "pen",
  300: "book, books",
  329: "cat",
  331: "dog",
  371: "car, automobile",
  417: "shopping basket",
  442: "table",
  487: "bowl",
  488: "chair",
  506: "glass",
  530: "banana",
  549: "strawberry",
  660: "TV",
  720: "pillow",
  756: "computer monitor",
  761: "coffee table",
  764: "desk",
  770: "door",
  780: "window",
  834: "glasses, eyeglasses",
  849: "headphones",
  859: "lamp",
  950: "water bottle",
  999: "unknown"
};
