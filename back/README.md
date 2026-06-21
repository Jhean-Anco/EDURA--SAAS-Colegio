# EDURA Backend

## Guia para lectura automatica

Si una IA va a recorrer este repositorio, este es el orden recomendado:

0. [`../docs/README.md`](../docs/README.md)
1. [`documentacion/estado-maestro/ESTADO-MAESTRO.md`](documentacion/estado-maestro/ESTADO-MAESTRO.md)
2. [`documentacion/arquitectura/arquitectura-backend.md`](documentacion/arquitectura/arquitectura-backend.md)
3. [`documentacion/base-datos/diccionario-datos.md`](documentacion/base-datos/diccionario-datos.md)
4. [`documentacion/base-datos/reglas-integridad.md`](documentacion/base-datos/reglas-integridad.md)
5. [`documentacion/modulos/plataforma-saas.md`](documentacion/modulos/plataforma-saas.md)
6. Documentacion de cada modulo en [`documentacion/modulos/`](documentacion/modulos)

## Politica de documentacion viva

- Cada incremento funcional relevante debe actualizar su documento de modulo.
- Si cambia una regla de negocio, actualiza tambien `documentacion/base-datos/reglas-integridad.md`.
- Si cambia una entidad, permiso, migracion o flujo de seguridad, actualiza `documentacion/estado-maestro/ESTADO-MAESTRO.md`.
- Si cambia la arquitectura de capas, registrar la decision en `documentacion/adr/`.
- La documentacion del backend debe permitir que una IA reconstruya:
  - la arquitectura,
  - los modulos existentes,
  - el contrato de seguridad,
  - el modelo de datos vigente,
  - y el estado real de implementacion.

## Requisitos

- Node.js 24+
- npm
- PostgreSQL 16

## Inicio local

1. Copia `.env.example` a `.env`.
2. Levanta PostgreSQL: `docker compose up -d postgres`.
3. Ejecuta migraciones: `npm run db:migration:run`.
4. Ejecuta semillas: `npm run db:seed`.
5. Inicia la API: `npm run start:dev`.

## Variables

- `ENTORNO`
- `PUERTO_API`
- `ORIGENES_CORS`
- `BD_HOST`
- `BD_PUERTO`
- `BD_USUARIO`
- `BD_CLAVE`
- `BD_NOMBRE`
- `BD_SSL`
- `BD_REGISTRO_CONSULTAS`

## Rutas

- Swagger: `/api/documentacion`
- Salud: `/api/v1/salud`
- Modulos principales: estructura institucional, infraestructura fisica, identidad y acceso, personas, panel institucional, estudiantes
- Entidades registradas: 50

## Seguridad HTTP

- Todo endpoint de negocio es privado por defecto.
- Solo `@Publico()` expone rutas sin token.
- `GuardiaJwt` y `GuardiaPermisos` se registran globalmente mediante `APP_GUARD`.
- El contexto institucional y de sede se deriva del token autenticado.
- La politica detallada vive en `documentacion/adr/ADR-011-seguridad-fail-closed.md`.

## Semillas

- `npm run db:seed:bootstrap` asegura el propietario de plataforma.
- `npm run db:seed:demo` solo corre en desarrollo/test/ci.
- `npm run db:seed:all` ejecuta catalogos, seguridad, bootstrap y demo.

## Documentacion de modulos

- [`documentacion/modulos/estructura-institucional.md`](documentacion/modulos/estructura-institucional.md)
- [`documentacion/modulos/infraestructura-fisica.md`](documentacion/modulos/infraestructura-fisica.md)
- [`documentacion/modulos/personas.md`](documentacion/modulos/personas.md)
- [`documentacion/modulos/panel-institucional.md`](documentacion/modulos/panel-institucional.md)
- [`documentacion/modulos/estudiantes.md`](documentacion/modulos/estudiantes.md)

## Criterio de evolucion

El proyecto crece por incrementos funcionales numerados. Cada incremento debe dejar trazabilidad en:

- codigo,
- migraciones,
- semillas,
- pruebas,
- documentacion del modulo,
- estado maestro.
