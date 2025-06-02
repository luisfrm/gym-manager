import { Calendar, DollarSign, Hash } from "lucide-react";
import { SuggestionOption } from "./types";

  // Sugerencias estáticas para servicios
  export const serviceOptions: SuggestionOption[] = [
    {
      id: 1,
      label: "Mensualidad",
      description: "Pago mensual de membresía",
      icon: <Calendar className="w-4 h-4 text-blue-500" />
    },
    {
      id: 2,
      label: "Semana",
      description: "Pago semanal de acceso",
      icon: <Calendar className="w-4 h-4 text-green-500" />
    },
    {
      id: 3,
      label: "Día",
      description: "Pago diario de acceso",
      icon: <Calendar className="w-4 h-4 text-orange-500" />
    }
  ];

  // Sugerencias estáticas para métodos de pago
  export const paymentMethodOptions: SuggestionOption[] = [
    {
      id: 1,
      label: "Efectivo",
      description: "Pago en efectivo en recepción",
      icon: <DollarSign className="w-4 h-4 text-green-500" />
    },
    {
      id: 2,
      label: "Transferencia",
      description: "Transferencia directa a cuenta",
      icon: <Hash className="w-4 h-4 text-indigo-500" />
    },
    {
      id: 3,
      label: "Zelle",
      description: "Transferencia vía Zelle",
      icon: <Hash className="w-4 h-4 text-yellow-500" />
    }
  ];