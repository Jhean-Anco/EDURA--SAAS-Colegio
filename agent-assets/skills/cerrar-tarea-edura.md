---
id: cerrar-tarea-edura
version: "1.0.0"
descripcion: "Verifica criterios de terminado, genera handoff y mueve la tarea a completed/"
categoria: plataforma
plataformas: [claude-code, codex, antigravity]
activar_cuando:
  - tarea lista para entregar
  - todos los criterios de aceptación verificados
no_activar_cuando:
  - quedan pendientes bloqueantes
  - fallan pruebas
herramientas_permitidas: [git_diff, ejecucion_checks, lectura_tasks, escritura_tasks]
presupuesto: mecanico
---

## Pasos

1. Ejecutar `pnpm ai:check:affected` — debe pasar sin errores.
2. Ejecutar Skill `revisar-diff` — no debe haber bloqueantes.
3. Verificar criterios de aceptación en `tasks/active/<id_tarea>.md`.
4. Ejecutar Skill `preparar-handoff`.
5. Ejecutar `pnpm ai:metrics:report` para registrar métricas de la tarea.
6. Actualizar `docs/ESTADO-MAESTRO.md` si el módulo cambió de estado.

## Criterios de terminado (todos obligatorios)

- [ ] TypeScript compila sin errores
- [ ] ESLint pasa en archivos modificados
- [ ] Pruebas afectadas pasan
- [ ] Sin secretos en el diff
- [ ] Handoff generado en `tasks/completed/`
- [ ] Sin pendientes bloqueantes

## Salida

Confirmación de cierre con ruta del handoff y cualquier pendiente no bloqueante documentado.
