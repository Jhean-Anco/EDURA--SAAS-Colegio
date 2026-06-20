# ADR-007 - Persona separada de usuario

## Contexto

EDURA necesita registrar personas por institución sin fusionarlas con cuentas de acceso.

## Decisión

`Persona` y `Usuario` se modelan como conceptos distintos.

## Consecuencias

- Un usuario puede existir sin persona.
- Una persona puede existir sin usuario.
- El vínculo se realiza mediante membresía institucional.

