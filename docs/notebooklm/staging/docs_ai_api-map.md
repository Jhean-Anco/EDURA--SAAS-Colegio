# Mapa de API EDURA

Fuente canónica de contratos: OpenAPI (generar con `pnpm ai:index`)
Índice de controladores: `docs/ai/generated/controllers.json`
Índice de rutas: `docs/ai/generated/routes.json`

## Estructura de prefijos

El backend NestJS expone rutas bajo prefijo `/api/v1/`.
El frontend actúa como BFF: clientes llaman a `front/src/app/api/<ruta>/route.ts`,
que reenvía al backend con token de sesión.

## Módulos con endpoints (buscar controladores en `presentacion/controladores/`)

| Módulo                  | Prefijo esperado            |
|-------------------------|-----------------------------|
| identidad-acceso        | `/api/v1/auth`              |
| personas                | `/api/v1/personas`          |
| estructura-institucional| `/api/v1/instituciones`     |
| estructura-academica    | `/api/v1/estructura`        |
| curriculo               | `/api/v1/curriculo`         |
| docentes                | `/api/v1/docentes`          |
| estudiantes             | `/api/v1/estudiantes`       |
| matriculas              | `/api/v1/matriculas`        |
| infraestructura-fisica  | `/api/v1/infraestructura`   |
| panel-institucional     | `/api/v1/panel`             |

## Seguridad en endpoints

- `JwtAuthGuard` en rutas protegidas
- `RolesGuard` con decorador `@Roles(...)`
- CSRF token en mutaciones desde frontend
- Rate limiting en endpoints de autenticación

## Para inspeccionar rutas reales

```bash
pnpm ai:search -- "@Controller" --glob "back/src/**/*.ts"
pnpm ai:search -- "@Get\|@Post\|@Put\|@Delete\|@Patch" --glob "back/src/**/presentacion/**/*.ts"
```
