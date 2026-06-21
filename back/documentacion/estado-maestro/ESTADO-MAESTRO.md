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
