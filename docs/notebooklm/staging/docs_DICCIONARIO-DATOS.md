# Diccionario de Datos EDURA

## Tablas actuales

- `instituciones_educativas`
- `sedes`
- `usuarios`
- `membresias_institucion`
- `roles`
- `permisos`
- `roles_permisos`
- `asignaciones_rol_usuario`
- `eventos_auditoria`
- `personas`
- `documentos_identidad_persona`
- `medios_contacto_persona`
- `direcciones_persona`
- `elementos_infraestructura`
- `espacios_fisicos`
- `alertas_institucionales`
- `comunicados_institucionales`
- `estudiantes`
- `apoderados_estudiante`
- `documentos_estudiante`

## Entidades principales

- InstitucionEducativa
- Sede
- Usuario
- MembresiaInstitucion
- Rol
- Permiso
- Persona
- Estudiante
- ApoderadoEstudiante
- DocumentoEstudiante
- ElementoInfraestructura
- EspacioFisico
- AlertaInstitucional
- ComunicadoInstitucional

## Relaciones

- Una institucion tiene muchas sedes.
- Una sede pertenece a una institucion.
- Un usuario se relaciona con una institucion por membresia.
- Un rol se asigna a usuarios por membresia y, si aplica, por sede.
- Una persona puede ser estudiante o apoderado sin duplicar tabla humana.
- Un estudiante pertenece a una institucion, una sede y una persona.
- Un apoderado pertenece a una institucion, un estudiante y una persona.
- La infraestructura se cuelga de la sede.

## Campos criticos

- `id_institucion_educativa`
- `id_sede`
- `estado`
- `fecha_creacion`
- `fecha_modificacion`
- `fecha_ingreso`
- `fecha_retiro`
- `fecha_publicacion`
- `prioridad`

## Reglas de unicidad

- Codigo unico por institucion para instituciones y sedes.
- Personas aisladas por institucion.
- Estudiantes unicos por institucion segun codigo y persona.
- Un apoderado principal activo por estudiante.

## Reglas de auditoria

- Las tablas principales conservan `fecha_creacion` y `fecha_modificacion`.
- Eventos sensibles deben pasar por auditoria cuando el flujo lo soporte.

## Aislamiento por institucion

- Ninguna consulta debe cruzar instituciones sin filtro.
- Los endpoints institucionales deben fallar cerrado si falta contexto.
- El panel institucional y estudiantes respetan este aislamiento como contrato base.
