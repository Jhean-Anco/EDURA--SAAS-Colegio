# Estado Maestro

## REL-004.2

- Estado: implementado en codigo.
- Guardias globales: `APP_GUARD` para autenticacion y permisos.
- Excepciones publicas: salud, iniciar sesion, renovar sesion.
- Validacion de contexto: aplicada en controladores institucionales y de sede.
- Permisos: centralizados con `GuardiaPermisos`.
- Consultador de permisos: filtrado por ambito institucional y de sede.
- Evidencia automatizada: `lint`, `build` y `test` pasan.
- E2E de aislamiento: requiere PostgreSQL activo para ejecucion completa.

## MOD-001

- Estado: implementado en codigo y documentado.
- Alcance: panel institucional con resumen operativo por institucion y sede.
- Fuente de datos: instituciones, sedes, membresias, asignaciones, infraestructura, alertas, comunicados y estudiantes activos cuando la tabla existe.
- Contrato estable: indicadores preparados para estudiantes, docentes, matriculas y asistencia aunque algunos queden en cero o `null`.

## MOD-008.1 — Estructura Académica (REL-006.3)

- Estado: cerrado — CI verde confirmado (todos los 5 jobs) en REL-006.2. REL-006.3 cierra brechas funcionales residuales.
- Alcance: calendario académico (años y períodos), catálogos educativos (niveles y grados), oferta por sede y secciones académicas.
- DI: tokens Symbol (`REPOSITORIO_CALENDARIO_ACADEMICO`, `REPOSITORIO_CATALOGOS_ACADEMICOS`, `REPOSITORIO_OFERTA_ACADEMICA`, `CONSULTADOR_ESTRUCTURA_ACADEMICA`) con `useFactory + inject`. Factories tipadas con interfaces de puerto (sin `any`).
- Máquinas de estado explícitas en todas las entidades; matrices de transición en los casos de uso de cambio de estado.
- Aislamiento multisede: `AlcanceAcceso` propagado en todos los casos de uso; `sedeId` propagado a `listarSecciones` cuando `ambito === 'SEDE'`.
- Validaciones cruzadas: espacio físico y docente tutor verificados contra la sede de la oferta via SQL.
- `codigo_normalizado` como clave de unicidad case-insensitive en todas las entidades con código.
- Migración V16: estructura base (con defaults 0 en orden que fueron limpiados por V18).
- Migración V17: btree_gist, constraint EXCLUDE para solapamientos de períodos, CHECKs de orden y fechas, NOT NULL en `capacidad_maxima`.
- Migración V18: elimina DEFAULT 0 en columnas `orden` (incompatibles con CHECKs de V17), actualiza DEFAULT de `estado` en secciones a `PLANIFICADA`.
- Semilla demo: `periodos` con `orden = 1`, `ofertas` con `capacidad_referencial = 30`, `secciones` con `capacidad_maxima = 25` y `estado = PLANIFICADA`.
- `capacidadMaxima` requerida en DTO, caso de uso y repositorio; repositorio siempre inserta `estado = PLANIFICADA`.
- Validación de referencias al crear oferta: sede ACTIVA, grado ACTIVO, nivel ACTIVO, año no CERRADO/ANULADO (`obtenerContextoReferenciasOferta` — 3 queries paralelas).
- Validación al activar oferta: sede/grado/nivel/año activos (`obtenerOfertaConContexto` — 1 JOIN de 4 tablas).
- Oferta CERRADA/CANCELADA bloquea creación de secciones.
- Sección solo se activa si oferta está ACTIVA.
- Ruta anidada `PATCH /ofertas/:idOferta/secciones/:id` verifica que la sección pertenezca a la oferta padre.
- `capacidadMaxima` en actualización no acepta `null`.
- E2E con usuarios aislados por sede (admin, directorA1 exclusivo, directorA2 exclusivo).
- Tests unitarios: 179/179 pasan.
- Nuevos errores de dominio: `SedeAcademicaNoDisponibleError`, `GradoAcademicoNoDisponibleError`, `NivelAcademicoNoDisponibleError`, `AnioAcademicoNoDisponibleError`, `OfertaNoPermiteSeccionesError`, `OfertaNoActivaError`.
- Errores previos: `NivelTransicionInvalidaError`, `GradoTransicionInvalidaError`, `TransicionOfertaInvalidaError`, `TransicionSeccionInvalidaError`, `AnioConPeriodosActivosError`, `AnioConOfertasActivasError`, `OfertaConSeccionesActivasError`, `PeriodoFueraDeAnioError`.
- ADR-014 documenta las decisiones de aislamiento multisede.
- Siguiente módulo: MOD-008.2 Currículo y Planes de Estudio.

