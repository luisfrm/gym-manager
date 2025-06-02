import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/dashboard");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-12 text-center space-y-8">
          {/* Ilustración 404 */}
          <div className="relative">
            <div className="text-9xl font-bold text-primary/20 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-24 h-24 text-primary/60 animate-pulse" />
            </div>
          </div>

          {/* Contenido principal */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground font-serif">
              Página no encontrada
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              Lo sentimos, la página que estás buscando no existe o ha sido movida a otra ubicación.
            </p>
          </div>

          {/* Sugerencias */}
          <div className="bg-muted/30 rounded-lg p-6 space-y-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              ¿Qué puedes hacer?
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-sm mx-auto">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                Verifica que la URL esté escrita correctamente
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                Regresa a la página anterior y intenta de nuevo
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                Ve al panel principal del sistema
              </li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={handleGoHome} 
              className="flex items-center gap-2 px-6"
              size="lg"
            >
              <Home className="w-4 h-4" />
              Ir al Dashboard
            </Button>
            <Button 
              onClick={handleGoBack} 
              variant="outline" 
              className="flex items-center gap-2 px-6"
              size="lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver atrás
            </Button>
            <Button 
              onClick={handleRefresh} 
              variant="ghost" 
              className="flex items-center gap-2 px-6"
              size="lg"
            >
              <RefreshCw className="w-4 h-4" />
              Recargar
            </Button>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Si el problema persiste, contacta al administrador del sistema
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 