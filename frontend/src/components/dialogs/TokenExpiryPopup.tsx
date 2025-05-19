import { AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface TokenExpiryPopupProps {
  onRenew: () => void;
  onDismiss: () => void;
  timeLeft: number; // Time in seconds until token expires
  isVisible: boolean;
}

export default function TokenExpiryPopup({ onRenew, onDismiss, timeLeft, isVisible }: TokenExpiryPopupProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <Alert variant="default" className="bg-white lg:w-[26rem] border-2 border-red-600 py-4 flex gap-4 z-50">
            <section>
              <AlertCircle className="text-red-600 h-10 w-10" />
            </section>
            <section>
              <AlertTitle className="text-red-500">Tu sesión está por expirar</AlertTitle>
              <AlertDescription>
                <p className="mb-2">
                  Tu sesión expirará en <strong className="text-red-600">{timeLeft}</strong> segundos. ¿Deseas
                  renovarla?
                </p>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={onDismiss}>
                    Ignorar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={onRenew}>
                    Renovar
                  </Button>
                </div>
              </AlertDescription>
            </section>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
