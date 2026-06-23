---
id: revisar-diff
version: "1.0.0"
descripcion: "Analiza los cambios actuales para detectar riesgos antes de commit"
categoria: calidad
plataformas: [claude-code, codex, antigravity]
activar_cuando:
  - antes de commit
  - antes de crear PR
  - revisión rápida de cambios
no_activar_cuando:
  - cambio de una sola línea obvia
herramientas_permitidas: [git_diff, lectura_parcial]
presupuesto: mecanico
---

## Pasos

1. Ejecutar `git diff HEAD` o `git diff --staged`.
2. Revisar cada archivo cambiado para detectar:
   - Secretos, tokens o contraseñas hardcodeadas → BLOQUEANTE
   - `console.log` con datos sensibles → ADVERTENCIA
   - Endpoints nuevos sin guard → ADVERTENCIA
   - `TODO` o `FIXME` sin issue → NOTA
   - Cambios en migraciones ya existentes → BLOQUEANTE
   - `any` en TypeScript nuevo → ADVERTENCIA
   - Imports de `node_modules` no declarados en package.json → ADVERTENCIA
3. Listar hallazgos por severidad.

## Salida

```
Revisión de diff: N archivos, +X líneas, -Y líneas

BLOQUEANTES (N):
- <archivo>:<línea>: <descripción>

ADVERTENCIAS (N):
- ...

NOTAS (N):
- ...

Estado: APROBADO / REQUIERE CORRECCIÓN
```
