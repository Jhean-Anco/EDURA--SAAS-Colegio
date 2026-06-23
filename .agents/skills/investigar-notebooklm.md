---
id: investigar-notebooklm
version: "1.0.0"
descripcion: "Prepara fuentes y lanza consulta al cuaderno NotebookLM correspondiente"
categoria: investigacion
plataformas: [claude-code]
activar_cuando:
  - analizar requerimiento extenso con múltiples documentos
  - cruzar requerimientos de varios actores
  - sintetizar proceso de negocio
  - detectar contradicciones en documentación
no_activar_cuando:
  - información disponible en código o ADR
  - pregunta respondible leyendo 1-2 archivos
herramientas_permitidas: [lectura_docs, escritura_staging, mcp_notebooklm]
presupuesto: normal
---

## Pasos

1. Ejecutar `pnpm ai:notebooklm:status` para verificar disponibilidad.
2. Si no está configurado: documentar que el paso requiere autenticación manual y detener.
3. Si está disponible:
   a. Seleccionar cuaderno apropiado según el tema.
   b. Ejecutar `pnpm ai:notebooklm:prepare` para sanitizar fuentes.
   c. Seleccionar plantilla de consulta de `docs/notebooklm/query-templates/`.
   d. Ejecutar `pnpm ai:notebooklm:ask -- <plantilla>`.
4. Guardar resultado en `docs/ai/research/<id>-<tema>.yaml` con esquema estándar.
5. NO incorporar conclusiones al estado maestro sin validación humana.

## Cuadernos disponibles

Ver `docs/notebooklm/notebooks.yaml` para lista actualizada.

## Salida

Hallazgos estructurados en `docs/ai/research/` con citas y fuentes identificadas.
Estado de disponibilidad si NotebookLM no está configurado.
