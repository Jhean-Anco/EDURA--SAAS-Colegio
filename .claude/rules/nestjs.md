---
description: "Reglas para archivos NestJS del backend EDURA"
globs: ["back/src/**/*.ts", "back/src/**/*.module.ts", "back/test/**/*.ts"]
---

# Reglas NestJS — EDURA back

- Cada módulo en `back/src/modulos/<nombre>/` sigue la estructura: aplicacion/, dominio/, infraestructura/, presentacion/.
- Nombres de archivos y clases en español salvo decoradores y tipos de framework.
- Entidades TypeORM en `dominio/entidades/`; nunca en presentacion/.
- DTOs en `aplicacion/dtos/`; validar con `class-validator`.
- Repositorios: interfaz en `dominio/repositorios/`, implementación TypeORM en `infraestructura/repositorios/`.
- Todo endpoint protegido debe tener `JwtAuthGuard` y `RolesGuard` cuando aplique.
- Toda entidad con datos institucionales debe incluir `institucion_id`.
- Nunca exponer la entidad directamente en el controlador; usar DTO de respuesta.
- Migraciones: solo generarlas, nunca ejecutarlas sin aprobación.
- Al crear un nuevo módulo, registrarlo en `app.module.ts`.

Comandos disponibles:
```bash
npm --prefix back run lint
npm --prefix back run typecheck   # tsc --noEmit
npm --prefix back run test:unit
npm --prefix back run db:migration:generate --name=Nombre
npm --prefix back run db:migration:show
```
