# ADR-012 institucion como cliente SaaS directo

## Estado

Aprobado.

## Contexto

EDURA debe evolucionar a capacidades SaaS sin romper el modelo actual de monolito modular. La institucion educativa sigue siendo el cliente directo y el tenant proviene del contexto autenticado.

## Decision

- No crear una organizacion suscriptora intermedia.
- Modelar planes, versiones, suscripciones y capacidades efectivas.
- Separar estado institucional de estado comercial.
- Mantener el aprovisionamiento idempotente y reanudable.
- Validar el aislamiento en presentacion, aplicacion y persistencia.

## Consecuencias

- La plataforma puede administrar cualquier institucion con permiso funcional.
- Un recurso ajeno debe devolver `404`.
- `PLATAFORMA` no requiere `institucionId`.
