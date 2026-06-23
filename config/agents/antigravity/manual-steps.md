# Antigravity — Pasos de configuración MCP
# Generado: 2026-06-23
# Estado: no_detectado (Antigravity no encontrado en PATH)

## Estado actual
Antigravity no fue detectado en el entorno. Este archivo documenta los pasos
a seguir cuando esté disponible.

## Pasos de configuración

### 1. Instalar Antigravity
Seguir las instrucciones oficiales de Google para instalar Antigravity CLI.
Verificar con: antigravity --version

### 2. Configurar MCP EDURA Contexto
Antigravity utiliza el estándar AGENTS.md y puede soportar MCPs via OpenAPI o STDIO.
Una vez instalado, verificar el mecanismo de integración MCP soportado.

Configuración propuesta (ajustar según documentación oficial):
```json
{
  "mcpServers": {
    "edura-contexto": {
      "command": "node",
      "args": ["d:/EDURA/sistema/tools/mcp-edura-contexto/server.mjs"]
    }
  }
}
```

### 3. Verificar detección
node scripts/ai/mcp-manager.mjs discover
→ Antigravity debe aparecer como detectado

### 4. Ejecutar pruebas de salud
node scripts/ai/mcp-manager.mjs test edura-contexto

### 5. Actualizar lockfile
Actualizar .ai/mcp.lock.yaml con el estado real verificado.

## Referencia
- AGENTS.md en la raíz del repositorio
- .ai/mcp.registry.yaml
- .ai/mcp.lock.yaml
