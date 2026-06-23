---
id: generar-documentacion
version: "1.0.0"
descripcion: "Genera o actualiza documentación técnica del módulo o funcionalidad implementada"
categoria: documentacion
plataformas: [claude-code, codex, antigravity]
activar_cuando:
  - nuevo módulo completo entregado
  - nueva funcionalidad pública documentable
  - cambio de contrato de API
no_activar_cuando:
  - cambio interno sin impacto en la interfaz
  - corrección de bug menor
herramientas_permitidas: [lectura, escritura_docs, busqueda_dirigida]
presupuesto: normal
---

## Pasos

1. Leer el módulo implementado (solo `.module.ts`, controlador y DTOs principales).
2. Actualizar `docs/ai/api-map.md` si hay endpoints nuevos o modificados.
3. Si es módulo nuevo: crear `docs/ai/context/<nombre>.md` con:
   - Propósito del módulo
   - Actores que lo utilizan
   - Flujo principal
   - Endpoints principales (sin copiar OpenAPI completo)
   - Dependencias de otros módulos
4. Actualizar `docs/ESTADO-MAESTRO.md` si el módulo pasó a estado completado.
5. Si hay decisión arquitectónica nueva: activar Skill `actualizar-adr`.

## Límites

- No repetir lo que ya está en el código (no describir el WHAT).
- No generar documentación funcional de usuario (eso es para NotebookLM).

## Salida

Lista de archivos de documentación creados o actualizados.
