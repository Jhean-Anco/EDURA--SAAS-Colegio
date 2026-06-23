---
id: comprimir-errores
version: "1.0.0"
descripcion: "Extrae solo errores accionables de logs o salida de comandos"
categoria: plataforma
plataformas: [claude-code, codex, antigravity]
activar_cuando:
  - log extenso de compilación
  - error de TypeScript con mucho output
  - fallo de test con stack trace largo
no_activar_cuando:
  - error ya es corto y claro
herramientas_permitidas: [lectura_logs]
presupuesto: mecanico
---

## Pasos

1. Recibir el log o salida del comando.
2. Filtrar: mantener solo líneas con `error`, `Error`, `FAIL`, `✗`, líneas de archivo:línea.
3. Agrupar errores por archivo.
4. Eliminar duplicados exactos.
5. Eliminar líneas de stack trace internas de node_modules.
6. Presentar máximo 20 errores distintos.
7. Si hay más: indicar `+N errores adicionales del mismo tipo`.

## Salida

```
Errores encontrados: N
Archivos afectados: M

1. <archivo>:<línea> — <mensaje de error>
2. ...

Warnings: N (omitidos si 0)
```
