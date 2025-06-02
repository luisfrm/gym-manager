import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "../ui/button";
import { Camera, X, Check, RotateCcw, Loader2 } from "lucide-react";
import { useFaceRecognition } from "@/hooks/useFaceRecognition";
import { toastUtils } from "@/lib/toast";

interface FaceCaptureComponentProps {
  onFaceCaptured: (encoding: number[], image: string) => void;
  onCancel: () => void;
  isOpen: boolean;
  excludeClientId?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const FaceCaptureComponent = ({ onFaceCaptured, onCancel, isOpen, excludeClientId }: FaceCaptureComponentProps) => {
  const [step, setStep] = useState<'camera' | 'preview' | 'validating'>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedEncoding, setCapturedEncoding] = useState<number[] | null>(null);
  const [error, setError] = useState<string>("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { detectFace, isLoaded, error: faceDetectionError } = useFaceRecognition();
  const [isDetecting, setIsDetecting] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setError("");
    } catch (err) {
      setError("No se pudo acceder a la cámara");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const validateFaceEncoding = useCallback(async (encoding: number[]) => {
    try {
      const { useStore } = await import("@/hooks/useStore");
      const token = useStore.getState().auth.token;
      
      const response = await fetch(`${API_BASE_URL}/face/validate-encoding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          faceEncoding: encoding,
          excludeClientId
        }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          const errorData = await response.json();
          return {
            isDuplicate: true,
            message: errorData.message,
            existingClient: errorData.existingClient,
            similarity: errorData.similarity
          };
        }
        throw new Error('Error al validar la cara');
      }

      return { isDuplicate: false };
    } catch (error) {
      console.error('Error validating face:', error);
      throw error;
    }
  }, [excludeClientId]);

  const resetCapture = useCallback(() => {
    setStep('camera');
    setCapturedImage(null);
    setCapturedEncoding(null);
    setError("");
  }, []);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isDetecting) return;

    setIsDetecting(true);
    setError("");
    setStep('validating');

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No se pudo obtener el contexto del canvas');
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageDataUrl);

      const detections = await detectFace(video);
      
      if (detections && detections.length > 0) {
        const encoding = detections as number[];
        setCapturedEncoding(encoding);
        
        try {
          const validation = await validateFaceEncoding(encoding);
          
          if (validation.isDuplicate) {
            if (validation.existingClient) {
              const { firstname, lastname, cedula } = validation.existingClient;
              const similarity = validation.similarity || 0;
              
              toastUtils.face.duplicate(
                { firstname, lastname, cedula },
                similarity
              );
            }
            
            resetCapture();
          } else {
            setStep('preview');
            toastUtils.face.captured();
          }
        } catch (validationError) {
          console.error('Error validating face:', validationError);
          toastUtils.face.validationError("No se pudo validar el rostro. Inténtalo de nuevo.");
          resetCapture();
        }
      } else {
        toastUtils.face.noFaceDetected();
        setStep('camera');
      }
    } catch (err) {
      console.error('Error processing image:', err);
      toastUtils.face.error("Error al procesar la imagen. Inténtalo de nuevo.");
      setStep('camera');
    } finally {
      setIsDetecting(false);
    }
  }, [detectFace, isDetecting, resetCapture, validateFaceEncoding]);

  const confirmCapture = useCallback(() => {
    if (capturedEncoding && capturedImage) {
      onFaceCaptured(capturedEncoding, capturedImage);
      resetCapture();
    }
  }, [capturedEncoding, capturedImage, onFaceCaptured, resetCapture]);

  const handleCancel = useCallback(() => {
    resetCapture();
    stopCamera();
    onCancel();
  }, [resetCapture, stopCamera, onCancel]);

  useEffect(() => {
    if (isOpen && step === 'camera') {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen, step, startCamera, stopCamera]);

  if (!isOpen) return null;

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Capturar Rostro</h3>
        <Button variant="ghost" size="sm" onClick={handleCancel} type="button">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {step === 'camera' && (
        <div className="space-y-4">
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          
          {faceDetectionError && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {faceDetectionError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              onClick={capturePhoto}
              disabled={isDetecting || !isLoaded}
              className="flex items-center gap-2 w-full sm:w-auto"
              type="button"
            >
              <Camera className="w-4 h-4" />
              {!isLoaded ? "Cargando modelos..." : isDetecting ? "Procesando..." : "Capturar"}
            </Button>
            <Button variant="outline" onClick={handleCancel} type="button" className="w-full sm:w-auto">
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {step === 'validating' && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
              <span className="text-lg font-medium">Validando rostro...</span>
            </div>
            {capturedImage && (
              <img
                src={capturedImage}
                alt="Captured face"
                className="max-w-full h-48 object-cover rounded-lg mx-auto"
              />
            )}
            <p className="text-sm text-gray-600 mt-2">
              Verificando que este rostro no esté ya registrado en el sistema...
            </p>
          </div>
        </div>
      )}

      {step === 'preview' && capturedImage && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Vista previa de la imagen capturada:</p>
            <img
              src={capturedImage}
              alt="Captured face"
              className="max-w-full h-48 object-cover rounded-lg mx-auto"
            />
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
              <div className="flex items-center justify-center gap-2 text-green-700">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Rostro validado correctamente</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              onClick={confirmCapture}
              className="flex items-center gap-2 w-full sm:w-auto"
              type="button"
            >
              <Check className="w-4 h-4" />
              Confirmar
            </Button>
            <Button
              variant="outline"
              onClick={resetCapture}
              className="flex items-center gap-2 w-full sm:w-auto"
              type="button"
            >
              <RotateCcw className="w-4 h-4" />
              Capturar de nuevo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}; 