# 🧪 Comandos de Testing

Este documento describe todos los comandos de testing disponibles en el proyecto Gym Manager.

## 📂 Estructura de Testing

```
gym-manager/
├── backend/                 # Node.js + Express + Bun Test
│   ├── src/
│   │   ├── utils/__tests__/           # Tests de utilidades
│   │   ├── controllers/__tests__/     # Tests de controladores
│   │   └── schemas/__tests__/         # Tests de validación
│   └── package.json
│
└── frontend/                # React + Vite + Bun Test
    ├── src/
    │   ├── lib/__tests__/             # Tests de utilidades
    │   ├── components/__tests__/      # Tests de componentes
    │   └── hooks/__tests__/           # Tests de hooks (futuro)
    └── package.json
```

## 🔧 Backend - Comandos de Testing

### Comandos Principales
```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (observa cambios)
npm run test:watch

# Ejecutar tests con reporte de cobertura
npm run test:coverage
```

### Comandos Específicos por Módulo
```bash
# Tests de utilidades (formatNumber, safeTrim, etc.)
npm run test:utils

# Tests de controladores (client, auth, etc.)
npm run test:controllers

# Tests de esquemas de validación (Zod schemas)
npm run test:schemas
```

### Ejemplos de Tests Actuales
- ✅ `safeTrim` - Función para manejar strings null/undefined
- ✅ `formatNumber` - Formateo de números con separadores
- ✅ `Client Controller` - Integración de safeTrim en controladores
- ✅ `Auth Schema` - Validación de esquemas de autenticación

## 🎨 Frontend - Comandos de Testing

### Comandos Principales
```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (observa cambios)
npm run test:watch

# Ejecutar tests con reporte de cobertura
npm run test:coverage
```

### Comandos Específicos por Módulo
```bash
# Tests de utilidades (formato, validación, etc.)
npm run test:utils

# Tests de componentes UI (Button, Modal, etc.)
npm run test:ui

# Tests de hooks personalizados (futuros)
npm run test:hooks
```

### Ejemplos de Tests Actuales
- ✅ `Format Utils` - formatCurrency, capitalizeFirstLetter, truncateText
- ✅ `Utils` - isEmailValid, isDateActive
- ✅ `Button Logic` - getButtonClasses, validateButtonProps

## ⚙️ Configuración de Testing

### Backend (Bun Test)
```javascript
// package.json
{
  "scripts": {
    "test": "bun test",
    "test:watch": "bun test --watch",
    "test:coverage": "bun test --coverage",
    "test:utils": "bun test src/utils/__tests__/",
    "test:controllers": "bun test src/controllers/__tests__/",
    "test:schemas": "bun test src/schemas/__tests__/"
  }
}
```

### Frontend (Bun Test + configuración personalizada)
```javascript
// package.json
{
  "scripts": {
    "test": "bun test",
    "test:watch": "bun test --watch",
    "test:coverage": "bun test --coverage",
    "test:ui": "bun test src/components/__tests__/",
    "test:hooks": "bun test src/hooks/__tests__/",
    "test:utils": "bun test src/lib/__tests__/"
  }
}
```

```toml
# bunfig.toml
[test]
# Testing configuration without preload to avoid jest-dom conflicts

[test.env]
NODE_ENV = "test"
```

## 🏃‍♂️ Ejecución Rápida

### Backend
```bash
cd backend

# Test completo
npm test

# Solo utils
npm run test:utils

# Solo controladores
npm run test:controllers
```

### Frontend
```bash
cd frontend

# Test completo
npm test

# Solo utilidades
npm run test:utils

# Solo componentes
npm run test:ui
```

## 📊 Resultados Actuales

### Backend
- **34 tests** ejecutándose correctamente
- **75 assertions** pasando
- **Tiempo promedio**: ~77ms

### Frontend  
- **25 tests** ejecutándose correctamente
- **72 assertions** pasando
- **Tiempo promedio**: ~67ms

## 🚀 Futuras Mejoras

### Backend
- [x] Tests de integración completos para APIs
- [x] Tests de validación de cara duplicada 
- [x] Tests de middlewares de autenticación
- [x] Tests del sistema de reconocimiento facial

### Frontend
- [x] Tests de componentes React con lógica de negocio
- [x] Tests de validación de cara duplicada
- [ ] Tests de hooks personalizados (useFaceRecognition)
- [ ] Tests de integración con APIs
- [ ] Tests E2E con Playwright o Cypress

## 💡 Mejores Prácticas Implementadas

1. **Un archivo por utilidad** - Fácil mantenimiento y testing
2. **Tests específicos por módulo** - Comandos granulares para desarrollo
3. **Naming consistency** - Nombres descriptivos y claros
4. **Type safety** - TypeScript en todos los tests
5. **Fast feedback** - Tests rápidos con Bun
6. **Watch mode** - Desarrollo ágil con re-ejecución automática
7. **Face validation testing** - Tests completos para prevención de duplicados

---

## 🔗 Enlaces Útiles

- [Bun Test Documentation](https://bun.sh/docs/cli/test)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Última actualización**: Proyecto implementado con sistema completo de testing para backend y frontend usando Bun como test runner, incluyendo validación inmediata de caras duplicadas en tiempo real. 