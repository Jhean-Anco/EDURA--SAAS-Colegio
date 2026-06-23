---
description: "Reglas para archivos de prueba"
globs: ["back/src/**/*.spec.ts", "back/test/**/*.ts", "front/src/tests/**/*.ts", "front/src/**/*.test.tsx"]
---

# Reglas de Pruebas — EDURA

- Unit tests backend: junto al archivo, sufijo `.spec.ts`, con Jest.
- Tests E2E backend: en `back/test/`, configuración `jest-e2e.json`.
- Tests frontend: en `front/src/tests/` o junto al componente, con Vitest.
- Fixtures: solo datos ficticios; nunca datos reales de personas, instituciones o estudiantes.
- Mocking: permitido para servicios externos; no para la base de datos en tests E2E.
- Ejecutar solo pruebas afectadas: `pnpm ai:check:affected`.
- No ejecutar toda la suite por defecto; solo cuando el impacto transversal lo justifique.
- Cobertura: no es el objetivo; calidad de los casos sí.
- Al agregar funcionalidad nueva: agregar al menos un test unitario del caso principal.
