import { useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

interface FaceRecognitionResult {
  isLoaded: boolean;
  error: string | null;
  detectFace: (video: HTMLVideoElement) => Promise<number[] | null>;
  detectFaceOnly: (video: HTMLVideoElement) => Promise<boolean>;
  startCamera: () => Promise<MediaStream | null>;
  stopCamera: (stream: MediaStream) => void;
}

export const useFaceRecognition = (): FaceRecognitionResult => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setError(null);
        
        // Cargar modelos desde un CDN
        const MODEL_URL = '/models'; // Los modelos estarán en public/models
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        
        setIsLoaded(true);
      } catch (err) {
        setError('Error al cargar los modelos de reconocimiento facial');
        console.error('Error loading face-api models:', err);
      }
    };

    loadModels();
  }, []);

  const detectFace = async (video: HTMLVideoElement): Promise<number[] | null> => {
    if (!isLoaded) {
      throw new Error('Los modelos aún no están cargados');
    }

    try {
      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        return null;
      }

      return Array.from(detections.descriptor);
    } catch (err) {
      console.error('Error detecting face:', err);
      return null;
    }
  };

  const detectFaceOnly = async (video: HTMLVideoElement): Promise<boolean> => {
    if (!isLoaded) {
      throw new Error('Los modelos aún no están cargados');
    }

    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());

      return !!detection;
    } catch (err) {
      console.error('Error detecting face:', err);
      return false;
    }
  };

  const startCamera = async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 720,
          height: 560,
          facingMode: 'user'
        }
      });
      return stream;
    } catch (err) {
      setError('Error al acceder a la cámara');
      console.error('Error accessing camera:', err);
      return null;
    }
  };

  const stopCamera = (stream: MediaStream): void => {
    stream.getTracks().forEach(track => track.stop());
  };

  return {
    isLoaded,
    error,
    detectFace,
    detectFaceOnly,
    startCamera,
    stopCamera
  };
}; 