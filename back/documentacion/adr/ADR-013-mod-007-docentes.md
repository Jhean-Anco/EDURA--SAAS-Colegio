# ADR-013 — MOD-007 Docentes: diseño y decisiones

**Estado**: Aceptado  
**Fecha**: 2026-06-20  
**Rama**: feat/rel-006-mod-008-1-estructura-academica

## Contexto

Se necesita gestionar docentes dentro del sistema SaaS multiinstitución. Un docente puede pertenecer a múltiples sedes de la misma institución, tener múltiples especialidades profesionales y su cuenta de usuario es opcional (puede existir como persona/docente sin acceso al sistema).

## Decisiones

### 1. Docente como proyección laboral de Persona

Un `Docente` no duplica datos personales — referencia a `Persona` con FK y FK compuesta `(id_persona, id_institucion_educativa)`. Esto garantiza aislamiento entre instituciones a nivel de BD.

**Alternativa descartada**: Incluir datos de persona en la tabla docentes. Crearía duplicación y rompería el modelo de Personas ya establecido.

### 2. Asignaciones sede como entidad propia

`asignaciones_docente_sede` permite que un docente esté activo en múltiples sedes con historial temporal (`fecha_inicio`, `fecha_fin`). Exactamente una asignación puede ser `es_principal = true AND estado = 'ACTIVA'` — garantizado por índice único parcial.

### 3. Estado CESADO es terminal con fechaCese obligatoria

`CESADO` no admite reactivación y requiere `fechaCese`. Al cesar un docente, todas sus asignaciones de sede se inactivan automáticamente en la misma operación (pero sin transacción distribuida — el repositorio lo hace en un UPDATE masivo).

**Regla adicional**: Reactivar (INACTIVO→ACTIVO) requiere que exista al menos una sede activa. Si un docente fue inactivado sin sedes, debe asignársele una sede antes de reactivarlo.

### 4. Mi perfil: resolución usuario→membresía→persona→docente

`GET /docentes/mi-perfil` no asume que `usuario.id` == `persona.id`. Resuelve: `usuarios` → `membresias_institucion` (donde `mi.id_persona` apunta a la persona del usuario en esa institución) → `docentes`. Esto es correcto porque la vinculación usuario-persona se hace a través de la membresía.

### 5. Permiso DOCENTES.MI_PERFIL.LEER separado de DOCENTES.LEER

El rol `DOCENTE` solo tiene `DOCENTES.MI_PERFIL.LEER` — no puede ver el listado de otros docentes. El endpoint `GET /docentes` requiere `DOCENTES.LEER` que solo tienen administradores y directores de sede.

### 6. Auditoría vía interceptor HTTP

Las 10 acciones mutantes se registran en `eventos_auditoria` a través de `AuditoriaDocentesInterceptor` aplicado con `@UseInterceptors` en los controladores. El interceptor nunca falla silenciosamente — los errores de auditoría están capturados en `try/catch` para no interrumpir el flujo principal.

**Alternativa descartada**: Añadir `ServicioAuditoria` como dependencia de cada caso de uso. Contaminaría la capa de aplicación con infraestructura y haría los tests unitarios más complejos.

### 7. FK compuestas para aislamiento cross-table

```sql
FOREIGN KEY (id_persona, id_institucion_educativa)
  REFERENCES personas (id, id_institucion_educativa)
```

Esto garantiza que no se puede crear un docente apuntando a una persona de otra institución, aunque alguien inserte directamente en la BD.

### 8. Consultador SQL nativo con interfaces tipadas

El `ConsultadorDocentesTypeorm` usa `ds.query<InterfaceTipada[]>()` en lugar de `any`. Se definen interfaces locales para cada forma de resultado SQL (`FilaDocenteResumen`, `FilaDocenteDetalle`, etc.) eliminando los `@typescript-eslint/no-unsafe-*` completamente.

## Consecuencias

- El listado de docentes es eficiente — una sola query con subconsultas correlacionadas para sede y especialidad principal.
- El `mi-perfil` requiere un JOIN adicional vía `membresias_institucion` pero es semánticamente correcto.
- La auditoría es best-effort — si la tabla `eventos_auditoria` no existe o hay error de BD, la operación principal continúa.
- Las reglas de estado están en el caso de uso (dominio), no en el controlador.
