import React, { useState } from "react";
import { FormInput } from "@/components/ui/form-input";
import { useForm } from "react-hook-form";
import { CreditCard, User, Dumbbell, Clock, FileText } from "lucide-react";
import Template from "./Template";
import { SuggestionOption } from "@/lib/types";

interface FormData {
  service: string;
  paymentMethod: string;
  description: string;
}

const SuggestionsPage: React.FC = () => {
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});

  const { register, handleSubmit, setValue } = useForm<FormData>({
    defaultValues: {
      service: "",
      paymentMethod: "",
      description: ""
    }
  });

  // Datos de ejemplo para servicios de gimnasio
  const gymServices: SuggestionOption[] = [
    {
      id: 1,
      label: "Membresía Mensual",
      description: "Acceso completo por 30 días - $50",
      icon: <CreditCard className="w-4 h-4 text-blue-500" />,
      data: { price: 50, duration: 30, type: "membership" }
    },
    {
      id: 2,
      label: "Entrenamiento Personal",
      description: "Sesión 1:1 con entrenador certificado - $25/hora",
      icon: <User className="w-4 h-4 text-green-500" />,
      data: { price: 25, duration: 60, type: "training" }
    },
    {
      id: 3,
      label: "Clase Grupal",
      description: "Zumba, Yoga, CrossFit - $15/clase",
      icon: <Dumbbell className="w-4 h-4 text-orange-500" />,
      data: { price: 15, duration: 45, type: "class" }
    },
    {
      id: 4,
      label: "Evaluación Física",
      description: "Análisis completo de composición corporal - $30",
      icon: <Clock className="w-4 h-4 text-purple-500" />,
      data: { price: 30, duration: 90, type: "evaluation" }
    }
  ];

  // Datos para métodos de pago
  const paymentMethods: SuggestionOption[] = [
    {
      id: 1,
      label: "Efectivo",
      description: "Pago en efectivo en recepción",
      icon: <span className="text-green-600">💵</span>
    },
    {
      id: 2,
      label: "Tarjeta de Crédito",
      description: "Visa, MasterCard, American Express",
      icon: <CreditCard className="w-4 h-4 text-blue-500" />
    },
    {
      id: 3,
      label: "Transferencia Bancaria",
      description: "Transferencia directa a cuenta del gimnasio",
      icon: <span className="text-purple-600">🏦</span>
    },
    {
      id: 4,
      label: "Pago Móvil",
      description: "Pago Móvil, Zelle, PayPal",
      icon: <span className="text-blue-600">📱</span>
    }
  ];

  const handleServiceSelect = (option: SuggestionOption) => {
    setSelectedValues(prev => ({
      ...prev,
      service: `${option.label} - $${option.data.price}`
    }));
    setValue("service", option.label);
    console.log("Servicio seleccionado:", option);
  };

  const handlePaymentMethodSelect = (option: SuggestionOption) => {
    setSelectedValues(prev => ({
      ...prev,
      paymentMethod: option.label
    }));
    setValue("paymentMethod", option.label);
    console.log("Método de pago seleccionado:", option);
  };

  const onSubmit = (data: FormData) => {
    console.log("Datos del formulario:", data);
  };

  return (
    <Template>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Sistema de Sugerencias en FormInput</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario de ejemplo */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Formulario de Pago</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormInput
                label="Servicio"
                name="service"
                register={register}
                placeholder="Seleccionar servicio..."
                icon={<FileText className="w-4 h-4" />}
                suggestions={gymServices}
                onSuggestionSelect={handleServiceSelect}
                suggestionsGroupHeading="Servicios Disponibles"
                suggestionsEmptyMessage="No se encontraron servicios que coincidan"
              />

              <FormInput
                label="Método de Pago"
                name="paymentMethod"
                register={register}
                placeholder="Seleccionar método de pago..."
                icon={<CreditCard className="w-4 h-4" />}
                suggestions={paymentMethods}
                onSuggestionSelect={handlePaymentMethodSelect}
                suggestionsGroupHeading="Métodos de Pago"
                suggestionsEmptyMessage="No se encontraron métodos que coincidan"
              />

              <FormInput
                label="Descripción"
                name="description"
                register={register}
                placeholder="Descripción adicional (sin sugerencias)..."
                icon={<FileText className="w-4 h-4" />}
              />

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Procesar Pago
              </button>
            </form>
          </div>

          {/* Panel de información */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Estado de Selecciones</h2>
            
            {Object.keys(selectedValues).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(selectedValues).map(([key, value]) => (
                  <div key={key} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="font-medium text-green-800 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </div>
                    <div className="text-green-700">{value}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-center">
                Selecciona opciones del formulario para ver el estado
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-3">💡 Características</h3>
              <ul className="text-sm text-blue-700 space-y-2">
                <li>✅ <strong>Integrado en FormInput</strong> - Funciona con cualquier input existente</li>
                <li>✅ <strong>Opcional</strong> - Solo aparece si se pasan sugerencias</li>
                <li>✅ <strong>Ancho automático</strong> - Se adapta al ancho del input padre</li>
                <li>✅ <strong>Compatible con React Hook Form</strong> - Funciona con el sistema de forms actual</li>
                <li>✅ <strong>Iconos y descripciones</strong> - Soporte completo para UI rica</li>
                <li>✅ <strong>Estados de carga</strong> - Manejo de estados async</li>
                <li>✅ <strong>Filtrado inteligente</strong> - Busca en label y descripción</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-800 mb-3">🔧 Implementación</h3>
              <div className="text-sm text-amber-700 space-y-1">
                <p><strong>1.</strong> Solo agregar props de sugerencias al FormInput existente</p>
                <p><strong>2.</strong> No requiere cambios en la estructura del form</p>
                <p><strong>3.</strong> Funciona con todos los inputs de texto</p>
                <p><strong>4.</strong> Compatible con iconos y validaciones</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Template>
  );
};

export default SuggestionsPage;
