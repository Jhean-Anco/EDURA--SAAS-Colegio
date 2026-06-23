# CLAUDE.md — EDURA

@AGENTS.md

---

## Reglas específicas de Claude Code

Las reglas condicionales por ruta están en `.claude/rules/`.
Claude Code las carga automáticamente según el archivo activo.

### Comportamiento general

- Responder siempre en español salvo nombres técnicos establecidos.
- Nunca generar código sin leer primero el módulo afectado.
- Antes de crear un archivo nuevo, verificar que no exista uno equivalente.
- Ante duda sobre alcance, leer `tasks/active/` antes de actuar.

### Memoria de sesión

Las memorias persistentes están en `C:\Users\julio\.claude\projects\d--EDURA-sistema\memory\`.
No guardar en memoria: rutas de archivos, patrones de código, historial Git.
Guardar en memoria: preferencias del usuario, decisiones de colaboración, contexto del proyecto no derivable del código.

### Skills disponibles en Claude Code

Ver catálogo en `.ai/skills.catalog.yaml`.
Invocar con `/nombre-skill` desde el chat.
Las Skills de Claude Code están sincronizadas en `.claude/skills/`.

### MCP activos

El perfil activo por defecto es `local-fast`.
Ver perfiles en `.ai/mcp.registry.yaml`.
No activar servidores MCP externos sin revisar el perfil correspondiente.

### Verificación antes de entregar

```bash
pnpm ai:check:affected   # lint + typecheck + tests afectados
pnpm ai:doctor           # salud del sistema de agentes
```
