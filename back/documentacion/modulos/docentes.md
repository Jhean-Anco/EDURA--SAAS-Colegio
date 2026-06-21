# MOD-007 — Docentes

## Resumen

Gestión de docentes en contexto SaaS multiinstitución/multisede. Un docente es la proyección laboral de una `Persona` dentro de una institución educativa.

## Modelo de datos

```
especialidades_profesionales
  id, id_institucion_educativa, codigo, codigo_normalizado,
  nombre, nombre_normalizado, descripcion, estado

docentes
  id, id_institucion_educativa, id_persona, codigo, codigo_normalizado,
  estado, fecha_ingreso, fecha_cese, perfil_profesional, observacion

asignaciones_docente_sede
  id, id_institucion_educativa, id_docente, id_sede,
  es_principal, estado, fecha_inicio, fecha_fin, observacion

docentes_especialidades_profesionales
  id, id_institucion_educativa, id_docente, id_especialidad_profesional,
  es_principal, anios_experiencia, estado
```

## Estados

| Entidad | Estados | Transiciones permitidas |
|---|---|---|
| Docente | ACTIVO, INACTIVO, CESADO | ACTIVO↔INACTIVO, ACTIVO→CESADO, INACTIVO→CESADO |
| Asignación sede | ACTIVA, INACTIVA | ACTIVA→INACTIVA |
| Especialidad docente | ACTIVA, INACTIVA | ACTIVA→INACTIVA |

### Reglas de estado

- **CESADO** requiere `fechaCese` obligatoria. Inactiva todas las asignaciones de sede automáticamente.
- **Reactivar** (INACTIVO→ACTIVO) requiere que el docente tenga al menos una sede activa.
- **CESADO** es terminal — no admite transiciones salientes.
- Un docente ACTIVO siempre debe tener al menos una sede activa (protegido por `UltimaSedeActivaError`).

## API REST

Base: `GET|POST|PATCH /api/v1/docentes`

| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| GET | /docentes | DOCENTES.LEER | Listar con filtros y paginación |
| GET | /docentes/mi-perfil | DOCENTES.MI_PERFIL.LEER | Perfil del usuario autenticado |
| GET | /docentes/:id | DOCENTES.LEER | Ficha completa |
| POST | /docentes | DOCENTES.CREAR | Crear docente + asignación sede inicial |
| PATCH | /docentes/:id | DOCENTES.ACTUALIZAR | Actualizar datos |
| PATCH | /docentes/:id/estado | DOCENTES.CAMBIAR_ESTADO | Cambiar estado |
| POST | /docentes/:id/sedes | DOCENTES.GESTIONAR_SEDES | Asignar sede |
| PATCH | /docentes/:id/sedes/:idAsig | DOCENTES.GESTIONAR_SEDES | Actualizar asignación |
| POST | /docentes/:id/sedes/:idAsig/establecer-principal | DOCENTES.GESTIONAR_SEDES | Marcar sede principal |
| POST | /docentes/:id/especialidades | DOCENTES.GESTIONAR_ESPECIALIDADES | Asignar especialidad |
| PATCH | /docentes/:id/especialidades/:idAsig | DOCENTES.GESTIONAR_ESPECIALIDADES | Actualizar asignación |
| GET | /especialidades-profesionales | ESPECIALIDADES_PROFESIONALES.LEER | Listar catálogo |
| POST | /especialidades-profesionales | ESPECIALIDADES_PROFESIONALES.CREAR | Crear especialidad |
| PATCH | /especialidades-profesionales/:id | ESPECIALIDADES_PROFESIONALES.ACTUALIZAR | Actualizar especialidad |

## Aislamiento SaaS

- `institucionId` siempre proviene del JWT — nunca del body.
- Cuando `alcance.ambito === 'SEDE'`, el listado de docentes se filtra automáticamente a la sede del token.
- Las FK compuestas `(id_docente, id_institucion_educativa)` → `docentes(id, id_institucion_educativa)` garantizan que no se pueden crear asignaciones cruzadas entre instituciones a nivel de base de datos.

## Permisos por rol

| Rol | Permisos |
|---|---|
| PROPIETARIO_PLATAFORMA | Todos |
| ADMINISTRADOR_INSTITUCION | DOCENTES.LEER/CREAR/ACTUALIZAR/CAMBIAR_ESTADO/GESTIONAR_SEDES/GESTIONAR_ESPECIALIDADES + ESPECIALIDADES_PROFESIONALES.* |
| DIRECTOR_SEDE | DOCENTES.LEER/ACTUALIZAR/GESTIONAR_SEDES + ESPECIALIDADES_PROFESIONALES.LEER |
| DOCENTE | DOCENTES.MI_PERFIL.LEER + ESPECIALIDADES_PROFESIONALES.LEER + PANEL_INSTITUCIONAL.RESUMEN.LEER |

## Auditoría

Las siguientes acciones se registran en `eventos_auditoria` vía `AuditoriaDocentesInterceptor`:

| Acción | Trigger |
|---|---|
| DOCENTE.CREAR | POST /docentes |
| DOCENTE.ACTUALIZAR | PATCH /docentes/:id |
| DOCENTE.CAMBIAR_ESTADO | PATCH /docentes/:id/estado |
| DOCENTE.ASIGNAR_SEDE | POST /docentes/:id/sedes |
| DOCENTE.ACTUALIZAR_SEDE | PATCH /docentes/:id/sedes/:id |
| DOCENTE.ESTABLECER_SEDE_PRINCIPAL | POST /docentes/:id/sedes/:id/establecer-principal |
| DOCENTE.ASIGNAR_ESPECIALIDAD | POST /docentes/:id/especialidades |
| DOCENTE.ACTUALIZAR_ESPECIALIDAD | PATCH /docentes/:id/especialidades/:id |
| ESPECIALIDAD_PROFESIONAL.CREAR | POST /especialidades-profesionales |
| ESPECIALIDAD_PROFESIONAL.ACTUALIZAR | PATCH /especialidades-profesionales/:id |

## Migraciones

| Versión | Archivo | Descripción |
|---|---|---|
| V14.5 | 1718945000000-PrepararIntegridadSedesParaDocentesV14_5.ts | UNIQUE(id, id_inst) idempotente en sedes y personas |
| V15 | 1718950000000-AgregarDocentesV15.ts | Crea las 4 tablas de docentes con FK compuestas y constraints |

## Arquitectura

Sigue hexagonal estricta:
- **Dominio**: `docentes.puerto.ts` (interfaces), `errores-docentes.ts`
- **Aplicación**: 11 casos de uso, todos sin dependencias de infraestructura
- **Infraestructura**: 2 repositorios TypeORM + 1 consultador SQL nativo
- **Presentación**: 2 controladores REST con `@UseInterceptors(AuditoriaDocentesInterceptor)`

Ver: [ADR-013](../adr/ADR-013-mod-007-docentes.md)
