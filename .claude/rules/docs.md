---
description: "Reglas para archivos de documentación"
globs: ["docs/**/*.md", "docs/**/*.yaml", "*.md"]
---

# Reglas de Documentación — EDURA

- ADR en `docs/ai/decisions/ADR-NNNN-titulo.md`; crear uno por decisión arquitectónica relevante.
- `docs/ESTADO-MAESTRO.md` es la fuente de verdad del estado implementado; actualizar al cerrar tareas.
- No duplicar contenido entre `AGENTS.md`, `CLAUDE.md` y `docs/ai/`.
- `docs/ai/generated/` es generado automáticamente; no editar manualmente.
- `docs/notebooklm/staging/` es temporal; no versionar datos reales.
- Resultados de investigación: guardar en `docs/ai/research/` con el esquema definido.
- Documentación funcional (procesos, actores, flujos): en `docs/`; no en `docs/ai/`.
- No pegar documentación oficial completa; referenciar la fuente original.
