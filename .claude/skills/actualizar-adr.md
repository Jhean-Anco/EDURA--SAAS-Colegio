---
id: actualizar-adr
version: "1.0.0"
descripcion: "Crea o actualiza un Architecture Decision Record cuando se toma una decisión arquitectónica"
categoria: documentacion
plataformas: [claude-code, codex, antigravity]
activar_cuando:
  - nueva tecnología adoptada
  - cambio de patrón arquitectónico
  - decisión de diseño con alternativas evaluadas
  - cambio de política de seguridad
no_activar_cuando:
  - implementación de funcionalidad ya diseñada
  - corrección de bug sin impacto arquitectónico
herramientas_permitidas: [lectura, escritura_docs]
presupuesto: mecanico
---

## Pasos

1. Listar ADRs existentes en `docs/ai/decisions/` para obtener el próximo número.
2. Crear `docs/ai/decisions/ADR-NNNN-<titulo-kebab>.md` con la estructura:

```markdown
# ADR-NNNN: Título

**Estado:** propuesto | aceptado | obsoleto | reemplazado por ADR-XXXX
**Fecha:** YYYY-MM-DD
**Área:** backend | frontend | base-datos | seguridad | infraestructura

## Contexto

Qué situación requirió esta decisión.

## Decisión

Qué se decidió hacer.

## Alternativas consideradas

- Opción A: ...
- Opción B: ...

## Consecuencias

Positivas y negativas de la decisión tomada.
```

3. Si actualiza un ADR existente: cambiar estado y agregar nota de reemplazo.

## Salida

Ruta del ADR creado o actualizado.
