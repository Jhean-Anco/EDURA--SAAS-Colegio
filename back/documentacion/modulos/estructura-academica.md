# MOD-008.1 — Estructura Académica

## Resumen

Gestión del calendario académico, catálogos educativos (niveles y grados) y oferta académica por sede (secciones). Implementa aislamiento multisede con máquinas de estado explícitas en todas las entidades.

## Modelo de datos

```
anios_academicos
  id, id_institucion_educativa, anio, codigo, codigo_normalizado,
  nombre, fecha_inicio, fecha_fin, estado, observacion

periodos_academicos
  id, id_institucion_educativa, id_anio_academico, codigo, codigo_normalizado,
  nombre, tipo, orden, fecha_inicio, fecha_fin, estado, observacion

niveles_educativos
  id, id_institucion_educativa, codigo, codigo_normalizado,
  nombre, descripcion, orden, estado

grados_educativos
  id, id_institucion_educativa, id_nivel_educativo, codigo, codigo_normalizado,
  nombre, descripcion, orden, estado

ofertas_grado_sede
  id, id_institucion_educativa, id_sede, id_grado_educativo,
  id_anio_academico, capacidad_referencial, estado

secciones_academicas
  id, id_institucion_educativa, id_oferta_grado_sede, codigo, codigo_normalizado,
  nombre, turno, capacidad_maxima, id_docente_tutor, id_espacio_fisico, estado
```

## Estados

| Entidad | Estados | Transiciones permitidas |
|---|---|---|
| AñoAcadémico | PLANIFICADO → ACTIVO, ANULADO; ACTIVO → CERRADO, ANULADO | Solo uno ACTIVO por institución |
| PeriodoAcadémico | PLANIFICADO → ACTIVO, ANULADO; ACTIVO → CERRADO, ANULADO | Solo uno ACTIVO por año |
| NivelEducativo | ACTIVO ↔ INACTIVO | No inactivar si tiene grados activos |
| GradoEducativo | ACTIVO ↔ INACTIVO | No inactivar si tiene ofertas activas/planificadas |
| OfertaGradoSede | PLANIFICADA → ACTIVA, CANCELADA; ACTIVA → CERRADA, CANCELADA | No cerrar/cancelar con secciones activas |
| SeccionAcademica | PLANIFICADA → ACTIVA, INACTIVA; ACTIVA → CERRADA, INACTIVA; INACTIVA → PLANIFICADA | — |

## Tipos de período

`BIMESTRE`, `TRIMESTRE`, `SEMESTRE`, `CUATRIMESTRE`, `OTRO`

## Turnos de sección

`MANANA`, `TARDE`, `NOCHE`, `COMPLETO`, `OTRO`

## Invariantes

- `fecha_fin > fecha_inicio` siempre; los períodos deben estar dentro del intervalo del año.
- Períodos no se solapan dentro del mismo año (excluye CERRADO/ANULADO).
- `codigo_normalizado` es el `codigo` en mayúsculas sin espacios laterales.
- El orden de períodos/niveles/grados es único por contexto.
- El espacio físico asignado a una sección debe pertenecer a la misma sede que la oferta.
- El docente tutor debe tener asignación activa en la sede de la oferta.

## Migración V17

`1718970000000-EndurecerEstructuraAcademicaV17.ts` agrega:

- Extensión `btree_gist` para constraints de rango de fechas.
- `EXCLUDE USING gist` en `periodos_academicos` para prevenir solapamientos en BD.
- Constraints `CHECK` para orden positivo y consistencia de fechas.
- Índices de apoyo para búsquedas frecuentes.

## Tokens DI

| Token | Implementación |
|---|---|
| `REPOSITORIO_CALENDARIO_ACADEMICO` | `RepositorioCalendarioAcademicoTypeorm` |
| `REPOSITORIO_CATALOGOS_ACADEMICOS` | `RepositorioCatalogosAcademicosTypeorm` |
| `REPOSITORIO_OFERTA_ACADEMICA` | `RepositorioOfertaAcademicaTypeorm` |
| `CONSULTADOR_ESTRUCTURA_ACADEMICA` | `ConsultadorEstructuraAcademicaTypeorm` |

## Endpoints HTTP

| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| GET | `/estructura-academica/anios` | `ESTRUCTURA_ACADEMICA.LEER` | Listar años |
| POST | `/estructura-academica/anios` | `ESTRUCTURA_ACADEMICA.CALENDARIO.GESTIONAR` | Crear año |
| PATCH | `/estructura-academica/anios/:id` | `ESTRUCTURA_ACADEMICA.CALENDARIO.GESTIONAR` | Actualizar año |
| PATCH | `/estructura-academica/anios/:id/estado` | `ESTRUCTURA_ACADEMICA.CALENDARIO.GESTIONAR` | Cambiar estado año |
| GET | `/estructura-academica/anios/:id/periodos` | `ESTRUCTURA_ACADEMICA.LEER` | Listar períodos |
| POST | `/estructura-academica/anios/:id/periodos` | `ESTRUCTURA_ACADEMICA.CALENDARIO.GESTIONAR` | Crear período |
| PATCH | `/estructura-academica/anios/:idAnio/periodos/:id` | `ESTRUCTURA_ACADEMICA.CALENDARIO.GESTIONAR` | Actualizar período |
| PATCH | `/estructura-academica/anios/:idAnio/periodos/:id/estado` | `ESTRUCTURA_ACADEMICA.CALENDARIO.GESTIONAR` | Cambiar estado período |
| GET | `/estructura-academica/niveles` | `ESTRUCTURA_ACADEMICA.LEER` | Listar niveles |
| POST | `/estructura-academica/niveles` | `ESTRUCTURA_ACADEMICA.CATALOGOS.GESTIONAR` | Crear nivel |
| PATCH | `/estructura-academica/niveles/:id` | `ESTRUCTURA_ACADEMICA.CATALOGOS.GESTIONAR` | Actualizar nivel |
| PATCH | `/estructura-academica/niveles/:id/estado` | `ESTRUCTURA_ACADEMICA.CATALOGOS.GESTIONAR` | Cambiar estado nivel |
| GET | `/estructura-academica/grados` | `ESTRUCTURA_ACADEMICA.LEER` | Listar grados |
| POST | `/estructura-academica/grados` | `ESTRUCTURA_ACADEMICA.CATALOGOS.GESTIONAR` | Crear grado |
| PATCH | `/estructura-academica/grados/:id` | `ESTRUCTURA_ACADEMICA.CATALOGOS.GESTIONAR` | Actualizar grado |
| PATCH | `/estructura-academica/grados/:id/estado` | `ESTRUCTURA_ACADEMICA.CATALOGOS.GESTIONAR` | Cambiar estado grado |
| GET | `/estructura-academica/ofertas` | `ESTRUCTURA_ACADEMICA.LEER` | Listar ofertas |
| POST | `/estructura-academica/ofertas` | `ESTRUCTURA_ACADEMICA.OFERTAS.GESTIONAR` | Crear oferta |
| PATCH | `/estructura-academica/ofertas/:id` | `ESTRUCTURA_ACADEMICA.OFERTAS.GESTIONAR` | Actualizar oferta |
| PATCH | `/estructura-academica/ofertas/:id/estado` | `ESTRUCTURA_ACADEMICA.OFERTAS.GESTIONAR` | Cambiar estado oferta |
| GET | `/estructura-academica/ofertas/:id/secciones` | `ESTRUCTURA_ACADEMICA.LEER` | Listar secciones |
| POST | `/estructura-academica/ofertas/:id/secciones` | `ESTRUCTURA_ACADEMICA.SECCIONES.GESTIONAR` | Crear sección |
| PATCH | `/estructura-academica/ofertas/:idOferta/secciones/:id` | `ESTRUCTURA_ACADEMICA.SECCIONES.GESTIONAR` | Actualizar sección |
| PATCH | `/estructura-academica/secciones/:id/estado` | `ESTRUCTURA_ACADEMICA.SECCIONES.GESTIONAR` | Cambiar estado sección |
| PATCH | `/estructura-academica/secciones/:id/espacio` | `ESTRUCTURA_ACADEMICA.SECCIONES.GESTIONAR` | Asignar espacio físico |
| PATCH | `/estructura-academica/secciones/:id/tutor` | `ESTRUCTURA_ACADEMICA.SECCIONES.GESTIONAR` | Asignar docente tutor |
