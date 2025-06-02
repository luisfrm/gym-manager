import { toast } from "sonner";
import React from "react";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Loader2,
  Shield,
  User,
  CreditCard,
  Camera,
  Trash2,
  Edit,
  Settings,
  Copy,
  UserCheck,
  AlertCircle
} from "lucide-react";

// Tipos de toast disponibles
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

// Categorías de acciones para iconos contextuales
export type ToastCategory = 
  | 'client' 
  | 'payment' 
  | 'face' 
  | 'auth' 
  | 'system' 
  | 'validation'
  | 'delete'
  | 'update'
  | 'create'
  | 'copy'
  | 'access';

// Configuración de estilos por tipo
const toastStyles = {
  success: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    color: '#15803D',
    iconColor: '#16A34A',
    icon: CheckCircle2
  },
  error: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    color: '#DC2626',
    iconColor: '#EF4444',
    icon: XCircle
  },
  warning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FED7AA',
    color: '#D97706',
    iconColor: '#F59E0B',
    icon: AlertTriangle
  },
  info: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    color: '#2563EB',
    iconColor: '#3B82F6',
    icon: Info
  },
  loading: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    color: '#475569',
    iconColor: '#64748B',
    icon: Loader2
  }
};

// Iconos contextuales por categoría
const categoryIcons = {
  client: User,
  payment: CreditCard,
  face: Camera,
  auth: Shield,
  system: Settings,
  validation: AlertCircle,
  delete: Trash2,
  update: Edit,
  create: CheckCircle2,
  copy: Copy,
  access: UserCheck
};

