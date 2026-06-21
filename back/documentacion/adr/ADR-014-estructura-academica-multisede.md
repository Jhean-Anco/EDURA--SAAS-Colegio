# ADR-014 — Aislamiento multisede en Estructura Académica (MOD-008.1)

**Estado:** Aceptado  
**Fecha:** 2026-06-21  
**Deciders:** Equipo EDURA

## Contexto

MOD-008.1 introduce la estructura académica completa: calendarios, períodos, catálogos (niveles/grados) y oferta por sede con secciones. Una institución puede tener múltiples sedes, y el acceso debe aislarse según el `AlcanceAcceso` del usuario (`INSTITUCION` o `SEDE`).

## Decisión

### 1. Estructura jerárquica fija

`AñoAcadémico → PeriodosAcadémicos` (a nivel de institución)  
`OfertaGradoSede` (cruce de sede × grado × año)  
`SecciónAcadémica` (dentro de cada oferta)

Los catálogos (niveles y grados) son de institución pero la oferta y las secciones son por sede.

### 2. Alcance propagado en cada caso de uso

El `AlcanceAcceso` se pasa a todos los casos de uso. Cuando `ambito === 'SEDE'`, se filtra por `sedeId`. Los casos de uso validan que la entidad pertenezca a la sede del alcance antes de operar; si no, lanzan el error de "no encontrado" (información mínima en errores, ver ADR-011).

### 3. `codigo_normalizado` como clave de unicidad

Toda entidad con código usa `codigo_normalizado = UPPER(TRIM(codigo))` para chequeos de duplicidad, almacenando el original en `codigo`. Esto evita duplicados case-insensitive sin pérdida de la presentación original.

### 4. Máquinas de estado explícitas con matrices de transición

Cada entidad tiene un `Record<Estado, Estado[]>` en el caso de uso de cambio de estado. Esta matriz es la única fuente de verdad de las transiciones válidas; se verifica antes de persistir. No hay transiciones implícitas en repositorios.

### 5. Verificación cruzada de sede para espacio físico y docente tutor

Antes de asignar un espacio físico a una sección, se verifica via SQL que el elemento de infraestructura pertenezca a la misma sede que la oferta. El mismo principio aplica para docentes tutores (vía `asignaciones_docente_sede`).

### 6. Fechas como `date` en PostgreSQL, strings ISO en TypeScript

Las fechas se almacenan como `DATE` en BD y se devuelven como `string` (`YYYY-MM-DD`) en la capa de aplicación. La comparación de solapamientos usa el operador de exclusión de `btree_gist`.

## Alternativas consideradas

- **Entidad "Sede" con lista de niveles propios**: rechazado porque aumenta la complejidad de catálogos sin beneficio pedagógico real; los niveles y grados son de institución.
- **Estado CANCELADO en secciones**: rechazado porque el ciclo de vida de secciones es más simple (PLANIFICADA → ACTIVA → CERRADA/INACTIVA). Cancelar una sección es equivalente a cerrarla anticipadamente.

## Consecuencias

- Los repositorios siempre reciben `institucionId` como filtro obligatorio.
- La consulta `verificarEspacioFisicoEnSede` requiere JOIN de 3 tablas (`elementos_infraestructura → espacios_fisicos → tipos_espacio_fisico`) para determinar si el espacio es de tipo AULA.
- El constraint `EXCLUDE USING gist` en `periodos_academicos` previene solapamientos a nivel de BD como segunda línea de defensa (la primera es el caso de uso).
