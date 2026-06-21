# Changelog EDURA

Este archivo registra la evolucion visible del backend para que una IA o una persona pueda reconstruir rapidamente el estado del repositorio.

## [Unreleased]

### Added

- Guia documental raiz para navegacion automatica del repositorio.
- Documento maestro de arquitectura, estado y diccionario de datos en `docs/`.
- Endurecimiento de configuracion para secretos criticos fuera de desarrollo.

### Changed

- Se alineo la documentacion del backend con el indice raiz.
- Se mantuvo la separacion documental entre vision global y detalle del backend.

## [0.2.1] - 2026-06-21

### Fixed

- Semilla demo fallaba en `db:seed:demo` porque `periodos_academicos` omitía `orden` (DEFAULT 0 violaba `ck_periodos_orden_pos`) y `secciones_academicas` omitía `capacidad_maxima` (NOT NULL de V17).
- Migración V18 elimina los DEFAULT 0 en columnas `orden` que contradicen los CHECKs de V17, y actualiza el DEFAULT de `estado` en `secciones_academicas` a `PLANIFICADA`.
- `capacidadMaxima` ahora obligatorio en `CrearSeccionAcademicaSolicitud` y en la entrada del caso de uso y repositorio.
- La inserción de sección académica siempre establece `estado = 'PLANIFICADA'` explícitamente en el repositorio.
- `ListarSeccionesCasoUso` ahora propaga `sedeId` al consultador cuando el alcance es `SEDE`, cerrando la brecha de aislamiento multisede.
- Factories del módulo tipadas con las interfaces de puerto en lugar de `any`.
- CI: `PREVIOUS_RELEASE_SHA` actualizado a `b449cf4245681cf945f7d317086bfe3dbe182cf5` (base de REL-006.1).

## [0.2.0] - 2026-06-21

### Added

- MOD-008.1 Estructura Académica: calendario (años y períodos), catálogos (niveles y grados), oferta por sede y secciones.
- Migración V17 con btree_gist, EXCLUDE para solapamientos de períodos y CHECKs de integridad.
- 26 nuevos endpoints bajo `/estructura-academica/`.
- Documentación `documentacion/modulos/estructura-academica.md` y ADR-014.

### Changed

- CI actualizado con SHA base de REL-006.1.
- Tokens DI Symbol para todos los repositorios de estructura académica.

## [0.1.0] - 2026-06-20

### Added

- MOD-001 Panel institucional.
- MOD-006 Gestion de estudiantes y apoderados.
- Entidades TypeORM nuevas para estudiantes, apoderados y documentos administrativos.
- Migraciones para alertas, comunicados y estudiantes.
- Semillas demo para panel, permisos y estudiantes.
- Pruebas unitarias y e2e para los flujos principales.

### Changed

- El panel institucional ahora calcula estudiantes activos de forma real cuando la tabla existe.
- El sistema de permisos incorpora `PANEL_INSTITUCIONAL.RESUMEN.LEER`.
- El backend registra el modulo `estudiantes` y refuerza el aislamiento por institucion.

### Security

- Las consultas institucionales fallan cerrado ante contexto incompleto.
- `JWT_SECRETO` y `HASH_TOKEN_SECRETO` dejaron de depender de defaults inseguros fuera de desarrollo.
- Se valida la presencia de credenciales externas cuando se activan integraciones.

## [0.0.1] - 2026-06-19

### Added

- Base modular NestJS + TypeORM + PostgreSQL.
- Estructura institucional.
- Infraestructura fisica.
- Identidad y acceso.
- Personas.
- Seguridad global con JWT y permisos.
- Migraciones versionadas y semillas idempotentes.

## Notas de mantenimiento

- Cada incremento funcional importante debe agregar una entrada en `Unreleased`.
- Cuando un incremento se consolide, moverlo a una version fechada.
- Mantener el texto en espanol y con nombres de negocio del proyecto.
