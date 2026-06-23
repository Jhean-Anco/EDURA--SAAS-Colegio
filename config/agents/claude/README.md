# Configuración Claude Code — EDURA

## Instalación

Claude Code lee automáticamente:

- `CLAUDE.md` (raíz del repositorio)
- `AGENTS.md` (raíz)
- `.claude/rules/*.md` (reglas condicionales por ruta)
- `.claude/skills/*.md` (Skills disponibles)
- `.claude/settings.json` (permisos y configuración)

No se requiere instalación adicional.

## Permisos configurados

Ver `.claude/settings.json`.
Las acciones destructivas (migraciones, push) requieren `settings.local.json` con permisos explícitos.

## Configuración local (no versionar)

Copiar `.claude/settings.local.example.json` como `.claude/settings.local.json` para permisos personales.

## Variables de entorno para scripts

```bash
# Opcional — habilitar debug de scripts de IA
AI_DEBUG=true

# Opcional — métricas
AI_METRICS_ENABLED=true
```

## MCP para Claude Code

Ver `config/agents/claude/mcp.config.example.json`.
Copiar como `~/.claude/claude_desktop_config.json` para activar MCP.

**Nota**: Los MCP builtin (filesystem, git) están disponibles en Claude Code sin configuración adicional.

## Verificación

```bash
pnpm ai:bootstrap
pnpm ai:doctor
```
