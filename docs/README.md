# Documentacion del Repositorio EDURA

Este indice sirve como entrada principal para humanos y para agentes automaticos.

## Orden de lectura recomendado

1. [`ESTADO-MAESTRO.md`](ESTADO-MAESTRO.md)
2. [`ARQUITECTURA.md`](ARQUITECTURA.md)
3. [`DICCIONARIO-DATOS.md`](DICCIONARIO-DATOS.md)
4. [`../back/README.md`](../back/README.md)
5. [`../back/documentacion/guia-lectura-ia.md`](../back/documentacion/guia-lectura-ia.md)

## Capas de documentacion

- `docs/` contiene la vision global del repositorio.
- `back/documentacion/` contiene el detalle vivo del backend.
- `back/docs/` conserva auditorias y trazabilidad historica.

## Regla de mantenimiento

- Si cambia un contrato transversal, actualizar este indice y `ESTADO-MAESTRO.md`.
- Si cambia un modulo, actualizar su documento en `back/documentacion/modulos/`.
- Si cambia el modelo de datos, actualizar `DICCIONARIO-DATOS.md`.
- Si cambia arquitectura o seguridad, actualizar `ARQUITECTURA.md` y el ADR correspondiente.
