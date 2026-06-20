# ADR-006 - Páginas tipadas en JSONB

## Contexto

Las páginas públicas requieren secciones heterogéneas sin crear una tabla por variante.

## Decisión

Usar `secciones_pagina_sede.contenido` como `jsonb` tipado por `tipo_seccion`.

## Consecuencias

- Se preserva flexibilidad sin abandonar validación.
- Se evita HTML ejecutable y estructuras arbitrarias.
- La API puede serializar JSON estructurado.

## Fuera de alcance

- CMS de propósito general.
- Renderizado HTML en backend.
