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

## MOD-006

- Estado: implementado en codigo y documentado.
- Alcance: gestion de estudiantes y apoderados sobre `personas.id`.
- Regla base: no se duplica la tabla de personas.
- Seguridad: filtros por institucion obligatorios y filtro por sede cuando el contexto lo exige.
- Integracion: el panel institucional ya consume el conteo real de estudiantes activos.

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
