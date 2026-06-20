# EDURA Backend

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
- Módulos principales: estructura institucional, infraestructura física, identidad y acceso, personas
- Entidades registradas: 45

## Seguridad HTTP

- Todo endpoint de negocio es privado por defecto.
- Solo `@Publico()` expone rutas sin token.
- `GuardiaJwt` y `GuardiaPermisos` se registran globalmente mediante `APP_GUARD`.
- El contexto institucional y de sede se deriva del token autenticado.
- La política detallada vive en `documentacion/adr/ADR-011-seguridad-fail-closed.md`.
## Semillas

- `npm run db:seed:bootstrap` asegura el propietario de plataforma.
- `npm run db:seed:demo` solo corre en desarrollo/test/ci.
- `npm run db:seed:all` ejecuta catálogos, seguridad, bootstrap y demo.