interface ToastOptions {
  description?: string;
  duration?: number;
  category?: ToastCategory;
  customIcon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Función principal para mostrar toasts
const showToast = (
  type: ToastType,
  title: string,
  options: ToastOptions = {}
) => {
  const {
    description,
    duration = 4000,
    category,
    customIcon,
    action
  } = options;

  const style = toastStyles[type];
  const IconComponent = style.icon;
  
  // Determinar el ícono a usar
  let finalIcon = customIcon;
  if (!finalIcon) {
    if (category && categoryIcons[category]) {
      const CategoryIcon = categoryIcons[category];
      finalIcon = <CategoryIcon className="w-5 h-5" style={{ color: style.iconColor }} />;
    } else {
      finalIcon = type === 'loading' ? 
        <IconComponent className="w-5 h-5 animate-spin" style={{ color: style.iconColor }} /> :
        <IconComponent className="w-5 h-5" style={{ color: style.iconColor }} />;
    }
  }

  toast(title, {
    description,
    duration: type === 'loading' ? Infinity : duration,
    icon: finalIcon,
    style: {
      backgroundColor: style.backgroundColor,
      borderColor: style.borderColor,
      color: style.color,
      border: '1px solid',
      borderRadius: '8px',
      padding: '12px 16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    action: action ? {
      label: action.label,
      onClick: action.onClick,
    } : undefined,
  });
};

// Funciones específicas para cada tipo
export const toastUtils = {
  // Éxito general
  success: (title: string, options?: ToastOptions) => 
    showToast('success', title, options),

  // Error general  
  error: (title: string, options?: ToastOptions) => 
    showToast('error', title, options),

  // Advertencia
  warning: (title: string, options?: ToastOptions) => 
    showToast('warning', title, options),

  // Información
  info: (title: string, options?: ToastOptions) => 
    showToast('info', title, options),

  // Carga
  loading: (title: string, options?: ToastOptions) => 
    showToast('loading', title, options),

  // === TOASTS ESPECÍFICOS POR CATEGORÍA ===

  // Clientes
  client: {
    created: (clientName?: string) => 
      showToast('success', 'Cliente creado exitosamente', {
        description: clientName ? `${clientName} ha sido registrado en la base de datos.` : 'El cliente ha sido registrado en la base de datos.',
        category: 'client',
        duration: 4000
      }),

    updated: (clientName?: string) => 
      showToast('success', 'Cliente actualizado', {
        description: clientName ? `La información de ${clientName} ha sido actualizada.` : 'El cliente ha sido actualizado exitosamente.',
        category: 'client',
        duration: 4000
      }),

    deleted: (clientName?: string) => 
      showToast('success', 'Cliente eliminado', {
        description: clientName ? `${clientName} y todos sus pagos han sido eliminados.` : 'El cliente ha sido eliminado exitosamente.',
        category: 'delete',
        duration: 4000
      }),

    selected: (clientName: string, cedula: string) => 
      showToast('success', 'Cliente seleccionado', {
        description: `${clientName} - ${cedula}`,
        category: 'client',
        duration: 3000
      }),

    error: (action: string = 'procesar', details?: string) => 
      showToast('error', `Error al ${action} cliente`, {
        description: details || 'Por favor, intenta de nuevo o contacta con el administrador.',
        category: 'client',
        duration: 5000
      }),

    exists: () => 
      showToast('error', 'Cliente ya existe', {
        description: 'Ya existe un cliente con esta cédula.',
        category: 'validation',
        duration: 5000
      })
  },

  // Pagos
  payment: {
    created: () => 
      showToast('success', 'Pago registrado', {
        description: 'El pago se ha registrado correctamente.',
        category: 'payment',
        duration: 4000
      }),

    updated: () => 
      showToast('success', 'Pago actualizado', {
        description: 'El pago ha sido actualizado exitosamente.',
        category: 'payment',
        duration: 4000
      }),

    error: (action: string = 'procesar', details?: string) => 
      showToast('error', `Error al ${action} pago`, {
        description: details || 'Por favor, intenta de nuevo o contacta con el administrador.',
        category: 'payment',
        duration: 5000
      }),

    referenceError: (message: string) => 
      showToast('error', 'Error en referencia', {
        description: message,
        category: 'validation',
        duration: 5000
      })
  },

  // Reconocimiento facial
  face: {
    registered: (clientName: string) => 
      showToast('success', 'Registro facial exitoso', {
        description: `El rostro de ${clientName} ha sido registrado correctamente`,
        category: 'face',
        duration: 4000
      }),

    captured: () => 
      showToast('success', 'Rostro capturado', {
        description: 'Rostro capturado correctamente',
        category: 'face',
        duration: 3000
      }),

    duplicate: (existingClient?: { firstname: string; lastname: string; cedula: string }, similarity?: number) => 
      showToast('warning', 'Cara ya registrada', {
        description: existingClient ? 
          `Esta cara pertenece a ${existingClient.firstname} ${existingClient.lastname} (${existingClient.cedula})${similarity ? ` - Similitud: ${Math.round(similarity * 100)}%` : ''}` :
          'Esta cara ya está registrada en el sistema',
        category: 'face',
        duration: 8000
      }),

    error: (details?: string) => 
      showToast('error', 'Error en reconocimiento facial', {
        description: details || 'Error al procesar el rostro',
        category: 'face',
        duration: 5000
      }),

    validationError: (message: string) => 
      showToast('error', 'Error de validación', {
        description: message,
        category: 'validation',
        duration: 4000
      })
  },

  // Acceso y autenticación
  access: {
    authorized: (clientName?: string) => 
      showToast('success', '¡Acceso autorizado!', {
        description: clientName ? `Bienvenido, ${clientName}` : 'Acceso concedido al gimnasio',
        category: 'access',
        duration: 4000
      }),

    expired: (clientName?: string) => 
      showToast('warning', 'Membresía vencida', {
        description: clientName ? `La membresía de ${clientName} ha expirado` : 'Tu membresía ha vencido, por favor renuévala',
        category: 'access',
        duration: 6000
      }),

    denied: (reason?: string) => 
      showToast('error', 'Acceso denegado', {
        description: reason || 'No se pudo verificar la identidad',
        category: 'access',
        duration: 5000
      }),

    loginError: (details?: string) => 
      showToast('error', 'Error al iniciar sesión', {
        description: details || 'Credenciales incorrectas',
        category: 'auth',
        duration: 5000
      }),

    sessionExpired: () => 
      showToast('warning', 'Sesión expirada', {
        description: 'Por favor, inicia sesión nuevamente.',
        category: 'auth',
        duration: 5000
      }),

    sessionRenewed: () => 
      showToast('success', 'Sesión renovada', {
        description: 'Sesión renovada exitosamente',
        category: 'auth',
        duration: 3000
      })
  },

  // Sistema y utilidades
  system: {
    copied: () => 
      showToast('success', 'Copiado al portapapeles', {
        description: 'Texto copiado correctamente',
        category: 'copy',
        duration: 2000
      }),

    copyError: () => 
      showToast('error', 'Error al copiar', {
        description: 'No se pudo copiar el texto',
        category: 'copy',
        duration: 3000
      }),

    saved: (item: string = 'Configuración') => 
      showToast('success', `${item} guardada`, {
        category: 'system',
        duration: 3000
      }),

    updated: (item: string) => 
      showToast('success', `${item} actualizada`, {
        category: 'update',
        duration: 3000
      }),

    error: (action: string, details?: string) => 
      showToast('error', `Error al ${action}`, {
        description: details || 'Algo salió mal, intenta nuevamente',
        category: 'system',
        duration: 4000
      })
  },

  // Combinadas (cliente + pago)
  combined: {
    clientAndPayment: () => 
      showToast('success', 'Cliente y pago creados', {
        description: 'El cliente y su primer pago han sido registrados exitosamente.',
        customIcon: <div className="flex items-center gap-1">
          <User className="w-4 h-4 text-green-500" />
          <CreditCard className="w-4 h-4 text-green-500" />
        </div>,
        duration: 4000
      })
  }
};

// Función para dimiss todos los toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};

// Función para toast de loading con promise
export const toastPromise = <T,>(
  promise: Promise<T>,
  {
    loading: loadingMsg,
    success: successMsg,
    error: errorMsg,
  }: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  }
) => {
  return toast.promise(promise, {
    loading: loadingMsg,
    success: successMsg,
    error: errorMsg,
  });
}; 