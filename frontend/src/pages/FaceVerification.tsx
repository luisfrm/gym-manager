import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CircleCheckBig, CircleX, Loader2, Camera, Shield, Clock, User, Play, Pause, Volume2 } from "lucide-react";
import { useFaceRecognition } from "@/hooks/useFaceRecognition";
import Template from "./Template";

interface VerificationResult {
  message: string;
  client: {
    id: string;
    firstname: string;
    lastname: string;
    cedula: string;
    expiredDate: string;
    isActive: boolean;
    daysRemaining: number;
  };
  similarity: number;
  isActive: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const FaceVerification = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastVerificationRef = useRef<number>(0);
  const successAudioRef = useRef<HTMLAudioElement | null>(null);
  const errorAudioRef = useRef<HTMLAudioElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isInCooldown, setIsInCooldown] = useState(false);

  const { isLoaded, error, detectFace, detectFaceOnly, startCamera, stopCamera } = useFaceRecognition();

  // Crear sonidos y preparar síntesis de voz al montar el componente
  useEffect(() => {
    // Sonido de éxito (frecuencia más alta, más alegre)
    const successAudio = new Audio();
    const successBuffer = createBeepSound(800, 200, 0.3); // 800Hz, 200ms
    successAudio.src = URL.createObjectURL(new Blob([successBuffer], { type: "audio/wav" }));
    successAudioRef.current = successAudio;

    // Sonido de error (frecuencia más baja, más serio)
    const errorAudio = new Audio();
    const errorBuffer = createBeepSound(300, 400, 0.3); // 300Hz, 400ms
    errorAudio.src = URL.createObjectURL(new Blob([errorBuffer], { type: "audio/wav" }));
    errorAudioRef.current = errorAudio;

    // Inicializar síntesis de voz y cargar voces disponibles
    if ("speechSynthesis" in window) {
      // Función para cargar voces (puede ser asíncrono en algunos navegadores)
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log(
          "Voces disponibles:",
          voices.map(v => `${v.name} (${v.lang})`),
        );
      };

      // Cargar voces inmediatamente
      loadVoices();

      // También escuchar el evento de voces cargadas (necesario en algunos navegadores)
      window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

              return () => {
          window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
          if (cooldownIntervalRef.current) {
            clearInterval(cooldownIntervalRef.current);
          }
          if (successAudioRef.current) {
            URL.revokeObjectURL(successAudioRef.current.src);
          }
          if (errorAudioRef.current) {
            URL.revokeObjectURL(errorAudioRef.current.src);
          }
        };
    }

    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
      if (successAudioRef.current) {
        URL.revokeObjectURL(successAudioRef.current.src);
      }
      if (errorAudioRef.current) {
        URL.revokeObjectURL(errorAudioRef.current.src);
      }
    };
  }, []);

  // Función para crear sonidos sintéticos
  const createBeepSound = (frequency: number, duration: number, volume: number): ArrayBuffer => {
    const sampleRate = 44100;
    const samples = Math.floor((sampleRate * duration) / 1000);
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, samples * 2, true);

    // Generate sine wave
    for (let i = 0; i < samples; i++) {
      const sample = Math.sin((2 * Math.PI * frequency * i) / sampleRate) * volume * 32767;
      view.setInt16(44 + i * 2, sample, true);
    }

    return buffer;
  };

  // Función para reproducir sonidos y voz
  const playSound = (isSuccess: boolean, clientName?: string) => {
    try {
      // Reproducir el sonido beep primero
      const audio = isSuccess ? successAudioRef.current : errorAudioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      }

      // Después reproducir el mensaje de voz (si está habilitado)
      if (isVoiceEnabled) {
        setTimeout(() => {
          playVoiceMessage(isSuccess, clientName);
        }, 300); // Esperar 300ms después del beep
      }
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  // Función para síntesis de voz
  const playVoiceMessage = (isSuccess: boolean, clientName?: string) => {
    try {
      // Verificar si el navegador soporta Speech Synthesis
      if (!("speechSynthesis" in window)) {
        console.warn("Speech Synthesis no soportado en este navegador");
        return;
      }

      // Cancelar cualquier síntesis de voz en curso
      window.speechSynthesis.cancel();

      let message = "";
      if (isSuccess && clientName) {
        message = `Acceso autorizado. Bienvenido, ${clientName}.`;
      } else if (isSuccess) {
        message = "Acceso autorizado. Bienvenido al gimnasio.";
      } else if (clientName) {
        message = `Acceso denegado. La membresía de ${clientName} ha expirado.`;
      } else {
        message = "Acceso denegado. No se encontró registro facial en el sistema.";
      }

      // Crear y configurar la síntesis de voz
      const utterance = new SpeechSynthesisUtterance(message);

      // Configurar propiedades de la voz
      utterance.lang = "es-ES"; // Español
      utterance.rate = 1.0; // Velocidad normal
      utterance.pitch = isSuccess ? 1.2 : 0.8; // Tono más alto para éxito, más bajo para error
      utterance.volume = 0.8; // Volumen al 80%

      // Intentar usar una voz en español si está disponible
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(voice => voice.lang.includes("es") || voice.lang.includes("ES"));

      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }

      // Reproducir el mensaje
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Error en síntesis de voz:", error);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      initializeCamera();
    }

    return () => {
      if (stream) {
        stopCamera(stream);
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, [isLoaded]);

  // Inicializar detección automática cuando se activa el modo auto
  useEffect(() => {
    if (isAutoMode && stream && isLoaded) {
      startContinuousDetection();
    } else {
      stopContinuousDetection();
    }

    return () => {
      stopContinuousDetection();
    };
  }, [isAutoMode, stream, isLoaded]);

  const initializeCamera = async () => {
    const cameraStream = await startCamera();
    if (cameraStream && videoRef.current) {
      setStream(cameraStream);
      videoRef.current.srcObject = cameraStream;
    }
  };

  const startContinuousDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    detectionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !isLoaded || isVerifying || isInCooldown) return;

      try {
        // Detectar cara sin hacer encoding completo (más rápido)
        const detection = await detectFaceOnly(videoRef.current);
        setFaceDetected(detection);

        // Si se detecta una cara, verificar debounce Y que no esté en cooldown
        const timeSinceLastVerification = Date.now() - lastVerificationRef.current;
        const hasEnoughTimeElapsed = timeSinceLastVerification > 3000; // 3 segundos de debounce inicial
        
        if (detection && !isInCooldown && hasEnoughTimeElapsed) {
          console.log('Iniciando verificación automática - cara detectada, no en cooldown y tiempo suficiente');
          await handleAutoVerification();
        } else if (detection && isInCooldown) {
          console.log(`Cara detectada pero en cooldown (${cooldownSeconds}s restantes)`);
        } else if (detection && !hasEnoughTimeElapsed) {
          console.log(`Cara detectada pero debounce activo (${3 - Math.floor(timeSinceLastVerification/1000)}s restantes)`);
        }
      } catch (error) {
        console.error("Error in continuous detection:", error);
        setFaceDetected(false);
      }
    }, 500); // Verificar cada 500ms
  };

  const stopContinuousDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
      cooldownIntervalRef.current = null;
    }
    setFaceDetected(false);
    setIsInCooldown(false);
    setCooldownSeconds(0);
  };

  const handleAutoVerification = async () => {
    if (!videoRef.current || !isLoaded || isVerifying || isInCooldown) return;

    // Marcar el tiempo de inicio de verificación para evitar verificaciones duplicadas
    lastVerificationRef.current = Date.now();
    
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const encoding = await detectFace(videoRef.current);

      if (!encoding) {
        setIsVerifying(false);
        return;
      }

      // Hacer la verificación
      const response = await fetch(`${API_BASE_URL}/face/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ faceEncoding: encoding }),
      });

            if (response.ok) {
        const data: VerificationResult = await response.json();
        setVerificationResult(data);
        
        // Reproducir sonido y voz según el resultado
        const clientName = `${data.client.firstname} ${data.client.lastname}`;
        playSound(data.isActive, clientName);
        
        if (data.isActive) {
          toast("¡Acceso autorizado!", {
            description: `Bienvenido ${data.client.firstname} ${data.client.lastname}`,
            duration: 8000,
            icon: <CircleCheckBig className="text-lime-500" />,
          });
        } else {
          toast("Membresía vencida", {
            description: `${data.client.firstname} ${data.client.lastname} - Membresía expirada`,
            duration: 8000,
            icon: <CircleX className="text-red-600" />,
          });
        }

        // Iniciar cooldown de 5 segundos después de cualquier verificación exitosa
        startCooldown();
      } else {
        // Error en verificación - reproducir sonido de error
        playSound(false);

        const errorData = await response.json();
        toast("No se pudo verificar", {
          description: errorData.message || "No se encontró coincidencia facial.",
          duration: 5000,
          icon: <CircleX className="text-red-600" />,
        });
      }
    } catch (error) {
      console.error("Error in auto verification:", error);
      playSound(false);
      toast("Error al procesar imagen", {
        description: "Error en verificación automática.",
        duration: 5000,
        icon: <CircleX className="text-red-600" />,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyFaceMutation = useMutation({
    mutationFn: async (faceEncoding: number[]) => {
      const response = await fetch(`${API_BASE_URL}/face/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ faceEncoding }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al verificar cara");
      }

      return response.json() as Promise<VerificationResult>;
    },
        onSuccess: data => {
      setVerificationResult(data);
      setIsVerifying(false);
      
      // Reproducir sonido y voz según el resultado
      const clientName = `${data.client.firstname} ${data.client.lastname}`;
      playSound(data.isActive, clientName);
      
      if (data.isActive) {
        toast("¡Acceso autorizado!", {
          description: `Bienvenido ${data.client.firstname} ${data.client.lastname}`,
          duration: 8000,
          icon: <CircleCheckBig className="text-lime-500" />,
        });
      } else {
        toast("Membresía vencida", {
          description: `${data.client.firstname} ${data.client.lastname} - Membresía expirada`,
          duration: 8000,
          icon: <CircleX className="text-red-600" />,
        });
      }

      // Iniciar cooldown de 5 segundos después de cualquier verificación exitosa
      if (isAutoMode) {
        startCooldown();
      }
    },
    onError: (error: Error) => {
      setIsVerifying(false);
      playSound(false);
      console.error("Error verifying face:", error);
      toast("No se pudo verificar", {
        description: error.message || "No se encontró coincidencia facial.",
        duration: 5000,
        icon: <CircleX className="text-red-600" />,
      });
    },
  });

  const handleVerifyFace = async () => {
    if (!videoRef.current || !isLoaded) return;

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const encoding = await detectFace(videoRef.current);

      if (!encoding) {
        toast("No se detectó ninguna cara", {
          description: "Asegúrate de que tu cara esté bien iluminada y centrada.",
          duration: 5000,
          icon: <CircleX className="text-red-600" />,
        });
        setIsVerifying(false);
        return;
      }

      verifyFaceMutation.mutate(encoding);
    } catch (error) {
      console.error("Error detecting face:", error);
      toast("Error al procesar imagen", {
        description: "Inténtalo de nuevo.",
        duration: 5000,
        icon: <CircleX className="text-red-600" />,
      });
      setIsVerifying(false);
    }
  };

  const resetVerification = () => {
    setVerificationResult(null);
  };

  const toggleAutoMode = () => {
    setIsAutoMode(!isAutoMode);
    if (verificationResult) {
      resetVerification();
    }
  };

  const testAudio = (isSuccess: boolean) => {
    const testName = isSuccess ? "Juan Pérez" : "María González";
    playSound(isSuccess, testName);
  };

  const startCooldown = () => {
    // Limpiar cualquier cooldown previo
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
    }

    // Establecer el estado de cooldown inmediatamente
    setIsInCooldown(true);
    setCooldownSeconds(5);
    
    // Actualizar la referencia de última verificación para evitar conflictos
    lastVerificationRef.current = Date.now();
    
    let remainingTime = 5;
    
    cooldownIntervalRef.current = setInterval(() => {
      remainingTime--;
      setCooldownSeconds(remainingTime);
      console.log(`Cooldown: ${remainingTime}s restantes, isInCooldown: true`);
      
      if (remainingTime <= 0) {
        clearInterval(cooldownIntervalRef.current!);
        cooldownIntervalRef.current = null;
        setIsInCooldown(false);
        setCooldownSeconds(0);
        // No resetear lastVerificationRef aquí - mantener el timestamp para el debounce
        console.log('Cooldown terminado, verificación automática habilitada');
      }
    }, 1000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Cargando verificación facial</h2>
          <p className="text-gray-600">Preparando modelos de reconocimiento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CircleX className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <Template>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Shield className="h-16 w-16 mx-auto mb-4 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Verificación Facial</h1>
                         <p className="text-gray-600 mt-2">
               {isAutoMode
                 ? isInCooldown
                   ? `Esperando ${cooldownSeconds} segundos antes de la próxima verificación automática`
                   : "Modo automático activo: La verificación se realizará automáticamente cuando detecte tu rostro"
                 : "Colócate frente a la cámara para verificar tu identidad y estado de membresía"}
             </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cámara */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Cámara
              </h2>

              <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-64 object-cover" />

                                 {/* Indicador de detección facial en modo automático */}
                 {isAutoMode && (
                   <div className="absolute top-3 left-3">
                     <div
                       className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                         isInCooldown
                           ? "bg-blue-100 text-blue-800 border border-blue-200"
                           : faceDetected
                             ? "bg-green-100 text-green-800 border border-green-200"
                             : "bg-gray-100 text-gray-600 border border-gray-200"
                       }`}
                     >
                       <div className={`w-2 h-2 rounded-full ${
                         isInCooldown 
                           ? "bg-blue-500" 
                           : faceDetected 
                             ? "bg-green-500" 
                             : "bg-gray-400"
                       }`}></div>
                       {isInCooldown 
                         ? `Nueva verificación en ${cooldownSeconds}s`
                         : faceDetected 
                           ? "Cara detectada" 
                           : "Buscando cara..."
                       }
                     </div>
                   </div>
                 )}

                {/* Indicador de modo automático activo */}
                {isAutoMode && (
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      AUTO
                    </div>
                  </div>
                )}

                                 {/* Overlay de verificación */}
                 {isVerifying && (
                   <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                     <div className="text-white text-center">
                       <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2" />
                       <p>Verificando...</p>
                     </div>
                   </div>
                 )}

                 {/* Overlay de cooldown */}
                 {isInCooldown && isAutoMode && (
                   <div className="absolute inset-0 bg-blue-500 bg-opacity-30 flex items-center justify-center">
                     <div className="bg-white rounded-lg p-4 text-center shadow-lg">
                       <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                       <p className="text-gray-800 font-medium">Realizando nueva verificación en</p>
                       <p className="text-2xl font-bold text-blue-600">{cooldownSeconds}s</p>
                     </div>
                   </div>
                 )}
              </div>

              <div className="space-y-3">
                {/* Botón de modo automático/manual */}
                               <Button
                 onClick={toggleAutoMode}
                 disabled={!stream}
                 variant={isAutoMode ? "default" : "outline"}
                 className="w-full"
                 size="lg"
               >
                 {isAutoMode ? (
                   <>
                     <Pause className="w-5 h-5 mr-2" />
                     {isInCooldown ? `Cooldown activo (${cooldownSeconds}s)` : "Desactivar modo automático"}
                   </>
                 ) : (
                   <>
                     <Play className="w-5 h-5 mr-2" />
                     Activar modo automático
                   </>
                 )}
               </Button>

                {/* Control de sonido y voz */}
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Volume2 className="w-4 h-4" />
                    <span>Sonidos automáticos habilitados</span>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                      className={`text-xs ${isVoiceEnabled ? "text-blue-600" : "text-gray-500"}`}
                    >
                      🔊 {isVoiceEnabled ? "Voz activada" : "Voz desactivada"}
                    </Button>
                  </div>

                  {/* Botones de prueba de sonidos */}
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testAudio(true)}
                      className="text-xs text-green-600 hover:bg-green-50"
                    >
                      🎵 Prueba: Acceso
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testAudio(false)}
                      className="text-xs text-red-600 hover:bg-red-50"
                    >
                      🎵 Prueba: Denegado
                    </Button>
                  </div>
                </div>

                {/* Botón de verificación manual - solo visible en modo manual */}
                {!isAutoMode && (
                  <Button
                    onClick={handleVerifyFace}
                    disabled={!stream || isVerifying || verifyFaceMutation.isPending}
                    className="w-full"
                    size="lg"
                    variant="outline"
                  >
                    {isVerifying || verifyFaceMutation.isPending ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5 mr-2" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5 mr-2" />
                        Verificar Acceso
                      </>
                    )}
                  </Button>
                )}

                {verificationResult && (
                  <Button onClick={resetVerification} variant="outline" className="w-full">
                    Nueva verificación
                  </Button>
                )}
              </div>
            </div>

            {/* Resultado */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Resultado
              </h2>

              {!verificationResult ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">Realiza una verificación facial para ver los resultados</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Estado del acceso */}
                  <div
                    className={`p-4 rounded-lg ${
                      verificationResult.isActive
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <div className="flex items-center">
                      {verificationResult.isActive ? (
                        <CircleCheckBig className="w-6 h-6 text-green-600 mr-3" />
                      ) : (
                        <CircleX className="w-6 h-6 text-red-600 mr-3" />
                      )}
                      <div>
                        <h3
                          className={`font-semibold ${verificationResult.isActive ? "text-green-900" : "text-red-900"}`}
                        >
                          {verificationResult.isActive ? "Acceso Autorizado" : "Acceso Denegado"}
                        </h3>
                        <p className={`text-sm ${verificationResult.isActive ? "text-green-700" : "text-red-700"}`}>
                          {verificationResult.isActive ? "Membresía activa" : "Membresía vencida"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Información del cliente */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Información del Cliente</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nombre:</span>
                        <span className="font-medium">
                          {verificationResult.client.firstname} {verificationResult.client.lastname}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cédula:</span>
                        <span className="font-medium">{verificationResult.client.cedula}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vencimiento:</span>
                        <span className="font-medium">{formatDate(verificationResult.client.expiredDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Días restantes:</span>
                        <span
                          className={`font-medium ${
                            verificationResult.client.daysRemaining > 7
                              ? "text-green-600"
                              : verificationResult.client.daysRemaining > 0
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {verificationResult.client.daysRemaining > 0
                            ? `${verificationResult.client.daysRemaining} días`
                            : "Vencida"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Similitud:</span>
                        <span className="font-medium">{Math.round(verificationResult.similarity * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Template>
  );
};

export default FaceVerification;