## MOD-006 (REL-004.4)

- Estado: estabilizado — arquitectura hexagonal limpia, tests unitarios y E2E.
- Alcance: gestion de estudiantes, apoderados y documentos administrativos sobre `personas.id`.
- DI: tokens Symbol (`CONSULTA_ESTUDIANTES`, `REPOSITORIO_ESTUDIANTES`) con `useFactory + inject`; capa de aplicacion sin imports de NestJS ni TypeORM.
- Errores de dominio: `EstudianteNoEncontradoError`, `SedeFueraDeInstitucionError`, `PersonaFueraDeInstitucionError`, `EstudianteCodigoDuplicadoError`, `PersonaYaEsEstudianteError`, `ApoderadoPrincipalExistenteError` mapeados en `FiltroHttpGlobal`.
- DTOs: solicitudes tipadas con `class-validator` para todos los endpoints.
- Seguridad: `institucionId` siempre desde JWT, nunca del body.
- Integridad BD: migracion V14 agrega CHECKs de estado/codigo, FKs compuestas que garantizan que estudiante, apoderado y documento pertenezcan a la misma institucion, e indices parciales.
- Tests unitarios: 85/85 pasan; `mockRepo()` tipado contra `RepositorioEstudiantes`.
- Tests E2E: `test/estudiantes-flujo.e2e-spec.ts` cubre CRUD, 401 sin token, 409 codigo duplicado, 422 sede de otra institucion, aislamiento cruzado entre instituciones.
- CI: workflow movido a raiz del repo (`.github/workflows/ci.yml`) para deteccion por GitHub Actions.

## PR-PLT-00

- Estado: en estabilizacion backend.
- Bootstrap propietario: alineado al esquema vigente e idempotente.
- Semilla demo: restringida a desarrollo/test/ci e idempotente.
- Contexto plataforma: corregido para no exigir `institucionId`.
- CI: preparado para bootstrap, migraciones y semillas idempotentes con PostgreSQL 16.
- Evidencia automatizada: `lint`, `build`, `test:unit` y cobertura pasan.

## RSK-006

- Estado: corregido en codigo.

## RSK-007

- Estado: corregido parcialmente.
- La prueba vacia fue reemplazada por pruebas verificables, pero el escenario E2E completo sigue dependiendo de BD activa.

## ADR

- ADR-011 actualizado y alineado con la implementacion.
- ADR-012 agregado para la evolucion SaaS directa por institucion.

## Documentacion viva

- La lectura inicial del backend debe pasar por `README.md` y por `documentacion/guia-lectura-ia.md`.
- Cada modulo funcional debe mantener su propio archivo bajo `documentacion/modulos/`.
- Cambios de contrato, seguridad o modelo de datos deben reflejarse en esta pagina en el mismo incremento.

## Riesgos residuales

- Falta ejecutar la suite E2E de aislamiento con una base PostgreSQL disponible.
- Cualquier controlador nuevo que use `idInstitucion` o `idSede` debe seguir la misma validacion de contexto.
- El cierre total de PR-PLT-00 sigue dependiendo de la ejecucion E2E contra PostgreSQL real.
