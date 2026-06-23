# Arquitectura EDURA

## Stack tecnológico real

| Capa       | Tecnología                     |
|------------|-------------------------------|
| Backend    | NestJS, TypeORM, PostgreSQL    |
| Frontend   | Next.js 15, React 19, Tailwind |
| Tests back | Jest (unit + e2e)              |
| Tests front | Vitest + React Testing Library |
| E2E        | Playwright (front)             |
| Gestor pkg | npm (workspaces no activos)    |
| Node       | v24                            |

## Estructura de módulos NestJS

Cada módulo en `back/src/modulos/<nombre>/` sigue la convención:
```
<nombre>/
├── aplicacion/      # Casos de uso, DTOs, interfaces
├── dominio/         # Entidades, repositorios, value objects
├── infraestructura/ # Repositorios TypeORM, adaptadores externos
├── presentacion/    # Controladores, guards, pipes
└── <nombre>.module.ts
```

## Módulos existentes

- `curriculo` — Plan de estudios, cursos, secciones
- `docentes` — Gestión de docentes
- `estudiantes` — Gestión de estudiantes
- `matriculas` — Proceso de matrícula
- `identidad-acceso` — Autenticación, autorización, roles
- `estructura-academica` — Niveles, grados, secciones
- `estructura-institucional` — Instituciones, sedes
- `personas` — Entidad persona compartida
- `panel-institucional` — Dashboard institucional
- `infraestructura-fisica` — Aulas, recursos físicos
- `integraciones-externas` — Conectores externos

## Patrón BFF (Backend For Frontend)

El frontend Next.js actúa como BFF: las route handlers de `app/api/` llaman al backend NestJS.
El cliente externo nunca llama directamente al backend.

## Multitenencia

Aislamiento por institución educativa mediante columna `institucion_id` en entidades relevantes.
Row-level isolation implementado en guards y repositorios del módulo `identidad-acceso`.

## Seguridad

- JWT con refresh token rotation
- CSRF en endpoints de mutación
- OWASP hardening aplicado (ver commit 8025b61)
- Auditoría de accesos en módulo `identidad-acceso`

## Fuentes detalladas

- `docs/ARQUITECTURA.md` — Documento extenso de arquitectura
- `docs/ESTADO-MAESTRO.md` — Estado actual de implementación
- `docs/DICCIONARIO-DATOS.md` — Diccionario de entidades y campos
