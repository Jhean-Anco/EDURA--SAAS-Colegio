# Convenciones EDURA

## Idioma

- Nombres de dominio (entidades, módulos, campos, DTOs): **español**
- Nombres técnicos de herramientas/frameworks: inglés (module, controller, guard, entity, dto)
- Variables de entorno: SCREAMING_SNAKE_CASE en español abreviado (ej. `JWT_SECRETO`)
- Archivos: kebab-case en español (ej. `matriculas.module.ts`, `crear-matricula.dto.ts`)

## Convenciones NestJS (back)

- Un módulo por dominio en `back/src/modulos/<nombre>/`
- DTOs en `aplicacion/dtos/`
- Casos de uso en `aplicacion/casos-de-uso/`
- Entidades TypeORM en `dominio/entidades/`
- Interfaces de repositorio en `dominio/repositorios/`
- Implementaciones TypeORM en `infraestructura/repositorios/`
- Controladores en `presentacion/controladores/`

## Convenciones Next.js (front)

- App Router en `front/src/app/`
- Funcionalidades de dominio en `front/src/features/<nombre>/`
- Componentes reutilizables en `front/src/components/`
- Design system en `front/src/design-system/`
- Llamadas al backend desde route handlers en `app/api/`

## Convenciones de pruebas

- Unit tests junto al archivo: `*.spec.ts`
- E2E tests en `back/test/` con Jest
- Tests de frontend en `front/src/tests/` con Vitest
- Fixtures de prueba no deben contener datos reales

## Migraciones TypeORM

- Nombrar: `NombreDescriptivo` (PascalCase descriptivo)
- Comando: `npm --prefix back run db:migration:generate --name=NombreDescriptivo`
- Nunca modificar una migración ya ejecutada en producción

## Commits

- Formato: `tipo(alcance): descripción en español`
- Tipos: feat, fix, docs, refactor, test, chore, rel
- Alcance: nombre del módulo o área (ej. `matriculas`, `front`, `db`)
