# AGENTS.md — EDURA

EDURA es un sistema integral de gestión educativa (SaaS multiinstitución, multisede).
Tecnologías: NestJS (back), Next.js 15 + React 19 (front), PostgreSQL, TypeORM, Node 24.

---

## Mapa del repositorio

```
sistema/
├── back/src/
│   ├── modulos/          # Dominio: curriculo, docentes, estudiantes, matriculas,
│   │                     #   identidad-acceso, infraestructura-fisica,
│   │                     #   estructura-academica, estructura-institucional,
│   │                     #   personas, panel-institucional, integraciones-externas
│   ├── compartido/       # Aplicacion, dominio, infraestructura, presentacion compartidos
│   ├── base-datos/typeorm/  # fuente-datos, migraciones, semillas, utilidades
│   └── configuracion/
├── front/src/
│   ├── app/              # Next.js App Router
│   ├── features/         # Funcionalidades por dominio
│   ├── components/       # Componentes reutilizables
│   ├── design-system/
│   ├── lib/
│   └── types/
├── docs/                 # Arquitectura, estado maestro, diccionario de datos
├── docs/ai/              # Contexto para agentes (NO modificar sin razón)
├── agent-assets/skills/  # Fuente canónica de Skills de EDURA
├── .ai/                  # Políticas, catálogos, lockfiles, métricas
├── .claude/rules/        # Reglas condicionales por ruta (Claude Code)
├── tasks/                # Tareas activas, contexto, handoffs, completadas
├── config/agents/        # Configuraciones para Codex y Antigravity
└── scripts/ai/           # Scripts de plataforma de agentes
```

---

## Fuentes de verdad

| Qué                        | Dónde                                  |
|----------------------------|----------------------------------------|
| Módulos y dominio          | `back/src/modulos/`                    |
| Esquema de base de datos   | `back/src/base-datos/typeorm/migraciones/` |
| Contratos HTTP             | `docs/ai/api-map.md` + OpenAPI generado |
| Decisiones arquitectónicas | `docs/ai/decisions/`                   |
| Estado implementado        | `docs/ESTADO-MAESTRO.md`               |
| Skills aprobadas           | `.ai/skills.catalog.yaml`              |
| Skills instaladas          | `.ai/skills.lock.yaml`                 |
| MCP autorizados            | `.ai/mcp.registry.yaml`                |
| Métricas de tareas         | `.ai/metrics/`                         |
| Índice estructural         | `docs/ai/generated/`                   |

---

## Cómo localizar contexto

1. Leer la tarea en `tasks/active/EDURA-XXX.md`.
2. Ejecutar `pnpm ai:context -- EDURA-XXX` para obtener la cápsula.
3. Leer únicamente los archivos listados en la cápsula.
4. Para símbolos: consultar `docs/ai/generated/symbols.json`.
5. Para módulo NestJS: `back/src/modulos/<nombre>/<nombre>.module.ts`.
6. Para migraciones: `back/src/base-datos/typeorm/migraciones/`.
7. Para frontend: `front/src/features/<nombre>/` o `front/src/app/<ruta>/`.

---

## Rutas excluidas (no leer salvo necesidad crítica)

- `**/node_modules/**`
- `**/dist/**`
- `**/coverage/**`
- `**/.next/**`
- `**/generated/**` (excepto `docs/ai/generated/`)
- `**/*.env*`
- `**/*.pem`, `**/*.key`, `**/*.p12`
- `back/src/base-datos/typeorm/semillas/demo.ts` (datos ficticios)

---

## Comandos principales

```bash
# Arranque de la plataforma de agentes
pnpm ai:bootstrap          # verificar entorno y estructura

# Contexto por tarea
pnpm ai:context -- EDURA-XXX

# Búsqueda y lectura limitadas
pnpm ai:search -- "<patrón>"
pnpm ai:read -- <archivo> --from <N> --to <N>
pnpm ai:diff
pnpm ai:impact

# Índice estructural (regenerar tras cambios grandes)
pnpm ai:index

# Validación dirigida por impacto
pnpm ai:check:changed
pnpm ai:check:affected

# Skills
pnpm ai:skills:list
pnpm ai:skills:sync
pnpm ai:skills:check

# MCP
pnpm ai:mcp:list
pnpm ai:mcp:health

# NotebookLM
pnpm ai:notebooklm:prepare
pnpm ai:notebooklm:status

# Handoff y métricas
pnpm ai:handoff -- EDURA-XXX
pnpm ai:metrics:report

# Doctor del sistema
pnpm ai:doctor
```

---

## Flujo obligatorio antes de modificar código

1. Leer `tasks/active/EDURA-XXX.md`.
2. Obtener cápsula de contexto con `pnpm ai:context`.
3. Consultar `docs/ai/decisions/` si la tarea afecta arquitectura.
4. Verificar multitenencia si el cambio toca datos de institución.
5. Verificar autorización si el cambio toca permisos o roles.
6. Implementar dentro del alcance declarado.
7. Ejecutar `pnpm ai:check:affected` antes de entregar.
8. Registrar en `tasks/completed/` con handoff.

---

## Política de dependencias

- No instalar dependencias de producción para la plataforma de agentes.
- Scripts en `scripts/ai/` solo usan Node.js built-ins o devDependencies existentes.
- Toda dependencia nueva requiere justificación documentada en ADR.

---

## Política de seguridad

- Nunca leer ni transmitir `.env`, secretos, claves privadas o datos personales.
- Nunca acceder a base de datos de producción.
- Nunca ejecutar `db:migration:run` sin aprobación explícita.
- Nunca hacer commit de credenciales.
- Todo acceso destructivo requiere confirmación humana.
- Skills y MCP con riesgo > bajo requieren aprobación manual.

---

## Definición de terminado

Una tarea está terminada cuando:
- TypeScript compila sin errores (`tsc --noEmit`).
- ESLint pasa en los archivos modificados.
- Pruebas afectadas pasan.
- No hay secretos en los cambios.
- Handoff generado en `tasks/completed/`.

---

## Formato de salida

Responde con: qué se hizo, archivos modificados, decisiones, riesgos, pendientes.
No incluyas razonamiento interno, logs exitosos completos ni archivos sin cambios.

---

## Documentación bajo demanda

- Arquitectura detallada: `docs/ai/architecture.md`
- Mapa de base de datos: `docs/ai/database-map.md`
- Mapa de API: `docs/ai/api-map.md`
- Convenciones: `docs/ai/conventions.md`
- Skills: `agent-assets/skills/`
- ADR: `docs/ai/decisions/`
- Guía de plataforma: `docs/ai/index.yaml`
