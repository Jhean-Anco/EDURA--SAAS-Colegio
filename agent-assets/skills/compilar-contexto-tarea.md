---
id: compilar-contexto-tarea
version: "1.0.0"
descripcion: "Genera la cápsula de contexto mínima para una tarea EDURA"
categoria: plataforma
plataformas: [claude-code, codex, antigravity]
activar_cuando:
  - inicio de una tarea nueva
  - cambio de agente en una tarea en curso
no_activar_cuando:
  - tarea mecánica ya con contexto cargado
  - simple búsqueda puntual
entradas:
  - id_tarea: "EDURA-XXX"
herramientas_permitidas: [lectura, busqueda_dirigida, git_diff]
presupuesto: mecanico
---

## Pasos

1. Leer `tasks/active/<id_tarea>.md`.
2. Extraer: módulos afectados, rutas declaradas, símbolos mencionados.
3. Buscar símbolos clave con `pnpm ai:search -- "<símbolo>"`.
4. Leer manifiestos de módulos afectados (solo `.module.ts`, máx. 50 líneas cada uno).
5. Consultar `docs/ai/decisions/` para ADR aplicables (solo títulos y estado).
6. Obtener `git diff --stat HEAD` para ver cambios actuales.
7. Escribir `tasks/context/<id_tarea>.context.yaml`.

## Formato de salida

```yaml
tarea: EDURA-XXX
tipo: [mecanico|normal|critico]
perfil: [local-fast|backend|frontend-ui|docs-research|security-audit|database-review]
objetivo: "<una línea>"
rutas_permitidas: []
simbolos: []
dependencias: []
adr: []
archivos_referencia: []
pruebas: []
comandos: []
skills: []
presupuesto: normal
```

## Criterios de finalización

Archivo `tasks/context/<id_tarea>.context.yaml` creado con todos los campos.
