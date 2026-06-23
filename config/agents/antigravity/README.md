# Configuración Google Antigravity — EDURA

## Estado

Soporte en desarrollo. Verificar documentación oficial vigente antes de configurar.
Google Antigravity es compatible con el estándar `AGENTS.md`.

## Archivos de instrucciones compatibles

Antigravity busca instrucciones en `AGENTS.md` en la raíz y subdirectorios.
El `AGENTS.md` raíz de EDURA es compatible con el formato esperado.

## Perfil de trabajo

1. Leer `AGENTS.md` — cargado automáticamente.
2. Las Skills en `.agents/skills/` están sincronizadas desde `agent-assets/skills/`.
3. Usar el perfil MCP apropiado según la tarea (ver `.ai/mcp.registry.yaml`).

## Variables de entorno

```bash
# Ver env.example en este directorio
GOOGLE_API_KEY=<tu_clave>  # nunca en el repositorio
GOOGLE_PROJECT_ID=<proyecto>
```

## Comandos de verificación

```bash
pnpm ai:bootstrap
pnpm ai:context -- EDURA-XXX
```

## Diferencias con Claude Code

- Antigravity usa `AGENTS.md` como fuente principal.
- Las reglas condicionales de `.claude/rules/` no aplican — verificar soporte nativo.
- Usar `.agents/skills/` para Skills.
- Configuración MCP: verificar formato compatible con Antigravity IDE/CLI.

## Notas

Si Antigravity soporta un formato de configuración diferente para Skills o reglas,
crear adaptador en `tools/` y documentar aquí.
