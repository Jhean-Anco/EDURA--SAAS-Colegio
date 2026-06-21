# MOD-001 Panel Institucional

## Objetivo

Exponer un resumen operativo de la institucion educativa para directores y coordinadores de sede, respetando aislamiento por institucion y por sede.

## Endpoint

- `GET /panel-institucional/resumen`

## Alcance funcional

- Institucion educativa actual.
- Sede filtrada cuando el contexto lo permite.
- Periodo academico informado si viene en la solicitud.
- Total de sedes activas.
- Total de usuarios activos vinculados a la institucion.
- Total de espacios fisicos activos.
- Resumen de infraestructura por estado.
- Alertas institucionales pendientes.
- Comunicados recientes publicados.
- Indicadores reservados para proximas fases:
  - `totalEstudiantesActivos`
  - `totalDocentesActivos`
  - `matriculasPorEstado`
  - `asistenciaDelDia`

## Reglas

- Nunca aceptar `idInstitucionEducativa` por query.
- Siempre validar membresia activa del usuario.
- Si el rol o el contexto es de sede, restringir a esa sede.
- Falla en cerrado si no hay contexto valido.
- Todas las consultas filtran por institucion educativa.
- Si se filtra por sede, la sede debe pertenecer a la misma institucion.

## Fuentes de datos

- `instituciones_educativas`
- `sedes`
- `membresias_institucion`
- `asignaciones_rol_usuario`
- `elementos_infraestructura`
- `espacios_fisicos`
- `alertas_institucionales`
- `comunicados_institucionales`
- `estudiantes` cuando la tabla existe

## Contrato estable

- `totalEstudiantesActivos`: `number` o `0` cuando la tabla existe pero no hay registros; `null` solo en escenarios de preparacion previa cuando el contrato lo requiera.
- `totalDocentesActivos`: `null`
- `matriculasPorEstado`: `[]`
- `asistenciaDelDia`: `null`

## Ordenamiento

- Alertas: prioridad descendente funcional `CRITICA`, `ALTA`, `MEDIA`, `BAJA`, luego `fecha_generacion DESC`.
- Comunicados: `PUBLICADO`, `fecha_publicacion DESC`, limite 5.

## Seguridad

- Permiso: `PANEL_INSTITUCIONAL.RESUMEN.LEER`
- Guardias globales activas.
- No exponer correo, tokens ni auditoria interna.

## Pruebas

- E2E del resumen estable.
- Rechazo por sede fuera del contexto.
- Unitarias de la consulta de aplicacion y de la infraestructura.
