---
id: crear-funcionalidad-nextjs
version: "1.0.0"
descripcion: "Genera feature, componentes, route handler BFF y tests para Next.js"
categoria: frontend
plataformas: [claude-code, codex, antigravity]
activar_cuando:
  - nueva página en el frontend
  - nuevo feature de dominio en UI
  - nueva ruta BFF hacia el backend
no_activar_cuando:
  - cambio en un componente existente menor
  - corrección de estilo o texto
herramientas_permitidas: [lectura, escritura_modulos_front, busqueda_dirigida]
presupuesto: normal
---

## Pasos

1. Leer un feature similar existente en `front/src/features/` como referencia.
2. Crear en `front/src/features/<nombre>/`:
   - `components/` — componentes de UI del feature
   - `hooks/` — hooks con TanStack Query
   - `types.ts` — tipos específicos del feature
3. Crear route handler BFF: `front/src/app/api/<ruta>/route.ts`.
4. Crear página: `front/src/app/<ruta>/page.tsx`.
5. Usar `iron-session` para leer la sesión en route handlers.
6. Activar Skill `auditar-accesibilidad` para componentes de formulario.
7. Crear al menos un test en `front/src/tests/<nombre>/`.

## Límites

- No hacer fetch directo al backend desde componentes cliente.
- No instalar nuevas dependencias UI sin ADR.
- No usar `useState` + `useEffect` para datos remotos; usar TanStack Query.

## Salida

Lista de archivos creados y ruta de la nueva página.
