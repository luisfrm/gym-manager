# Modal Components Documentation

## Overview

Los componentes Modal han sido optimizados para manejar contenido largo con scroll automático y una altura máxima de **90svh** en desktop.

## Components Available

### 1. Modal (Structured)
Modal con estructura fija de header, body y footer. El body es scrollable mientras que header y footer permanecen fijos.

### 2. SimpleModal  
Modal simple donde todo el contenido scrollea junto.

---

## Modal (Structured) - Recommended

### Features
- ✅ **Desktop**: max-height 90svh 
- ✅ **Mobile**: full screen
- ✅ **Fixed header** y footer
- ✅ **Scrollable body** únicamente
- ✅ **Bordes visuales** entre secciones

### Usage

```tsx
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/Modal";
import { Button } from "@/components/ui/button";

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
      <ModalHeader 
        title="Título del Modal" 
        description="Descripción del contenido del modal" 
      />
      
      <ModalBody>
        {/* Contenido largo que hará scroll */}
        <div className="space-y-4">
          <p>Este contenido será scrollable...</p>
          <p>Puede ser muy largo...</p>
          {/* Más contenido */}
        </div>
      </ModalBody>
      
      <ModalFooter>
        <Button variant="outline" onClick={() => setIsOpen(false)}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          Guardar
        </Button>
      </ModalFooter>
    </Modal>
  );
}
```

### CSS Classes Applied

```css
/* Modal Container */
.modal-container {
  py-0 flex flex-col
  sm:max-h-[90svh]  /* Desktop: 90% screen viewport height */
  max-h-screen      /* Mobile: full screen */
}

/* Header */
.modal-header {
  px-6 pt-6 pb-4 
  border-b border-gray-100 
  flex-shrink-0  /* No se reduce */
}

/* Body */
.modal-body {
  flex-1            /* Toma todo el espacio disponible */
  overflow-y-auto   /* Scroll vertical cuando necesario */
  px-6 py-4
}

/* Footer */
.modal-footer {
  px-6 py-4 
  border-t border-gray-100 
  flex-shrink-0  /* No se reduce */
}
```

---

## SimpleModal

### Features
- ✅ **Desktop**: max-height 90svh con scroll
- ✅ **Mobile**: full screen con scroll
- ✅ **Todo el contenido** scrollea junto
- ✅ **Padding normal** mantenido

### Usage

```tsx
import { SimpleModal } from "@/components/Modal";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

function MySimpleComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SimpleModal isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogHeader>
        <DialogTitle>Título Simple</DialogTitle>
      </DialogHeader>
      
      {/* Todo este contenido scrollea junto */}
      <div className="space-y-4">
        <p>Contenido que puede ser muy largo...</p>
        <div>Más contenido...</div>
      </div>
    </SimpleModal>
  );
}
```

---

## Customization

### Custom Sizes

```tsx
// Modal pequeño
<Modal className="sm:max-w-md">

// Modal mediano (default)
<Modal className="sm:max-w-3xl">

// Modal grande
<Modal className="sm:max-w-6xl">

// Modal full width
<Modal className="sm:max-w-none sm:mx-4">
```

### Custom Height

```tsx
// Altura personalizada
<Modal className="sm:max-h-[80svh]">

// Altura fija
<Modal className="sm:h-[600px] sm:max-h-none">
```

### No Scroll (Fixed Height)

```tsx
<Modal className="sm:max-h-none sm:overflow-hidden">
  <ModalBody className="overflow-hidden">
    {/* Contenido que no debe scrollear */}
  </ModalBody>
</Modal>
```

---

## Best Practices

### ✅ Do's

1. **Usa Modal estructurado** para formularios largos
2. **Usa SimpleModal** para contenido simple
3. **Mantén headers concisos** (1-2 líneas)
4. **Agrupa contenido relacionado** en el body
5. **Usa footers para acciones principales**

```tsx
// ✅ Buena práctica
<Modal isOpen={isOpen} onOpenChange={setIsOpen}>
  <ModalHeader 
    title="Crear Cliente" 
    description="Completa la información del nuevo cliente" 
  />
  <ModalBody>
    <form className="space-y-4">
      {/* Formulario organizado */}
    </form>
  </ModalBody>
  <ModalFooter>
    <Button variant="outline">Cancelar</Button>
    <Button type="submit">Guardar</Button>
  </ModalFooter>
</Modal>
```

### ❌ Don'ts

1. **No uses padding extra** en ModalBody (ya incluido)
2. **No pongas scroll manual** en el body
3. **No uses altura fija** a menos que sea necesario

```tsx
// ❌ Evitar
<ModalBody className="px-8 py-8 overflow-y-scroll h-96">
  {/* Padding y scroll redundantes */}
</ModalBody>
```

---

## Technical Details

### Screen Viewport Height (svh)

- `90svh` = 90% de la altura visible del viewport
- **Más preciso** que `vh` en móviles (maneja barras del navegador)
- **Responsive** automáticamente

### Breakpoints

- `sm:` = 640px y superior (tablets y desktop)
- `max-h-screen` = fallback para móviles

### Flex Layout

```
┌─────────────────────┐
│ Header (flex-shrink-0) │ ← Fijo
├─────────────────────┤
│                     │
│ Body (flex-1)       │ ← Scrollable
│ overflow-y-auto     │
│                     │
├─────────────────────┤
│ Footer (flex-shrink-0) │ ← Fijo
└─────────────────────┘
```

---

## Migration Guide

### Modales Existentes

Si tienes modales existentes que usan `Modal`, automáticamente tendrán:

1. ✅ **Scroll optimizado**
2. ✅ **Altura máxima en desktop**
3. ✅ **Estructura fija**

Si necesitas el comportamiento anterior (todo scrollea), usa `SimpleModal`.

### Cambios Requeridos

```tsx
// Antes
<Modal isOpen={isOpen} onOpenChange={setIsOpen} className="py-8">
  <DialogHeader>...</DialogHeader>
  {/* contenido */}
</Modal>

// Después - Opción 1: Estructurado
<Modal isOpen={isOpen} onOpenChange={setIsOpen}>
  <ModalHeader title="..." description="..." />
  <ModalBody>{/* contenido */}</ModalBody>
</Modal>

// Después - Opción 2: Simple
<SimpleModal isOpen={isOpen} onOpenChange={setIsOpen}>
  <DialogHeader>...</DialogHeader>
  {/* contenido */}
</SimpleModal>
``` 