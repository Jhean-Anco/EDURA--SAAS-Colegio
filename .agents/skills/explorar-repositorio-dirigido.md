---
id: explorar-repositorio-dirigido
version: "1.0.0"
descripcion: "Búsqueda y lectura limitada de símbolos, archivos y dependencias"
categoria: plataforma
plataformas: [claude-code, codex, antigravity]
activar_cuando:
  - localizar dónde está definido un símbolo
  - encontrar todos los usos de una función
  - identificar dependencias de un módulo
no_activar_cuando:
  - ya se tiene el archivo exacto
  - el contexto de la tarea ya lista las rutas
herramientas_permitidas: [busqueda_dirigida, lectura_parcial, indice_ast]
presupuesto: mecanico
---

## Pasos

1. Consultar `docs/ai/generated/symbols.json` si existe.
2. Si no está indexado: `pnpm ai:search -- "<símbolo>" --glob "<ruta_raíz>/**/*.ts"`.
3. Leer solo las líneas relevantes: `pnpm ai:read -- <archivo> --from N --to N`.
4. Límite: máx. 15 archivos, máx. 300 líneas por archivo, máx. 20 resultados por búsqueda.
5. Si se necesita más: delegar a subagente explorador.

## Reglas

- No abrir archivos completos cuando una búsqueda o rango basta.
- Excluir: `node_modules/`, `dist/`, `.next/`, `coverage/`.
- No repetir búsquedas ya realizadas en la misma sesión.

## Salida

Lista de rutas y rangos de líneas relevantes, sin contenido completo.
