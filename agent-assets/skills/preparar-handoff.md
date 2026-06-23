---
id: preparar-handoff
version: "1.0.0"
descripcion: "Genera el paquete compacto de transferencia al cerrar una tarea"
categoria: plataforma
plataformas: [claude-code, codex, antigravity]
activar_cuando:
  - tarea completada
  - cambio de agente en tarea en curso
  - entrega de sprint
no_activar_cuando:
  - tarea aún en progreso con pendientes
herramientas_permitidas: [git_diff, lectura_tasks, escritura_tasks]
presupuesto: mecanico
---

## Pasos

1. Obtener diff: `git diff main...HEAD --stat` y `git diff main...HEAD`.
2. Leer `tasks/active/<id_tarea>.md` para criterios de aceptación.
3. Generar `tasks/handoffs/<id_tarea>.handoff.json`:

```json
{
  "tarea": "EDURA-XXX",
  "estado": "implementado|parcial|bloqueado",
  "archivosModificados": ["ruta:+líneas/-líneas"],
  "decisiones": ["decisión tomada y razón"],
  "validaciones": {
    "typecheck": "ok|fallido",
    "lint": "ok|fallido",
    "pruebas": "ok|fallido|omitido",
    "seguridad": "ok|pendiente"
  },
  "riesgos": ["descripción concisa"],
  "pendientes": ["descripción de lo que falta"],
  "metricas": {
    "archivos_leidos": 0,
    "archivos_modificados": 0,
    "duracion_minutos": 0
  }
}
```

4. Mover `tasks/active/<id_tarea>.md` a `tasks/completed/` si estado es "implementado".

## Reglas

- NO incluir conversación completa ni razonamiento privado.
- NO incluir logs exitosos completos.
- NO incluir archivos sin relación con la tarea.

## Salida

Ruta del handoff generado. Confirmación de movimiento a completed/.
