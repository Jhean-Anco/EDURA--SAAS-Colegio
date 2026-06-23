---
id: ejecutar-pruebas-dirigidas
version: "1.0.0"
descripcion: "Ejecuta solo pruebas afectadas por los cambios actuales"
categoria: calidad
plataformas: [claude-code, codex, antigravity]
activar_cuando:
  - verificar que los cambios no rompieron nada
  - antes de generar handoff
  - CI local antes de commit
no_activar_cuando:
  - cambios solo en documentación
  - cambios solo en archivos de configuración de plataforma de agentes
herramientas_permitidas: [ejecucion_pruebas, lectura]
presupuesto: normal
---

## Pasos

1. Obtener lista de archivos modificados: `git diff --name-only HEAD`.
2. Identificar pruebas relacionadas:
   - Backend: `*.spec.ts` junto a cada archivo modificado.
   - Frontend: `front/src/tests/` relacionados al feature modificado.
3. Ejecutar pruebas backend afectadas:
   ```bash
   npm --prefix back run test -- --testPathPattern="<patron>"
   ```
4. Ejecutar pruebas frontend afectadas:
   ```bash
   npm --prefix front run test -- --reporter=verbose "<patron>"
   ```
5. Ejecutar typecheck en rutas modificadas.
6. Ejecutar lint en rutas modificadas.
7. Comprimir resultado: solo errores y advertencias, no output exitoso.

## Reglas

- No ejecutar toda la suite salvo impacto transversal comprobado.
- Si fallan pruebas: detener y reportar antes de continuar.

## Salida

Resumen: pruebas ejecutadas, fallos, advertencias. Resultado OK o lista de fallos.
