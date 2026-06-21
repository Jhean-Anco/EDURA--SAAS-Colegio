# Arquitectura del Backend EDURA

## Arquitectura modular

El backend se organiza como monolito modular. Cada modulo encapsula su dominio, aplicacion, infraestructura y presentacion.

## Capas

- `dominio`: entidades, objetos de valor, reglas puras y puertos.
- `aplicacion`: casos de uso, coordinacion y reglas de proceso.
- `infraestructura`: TypeORM, adaptadores externos y persistencia.
- `presentacion`: controladores HTTP, solicitudes y respuestas.

## Reglas de dependencia

- `dominio` no depende de NestJS ni de TypeORM.
- `aplicacion` depende de `dominio`.
- `infraestructura` implementa puertos definidos por `dominio`.
- `presentacion` depende de `aplicacion`.
- Los DTO HTTP no son entidades de dominio.

## Convenciones de nombres

- El codigo de negocio usa espanol.
- Los nombres tecnicos del framework se mantienen cuando son obligatorios.
- Tablas, permisos, modulos y rutas de negocio usan nomenclatura consistente en espanol.

## Flujo HTTP

`controlador -> caso de uso -> puerto -> repositorio/adaptador -> base de datos`

## Manejo de errores

- Errores de dominio se traducen a respuestas HTTP controladas.
- El sistema falla cerrado si falta contexto institucional.
- No se exponen secretos ni datos internos de auditoria.

## Seguridad

- JWT obligatorio para negocio.
- Permisos aplicados por guardias globales.
- `@Publico()` solo para rutas explicitamente abiertas.
- CORS configurable por entorno.
- Helmet activo.
- Throttling disponible en la plataforma base cuando se habilite por modulo o gateway.

## Auditoria

- Existe infraestructura para eventos de auditoria.
- Las operaciones sensibles deben auditarse cuando el modulo lo soporte.

## Multiinstitucion

- Toda operacion institucional debe filtrar por `id_institucion_educativa`.
- Si aplica sede, tambien debe filtrarse por `id_sede`.
- Un usuario solo accede a instituciones donde tiene membresia valida.

## Estado actual

- Base consolidada para estructura institucional, infraestructura fisica, identidad y acceso, personas, panel institucional y estudiantes.
- Pendiente consolidar modulos academicos, financieros y de reportes avanzados.
