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

## RSK-006

- Estado: corregido en codigo.

## RSK-007

- Estado: corregido parcialmente.
- La prueba vacia fue reemplazada por pruebas verificables, pero el escenario E2E completo sigue dependiendo de BD activa.

## ADR

- ADR-011 actualizado y alineado con la implementacion.

## Riesgos residuales

- Falta ejecutar la suite E2E de aislamiento con una base PostgreSQL disponible.
- Cualquier controlador nuevo que use `idInstitucion` o `idSede` debe seguir la misma validacion de contexto.
