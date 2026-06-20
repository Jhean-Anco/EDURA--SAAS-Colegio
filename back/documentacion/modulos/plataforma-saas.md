# Plataforma SaaS

## Alcance

Base documental para la evolucion SaaS de EDURA sin microservicios y sin un modelo de organizacion intermedio.

## Identificadores

- `ACT-PLT-001`
- `MOD-PLT-001` Planes
- `MOD-PLT-002` Caracteristicas
- `MOD-PLT-003` Suscripciones
- `MOD-PLT-004` Capacidades
- `MOD-PLT-005` Aprovisionamiento
- `MOD-PLT-006` Cobranza
- `MOD-PLT-007` Operacion y auditoria
- `REL-PLT-001`

## Regla base

- `PLATAFORMA` opera sin `institucionId`.
- `INSTITUCION` requiere `institucionId`.
- `SEDE` requiere `institucionId` y `sedeId`.
- Un recurso de otro tenant responde `404`.
- Permiso insuficiente responde `403`.
