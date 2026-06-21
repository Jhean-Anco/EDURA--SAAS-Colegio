# Guia de lectura para IA

Este archivo existe para que un agente automatico entienda el estado del backend sin navegar el arbol a ciegas.

## Orden de lectura

1. [`../estado-maestro/ESTADO-MAESTRO.md`](../estado-maestro/ESTADO-MAESTRO.md)
2. [`../arquitectura/arquitectura-backend.md`](../arquitectura/arquitectura-backend.md)
3. [`../base-datos/diccionario-datos.md`](../base-datos/diccionario-datos.md)
4. [`../base-datos/reglas-integridad.md`](../base-datos/reglas-integridad.md)
5. [`../modulos/plataforma-saas.md`](../modulos/plataforma-saas.md)
6. [`../modulos/estructura-institucional.md`](../modulos/estructura-institucional.md)
7. [`../modulos/infraestructura-fisica.md`](../modulos/infraestructura-fisica.md)
8. [`../modulos/personas.md`](../modulos/personas.md)
9. [`../modulos/panel-institucional.md`](../modulos/panel-institucional.md)

## Como leer el repositorio

- `src/` contiene la implementacion real.
- `test/` contiene pruebas unitarias, de arquitectura y e2e.
- `src/base-datos/typeorm/migraciones/` contiene el historial real de cambios de esquema.
- `src/base-datos/typeorm/semillas/` contiene datos de arranque y demo.
- `documentacion/adr/` contiene decisiones de arquitectura con efecto estable.

## Regla de actualizacion

Cuando se agregue o cambie algo, actualizar como minimo:

- la documentacion del modulo afectado,
- el estado maestro,
- la semilla correspondiente si cambia el estado base,
- y las pruebas si cambia el contrato.

## Estado actual resumido

- Arquitectura: monolito modular NestJS con TypeORM y PostgreSQL.
- Seguridad: fail-closed, JWT + permisos globales.
- Multi-tenant: aislamiento por institucion educativa y por sede cuando aplica.
- Modulos activos: estructura institucional, infraestructura fisica, identidad y acceso, personas, panel institucional, estudiantes.
- Datos de negocio: personas aisladas por institucion, estudiantes vinculados a `personas.id`, panel institucional con resumen operativo real.
