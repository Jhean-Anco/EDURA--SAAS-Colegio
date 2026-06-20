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
- Módulos principales: estructura institucional e infraestructura física
- Entidades registradas: 28
