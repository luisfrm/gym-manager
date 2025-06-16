# LocalDate - Ejemplos de Uso

La clase `LocalDate` resuelve los problemas de zona horaria al trabajar con fechas en reportes y manejo de datos.

## Importación

### Backend
```typescript
import { LocalDate } from "../utils/LocalDate";
```

### Frontend  
```typescript
import { LocalDate } from "@/lib/utils/LocalDate";
```

## Ejemplos de Uso

### 1. Crear instancias
```typescript
// Fecha actual
const hoy = LocalDate.today();

// Desde string (evita problemas de zona horaria)
const fecha = new LocalDate("2024-05-31");

// Desde Date object
const fechaDate = new LocalDate(new Date(2024, 4, 31));

// Desde año/mes
const primeroDeMayo = LocalDate.fromYearMonth(2024, 5);
```

### 2. Obtener valores
```typescript
const fecha = new LocalDate("2024-05-31");

console.log(fecha.getDay());        // 31
console.log(fecha.getMonth());      // 5 
console.log(fecha.getYear());       // 2024
console.log(fecha.getDayName());    // "Viernes"
console.log(fecha.getMonthName());  // "Mayo"
console.log(fecha.getValue());      // Date object original
```

### 3. Formatear fechas
```typescript
const fecha = new LocalDate("2024-05-31");

console.log(fecha.getFullDate());                 // "31/05/2024" (default)
console.log(fecha.getFullDate("DD/MM/YYYY"));     // "31/05/2024"
console.log(fecha.getFullDate("YYYY-MM-DD"));     // "2024-05-31"
console.log(fecha.getFullDate("DD de MM de YYYY")); // "31 de 05 de 2024"
console.log(fecha.toISODateString());             // "2024-05-31"
```

### 4. Operaciones con fechas
```typescript
const fecha = new LocalDate("2024-05-15");

// Agregar/quitar días
const manana = fecha.addDays(1);           // 16/05/2024
const ayer = fecha.subtractDays(1);        // 14/05/2024

// Agregar meses
const proximoMes = fecha.addMonths(1);     // 15/06/2024

// Inicio y final de mes
const inicioMes = fecha.startOfMonth();    // 01/05/2024
const finalMes = fecha.endOfMonth();       // 31/05/2024
```

### 5. Comparaciones
```typescript
const fecha1 = new LocalDate("2024-05-15");
const fecha2 = new LocalDate("2024-05-20");

console.log(fecha1.isBefore(fecha2));     // true
console.log(fecha1.isAfter(fecha2));      // false
console.log(fecha1.isSame(fecha1));       // true
```

## Uso en Reportes (Backend)

### Antes (problemático)
```typescript
// ❌ Problemático - zona horaria puede cambiar el día
const endDate = new Date(2024, 5, 1); // 1 junio
const filter = {
  date: {
    $gte: startDate.toISOString().split('T')[0], // Puede dar fecha incorrecta
    $lte: endDate.toISOString().split('T')[0]
  }
};
```

### Después (correcto)
```typescript
// ✅ Correcto - sin problemas de zona horaria
const startDate = LocalDate.fromYearMonth(2024, 5).startOfMonth(); // 1 mayo
const endDate = LocalDate.fromYearMonth(2024, 5).endOfMonth();     // 31 mayo

const filter = {
  date: {
    $gte: startDate.toISODateString(), // "2024-05-01"
    $lte: endDate.toISODateString()    // "2024-05-31"
  }
};
```

## Uso en Frontend

### Formatear fechas de reportes
```typescript
import { LocalDate } from "@/lib/utils/LocalDate";

// En lugar de formatDate complejo
const formatearFecha = (fecha: string | Date) => {
  return new LocalDate(fecha).getFullDate("DD/MM/YYYY");
};

// Ejemplo en componente
const PaymentRow = ({ payment }) => (
  <div>
    Fecha: {new LocalDate(payment.date).getFullDate()}
    Mes: {new LocalDate(payment.date).getMonthName()}
  </div>
);
```

### Generar rangos de fechas
```typescript
// Para reportes mensuales
const mesActual = LocalDate.today();
const inicioMes = mesActual.startOfMonth();
const finMes = mesActual.endOfMonth();

console.log(`Reporte de ${inicioMes.getFullDate()} a ${finMes.getFullDate()}`);
// "Reporte de 01/05/2024 a 31/05/2024"
```

## Beneficios

✅ **Sin zona horaria**: Fechas consistentes independiente del servidor/cliente  
✅ **Fácil de usar**: API simple y métodos descriptivos  
✅ **Reutilizable**: Mismo código frontend y backend  
✅ **Localizado**: Nombres de días y meses en español  
✅ **Flexible**: Múltiples formatos de salida  
✅ **Inmutable**: Operaciones retornan nuevas instancias  

## Migración

Para migrar código existente:

1. Reemplaza `new Date().toISOString().split('T')[0]` con `LocalDate.today().toISODateString()`
2. Reemplaza funciones `formatDate` custom con `new LocalDate(fecha).getFullDate()`
3. Usa métodos de rango como `startOfMonth()` y `endOfMonth()` para reportes mensuales 