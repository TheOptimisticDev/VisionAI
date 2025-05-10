/**
 * Camera Utilities - Provides helper functions for camera operations and image processing
 */

/**
 * Starts the camera stream with optional constraints
 * @param videoElement HTML video element to stream to
 * @param constraints Optional media constraints
 * @returns Promise with the media stream
 */
export const startCamera = async (
  videoElement: HTMLVideoElement,
  constraints: MediaStreamConstraints = {
    video: {
      facingMode: 'environment',
      width: { ideal: 1280 },
      height: { ideal: 720 }
    }
  }
): Promise<MediaStream> => {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Browser API navigator.mediaDevices.getUserMedia not available');
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = stream;
    
    return new Promise((resolve, reject) => {
      videoElement.onloadedmetadata = () => resolve(stream);
      videoElement.onerror = reject;
      
      // Fallback in case onloadedmetadata doesn't fire
      setTimeout(() => {
        if (videoElement.readyState >= HTMLMediaElement.HAVE_METADATA) {
          resolve(stream);
        }
      }, 1000);
    });
  } catch (error) {
    console.error('Error accessing camera:', error);
    throw new Error(`Camera access failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Stops the camera stream and cleans up
 * @param videoElement HTML video element with the stream
 */
export const stopCamera = (videoElement: HTMLVideoElement): void => {
  if (!videoElement?.srcObject) return;

  const stream = videoElement.srcObject as MediaStream;
  const tracks = stream.getTracks();
  
  tracks.forEach(track => {
    track.stop();
    stream.removeTrack(track);
  });
  
  videoElement.srcObject = null;
};

/**
 * Captures a still image from the video stream
 * @param videoElement Video element to capture from
 * @param format Image format (default: 'image/jpeg')
 * @param quality Image quality (0-1 for JPEG)
 * @returns Data URL of the captured image
 */
export const captureImage = (
  videoElement: HTMLVideoElement,
  format: string = 'image/jpeg',
  quality: number = 0.92
): string => {
  if (!videoElement.videoWidth || !videoElement.videoHeight) {
    throw new Error('Video element has no video dimensions');
  }

  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL(format, quality);
};

/**
 * Converts a Data URL to an HTMLImageElement
 * @param dataUrl The image data URL
 * @returns Promise that resolves to an Image element
 */
export const getImageFromDataUrl = (dataUrl: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error(`Image load error: ${err}`));
    img.src = dataUrl;
  });
};

/**
 * Draws bounding boxes with labels on a canvas
 * @param canvas The canvas to draw on
 * @param boxes Array of bounding boxes with labels
 */
export const drawBoundingBoxes = (
  canvas: HTMLCanvasElement,
  boxes: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    color?: string;
    textColor?: string;
  }>
): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  boxes.forEach(box => {
    const { x, y, width, height, label, color = '#FF0000', textColor = '#FFFFFF' } = box;
    
    // Draw bounding box
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, width, height);
    
    // Calculate label position
    ctx.font = '16px Arial';
    const textWidth = ctx.measureText(label).width;
    const textHeight = 20;
    const padding = 5;
    
    // Draw label background
    ctx.fillStyle = color;
    ctx.fillRect(
      x - 1,
      y - textHeight - padding,
      textWidth + padding * 2,
      textHeight + padding
    );
    
    // Draw label text
    ctx.fillStyle = textColor;
    ctx.fillText(label, x + padding, y - padding);
  });
};

/**
 * Resizes an image while maintaining aspect ratio
 * @param image Image element to resize
 * @param maxWidth Maximum width
 * @param maxHeight Maximum height
 * @returns Data URL of resized image
 */
export const resizeImage = (
  image: HTMLImageElement,
  maxWidth: number,
  maxHeight: number
): string => {
  const canvas = document.createElement('canvas');
  let width = image.width;
  let height = image.height;

  if (width > height) {
    if (width > maxWidth) {
      height *= maxWidth / width;
      width = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      width *= maxHeight / height;
      height = maxHeight;
    }
  }

  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.9);
};

/**
 * Converts an image to grayscale
 * @param imageDataUrl Source image data URL
 * @returns Grayscale image data URL
 */
export const convertToGrayscale = (imageDataUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;     // R
        data[i + 1] = avg; // G
        data[i + 2] = avg; // B
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = () => reject(new Error('Image loading failed'));
    img.src = imageDataUrl;
  });
};
