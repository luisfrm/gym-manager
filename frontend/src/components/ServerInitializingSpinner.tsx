import { Loader2 } from "lucide-react";

export const ServerInitializingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-lg font-medium text-center">
          El servidor se está inicializando, la aplicación estará disponible en breve
        </p>
      </div>
    </div>
  );
}; 