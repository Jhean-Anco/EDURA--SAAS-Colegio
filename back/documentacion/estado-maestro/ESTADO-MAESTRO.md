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

## Riesgos residuales

- Falta ejecutar la suite E2E de aislamiento con una base PostgreSQL disponible.
- Cualquier controlador nuevo que use `idInstitucion` o `idSede` debe seguir la misma validacion de contexto.
- El cierre total de PR-PLT-00 sigue dependiendo de la ejecucion E2E contra PostgreSQL real.
