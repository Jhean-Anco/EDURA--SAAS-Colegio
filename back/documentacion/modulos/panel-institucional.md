# MOD-001 Panel Institucional

`GET /panel-institucional/resumen`

## Alcance

- Expone un resumen institucional para directores y coordinadores de sede.
- Usa el contexto autenticado existente; no acepta `idInstitucionEducativa` por query.
- Falla en cerrado si falta institución, membresía activa o autorización por sede.

## Fuente de datos

- `instituciones_educativas`
- `sedes`
- `membresias_institucion`
- `asignaciones_rol_usuario`
- `elementos_infraestructura`
- `espacios_fisicos`
- `alertas_institucionales`
- `comunicados_institucionales`

## Contrato estable

- `totalEstudiantesActivos`: `null`
- `totalDocentesActivos`: `null`
- `matriculasPorEstado`: `[]`
- `asistenciaDelDia`: `null`

## Notas

- `comunicados_institucionales` solo devuelve registros `PUBLICADO`, ordenados por `fecha_publicacion DESC` y limitados a 5.
- Las alertas pendientes se ordenan por prioridad y fecha de generación.
