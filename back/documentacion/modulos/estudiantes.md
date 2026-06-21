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

## Inyeccion de dependencias

Los casos de uso reciben sus dependencias por constructor sin decoradores NestJS:

```
REPOSITORIO_ESTUDIANTES (Symbol) → EstudiantesTypeormRepositorio
CONSULTA_ESTUDIANTES    (Symbol) → EstudiantesTypeormConsulta
```

El modulo usa `useFactory + inject` para construirlos. Esto mantiene la capa de aplicacion libre de NestJS y TypeORM.

## Errores de dominio

| Clase | Codigo HTTP |
|---|---|
| `EstudianteNoEncontradoError` | 404 |
| `EstudianteCodigoDuplicadoError` | 409 |
| `PersonaYaEsEstudianteError` | 409 |
| `SedeFueraDeInstitucionError` | 422 |
| `PersonaFueraDeInstitucionError` | 422 |
| `ApoderadoPrincipalExistenteError` | 422 |

## Integridad en base de datos (V14)

- `CHECK (estado IN ('ACTIVO','INACTIVO','RETIRADO','EGRESADO'))` en `estudiantes`.
- `CHECK (trim(codigo) <> '')` en `estudiantes`.
- `CHECK (fecha_retiro >= fecha_ingreso)` en `estudiantes`.
- FK compuesta `(id_persona, id_institucion_educativa)` garantiza que la persona pertenece a la misma institucion.
- FK compuesta `(id_estudiante, id_institucion_educativa)` en `apoderados_estudiante` y `documentos_estudiante`.
- Indice parcial `UNIQUE (id_institucion_educativa, id_persona) WHERE estado = 'ACTIVO'` impide doble matricula activa.
- `CHECK (estado IN ('ACTIVO','INACTIVO'))` en `apoderados_estudiante`.
- `CHECK (estado IN ('PENDIENTE','ENTREGADO','VENCIDO','ANULADO'))` en `documentos_estudiante`.

## Pruebas

### Unitarias (`test/unitarias/estudiantes.spec.ts`) — 85/85

- Crear estudiante valido.
- Rechazar sede de otra institucion.
- Rechazar persona de otra institucion.
- Rechazar codigo duplicado.
- Rechazar persona ya matriculada.
- Agregar apoderado valido.
- Rechazar segundo apoderado principal activo.
- Cambiar estado sin borrar fisicamente.
- Registrar documento administrativo.

### E2E (`test/estudiantes-flujo.e2e-spec.ts`) — requiere `BD_HOST`

- `GET /api/v1/estudiantes` sin token retorna 401.
- Listado vacio inicial al autenticarse.
- `POST /api/v1/estudiantes` crea estudiante y retorna `{ id }`.
- Codigo duplicado retorna 409.
- Sede de otra institucion retorna 422.
- `GET /api/v1/estudiantes/:id` retorna ficha del estudiante creado.
- Estudiante de otra institucion retorna 404.
- Listados de A y B no comparten IDs (aislamiento SaaS verificable).
- `PATCH /api/v1/estudiantes/:id/estado` cambia estado sin borrar.

## Evolucion futura

- Matriculas.
- Asistencia.
- Traslados.
- Historial academico.
