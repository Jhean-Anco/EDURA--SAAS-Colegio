# ADR-005 - Identidad por sede

## Contexto

Cada sede necesita branding propio, slugs públicos y recursos gráficos sin duplicar la identidad institucional completa.

## Decisión

Modelar `identidades_sede` como una entidad 1:1 con `sedes` y asociar recursos, contactos y páginas a la sede.

## Consecuencias

- Una sede tiene como máximo una identidad.
- El slug público puede usarse como URL pública.
- La identidad puede publicarse y despublicarse sin borrar datos.

## Fuera de alcance

- Gestión de archivos binarios.
- Autorización por institución/sede.
