# Configuración OpenAI Codex CLI — EDURA

## Estado

Soporte en desarrollo. Verificar documentación oficial vigente antes de configurar:
https://github.com/openai/codex

## Archivos de instrucciones compatibles

Codex CLI busca instrucciones en `AGENTS.md` en la raíz del repositorio y en subdirectorios.
El `AGENTS.md` raíz de EDURA es compatible con el formato esperado por Codex.

## Perfil de trabajo

Al iniciar Codex en este repositorio:

1. Leer `AGENTS.md` — cargado automáticamente.
2. Las Skills en `.agents/skills/` están sincronizadas desde `agent-assets/skills/`.
3. Usar el perfil `local-fast` o `backend` según la tarea.

## Variables de entorno requeridas

```bash
# Ver env.example en este directorio
OPENAI_API_KEY=<tu_clave>  # nunca en el repositorio
```

## Comandos de verificación

```bash
# Verificar que el entorno esté listo
pnpm ai:bootstrap

# Obtener contexto antes de iniciar
pnpm ai:context -- EDURA-XXX
```

## Diferencias con Claude Code

- Codex usa `AGENTS.md` como fuente principal (no `CLAUDE.md`).
- Las reglas condicionales de `.claude/rules/` no aplican directamente — verificar soporte.
- Usar `.agents/skills/` en lugar de `.claude/skills/`.

## Rutas excluidas (configurar en Codex si lo soporta)

Ver sección `Rutas excluidas` en `AGENTS.md`.
