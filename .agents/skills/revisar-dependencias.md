---
id: revisar-dependencias
version: "1.0.0"
descripcion: "Audita dependencias en busca de vulnerabilidades conocidas y licencias incompatibles"
categoria: seguridad
plataformas: [claude-code, codex, antigravity]
activar_cuando:
  - nueva dependencia agregada
  - actualización de dependencia existente
  - revisión periódica de seguridad
no_activar_cuando:
  - ningún cambio en package.json
herramientas_permitidas: [ejecucion_npm_audit, lectura]
presupuesto: normal
---

## Pasos

1. Verificar qué package.json fue modificado: `git diff --name-only HEAD | grep package.json`.
2. Ejecutar auditoría en el workspace afectado:
   ```bash
   npm audit --prefix back --audit-level=moderate
   npm audit --prefix front --audit-level=moderate
   ```
3. Filtrar vulnerabilidades nuevas (no preexistentes).
4. Para cada nueva dependencia: verificar licencia (rechazar: GPL, AGPL sin excepción).
5. Verificar que no sea dependencia de producción para la plataforma de agentes.
6. Documentar resultado.

## Salida

```
Dependencias auditadas: back (N), front (N)
Vulnerabilidades nuevas: N críticas, N altas, N medias
Licencias problemáticas: N
Estado: OK | REQUIERE ATENCIÓN
```
