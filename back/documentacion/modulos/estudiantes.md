# MOD-006 Estudiantes y Apoderados

## Objetivo

Gestionar estudiantes, sus apoderados y sus documentos administrativos reutilizando `personas.id` como ancla humana.

## Modelo de datos

- `estudiantes`
- `apoderados_estudiante`
- `documentos_estudiante`

## Reglas de negocio

- No se duplica `personas`.
- No se duplica `documentos_identidad_persona`.
- No se duplica `medios_contacto_persona`.
- No se duplica `direcciones_persona`.
- `id_institucion_educativa` es obligatorio en todas las tablas nuevas.
- Toda consulta filtra por institucion.
- Cuando aplique, tambien filtra por sede.
- Un estudiante pertenece a una institucion, una sede y una persona existente.
- Un apoderado pertenece a una persona existente y a un estudiante ya creado.
- Solo puede existir un apoderado principal activo por estudiante.

## Endpoints

- `GET /estudiantes`
- `GET /estudiantes/:id`
- `POST /estudiantes`
- `PATCH /estudiantes/:id`
- `PATCH /estudiantes/:id/estado`
- `POST /estudiantes/:id/apoderados`
- `PATCH /estudiantes/:id/apoderados/:idApoderado`
- `POST /estudiantes/:id/documentos`

## Casos de uso

- `ListarEstudiantesConsulta`
- `ObtenerEstudianteConsulta`
- `CrearEstudianteCasoUso`
- `ActualizarEstudianteCasoUso`
- `CambiarEstadoEstudianteCasoUso`
- `AgregarApoderadoEstudianteCasoUso`
- `ActualizarApoderadoEstudianteCasoUso`
- `RegistrarDocumentoEstudianteCasoUso`

## Permisos

- `ESTUDIANTES.LEER`
- `ESTUDIANTES.CREAR`
- `ESTUDIANTES.ACTUALIZAR`
- `ESTUDIANTES.CAMBIAR_ESTADO`
- `ESTUDIANTES.APODERADOS.GESTIONAR`
- `ESTUDIANTES.DOCUMENTOS.GESTIONAR`

## Integracion con panel

- El panel institucional consume el conteo real de estudiantes activos desde `estudiantes`.
- Si la tabla no existe en un entorno parcial, el resumen no debe romper el contrato base.

## Pruebas

- Crear estudiante valido.
- Rechazar sede o persona de otra institucion.
- Rechazar codigo duplicado.
- Obtener ficha completa.
- Agregar apoderado valido.
- Rechazar segundo apoderado principal activo.
- Cambiar estado sin borrar fisicamente.

## Evolucion futura

- Matriculas.
- Asistencia.
- Traslados.
- Historial academico.
